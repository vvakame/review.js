///<reference path='../Builder.ts' />

module ReVIEW {
	export module Build {

	import SyntaxTree = ReVIEW.Parse.SyntaxTree;
	import NodeSyntaxTree = ReVIEW.Parse.NodeSyntaxTree;
	import BlockElementSyntaxTree = ReVIEW.Parse.BlockElementSyntaxTree;
	import InlineElementSyntaxTree = ReVIEW.Parse.InlineElementSyntaxTree;
	import HeadlineSyntaxTree = ReVIEW.Parse.HeadlineSyntaxTree;
	import TextNodeSyntaxTree = ReVIEW.Parse.TextNodeSyntaxTree;
	import ChapterSyntaxTree = ReVIEW.Parse.ChapterSyntaxTree;

		export class TextBuilder extends DefaultBuilder {

			headline_pre(process:Process, name:string, node:HeadlineSyntaxTree) {
				// TODO no の採番がレベル別になっていない
				// TODO 2.3.2 みたいな階層を返せるメソッドが何かほしい
				process.out("■H").out(node.level).out("■");
				if (node.level === 1) {
					process.out("第").out(node.parentNode.no).out("章").out("　");
				} else if (node.level === 2) {
					process.out(node.parentNode.toChapter().fqn).out("　");
				}
			}

			headline_post(process:Process, name:string, node:HeadlineSyntaxTree) {
				process.out("\n\n");
			}

			block_list_pre(process:Process, node:BlockElementSyntaxTree) {
				process.out("◆→開始:リスト←◆\n");
				var chapter = this.findChapter(node, 1);
				process.out("リスト").out(chapter.fqn).out(".").out(node.no).out("　").out(node.args[1].arg).out("\n");
				return (v) => {
					// name, args はパスしたい
					node.childNodes.forEach((node)=> {
						ReVIEW.visit(node, v);
					});
				};
			}

			block_list_post(process:Process, node:BlockElementSyntaxTree) {
				process.out("◆→終了:リスト←◆\n");
			}

			inline_list(process:Process, node:InlineElementSyntaxTree) {
				var chapter = this.findChapter(node, 1);
				var listNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
				process.out("リスト").out(chapter.fqn).out(".").out(listNode.no);
			}

			inline_hd_pre(process:Process, node:InlineElementSyntaxTree) {
				process.out("「");
				var chapter = this.findChapter(node);
				if (chapter.level === 1) {
					process.out(chapter.fqn).out("章 ");
				} else {
					process.out(chapter.fqn).out(" ");
				}
				process.out(this.contentToString(chapter.headline));
				return false;
			}

			inline_hd_post(process:Process, node:InlineElementSyntaxTree) {
				process.out("」");
			}
		}
	}
}
