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

	export class HtmlBuilder extends DefaultBuilder {

		constructor(private standalone = true) {
			super();
		}

		processPost(process:BuilderProcess, chapter:Chapter):void {
			if (this.standalone) {

				var pre = "";
				pre += "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
				pre += "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.1//EN\" \"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd\">\n";
				pre += "<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:ops=\"http://www.idpf.org/2007/ops\" xml:lang=\"ja\">\n";
				pre += "<head>\n";
				pre += "  <meta http-equiv=\"Content-Type\" content=\"text/html;charset=UTF-8\" />\n";
				pre += "  <meta http-equiv=\"Content-Style-Type\" content=\"text/css\" />\n";
				pre += "  <meta name=\"generator\" content=\"ReVIEW\" />\n";
				var name:string = null;
				ReVIEW.visit(chapter.root, {
					visitDefaultPre: ()=> {
					},
					visitChapterPre: (node:ChapterSyntaxTree)=> {
						name = nodeContentToString(process, node.headline.caption);
					}
				});
				pre += "  <title>" + name + "</title>\n";
				pre += "</head>\n";
				pre += "<body>\n";
				process.pushOut(pre);

				process.out("</body>\n");
				process.out("</html>\n");
			}
		}

		chapterPost(process:BuilderProcess, node:ChapterSyntaxTree):any {
		}

		headlinePre(process:BuilderProcess, name:string, node:HeadlineSyntaxTree) {
			process.out("<h").out(node.level).out(">");
			process.out("<a id=\"h").out(node.level).out("\"></a>");
			if (node.level === 1) {
				var text = i18n.t("builder.chapter", node.parentNode.no);
				process.out(text).out("　");
			} else if (node.level === 2) {
				process.out(node.parentNode.toChapter().fqn).out("　");
			}
		}

		headlinePost(process:BuilderProcess, name:string, node:HeadlineSyntaxTree) {
			process.out("</h").out(node.level).out(">\n");
		}

        ulistPre(process:BuilderProcess, name:string, node:UlistElementSyntaxTree) {
            process.out("<li>");
            if (node.childNodes.length > 0) {
                return (v)=> {
                    ReVIEW.visit(node.text, v);
                    process.out("<ul>");
                    node.childNodes.forEach(child=>{
                        ReVIEW.visit(child, v);
                    });
                    process.out("</ul>");
                };
            }
        }

        ulistPost(process:BuilderProcess, name:string, node:UlistElementSyntaxTree) {
            process.out("</li>");
        }

		block_list_pre(process:BuilderProcess, node:BlockElementSyntaxTree) {
			//TODO エスケープ処理
			process.out("<div class=\"caption-code\">\n");
			var chapter = findChapter(node, 1);
			var text = i18n.t("builder.list", chapter.fqn, node.no);
			process.out("<p class=\"caption\">").out(text).out(": ").out(node.args[1].arg).out("</p>\n");
			process.out("<pre class=\"list\">");
			return (v) => {
				// name, args はパスしたい
				node.childNodes.forEach((node)=> {
					ReVIEW.visit(node, v);
				});
			};
		}

		block_list_post(process:BuilderProcess, node:BlockElementSyntaxTree) {
			process.out("</pre>\n").out("</div>\n");
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
			process.out("<br/>");
		}
	}
}
