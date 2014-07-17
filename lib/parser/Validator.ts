///<reference path='../i18n/i18n.ts' />
///<reference path='../model/CompilerModel.ts' />
///<reference path='Analyzer.ts' />

module ReVIEW.Build {
	"use strict";

	import t = ReVIEW.i18n.t;

	import SyntaxTree = ReVIEW.Parse.SyntaxTree;
	import ChapterSyntaxTree = ReVIEW.Parse.ChapterSyntaxTree;
	import ColumnSyntaxTree = ReVIEW.Parse.ColumnSyntaxTree;
	import HeadlineSyntaxTree = ReVIEW.Parse.HeadlineSyntaxTree;
	import BlockElementSyntaxTree = ReVIEW.Parse.BlockElementSyntaxTree;
	import InlineElementSyntaxTree = ReVIEW.Parse.InlineElementSyntaxTree;
	import ArgumentSyntaxTree = ReVIEW.Parse.ArgumentSyntaxTree;

	/**
	 * IAnalyzerで処理した後の構文木について構文上のエラーがないかチェックする。
	 * また、Builderと対比させて、未実装の候補がないかをチェックする。
	 */
	export interface IValidator {
		start(book:Book, acceptableSyntaxes:AcceptableSyntaxes, builders:IBuilder[]):void;
	}

	export class DefaultValidator implements IValidator {
		acceptableSyntaxes:AcceptableSyntaxes;
		builders:IBuilder[];

		start(book:Book, acceptableSyntaxes:AcceptableSyntaxes, builders:IBuilder[]) {
			this.acceptableSyntaxes = acceptableSyntaxes;
			this.builders = builders;

			this.checkBuilder(book, acceptableSyntaxes, builders);
			this.checkBook(book);
			this.resolveSymbolAndReference(book);
		}

		checkBuilder(book:Book, acceptableSyntaxes:AcceptableSyntaxes, builders:IBuilder[] = []) {
			acceptableSyntaxes.acceptableSyntaxes.forEach(syntax => {
				var prefix:string;
				switch (syntax.type) {
					case SyntaxType.Other:
						// Other系は実装をチェックする必要はない…。(ということにしておく
						return;
					case SyntaxType.Block:
						prefix = "block_";
						break;
					case SyntaxType.Inline:
						prefix = "inline_";
						break;
				}
				var funcName1 = prefix + syntax.symbolName;
				var funcName2 = prefix + syntax.symbolName + "_pre";
				builders.forEach(builder=> {
					var func = (<any>builder)[funcName1] || (<any>builder)[funcName2];
					if (!func) {
						book.process.error(SyntaxType[syntax.type] + " " + syntax.symbolName + " is not supported in " + builder.name);
					}
				});
			});
		}

		checkBook(book:Book) {
			book.parts.forEach(part=> this.checkPart(part));
		}

		checkPart(part:Part) {
			part.chapters.forEach(chapter=>this.checkChapter(chapter));
		}

		checkChapter(chapter:Chapter) {
			// Analyzer 内で生成した構文規則に基づき処理
			ReVIEW.visit(chapter.root, {
				visitDefaultPre: (node:SyntaxTree)=> {
				},
				visitHeadlinePre: (node:HeadlineSyntaxTree) => {
					var results = this.acceptableSyntaxes.find(node);
					if (results.length !== 1) {
						chapter.process.error(t("compile.syntax_definietion_error"), node);
						return;
					}
					return results[0].process(chapter.process, node);
				},
				visitColumnPre: (node:ColumnSyntaxTree) => {
					var results = this.acceptableSyntaxes.find(node);
					if (results.length !== 1) {
						chapter.process.error(t("compile.syntax_definietion_error"), node);
						return;
					}
					return results[0].process(chapter.process, node);
				},
				visitBlockElementPre: (node:BlockElementSyntaxTree) => {
					var results = this.acceptableSyntaxes.find(node);
					if (results.length !== 1) {
						chapter.process.error(t("compile.block_not_supported", node.symbol), node);
						return;
					}
					var expects = results[0].argsLength;
					var arg:ArgumentSyntaxTree[] = node.args || [];
					if (expects.indexOf(arg.length) === -1) {
						var expected = expects.map((n)=>Number(n).toString()).join(" or ");
						var message = t("compile.args_length_mismatch", expected, arg.length);
						chapter.process.error(message, node);
						return;
					}

					return results[0].process(chapter.process, node);
				},
				visitInlineElementPre: (node:InlineElementSyntaxTree) => {
					var results = this.acceptableSyntaxes.find(node);
					if (results.length !== 1) {
						chapter.process.error(t("compile.inline_not_supported", node.symbol), node);
						return;
					}
					return results[0].process(chapter.process, node);
				}
			});

			// 最初は必ず Level 1
			ReVIEW.visit(chapter.root, {
				visitDefaultPre: (node:SyntaxTree) => {
				},
				visitChapterPre: (node:ChapterSyntaxTree) => {
					if (node.level === 1) {
						if (!findChapter(node)) {
							// ここに来るのは実装のバグのはず
							chapter.process.error(t("compile.chapter_not_toplevel"), node);
						}
					} else {
						var parent = findChapter(node.parentNode);
						if (!parent) {
							chapter.process.error(t("compile.chapter_topleve_eq1"), node);
						}
					}
				}
			});
		}

		resolveSymbolAndReference(book:Book) {
			// symbols の解決
			// Arrayにflatten がなくて悲しい reduce だと長い…
			var symbols:ISymbol[] = flatten(book.parts.map(part=>part.chapters.map(chapter=>chapter.process.symbols)));
			symbols.forEach(symbol=> {
				// referenceToのpartやchapterの解決
				var referenceTo = symbol.referenceTo;
				if (!referenceTo) {
					return;
				}
				if (!referenceTo.part) {
					book.parts.forEach(part=> {
						if (referenceTo.partName === part.name) {
							referenceTo.part = part;
						}
					});
				}
				if (!referenceTo.part) {
					symbol.chapter.process.error(t("compile.part_is_missing", symbol.part.name), symbol.node);
					return;
				}
				if (!referenceTo.chapter) {
					referenceTo.part.chapters.forEach(chap=> {
						if (referenceTo.chapterName === chap.name) {
							referenceTo.chapter = chap;
						}
					});
				}
				if (!referenceTo.chapter) {
					symbol.chapter.process.error(t("compile.chapter_is_missing", symbol.chapter.name), symbol.node);
					return;
				}
			});
			// referenceTo.node の解決
			symbols.forEach(symbol=> {
				if (symbol.referenceTo && !symbol.referenceTo.referenceNode) {
					var reference = symbol.referenceTo;
					symbols.forEach(symbol=> {
						if (reference.part === symbol.part && reference.chapter === symbol.chapter && reference.targetSymbol === symbol.symbolName && reference.label === symbol.labelName) {
							reference.referenceNode = symbol.node;
						}
					});
					if (!reference.referenceNode) {
						symbol.chapter.process.error(t("compile.reference_is_missing", reference.targetSymbol, reference.label), symbol.node);
						return;
					}
				}
			});
			// 同一チャプター内に同一シンボル(listとか)で同一labelの要素がないかチェック
			symbols.forEach(symbol1=> {
				symbols.forEach(symbol2=> {
					if (symbol1 === symbol2) {
						return;
					}
					if (symbol1.chapter === symbol2.chapter && symbol1.symbolName === symbol2.symbolName) {
						if (symbol1.labelName && symbol2.labelName && symbol1.labelName === symbol2.labelName) {
							symbol1.chapter.process.error(t("compile.duplicated_label"), symbol1.node, symbol2.node);
							return;
						}
					}
				});
			});
		}
	}
}
