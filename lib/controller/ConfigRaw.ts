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
	export interface IConfigRaw {
		// TODO めんどくさくてまだ書いてない要素がたくさんある

		basePath? :string;

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

	/**
	 * 生の設定ファイルでの本の構成情報を画一的なフォーマットに変換し保持するためのクラス。
	 */
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

	/**
	 * 生の設定ファイルでの本の構成情報を画一的なフォーマットに変換し保持するためのクラス。
	 */
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
					chapters: (part.chapters || []).map((c:any) => typeof c === "string" ? {file: c} : c)
				};
				return new ContentStructure(p, null);
			} else {
				return null;
			}
		}
	}
}
