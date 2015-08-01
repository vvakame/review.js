///<reference path='../typings/custom-colors.d.ts' />

"use strict";

import {PEG} from "../../resources/grammar";

import {Book, ContentChunk, ReportLevel, ISymbol} from "../model/compilerModel";

import {SyntaxTree} from "../parser/parser";
import {Config, NodeJSConfig, WebBrowserConfig} from "./config";
import {IOptions, IConfigRaw, ContentStructure} from "./configRaw";

import {parse, ChapterSyntaxTree} from "../parser/parser";

import {SyntaxPreprocessor} from "../parser/preprocessor";

import {TextBuilder} from "../builder/textBuilder";
import {HtmlBuilder} from "../builder/htmlBuilder";

import {visit} from "../parser/walker";

import {isNodeJS} from "../utils/utils";

/**
 * ReVIEW文書を処理するためのコントローラ。
 * 処理の起点。
 */
export class Controller {
	builders = { TextBuilder, HtmlBuilder };

	private config: Config;

	constructor(public options: IOptions = {}) {
	}

	/**
	 * 設定の初期化を行う。
	 * 通常、 ReVIEW.start 経由で呼び出される。
	 * @param data
	 */
	initConfig(data: IConfigRaw): void {
		if (isNodeJS()) {
			this.config = new NodeJSConfig(this.options, data);
		} else {
			this.config = new WebBrowserConfig(this.options, data);
		}
	}

	process(): Promise<Book> {
		return Promise.resolve(new Book(this.config))
			.then(book=> this.acceptableSyntaxes(book))
			.then(book=> this.toContentChunk(book))
			.then(book=> this.readReVIEWFiles(book))
			.then(book=> this.parseContent(book))
			.then(book=> this.preprocessContent(book))
			.then(book=> this.processContent(book))
			.then(book=> this.writeContent(book))
			.then(book=> this.compileFinished(book))
			.catch(err => this.handleError(err));
	}

	acceptableSyntaxes(book: Book): Promise<Book> {
		book.acceptableSyntaxes = book.config.analyzer.getAcceptableSyntaxes();

		if (book.config.listener.onAcceptables(book.acceptableSyntaxes) === false) {
			// false が帰ってきたら処理を中断する (undefined でも継続)
			book.config.listener.onCompileFailed();
			return Promise.reject<Book>(null);
		}

		return Promise.resolve(book);
	}

	toContentChunk(book: Book): Book {
		var convert = (c: ContentStructure, parent?: ContentChunk): ContentChunk => {
			var chunk: ContentChunk;
			if (c.part) {
				chunk = new ContentChunk(book, c.part.file);
				c.part.chapters.forEach(c=> {
					convert(ContentStructure.createChapter(c), chunk);
				});
			} else if (c.chapter) {
				chunk = new ContentChunk(book, parent, c.chapter.file);
			} else {
				return null;
			}
			if (parent) {
				parent.nodes.push(chunk);
			}
			return chunk;
		};

		book.predef = this.config.book.predef.map(c => convert(c));
		book.contents = this.config.book.contents.map(c => convert(c));
		book.appendix = this.config.book.appendix.map(c => convert(c));
		book.postdef = this.config.book.postdef.map(c => convert(c));

		return book;
	}

	readReVIEWFiles(book: Book): Promise<Book> {
		var promises: Promise<any>[] = [];

		var read = (chunk: ContentChunk) => {
			var resolvedPath = book.config.resolvePath(chunk.name);
			promises.push(book.config.read(resolvedPath).then(input => chunk.input = input));
			chunk.nodes.forEach(chunk => read(chunk));
		};

		book.predef.forEach(chunk=> read(chunk));
		book.contents.forEach(chunk=> read(chunk));
		book.appendix.forEach(chunk=> read(chunk));
		book.postdef.forEach(chunk=> read(chunk));

		return Promise.all(promises).then(() => book);
	}

	parseContent(book: Book): Book {
		var _parse = (chunk: ContentChunk) => {
			try {
				chunk.tree = parse(chunk.input);
			} catch (e) {
				if (!(e instanceof PEG.SyntaxError)) {
					throw e;
				}
				var se: PEG.SyntaxError = e;
				var errorNode = new SyntaxTree({
					syntax: se.name,
					line: se.line,
					column: se.column,
					offset: se.offset,
					endPos: -1 // TODO SyntaxError が置き換えられたらなんとかできるかも…
				});
				chunk.tree = { ast: errorNode, cst: null };
				// TODO エラー表示が必要 process.error 的なやつ
			}
			chunk.nodes.forEach(chunk => _parse(chunk));
		};

		book.predef.forEach(chunk => _parse(chunk));
		book.contents.forEach(chunk => _parse(chunk));
		book.appendix.forEach(chunk => _parse(chunk));
		book.predef.forEach(chunk => _parse(chunk));

		return book;
	}

	preprocessContent(book: Book): Book {
		// Chapterに採番を行う
		var numberingChapter = (chunk: ContentChunk, counter: { [index: number]: number; }) => {
			// TODO partにも分け隔てなく採番してるけど間違ってるっしょ
			var chapters: ChapterSyntaxTree[] = [];
			visit(chunk.tree.ast, {
				visitDefaultPre: (node) => {
				},
				visitChapterPre: (node: ChapterSyntaxTree) => {
					chapters.push(node);
				}
			});
			var max = 0;
			var currentLevel = 1;
			chapters.forEach((chapter) => {
				var level = chapter.headline.level;
				max = Math.max(max, level);
				var i: number;
				if (currentLevel > level) {
					for (i = level + 1; i <= max; i++) {
						counter[i] = 0;
					}
				} else if (currentLevel < level) {
					for (i = level; i <= max; i++) {
						counter[i] = 0;
					}
				}
				currentLevel = level;
				counter[level] = (counter[level] || 0) + 1;
				chapter.no = counter[level];
			});
			chunk.no = counter[1];
			chunk.nodes.forEach(chunk=> numberingChapter(chunk, counter));
		};
		var numberingChapters = (chunks: ContentChunk[], counter: { [index: number]: number; } = {}) => {
			chunks.forEach(chunk => numberingChapter(chunk, counter));
		};

		numberingChapters(book.predef);
		numberingChapters(book.contents);
		numberingChapters(book.appendix);
		numberingChapters(book.postdef);

		var preprocessor = new SyntaxPreprocessor();
		preprocessor.start(book);
		return book;
	}

	processContent(book: Book): Promise<Book> {
		book.config.validators.forEach(validator=> {
			validator.start(book, book.acceptableSyntaxes, this.config.builders);
		});
		if (book.reports.some(report=> report.level === ReportLevel.Error)) {
			// エラーがあったら処理中断
			return Promise.resolve(book);
		}

		var symbols = book.allChunks.reduce<ISymbol[]>((p, c) => p.concat(c.process.symbols), []);
		if (this.config.listener.onSymbols(symbols) === false) {
			// false が帰ってきたら処理を中断する (undefined でも継続)
			return Promise.resolve(book);
		}

		return Promise.all(this.config.builders.map(builder=> builder.init(book))).then(() => book);
	}

	writeContent(book: Book): Promise<Book> {
		var promises: Promise<any>[] = [];

		var write = (chunk: ContentChunk) => {
			chunk.builderProcesses.forEach(process=> {
				var baseName = chunk.name.substr(0, chunk.name.lastIndexOf(".re"));
				var fileName = baseName + "." + process.builder.extention;
				promises.push(this.config.write(fileName, process.result));
			});
			chunk.nodes.forEach(chunk => write(chunk));
		};

		book.predef.forEach(chunk => write(chunk));
		book.contents.forEach(chunk => write(chunk));
		book.appendix.forEach(chunk => write(chunk));
		book.postdef.forEach(chunk => write(chunk));

		return Promise.all(promises).then(() => book);
	}

	compileFinished(book: Book): Book {
		book.config.listener.onReports(book.reports);
		if (!book.hasError) {
			book.config.listener.onCompileSuccess(book);
		} else {
			book.config.listener.onCompileFailed(book);
		}

		return book;
	}

	handleError(err: any): Promise<Book> {
		// TODO 指定された .re が存在しない場合ここにくる…
		console.error("unexpected error", err);
		if (err && err.stack) {
			console.error(err.stack);
		}
		return Promise.reject<Book>(err);
	}
}
