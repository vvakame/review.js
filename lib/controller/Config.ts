///<reference path='../model/CompilerModel.ts' />

module ReVIEW {
	"use strict";

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

		read?:(path:string)=>Promise<string>;
		write?:(path:string, data:string)=>Promise<void>;

		listener?:IConfigListener;

		analyzer?:Build.IAnalyzer;
		validators?:Build.IValidator[];
		builders?:Build.IBuilder[]; // TODO buildersの存在チェック入れる

		book:IConfigBook;
	}

	export interface IConfigListener {
		onAcceptables?:(acceptableSyntaxes:ReVIEW.Build.AcceptableSyntaxes)=>any;
		onSymbols?:(symbols:ReVIEW.ISymbol[])=>any;
		onReports?:(reports:ReVIEW.ProcessReport[])=>any;

		onCompileSuccess?:(book:ReVIEW.Book)=>void;
		onCompileFailed?:(book?:ReVIEW.Book)=>void;
	}

	export interface IConfigBook {
		predef?:IConfigChapter[];
		contents:IConfigPartOrChapter[];
		appendix?:IConfigChapter[];
		postdef?:IConfigChapter[];
	}

	export interface IConfigPartOrChapter {
		// part or file or chapter のみ来る想定
		part?:IConfigPart;
		chapter?: IConfigChapter;
		// file は chapter 表記の省略形
		file?: string;
	}

	export interface IConfigPart {
		file: string;
		chapters: IConfigChapter[];
	}

	export interface IConfigChapter {
		file: string;
	}

	export class BookStructure {
		// TODO コンストラクタ隠したい
		constructor(public predef:ContentStructure[], public contents:ContentStructure[], public appendix:ContentStructure[], public postdef:ContentStructure[]) {
			this.predef = this.predef || [];
			this.contents = this.contents || [];
			this.appendix = this.appendix || [];
			this.postdef = this.postdef || [];
		}

		static createBook(config:IConfigBook) {
			if (!config) {
				return new BookStructure(null, null, null, null);
			}
			var predef = (config.predef || (<any>config).PREDEF || []).map((v:any /* IConfigChapter */) => ContentStructure.createChapter(v));
			var contents = (config.contents || (<any>config).CHAPS || []).map((v:any) => {
				// value は string(YAML由来) か IConfigPartOrChapter
				if (!v) {
					return null;
				}
				if (typeof v === "string") {
					// YAML由来
					return ContentStructure.createChapter(v);
				} else if (v.chapter) {
					// IConfigPartOrChapter 由来
					return ContentStructure.createChapter(v.chapter);
				} else if (v.part) {
					// IConfigPartOrChapter 由来
					return ContentStructure.createPart(v.part);
				} else if (typeof v.file === "string" && v.chapters) {
					return ContentStructure.createPart(v);
				} else if (typeof v.file === "string") {
					// IConfigPartOrChapter 由来
					return ContentStructure.createChapter(v);
				} else {
					return null;
				}
			});
			var appendix = (config.appendix || (<any>config).APPENDIX || []).map((v:any /* IConfigChapter */) => ContentStructure.createChapter(v));
			var postdef = (config.postdef || (<any>config).POSTDEF || []).map((v:any /* IConfigChapter */) => ContentStructure.createChapter(v));
			return new BookStructure(predef, contents, appendix, postdef);
		}
	}

	export class ContentStructure {
		// TODO コンストラクタ隠したい
		constructor(public part:IConfigPart, public chapter:IConfigChapter) {
		}

		static createChapter(file:string):ContentStructure;

		static createChapter(chapter:IConfigChapter):ContentStructure;

		static createChapter(value:any):ContentStructure {
			if (typeof value === "string") {
				return new ContentStructure(null, {file: value});
			} else if (value && typeof value.file === "string") {
				return new ContentStructure(null, value);
			} else {
				return null;
			}
		}

		static createPart(part:IConfigPart):ContentStructure {
			if (part) {
				var p:IConfigPart = {
					file: part.file,
					chapters: (part.chapters || []).map((c: any) => typeof c === "string" ? {file: c} : c)
				};
				return new ContentStructure(p, null);
			} else {
				return null;
			}
		}
	}

	export class ConfigWrapper implements IConfig {
		_builders:Build.IBuilder[];

		constructor(public original:IConfig) {
		}

		get read():(path:string)=>Promise<string> {
			throw new Error("please implements this method");
		}

		get write():(path:string, data:string)=>Promise<void> {
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

		get bookStructure():BookStructure {
			return BookStructure.createBook(this.original.book);
		}

		resolvePath(path:string):string {
			throw new Error("please implements this method");
		}
	}

	export class NodeJSConfig extends ConfigWrapper implements IConfig {
		_listener:IConfigListener;

		constructor(public options:ReVIEW.IOptions, public original:IConfig) {
			super(original);
		}

		get read():(path:string)=>Promise<string> {
			return this.original.read || ReVIEW.IO.read;
		}

		get write():(path:string, data:string)=>Promise<void> {
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

	export class WebBrowserConfig extends ConfigWrapper implements IConfig {
		_listener:IConfigListener;

		constructor(public options:ReVIEW.IOptions, public original:IConfig) {
			super(original);
		}

		get read():(path:string)=>Promise<string> {
			return this.original.read || (():Promise<string>=> {
				throw new Error("please implement config.read method");
			});
		}

		get write():(path:string, data:string)=>Promise<void> {
			return this.original.write || (():Promise<void>=> {
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

		onCompileFailed(book?:Book) {
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
