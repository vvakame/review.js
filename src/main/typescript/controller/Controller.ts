///<reference path='../libs/custom-colors.d.ts' />

///<reference path='../utils/Utils.ts' />
///<reference path='../model/CompilerModel.ts' />
///<reference path='../parser/Parser.ts' />

module ReVIEW {

import t = ReVIEW.i18n.t;

import SyntaxTree = ReVIEW.Parse.SyntaxTree;
import HeadlineSyntaxTree = ReVIEW.Parse.HeadlineSyntaxTree;
import BlockElementSyntaxTree = ReVIEW.Parse.BlockElementSyntaxTree;
import InlineElementSyntaxTree = ReVIEW.Parse.InlineElementSyntaxTree;
import TextNodeSyntaxTree = ReVIEW.Parse.TextNodeSyntaxTree;
import ChapterSyntaxTree = ReVIEW.Parse.ChapterSyntaxTree;

	/**
	 * コマンドライン引数を解釈した結果のオプション。
	 */
	export interface IOptions {
		reviewfile?:string;
		base?:string;
	}

	/**
	 * コンパイル実行時の設定。
	 * 本についての情報や処理実行時のプログラムの差し替え。
	 */
	export interface IConfig {
		// TODO めんどくさくてまだ書いてない要素がたくさんある

		read?:(path:string)=>string;
		write?:(path:string, data:string)=>void;

		outputReport?:(reports:ReVIEW.ProcessReport[])=>void;

		compileSuccess?:()=>void;
		compileFailed?:()=>void;

		analyzer:Build.IAnalyzer;
		validators:Build.IValidator[];
		builders:Build.IBuilder[];

		book:{
			preface?:string[];
			chapters:string[];
			afterword?:string[];
		};
	}

	/**
	 * ReVIEW文書を処理するためのコントローラ。
	 * 処理の起点。
	 */
	export class Controller {
		config:ReVIEW.IConfig;

		constructor(public options:ReVIEW.IOptions = {}) {
		}

		/**
		 * 設定の初期化を行う。
		 * 通常、 ReVIEW.start 経由で呼び出される。
		 * @param data
		 */
			initConfig(data:ReVIEW.IConfig):void {
			this.config = data;

			// analyzer の正規化
			data.analyzer = data.analyzer || new Build.DefaultAnalyzer();
			// validators の正規化
			if (!data.validators || data.validators.length === 0) {
				this.config.validators = [new Build.DefaultValidator()];
			} else if (!Array.isArray(data.validators)) {
				this.config.validators = [<any>data.validators];
			}
			// builders の正規化
			if (!data.builders || data.builders.length === 0) {
				// TODO DefaultBuilder は微妙感
				this.config.builders = [new Build.DefaultBuilder()];
			} else if (!Array.isArray(data.builders)) {
				this.config.builders = [<any>data.builders];
			}
		}

		/**
		 * 処理開始
		 * @returns {Book}
		 */
			process():Book {
			var acceptableSyntaxes = this.config.analyzer.getAcceptableSyntaxes();

			var book = this.processBook();
			this.config.validators.forEach((validator)=> {
				validator.start(book, acceptableSyntaxes, this.config.builders);
			});
			if (book.reports.some(report=>report.level === ReVIEW.ReportLevel.Error)) {
				// エラーがあったら処理中断
				return book;
			}
			// TODO 入力補完候補を得るにはここで acceptableSyntaxes を JSON.stringify する

			this.config.builders.forEach((builder)=> {
				builder.init(book);
			});
			return book;
		}

		private processBook():Book {
			var book = new Book(this.config);
			book.parts = Object.keys(this.config.book).map((key, index) => {
				var chapters:string[] = this.config.book[key];
				return this.processPart(book, index, key, chapters);
			});
			// Chapterに採番を行う
			book.parts.forEach((part)=> {
				var chapters:ChapterSyntaxTree[] = [];
				part.chapters.forEach((chapter)=> {
					ReVIEW.visit(chapter.root, {
						visitDefaultPre: (node)=> {
						},
						visitChapterPre: (node:ChapterSyntaxTree) => {
							chapters.push(node);
						}
					});
				});
				var counter:{[index:number]:number;} = {};
				var max = 0;
				var currentLevel = 0;
				chapters.forEach((chapter)=> {
					var level = chapter.headline.level;
					max = Math.max(max, level);
					if (currentLevel > level) {
						for (var i = level + 1; i <= max; i++) {
							counter[i] = 0;
						}
					} else if (currentLevel < level) {
						for (var i = level; i <= max; i++) {
							counter[i] = 0;
						}
					}
					currentLevel = level;
					counter[level] += 1;
					chapter.no = counter[level];
				});
			});
			return book;
		}

		private processPart(book:Book, index:number, name:string, chapters:string[] = []):Part {
			var part = new Part(book, index + 1, name);
			part.chapters = chapters.map((chapter, index) => {
				return this.processChapter(book, part, index, chapter);
			});
			return part;
		}

		private processChapter(book:Book, part:Part, index:number, chapterPath:string):Chapter {
			var resolvedPath = this.resolvePath(chapterPath);
			var data = this.read(resolvedPath);
			if (!data) {
				var chapter = new Chapter(part, index + 1, chapterPath, data, null);
				chapter.process.error(t("compile.file_not_exists", resolvedPath));
				return chapter;
			}
			try {
				var parseResult = ReVIEW.Parse.parse(data);
				var chapter = new Chapter(part, index + 1, chapterPath, data, parseResult.ast);
			} catch (e) {
				if (!(e instanceof PEG.SyntaxError)) {
					throw e;
				}
				var se:PEG.SyntaxError = e;
				var errorNode = new SyntaxTree({
					syntax: se.name,
					line: se.line,
					column: se.column,
					offset: se.offset,
					endPos: -1 // TODO SyntaxError が置き換えられたらなんとかできるかも…
				});
				var chapter = new Chapter(part, index + 1, chapterPath, data, null);
				chapter.process.error(se.message, errorNode);
			}
			return chapter;
		}

		get read():(path:string)=>string {
			return this.config.read || ReVIEW.IO.read;
		}

		get write():(path:string, data:string)=>void {
			return this.config.write || ReVIEW.IO.write;
		}

		get outputReport():(reports:ReVIEW.ProcessReport[])=>void {
			if (this.config.outputReport) {
				return this.config.outputReport;
			} else if (ReVIEW.isNodeJS()) {
				return this.outputReportNodeJS;
			} else {
				return this.outputReportBrowser;
			}
		}

		private outputReportNodeJS(reports:ReVIEW.ProcessReport[]):void {
			var colors = require("colors");
			colors.setTheme({
				info: "cyan",
				warn: "yellow",
				error: "red"
			});

			reports.forEach(report=> {
				var message = "";
				message += report.chapter.name + " ";
				report.nodes.forEach(node => {
					message += "[" + node.line + "," + node.column + "] ";
				});
				message += report.message;
				if (report.level === ReVIEW.ReportLevel.Error) {
					console.warn(message.error);
				} else if (report.level === ReVIEW.ReportLevel.Warning) {
					console.error(message.warn);
				} else if (report.level === ReVIEW.ReportLevel.Info) {
					console.info(message.info);
				} else {
					throw new Error("unknown report level.");
				}
			});
		}

		private outputReportBrowser(reports:ReVIEW.ProcessReport[]):void {
			reports.forEach(report=> {
				var message = "";
				message += report.chapter.name + " ";
				report.nodes.forEach(node => {
					message += "[" + node.line + "," + node.column + "] ";
				});
				message += report.message;
				if (report.level === ReVIEW.ReportLevel.Error) {
					console.warn(message);
				} else if (report.level === ReVIEW.ReportLevel.Warning) {
					console.error(message);
				} else if (report.level === ReVIEW.ReportLevel.Info) {
					console.info(message);
				} else {
					throw new Error("unknown report level.");
				}
			});
		}

		compileFinished(book:Book) {
			var func:Function = ()=> {
			};
			if (!book.reports.some(report=>report.level === ReVIEW.ReportLevel.Error)) {
				if (this.config.compileSuccess) {
					func = this.config.compileSuccess;
				} else if (ReVIEW.isNodeJS()) {
					func = ()=> {
						process.exit(0);
					};
				}
			} else {
				if (this.config.compileFailed) {
					func = this.config.compileFailed;
				} else if (ReVIEW.isNodeJS()) {
					func = ()=> {
						process.exit(1);
					};
				}
			}
			func(book);
		}

		resolvePath(path:string):string {
			if (ReVIEW.isNodeJS()) {
				var p = require("path");
				var base = this.options.base || "./";
				return p.join(base, path);
			}

			if (!this.options.base) {
				return path;
			}

			if (!this.endWith(base, "/") && !this.startWith(path, "/")) {
				base += "/";
			}
			return base + path;
		}

		private startWith(str:string, target:string):boolean {
			return str.indexOf(target) === 0;
		}

		private endWith(str:string, target:string):boolean {
			return str.indexOf(target, str.length - target.length) !== -1;
		}
	}
}
