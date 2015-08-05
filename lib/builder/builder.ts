"use strict";

import {AnalyzerError} from "../js/exception";

import {Book, BuilderProcess, ContentChunk, Symbol} from "../model/compilerModel";

import {SyntaxTree, NodeSyntaxTree, ChapterSyntaxTree, BlockElementSyntaxTree, InlineElementSyntaxTree, HeadlineSyntaxTree, UlistElementSyntaxTree, OlistElementSyntaxTree, DlistElementSyntaxTree, TextNodeSyntaxTree, ColumnSyntaxTree, ColumnHeadlineSyntaxTree, SingleLineCommentSyntaxTree} from "../parser/parser";

import {visitAsync} from "../parser/walker";

import {nodeContentToString, findUp} from "../utils/utils";

/**
 * IAnalyzerとIValidatorでチェックをした後に構文木から出力を生成する。
 */
export interface Builder {
	name: string;
	extention: string;
	init(book: Book): Promise<void>;
	escape(data: any): string;
	chapterPre(process: BuilderProcess, node: ChapterSyntaxTree): any;
	chapterPost(process: BuilderProcess, node: ChapterSyntaxTree): any;
	headlinePre(process: BuilderProcess, name: string, node: HeadlineSyntaxTree): any;
	headlinePost(process: BuilderProcess, name: string, node: HeadlineSyntaxTree): any;
	columnPre(process: BuilderProcess, node: ColumnSyntaxTree): any;
	columnPost(process: BuilderProcess, node: ColumnSyntaxTree): any;
	columnHeadlinePre(process: BuilderProcess, node: ColumnHeadlineSyntaxTree): any;
	columnHeadlinePost(process: BuilderProcess, node: ColumnHeadlineSyntaxTree): any;
	ulistPre(process: BuilderProcess, name: string, node: UlistElementSyntaxTree): any;
	ulistPost(process: BuilderProcess, name: string, node: UlistElementSyntaxTree): any;
	olistPre(process: BuilderProcess, name: string, node: OlistElementSyntaxTree): any;
	olistPost(process: BuilderProcess, name: string, node: OlistElementSyntaxTree): any;
	blockPre(process: BuilderProcess, name: string, node: BlockElementSyntaxTree): any;
	blockPost(process: BuilderProcess, name: string, node: BlockElementSyntaxTree): any;
	inlinePre(process: BuilderProcess, name: string, node: InlineElementSyntaxTree): any;
	inlinePost(process: BuilderProcess, name: string, node: InlineElementSyntaxTree): any;
	text(process: BuilderProcess, node: TextNodeSyntaxTree): any;
	singleLineComment?(process: BuilderProcess, node: SingleLineCommentSyntaxTree): any;
}

/**
 * デフォルトのビルダ。
 * Re:VIEWのASTから何らかのテキストに変換する時はこのクラスを拡張し作成する。
 */
export class DefaultBuilder implements Builder {
	book: Book;
	extention = "bug";

	get name(): string {
		return (<any>this).constructor.name;
	}

	init(book: Book): Promise<void> {
		this.book = book;

		return Promise.all(book.allChunks.map(chunk => this.processAst(chunk))).then(() => <void>null);
	}

	processAst(chunk: ContentChunk): Promise<void> {
		var process = chunk.createBuilderProcess(this);
		return visitAsync(chunk.tree.ast, {
			visitDefaultPre: (node: SyntaxTree) => {
			},
			visitChapterPre: (node: ChapterSyntaxTree) => {
				return this.chapterPre(process, node);
			},
			visitChapterPost: (node: ChapterSyntaxTree) => {
				return this.chapterPost(process, node);
			},
			visitHeadlinePre: (node: HeadlineSyntaxTree) => {
				return this.headlinePre(process, "hd", node);
			},
			visitHeadlinePost: (node: HeadlineSyntaxTree) => {
				return this.headlinePost(process, "hd", node);
			},
			visitColumnPre: (node: ColumnSyntaxTree) => {
				return this.columnPre(process, node);
			},
			visitColumnPost: (node: ColumnSyntaxTree) => {
				return this.columnPost(process, node);
			},
			visitColumnHeadlinePre: (node: ColumnHeadlineSyntaxTree) => {
				return this.columnHeadlinePre(process, node);
			},
			visitColumnHeadlinePost: (node: ColumnHeadlineSyntaxTree) => {
				return this.columnHeadlinePost(process, node);
			},
			visitParagraphPre: (node: NodeSyntaxTree) => {
				return this.paragraphPre(process, "p", node);
			},
			visitParagraphPost: (node: NodeSyntaxTree) => {
				return this.paragraphPost(process, "p", node);
			},
			visitUlistPre: (node: UlistElementSyntaxTree) => {
				return this.ulistPre(process, "ul", node);
			},
			visitUlistPost: (node: UlistElementSyntaxTree) => {
				return this.ulistPost(process, "ul", node);
			},
			visitOlistPre: (node: OlistElementSyntaxTree) => {
				return this.olistPre(process, "ol", node);
			},
			visitOlistPost: (node: OlistElementSyntaxTree) => {
				return this.olistPost(process, "ol", node);
			},
			visitDlistPre: (node: DlistElementSyntaxTree) => {
				return this.dlistPre(process, "dl", node);
			},
			visitDlistPost: (node: DlistElementSyntaxTree) => {
				return this.dlistPost(process, "dl", node);
			},
			visitBlockElementPre: (node: BlockElementSyntaxTree) => {
				return this.blockPre(process, node.symbol, node);
			},
			visitBlockElementPost: (node: BlockElementSyntaxTree) => {
				return this.blockPost(process, node.symbol, node);
			},
			visitInlineElementPre: (node: InlineElementSyntaxTree) => {
				return this.inlinePre(process, node.symbol, node);
			},
			visitInlineElementPost: (node: InlineElementSyntaxTree) => {
				return this.inlinePost(process, node.symbol, node);
			},
			visitTextPre: (node: TextNodeSyntaxTree) => {
				this.text(process, node);
			},
			visitSingleLineCommentPre: (node: SingleLineCommentSyntaxTree) => {
				this.singleLineComment(process, node);
			}
		})
			.then(() => {
				this.processPost(process, chunk);
				return Promise.all(chunk.nodes.map(chunk => this.processAst(chunk))).then(() => <void>null);
			});
	}

	escape(data: any): string {
		throw new Error("please override this method");
	}

	processPost(process: BuilderProcess, chunk: ContentChunk): void {
	}

	chapterPre(process: BuilderProcess, node: ChapterSyntaxTree): any {
	}

	chapterPost(process: BuilderProcess, node: ChapterSyntaxTree): any {
	}

	headlinePre(process: BuilderProcess, name: string, node: HeadlineSyntaxTree): any {
	}

	headlinePost(process: BuilderProcess, name: string, node: HeadlineSyntaxTree): any {
	}

	columnPre(process: BuilderProcess, node: ColumnSyntaxTree): any {
	}

	columnPost(process: BuilderProcess, node: ColumnSyntaxTree): any {
	}

	columnHeadlinePre(process: BuilderProcess, node: ColumnHeadlineSyntaxTree): any {
	}

	columnHeadlinePost(process: BuilderProcess, node: ColumnHeadlineSyntaxTree): any {
	}

	paragraphPre(process: BuilderProcess, name: string, node: NodeSyntaxTree): any {
	}

	paragraphPost(process: BuilderProcess, name: string, node: NodeSyntaxTree): any {
	}

	ulistPre(process: BuilderProcess, name: string, node: UlistElementSyntaxTree): any {
	}

	ulistPost(process: BuilderProcess, name: string, node: UlistElementSyntaxTree): any {
	}

	olistPre(process: BuilderProcess, name: string, node: OlistElementSyntaxTree): any {
	}

	olistPost(process: BuilderProcess, name: string, node: OlistElementSyntaxTree): any {
	}

	dlistPre(process: BuilderProcess, name: string, node: DlistElementSyntaxTree): any {
	}

	dlistPost(process: BuilderProcess, name: string, node: DlistElementSyntaxTree): any {
	}

	text(process: BuilderProcess, node: TextNodeSyntaxTree): any {
		// TODO in paragraph だったら note.text.replace("\n", "") したほうが良い…
		process.out(node.text);
	}

	blockPre(process: BuilderProcess, name: string, node: BlockElementSyntaxTree): any {
		var func: Function;
		func = (<any>this)[`block_${name}`];
		if (typeof func === "function") {
			return func.call(this, process, node);
		}

		func = (<any>this)[`block_${name}_pre`];
		if (typeof func !== "function") {
			throw new AnalyzerError(`block_${name}_pre or block_${name} is not Function`);
		}
		return func.call(this, process, node);
	}

	blockPost(process: BuilderProcess, name: string, node: BlockElementSyntaxTree): any {
		var func: Function;
		func = (<any>this)[`block_${name}`];
		if (typeof func === "function") {
			return;
		}

		func = (<any>this)[`block_${name}_post`];
		if (typeof func !== "function") {
			throw new AnalyzerError(`block_${name}_post is not Function`);
		}
		return func.call(this, process, node);
	}

	inlinePre(process: BuilderProcess, name: string, node: InlineElementSyntaxTree): any {
		var func: Function;
		func = (<any>this)[`inline_${name}`];
		if (typeof func === "function") {
			return func.call(this, process, node);
		}

		func = (<any>this)[`inline_${name}_pre`];
		if (typeof func !== "function") {
			throw new AnalyzerError(`inline_${name}_pre or inline_${name} is not Function`);
		}
		return func.call(this, process, node);
	}

	inlinePost(process: BuilderProcess, name: string, node: InlineElementSyntaxTree): any {
		var func: Function;
		func = (<any>this)[`inline_${name}`];
		if (typeof func === "function") {
			return;
		}

		func = (<any>this)[`inline_${name}_post`];
		if (typeof func !== "function") {
			throw new AnalyzerError(`inline_${name}_post is not Function`);
		}
		return func.call(this, process, node);
	}

	ulistParentHelper(process: BuilderProcess, node: UlistElementSyntaxTree, action: () => void, currentLevel: number = node.level) {
		if (currentLevel !== 1) {
			var result = findUp(node.parentNode, (n) => {
				if (n instanceof UlistElementSyntaxTree) {
					var ulist = n.toUlist();
					return ulist.level === (currentLevel - 1);
				}
				return false;
			});
			if (result) {
				return;
			}
			action();
			this.ulistParentHelper(process, node, action, currentLevel - 1);
		}
	}

	findReference(process: BuilderProcess, node: SyntaxTree): Symbol {
		var founds = process.symbols.filter(symbol => symbol.node === node);
		if (founds.length !== 1) {
			throw new AnalyzerError("invalid status.");
		}
		return founds[0];
	}

	block_raw(process: BuilderProcess, node: BlockElementSyntaxTree): any {
		// TODO Ruby版との出力差が結構あるのでテスト含め直す
		var content = node.args[0].arg;
		var matches = content.match(/\|(.+)\|/);
		if (matches && matches[1]) {
			var target = matches[1].split(",").some(name => this.name.toLowerCase() === `${name}builder`);
			if (target) {
				// "|hoge,fuga| piyo" の場合 matches[1] === "hoge,fuga"
				process.outRaw(content.substring(matches[0].length));
			}
		} else {
			process.outRaw(content);
		}
		return false;
	}

	inline_raw(process: BuilderProcess, node: InlineElementSyntaxTree): any {
		var content = nodeContentToString(process, node);
		var matches = content.match(/\|(.+)\|/);
		if (matches && matches[1]) {
			var target = matches[1].split(",").some(name => this.name.toLowerCase() === `${name}builder`);
			if (target) {
				// "|hoge,fuga| piyo" の場合 matches[1] === "hoge,fuga"
				process.outRaw(content.substring(matches[0].length));
			}
		} else {
			process.outRaw(content);
		}
		return false;
	}

	inline_chap(process: BuilderProcess, node: InlineElementSyntaxTree): any {
		// TODO ひと目でそれと判るスタブ
		var content = nodeContentToString(process, node);
		process.outRaw(content);
		return false;
	}

	inline_chapref(process: BuilderProcess, node: InlineElementSyntaxTree): any {
		// TODO ひと目でそれと判るスタブ
		var content = nodeContentToString(process, node);
		process.outRaw("第x章「" + content + "」");
		return false;
	}

	singleLineComment(process: BuilderProcess, node: SingleLineCommentSyntaxTree): any {
		// 特に何もしない
	}
}
