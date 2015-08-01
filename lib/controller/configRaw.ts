"use strict";

import {Book, Symbol, ProcessReport} from "../model/compilerModel";
import {Analyzer, AcceptableSyntaxes} from "../parser/analyzer";
import {Validator} from "../parser/validator";
import {Builder} from "../builder/builder";

/**
 * コマンドライン引数を解釈した結果のオプション。
 */
export interface Options {
	reviewfile?: string;
	base?: string;
}

/**
 * コンパイル実行時の設定。
 * 本についての情報や処理実行時のプログラムの差し替え。
 */
export interface ConfigRaw {
	// TODO めんどくさくてまだ書いてない要素がたくさんある

	basePath?: string;

	read?: (path: string) => Promise<string>;
	write?: (path: string, data: string) => Promise<void>;

	listener?: ConfigListener;

	analyzer?: Analyzer;
	validators?: Validator[];
	builders?: Builder[]; // TODO buildersの存在チェック入れる

	book: ConfigBook;
}

export interface ConfigListener {
	onAcceptables?: (acceptableSyntaxes: AcceptableSyntaxes) => any;
	onSymbols?: (symbols: Symbol[]) => any;
	onReports?: (reports: ProcessReport[]) => any;

	onCompileSuccess?: (book: Book) => void;
	onCompileFailed?: (book?: Book) => void;
}

export interface ConfigBook {
	predef?: ConfigChapter[];
	contents: ConfigPartOrChapter[];
	appendix?: ConfigChapter[];
	postdef?: ConfigChapter[];
}

export interface ConfigPartOrChapter {
	// part or file or chapter のみ来る想定
	part?: ConfigPart;
	chapter?: ConfigChapter;
	// file は chapter 表記の省略形
	file?: string;
}

export interface ConfigPart {
	file: string;
	chapters: ConfigChapter[];
}

export interface ConfigChapter {
	file: string;
}

/**
 * 生の設定ファイルでの本の構成情報を画一的なフォーマットに変換し保持するためのクラス。
 */
export class BookStructure {
	// TODO コンストラクタ隠したい
	constructor(public predef: ContentStructure[], public contents: ContentStructure[], public appendix: ContentStructure[], public postdef: ContentStructure[]) {
		this.predef = this.predef || [];
		this.contents = this.contents || [];
		this.appendix = this.appendix || [];
		this.postdef = this.postdef || [];
	}

	static createBook(config: ConfigBook) {
		if (!config) {
			return new BookStructure(null, null, null, null);
		}
		var predef = (config.predef || (<any>config).PREDEF || []).map((v: any /* IConfigChapter */) => ContentStructure.createChapter(v));
		var contents = (config.contents || (<any>config).CHAPS || []).map((v: any) => {
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
			} else if (typeof v === "object") {
				// YAML由来
				return ContentStructure.createPart({
					file: Object.keys(v)[0],
					chapters: v[Object.keys(v)[0]].map((c: any) => ({ file: c }))
				});
			} else {
				return null;
			}
		});
		var appendix = (config.appendix || (<any>config).APPENDIX || []).map((v: any /* IConfigChapter */) => ContentStructure.createChapter(v));
		var postdef = (config.postdef || (<any>config).POSTDEF || []).map((v: any /* IConfigChapter */) => ContentStructure.createChapter(v));
		return new BookStructure(predef, contents, appendix, postdef);
	}
}

/**
 * 生の設定ファイルでの本の構成情報を画一的なフォーマットに変換し保持するためのクラス。
 */
export class ContentStructure {
	// TODO コンストラクタ隠したい
	constructor(public part: ConfigPart, public chapter: ConfigChapter) {
	}

	static createChapter(file: string): ContentStructure;

	static createChapter(chapter: ConfigChapter): ContentStructure;

	static createChapter(value: any): ContentStructure {
		if (typeof value === "string") {
			return new ContentStructure(null, { file: value });
		} else if (value && typeof value.file === "string") {
			return new ContentStructure(null, value);
		} else {
			return null;
		}
	}

	static createPart(part: ConfigPart): ContentStructure {
		if (part) {
			var p: ConfigPart = {
				file: part.file,
				chapters: (part.chapters || []).map((c: any) => typeof c === "string" ? { file: c } : c)
			};
			return new ContentStructure(p, null);
		} else {
			return null;
		}
	}
}
