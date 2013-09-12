///<reference path='../i18n/i18n.ts' />
///<reference path='../model/CompilerModel.ts' />
///<reference path='Analyzer.ts' />

module ReVIEW.Build {

import t = ReVIEW.i18n.t;

import SyntaxTree = ReVIEW.Parse.SyntaxTree;
import ChapterSyntaxTree = ReVIEW.Parse.ChapterSyntaxTree;
import HeadlineSyntaxTree = ReVIEW.Parse.HeadlineSyntaxTree;
import BlockElementSyntaxTree = ReVIEW.Parse.BlockElementSyntaxTree;
import InlineElementSyntaxTree = ReVIEW.Parse.InlineElementSyntaxTree;

	/**
	 * IAnalyzerで処理した後の構文木について構文上のエラーがないかチェックする。
	 * また、Builderと対比させて、未実装の候補がないかをチェックする。
	 */
	export interface IValidator {
		start(book:Book, acceptableSyntaxes:AcceptableSyntaxes, builders:IBuilder[]);
	}

	export class DefaultValidator implements IValidator {
		acceptableSyntaxes:AcceptableSyntaxes;
		builders:IBuilder[];

		start(book:Book, acceptableSyntaxes:AcceptableSyntaxes, builders:IBuilder[]) {
			this.acceptableSyntaxes = acceptableSyntaxes;
			this.builders = builders;

			this.checkBook(book);
			this.resolveSymbolAndReference(book);
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
					}
					return results[0].process(chapter.process, node);
				},
				visitBlockElementPre: (node:BlockElementSyntaxTree) => {
					var results = this.acceptableSyntaxes.find(node);
					if (results.length !== 1) {
						chapter.process.error(t("compile.syntax_definietion_error"), node);
					}
					var expects = results[0].argsLength;
					var arg = node.args || [];
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
						chapter.process.error(t("compile.syntax_definietion_error"), node);
					}
					return results[0].process(chapter.process, node);
				}
			});

			// 章の下に項がいきなり来ていないか(節のレベルを飛ばしている)
			// 最初は必ず Level 1, 1以外の場合は1つ上のChapterとのレベル差が1でなければならない
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
						} else if (parent.level !== node.level - 1) {
							chapter.process.error(t("compile.chapter_level_omission", node.level, node.level - 1, parent ? String(parent.level) : "none"), node);
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
