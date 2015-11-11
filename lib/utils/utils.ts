"use strict";

import {ConfigRaw} from "../controller/configRaw";
import {Book, Process, BuilderProcess} from "../model/compilerModel";

import {SyntaxTree, NodeSyntaxTree, HeadlineSyntaxTree, UlistElementSyntaxTree, DlistElementSyntaxTree, OlistElementSyntaxTree, TextNodeSyntaxTree, ChapterSyntaxTree, ColumnSyntaxTree} from "../parser/parser";
import {Builder} from "../builder/builder";
import {TextBuilder} from "../builder/textBuilder";
import {HtmlBuilder} from "../builder/htmlBuilder";
import {DefaultAnalyzer} from "../parser/analyzer";
import {DefaultValidator} from "../parser/validator";
import {TreeVisitor, visit, walk} from "../parser/walker";
import {start} from "../index";

declare let define: any; // TODO コンパイル通す用
false && Book; // tslint消し

/**
 * ブラウザ上での実行かどうかを判別する。
 * @returns {boolean}
 */
export function isBrowser(): boolean {
	"use strict";

	return typeof window !== "undefined";
}

declare var atom: any;

/**
 * Node.js上での実行かどうかを判別する。
 * @returns {boolean}
 */
export function isNodeJS(): boolean {
	"use strict";

	if (typeof atom !== "undefined") {
		// atomはNode.jsと判定したいけどwindowあるしbrowserify環境下と区別するために特別扱いする
		return true;
	}

	return !isBrowser() && !isAMD() && typeof exports === "object";
}

/**
 * AMD環境下での実行かどうかを判別する。
 * @returns {boolean|any}
 */
export function isAMD(): boolean {
	"use strict";

	return typeof define === "function" && define.amd;
}

/**
 * ネストしたArrayを潰して平らにする。
 * Arrayかどうかの判定は Array.isArray を利用。
 * @param data
 * @returns {*[]}
 */
export function flatten(data: any[]): any[] {
	"use strict";

	if (data.some((d) => Array.isArray(d))) {
		return flatten(data.reduce((p: any[], c: any[]) => p.concat(c), []));
	} else {
		return data;
	}
}

/**
 * SyntaxTree全体 を String に変換する。
 * @param process
 * @param node
 */
export function nodeToString(process: Process, node: SyntaxTree): string;
export function nodeToString(process: BuilderProcess, node: SyntaxTree): string;
export function nodeToString(process: any, node: SyntaxTree): string {
	"use strict";

	return process.input.substring(node.location.start.offset, node.location.end.offset);
}

/**
 * SyntaxTreeの中身部分 を String に変換する。
 * @param process
 * @param node
 */
export function nodeContentToString(process: Process, node: SyntaxTree): string;
export function nodeContentToString(process: BuilderProcess, node: SyntaxTree): string;
export function nodeContentToString(process: any, node: SyntaxTree): string {
	"use strict";

	let minPos = Number.MAX_VALUE;
	let maxPos = -1;
	// child
	let childVisitor: TreeVisitor = {
		visitDefaultPre: (node: SyntaxTree) => {
			minPos = Math.min(minPos, node.location.start.offset);
			maxPos = Math.max(maxPos, node.location.end.offset);
		}
	};
	// root (子要素だけ抽出したい)
	visit(node, {
		visitDefaultPre: (node: SyntaxTree) => {
		},
		visitNodePre: (node: NodeSyntaxTree) => {
			// Chapter, Inline, Block もここに来る
			node.childNodes.forEach(child => visit(child, childVisitor));
			return false;
		},
		visitHeadlinePre: (node: HeadlineSyntaxTree) => {
			visit(node.caption, childVisitor);
			return false;
		},
		visitUlistPre: (node: UlistElementSyntaxTree) => {
			visit(node.text, childVisitor);
			return false;
		},
		visitDlistPre: (node: DlistElementSyntaxTree) => {
			visit(node.text, childVisitor);
			visit(node.content, childVisitor);
			return false;
		},
		visitOlistPre: (node: OlistElementSyntaxTree) => {
			visit(node.text, childVisitor);
			return false;
		},
		visitTextPre: (text: TextNodeSyntaxTree) => {
			visit(node, childVisitor);
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
 * @returns {SyntaxTree}
 */
export function findUp(node: SyntaxTree, predicate: (node: SyntaxTree) => boolean): SyntaxTree {
	"use strict";

	let result: SyntaxTree = null;
	walk(node, (node: SyntaxTree) => {
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
export function findChapter(node: SyntaxTree, level?: number): ChapterSyntaxTree {
	"use strict";

	let chapter: ChapterSyntaxTree = null;
	walk(node, (node: SyntaxTree) => {
		if (node instanceof ChapterSyntaxTree) {
			chapter = node;
			if (typeof level === "undefined" || node.level === level) {
				return null;
			}
		}
		return node.parentNode;
	});
	return chapter;
}

export function findChapterOrColumn(node: SyntaxTree, level?: number): NodeSyntaxTree {
	"use strict";

	let chapter: ChapterSyntaxTree = null;
	let column: ColumnSyntaxTree = null;
	walk(node, (node: SyntaxTree) => {
		if (node instanceof ChapterSyntaxTree) {
			chapter = node;
			if (typeof level === "undefined" || node.level === level) {
				return null;
			}
		} else if (node instanceof ColumnSyntaxTree) {
			column = node;
			if (typeof level === "undefined" || node.level === level) {
				return null;
			}
		}
		return node.parentNode;
	});
	return chapter || column;
}

export function target2builder(target: string): Builder {
	"use strict";

	// TODO 適当になおす…
	let builderName = target.charAt(0).toUpperCase() + target.substring(1) + "Builder";
	if (builderName === "TextBuilder") {
		return new TextBuilder();
	}
	if (builderName === "HtmlBuilder") {
		return new HtmlBuilder();
	}
	/*
	for (let name in ReVIEW.Build) {
		if (name === builderName) {
			let ctor = (<any>ReVIEW.Build)[name];
			return new ctor();
		}
	}
	 */
	return null;
}

/**
 * Node.jsでのIOをざっくり行うためのモジュール。
 */
export module IO {
	"use strict";

	/**
	 * 指定されたファイルを読み文字列として返す。
	 * @param path
	 * @returns {*}
	 */
	export function read(path: string): Promise<string> {
		/* tslint:disable:no-require-imports */
		let fs = require("fs");
		/* tslint:enable:no-require-imports */
		return new Promise((resolve, reject) => {
			fs.readFile(path, { encoding: "utf8" }, (err: any, data: string) => {
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
	export function write(path: string, content: string): Promise<void> {
		/* tslint:disable:no-require-imports */
		let fs = require("fs");
		/* tslint:enable:no-require-imports */
		return new Promise<void>((resolve, reject) => {
			fs.writeFile(path, content, (err: any) => {
				if (err) {
					reject(err);
				} else {
					resolve(null);
				}
			});
		});
	}
}

/**
 * 行数から桁数の変換 100行 -> 3桁 
 */
export function linesToFigure(lines: number): number {
	"use strict";

	return String(lines).length;
}

export function padLeft(str: string, pad: string, maxLength: number): string {
	"use strict";

	if (maxLength <= str.length) {
		return str;
	}
	return stringRepeat(maxLength - str.length, pad) + str;
}

export function stringRepeat(times: number, src: string): string {
	"use strict";

	return new Array(times + 1).join(src);
}

/**
 * 実行するためのヘルパクラス群
 */
export module Exec {
	"use strict";

	export function singleCompile(input: string, fileName?: string, target?: string, tmpConfig?: any /* ReVIEW.IConfig */) {
		"use strict";

		let config: ConfigRaw = tmpConfig || <any>{};
		config.read = config.read || (() => Promise.resolve(input));

		config.analyzer = config.analyzer || new DefaultAnalyzer();
		config.validators = config.validators || [new DefaultValidator()];
		if (target && target2builder(target) == null) {
			console.error(target + " is not exists in builder");
			process.exit(1);
		}
		config.builders = config.builders || target ? [target2builder(target)] : [new TextBuilder()];
		config.book = config.book || {
			contents: [
				{ file: fileName }
			]
		};
		config.book.contents = config.book.contents || [
			{ file: fileName }
		];

		let results: any = {};
		config.write = config.write || ((path: string, content: any) => results[path] = content);

		config.listener = config.listener || {
			onReports: () => {
			},
			onCompileSuccess: () => {
			},
			onCompileFailed: () => {
			}
		};
		config.listener.onReports = config.listener.onReports || (() => {
		});
		config.listener.onCompileSuccess = config.listener.onCompileSuccess || (() => {
		});
		config.listener.onCompileFailed = config.listener.onCompileFailed || (() => {
		});
		let success: boolean;
		let originalCompileSuccess = config.listener.onCompileSuccess;
		config.listener.onCompileSuccess = (book) => {
			success = true;
			originalCompileSuccess(book);
		};
		let originalCompileFailed = config.listener.onCompileFailed;
		config.listener.onCompileFailed = (book) => {
			success = false;
			originalCompileFailed(book);
		};

		return start((review) => {
			review.initConfig(config);
		})
			.then(book=> {
				return {
					book: book,
					results: results
				};
			});
	}
}
