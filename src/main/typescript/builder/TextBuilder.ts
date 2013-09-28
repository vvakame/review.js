///<reference path='../utils/Utils.ts' />
///<reference path='Builder.ts' />
///<reference path='../i18n/i18n.ts' />

module ReVIEW.Build {

import i18n = ReVIEW.i18n;

import SyntaxTree = ReVIEW.Parse.SyntaxTree;
import NodeSyntaxTree = ReVIEW.Parse.NodeSyntaxTree;
import BlockElementSyntaxTree = ReVIEW.Parse.BlockElementSyntaxTree;
import InlineElementSyntaxTree = ReVIEW.Parse.InlineElementSyntaxTree;
import HeadlineSyntaxTree = ReVIEW.Parse.HeadlineSyntaxTree;
import UlistElementSyntaxTree = ReVIEW.Parse.UlistElementSyntaxTree;
import TextNodeSyntaxTree = ReVIEW.Parse.TextNodeSyntaxTree;
import ChapterSyntaxTree = ReVIEW.Parse.ChapterSyntaxTree;

import nodeContentToString = ReVIEW.nodeContentToString;
import findChapter = ReVIEW.findChapter;

	export class TextBuilder extends DefaultBuilder {

		chapterPost(process:BuilderProcess, node:ChapterSyntaxTree):any {
			if (!node.headline.cmd) {
				// 非 column
				process.out("\n");
			} else {
				// column
				process.out("◆→終了:←◆\n");
			}
		}

		headlinePre(process:BuilderProcess, name:string, node:HeadlineSyntaxTree) {
			// TODO no の採番がレベル別になっていない
			// TODO 2.3.2 みたいな階層を返せるメソッドが何かほしい
			if (!node.cmd) {
				// 非 column
				process.out("■H").out(node.level).out("■");
				if (node.level === 1) {
					var text = i18n.t("builder.chapter", node.parentNode.no);
					process.out(text).out("　");
				} else if (node.level === 2) {
					process.out(node.parentNode.toChapter().fqn).out("　");
				}
			} else {
				// column
				process.out("◆→開始:←◆\n");
				process.out("■");
				return v => {
					ReVIEW.visit(node.caption, v);
				};
			}
		}

		headlinePost(process:BuilderProcess, name:string, node:HeadlineSyntaxTree) {
			process.out("\n\n");
		}

		ulistPre(process:BuilderProcess, name:string, node:UlistElementSyntaxTree) {
			process.out("・");
			return (v)=> {
				ReVIEW.visit(node.text, v);
				process.out("\n");
				node.childNodes.forEach(child=> {
					process.out(stringRepeat(child.toUlist().level - 1, "    "));
					ReVIEW.visit(child, v);
				});
			};
		}

		ulistPost(process:BuilderProcess, name:string, node:UlistElementSyntaxTree) {

		}

		block_list_pre(process:BuilderProcess, node:BlockElementSyntaxTree) {
			process.out("◆→開始:リスト←◆\n");
			var chapter = findChapter(node, 1);
			var text = i18n.t("builder.list", chapter.fqn, node.no);
			process.out(text).out("　").out(node.args[1].arg).out("\n\n");
			return (v) => {
				// name, args はパスしたい
				node.childNodes.forEach((node)=> {
					ReVIEW.visit(node, v);
				});
			};
		}

		block_list_post(process:BuilderProcess, node:BlockElementSyntaxTree) {
			process.out("◆→終了:リスト←◆\n");
		}

		inline_list(process:BuilderProcess, node:InlineElementSyntaxTree) {
			var chapter = findChapter(node, 1);
			var listNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
			var text = i18n.t("builder.list", chapter.fqn, listNode.no);
			process.out(text);
			return false;
		}

		inline_hd_pre(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("「");
			var chapter = findChapter(node);
			if (chapter.level === 1) {
				process.out(chapter.fqn).out("章 ");
			} else {
				process.out(chapter.fqn).out(" ");
			}
			process.out(nodeContentToString(process, chapter.headline));
			return false;
		}

		inline_hd_post(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("」");
		}

		inline_br(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("\n");
		}

		inline_b_pre(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("★");
		}

		inline_b_post(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("☆");
		}

		inline_code_pre(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("△");
		}

		inline_code_post(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("☆");
		}

		inline_href_pre(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("△");
		}

		inline_href_post(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("☆");
		}

		// TODO 未完了
		inline_kw(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("[p]");
		}

		inline_tt_pre(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("△");
		}

		inline_tt_post(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("☆");
		}

	}
}
