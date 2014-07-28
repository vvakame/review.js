module ReVIEW {
	"use strict";

	/**
	 * Node.js上での実行かどうかを判別する。
	 * @returns {boolean}
	 */
	export function isNodeJS():boolean {
		return !isAMD() && typeof exports === "object";
	}

	/**
	 * AMD環境下での実行かどうかを判別する。
	 * @returns {boolean|any}
	 */
	export function isAMD():boolean {
		return typeof define === "function" && define.amd;
	}

	/**
	 * ネストしたArrayを潰して平らにする。
	 * Arrayかどうかの判定は Array.isArray を利用。
	 * @param data
	 * @returns {*[]}
	 */
	export function flatten(data:any[]):any[] {
		if (data.some((d)=>Array.isArray(d))) {
			return flatten(data.reduce((p:any[], c:any[])=> p.concat(c), []));
		} else {
			return data;
		}
	}

	/**
	 * SyntaxTree全体 を String に変換する。
	 * @param process
	 * @param node
	 */
	export function nodeToString(process:Process, node:ReVIEW.Parse.SyntaxTree):string ;

	export function nodeToString(process:BuilderProcess, node:ReVIEW.Parse.SyntaxTree):string ;

	export function nodeToString(process:any, node:ReVIEW.Parse.SyntaxTree):string {
		return process.input.substring(node.offset, node.endPos);
	}

	/**
	 * SyntaxTreeの中身部分 を String に変換する。
	 * @param process
	 * @param node
	 */
	export function nodeContentToString(process:Process, node:ReVIEW.Parse.SyntaxTree):string ;

	export function nodeContentToString(process:BuilderProcess, node:ReVIEW.Parse.SyntaxTree):string ;

	export function nodeContentToString(process:any, node:ReVIEW.Parse.SyntaxTree):string {
		var minPos = Number.MAX_VALUE;
		var maxPos = -1;
		// child
		var childVisitor:ReVIEW.ITreeVisitor = {
			visitDefaultPre: (node:ReVIEW.Parse.SyntaxTree)=> {
				minPos = Math.min(minPos, node.offset);
				maxPos = Math.max(maxPos, node.endPos);
			}
		};
		// root (子要素だけ抽出したい)
		ReVIEW.visit(node, {
			visitDefaultPre: (node:ReVIEW.Parse.SyntaxTree)=> {
			},
			visitNodePre: (node:ReVIEW.Parse.NodeSyntaxTree) => {
				// Chapter, Inline, Block もここに来る
				node.childNodes.forEach(child => ReVIEW.visit(child, childVisitor));
				return false;
			},
			visitHeadlinePre: (node:ReVIEW.Parse.HeadlineSyntaxTree) => {
				ReVIEW.visit(node.caption, childVisitor);
				return false;
			},
			visitUlistPre: (node:ReVIEW.Parse.UlistElementSyntaxTree) => {
				ReVIEW.visit(node.text, childVisitor);
				return false;
			},
			visitDlistPre: (node:ReVIEW.Parse.DlistElementSyntaxTree) => {
				ReVIEW.visit(node.text, childVisitor);
				ReVIEW.visit(node.content, childVisitor);
				return false;
			},
			visitOlistPre: (node:ReVIEW.Parse.OlistElementSyntaxTree) => {
				ReVIEW.visit(node.text, childVisitor);
				return false;
			},
			visitTextPre: (text:ReVIEW.Parse.TextNodeSyntaxTree) => {
				ReVIEW.visit(node, childVisitor);
				return false;
			}
		});
		if (maxPos < 0) {
			return "";
		} else {
			return process.input.substring(minPos, maxPos);
		}
	}

	/**
	 * 渡した要素から一番近いマッチする要素を探して返す。
	 * 見つからなかった場合 null を返す。
	 * @param node
	 * @param predicate
	 * @returns {ReVIEW.Parse.SyntaxTree}
	 */
	export function findUp(node:ReVIEW.Parse.SyntaxTree, predicate:(node:ReVIEW.Parse.SyntaxTree)=>boolean):ReVIEW.Parse.SyntaxTree {
		var result:ReVIEW.Parse.SyntaxTree = null;
		ReVIEW.walk(node, (node:ReVIEW.Parse.SyntaxTree) => {
			if (predicate(node)) {
				result = node;
				return null;
			}
			return node.parentNode;
		});
		return result;
	}

	/**
	 * 渡した要素から直近のChapterを探して返す。
	 * 見つからなかった場合 null を返す。
	 * もし、渡した要素自身がChapterだった場合、自身を返すのでnode.parentNode を渡すこと。
	 * @param node
	 * @param level 探すChapterのlevel
	 * @returns {ReVIEW.Parse.ChapterSyntaxTree}
	 */
	export function findChapter(node:ReVIEW.Parse.SyntaxTree, level?:number):ReVIEW.Parse.ChapterSyntaxTree {
		var chapter:ReVIEW.Parse.ChapterSyntaxTree = null;
		ReVIEW.walk(node, (node:ReVIEW.Parse.SyntaxTree) => {
			if (node instanceof ReVIEW.Parse.ChapterSyntaxTree) {
				chapter = node.toChapter();
				if (typeof level === "undefined" || chapter.level === level) {
					return null;
				}
			}
			return node.parentNode;
		});
		return chapter;
	}

	export function findChapterOrColumn(node:ReVIEW.Parse.SyntaxTree, level?:number):ReVIEW.Parse.NodeSyntaxTree {
		var chapter:ReVIEW.Parse.ChapterSyntaxTree = null;
		var column:ReVIEW.Parse.ColumnSyntaxTree = null;
		ReVIEW.walk(node, (node:ReVIEW.Parse.SyntaxTree) => {
			if (node instanceof ReVIEW.Parse.ChapterSyntaxTree) {
				chapter = node.toChapter();
				if (typeof level === "undefined" || chapter.level === level) {
					return null;
				}
			} else if (node instanceof  ReVIEW.Parse.ColumnSyntaxTree) {
				column = node.toColumn();
				if (typeof level === "undefined" || column.level === level) {
					return null;
				}
			}
			return node.parentNode;
		});
		return chapter || column;
	}

	export function target2builder(target:string):ReVIEW.Build.IBuilder {
		// TODO minifyに弱い構造になってる…
		var builderName = target.charAt(0).toUpperCase() + target.substring(1) + "Builder";
		for (var name in ReVIEW.Build) {
			if (name === builderName) {
				var ctor = (<any>ReVIEW.Build)[name];
				return new ctor();
			}
		}
		return null;
	}

	/**
	 * Node.jsでのIOをざっくり行うためのモジュール。
	 */
	export module IO {
		/**
		 * 指定されたファイルを読み文字列として返す。
		 * @param path
		 * @returns {*}
		 */
		export function read(path:string):Promise<string> {
			var fs = require("fs");
			return new Promise((resolve, reject)=> {
				fs.readFile(path, {encoding: "utf8"}, (err:any, data:string)=> {
					if (err) {
						reject(err);
					} else {
						resolve(data);
					}
				});
			});
		}

		/**
		 * 指定されたファイルへ文字列を書く。
		 * @param path
		 * @param content
		 */
		export function write(path:string, content:string):Promise<void> {
			var fs = require("fs");
			return new Promise<void>((resolve, reject)=> {
				fs.writeFile(path, content, (err:any)=> {
					if (err) {
						reject(err);
					} else {
						resolve(null);
					}
				});
			});
		}
	}

	export function stringRepeat(times:number, src:string):string {
		return new Array(times + 1).join(src);
	}

	/**
	 * 実行するためのヘルパクラス群
	 */
	export module Exec {
		export interface ResultPromise {
			success():ResultSuccess;
			failure():ResultFailure;
		}

		export interface ResultSuccess {
			book:ReVIEW.Book;
			results?:any;
		}

		export interface ResultFailure {
			book:ReVIEW.Book;
		}

		export function singleCompile(input:string, fileName?:string, target?:string, tmpConfig?:any /* ReVIEW.IConfig */) {
			var config:ReVIEW.IConfig = tmpConfig || <any>{};
			config.read = config.read || (()=> Promise.resolve(input));

			config.analyzer = config.analyzer || new ReVIEW.Build.DefaultAnalyzer();
			config.validators = config.validators || [new ReVIEW.Build.DefaultValidator()];
			if (target && target2builder(target) == null) {
				console.error(target + " is not exists in builder");
				process.exit(1);
			}
			config.builders = config.builders || target ? [target2builder(target)] : [new ReVIEW.Build.TextBuilder()];
			config.book = config.book || {
				chapters: [
					fileName
				]
			};
			config.book.chapters = config.book.chapters || [
				fileName
			];

			var results:any = {};
			config.write = config.write || ((path:string, content:any) => results[path] = content);

			config.listener = config.listener || {
				onReports: () => {
				},
				onCompileSuccess: ()=> {
				},
				onCompileFailed: ()=> {
				}
			};
			config.listener.onReports = config.listener.onReports || (()=> {
			});
			config.listener.onCompileSuccess = config.listener.onCompileSuccess || (()=> {
			});
			config.listener.onCompileFailed = config.listener.onCompileFailed || (()=> {
			});
			var success:boolean;
			var originalCompileSuccess = config.listener.onCompileSuccess;
			config.listener.onCompileSuccess = (book) => {
				success = true;
				originalCompileSuccess(book);
			};
			var originalCompileFailed = config.listener.onCompileFailed;
			config.listener.onCompileFailed = (book)=> {
				success = false;
				originalCompileFailed(book);
			};

			return ReVIEW
				.start((review)=> {
					review.initConfig(config);
				})
				.then(book=> {
					return    {
						book: book,
						results: results
					};
				});
		}
	}
}
