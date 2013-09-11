///<reference path='../i18n/i18n.ts' />
///<reference path='../model/CompilerModel.ts' />

module ReVIEW.Build {

import t = ReVIEW.i18n.t;

import SyntaxTree = ReVIEW.Parse.SyntaxTree;
import ChapterSyntaxTree = ReVIEW.Parse.ChapterSyntaxTree;

	/**
	 * IAnalyzerで処理した後の構文木について構文上のエラーがないかチェックする。
	 * また、Builderと対比させて、未実装の候補がないかをチェックする。
	 */
	export interface IValidator {
		init(book:Book, builders:IBuilder[]);
	}

	export class DefaultValidator implements IValidator {

		init(book:Book, builders:IBuilder[]) {
			this.checkBook(book);
		}

		checkBook(book:Book) {
			book.parts.forEach(part=> this.checkPart(part));
		}

		checkPart(part:Part) {
			part.chapters.forEach(chapter=>this.checkChapter(chapter));
		}

		checkChapter(chapter:Chapter) {
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
	}
}
