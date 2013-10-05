///<reference path='../libs/custom-colors.d.ts' />

///<reference path='../utils/Utils.ts' />
///<reference path='../model/CompilerModel.ts' />
///<reference path='../parser/Parser.ts' />
///<reference path='../parser/Analyzer.ts' />
///<reference path='../parser/Validator.ts' />

module ReVIEW {

import t = ReVIEW.i18n.t;

import SyntaxTree = ReVIEW.Parse.SyntaxTree;
import HeadlineSyntaxTree = ReVIEW.Parse.HeadlineSyntaxTree;
import BlockElementSyntaxTree = ReVIEW.Parse.BlockElementSyntaxTree;
import InlineElementSyntaxTree = ReVIEW.Parse.InlineElementSyntaxTree;
import TextNodeSyntaxTree = ReVIEW.Parse.TextNodeSyntaxTree;
import ChapterSyntaxTree = ReVIEW.Parse.ChapterSyntaxTree;

import flatten = ReVIEW.flatten;

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

		listener?:IConfigListener;

		analyzer?:Build.IAnalyzer;
		validators?:Build.IValidator[];
		builders:Build.IBuilder[];

		book:IConfigBook;
	}

	export interface IConfigListener {
		onAcceptables?:(acceptableSyntaxes:ReVIEW.Build.AcceptableSyntaxes)=>any;
		onSymbols?:(symbols:ReVIEW.ISymbol[])=>any;
		onReports?:(reports:ReVIEW.ProcessReport[])=>any;

		onCompileSuccess?:(book:ReVIEW.Book)=>void;
		onCompileFailed?:()=>void;
	}

	export interface IConfigBook {
		preface?:string[];
		chapters:string[];
		afterword?:string[];
	}

	/**
	 * ReVIEW文書を処理するためのコントローラ。
	 * 処理の起点。
	 */
	export class Controller {
		private config:ConfigWrapper;

		constructor(public options:ReVIEW.IOptions = {}) {
		}

		/**
		 * 設定の初期化を行う。
		 * 通常、 ReVIEW.start 経由で呼び出される。
		 * @param data
		 */
			initConfig(data:ReVIEW.IConfig):void {
			if (ReVIEW.isNodeJS()) {
				this.config = new NodeJSConfig(this.options, data);
			} else {
				this.config = new WebBrowserConfig(this.options, data);
			}
		}

		/**
		 * 処理開始
		 * @returns {Book}
		 */
			process():Book {
			var acceptableSyntaxes = this.config.analyzer.getAcceptableSyntaxes();

			if (this.config.listener.onAcceptables(acceptableSyntaxes) === false) {
				// false が帰ってきたら処理を中断する (undefined でも継続)
				this.config.listener.onCompileFailed();
				return null;
			}

			var book = this.processBook();

			this.config.validators.forEach(validator=> {
				validator.start(book, acceptableSyntaxes, this.config.builders);
			});
			if (book.reports.some(report=>report.level === ReVIEW.ReportLevel.Error)) {
				// エラーがあったら処理中断
				this.config.listener.onReports(book.reports);
				this.config.listener.onCompileFailed();
				return book;
			}

			var symbols:ReVIEW.ISymbol[] = flatten(book.parts.map(part=>part.chapters.map(chapter=>chapter.process.symbols)));
			if (this.config.listener.onSymbols(symbols) === false) {
				// false が帰ってきたら処理を中断する (undefined でも継続)
				this.config.listener.onReports(book.reports);
				this.config.listener.onCompileFailed();
				return null;
			}

			this.config.builders.forEach(builder=> builder.init(book));

			// TODO write しないといけない

			this.config.listener.onReports(book.reports);
			this.config.listener.onCompileSuccess(book);

			return book;
		}

		private processBook():Book {
			var book = new Book(this.config);
			book.parts = Object.keys(this.config.book).map((key, index) => {
				var chapters:string[] = this.config.book[key];
				return this.processPart(book, index, key, chapters);
			});
			// Chapterに採番を行う
			book.parts.forEach(part=> {
				var chapters:ChapterSyntaxTree[] = [];
				part.chapters.forEach(chapter=> {
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
			var resolvedPath = this.config.resolvePath(chapterPath);
			var data = this.config.read(resolvedPath);
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
	}

	class ConfigWrapper implements IConfig {
		_builders:Build.IBuilder[];

		constructor(public original:IConfig) {
		}

		get read():(path:string)=>string {
			throw new Error("please implements this method");
		}

		get write():(path:string, data:string)=>void {
			throw new Error("please implements this method");
		}

		get analyzer():Build.IAnalyzer {
			return this.original.analyzer || new Build.DefaultAnalyzer();
		}

		get validators():Build.IValidator[] {
			var config = this.original;
			if (!config.validators || config.validators.length === 0) {
				return [new Build.DefaultValidator()];
			} else if (!Array.isArray(config.validators)) {
				return [<any>config.validators];
			} else {
				return config.validators;
			}
		}

		get builders():Build.IBuilder[] {
			if (this._builders) {
				return this._builders;
			}

			var config = this.original;
			if (!config.builders || config.builders.length === 0) {
				// TODO DefaultBuilder は微妙感
				this._builders = [new Build.DefaultBuilder()];
			} else if (!Array.isArray(config.builders)) {
				this._builders = [<any>config.builders];
			} else {
				this._builders = config.builders;
			}
			return this._builders;
		}

		get listener():IConfigListener {
			throw new Error("please implements this method");
		}

		get book():IConfigBook {
			return this.original.book;
		}

		resolvePath(path:string):string {
			throw new Error("please implements this method");
		}
	}

	class NodeJSConfig extends ConfigWrapper implements IConfig {
		_listener:IConfigListener;

		constructor(public options:ReVIEW.IOptions, public original:IConfig) {
			super(original);
		}

		get read():(path:string)=>string {
			return this.original.read || ReVIEW.IO.read;
		}

		get write():(path:string, data:string)=>void {
			return this.original.write || ReVIEW.IO.write;
		}

		get listener():IConfigListener {
			if (this._listener) {
				return this._listener;
			}

			var listener:IConfigListener = this.original.listener || {
			};
			listener.onAcceptables = listener.onAcceptables || (()=> {
			});
			listener.onSymbols = listener.onSymbols || (()=> {
			});
			listener.onReports = listener.onReports || this.onReports;
			listener.onCompileSuccess = listener.onCompileSuccess || this.onCompileSuccess;
			listener.onCompileFailed = listener.onCompileFailed || this.onCompileFailed;

			this._listener = listener;
			return this._listener;
		}

		onReports(reports:ReVIEW.ProcessReport[]):void {
			var colors = require("colors");
			colors.setTheme({
				info: "cyan",
				warn: "yellow",
				error: "red"
			});

			reports.forEach(report=> {
				var message = "";
				if (report.chapter) {
					message += report.chapter.name + " ";
				}
				if (report.nodes) {
					report.nodes.forEach(node => {
						message += "[" + node.line + "," + node.column + "] ";
					});
				}
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

		onCompileSuccess(book:Book) {
			process.exit(0);
		}

		onCompileFailed() {
			process.exit(1);
		}

		resolvePath(path:string):string {
			var p = require("path");
			var base = this.options.base || "./";
			return p.join(base, path);
		}
	}

	class WebBrowserConfig extends ConfigWrapper implements IConfig {
		_listener:IConfigListener;

		constructor(public options:ReVIEW.IOptions, public original:IConfig) {
			super(original);
		}

		get read():(path:string)=>string {
			return this.original.read || (()=> {
				throw new Error("please implement config.read method");
			});
		}

		get write():(path:string, data:string)=>void {
			return this.original.write || (()=> {
				throw new Error("please implement config.write method");
			});
		}

		get listener():IConfigListener {
			if (this._listener) {
				return this._listener;
			}

			var listener:IConfigListener = this.original.listener || {
			};
			listener.onAcceptables = listener.onAcceptables || (()=> {
			});
			listener.onSymbols = listener.onSymbols || (()=> {
			});
			listener.onReports = listener.onReports || this.onReports;
			listener.onCompileSuccess = listener.onCompileSuccess || this.onCompileSuccess;
			listener.onCompileFailed = listener.onCompileFailed || this.onCompileFailed;

			this._listener = listener;
			return this._listener;
		}

		onReports(reports:ReVIEW.ProcessReport[]):void {
			reports.forEach(report=> {
				var message = "";
				if (report.chapter) {
					message += report.chapter.name + " ";
				}
				if (report.nodes) {
					report.nodes.forEach(node => {
						message += "[" + node.line + "," + node.column + "] ";
					});
				}
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

		onCompileSuccess(book:Book) {
		}

		onCompileFailed() {
		}

		resolvePath(path:string):string {
			if (!this.options.base) {
				return path;
			}

			var base = this.options.base;
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
