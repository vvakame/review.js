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
import OlistElementSyntaxTree = ReVIEW.Parse.OlistElementSyntaxTree;
import DlistElementSyntaxTree = ReVIEW.Parse.DlistElementSyntaxTree;
import TextNodeSyntaxTree = ReVIEW.Parse.TextNodeSyntaxTree;
import ChapterSyntaxTree = ReVIEW.Parse.ChapterSyntaxTree;

import nodeContentToString = ReVIEW.nodeContentToString;
import findChapter = ReVIEW.findChapter;
import findUp = ReVIEW.findUp;

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

		text(process:BuilderProcess, node:TextNodeSyntaxTree):any {
			process.out(node.text);
		}

		headlinePre(process:BuilderProcess, name:string, node:HeadlineSyntaxTree) {
			if (node.cmd) {
				process.out("<div class=\"column\">\n");
			}
			process.out("<h").out(node.level);
			if (node.label) {
				process.out(" id=\"").out(node.label.arg).out("\"");
			}
			process.out(">");
			if (node.cmd) {
				process.out("<a id=\"column-").out(node.parentNode.no).out("\"></a>");
			} else {
				process.out("<a id=\"h").out(node.level).out("\"></a>");
			}
			if (node.cmd) {
				return (v:ITreeVisitor)=> {
					ReVIEW.visit(node.caption, v);
				};
			} else if (node.level === 1) {
				var text = i18n.t("builder.chapter", node.parentNode.no);
				process.out(text).out("　");
			} else if (node.level === 2) {
				process.out(node.parentNode.toChapter().fqn).out("　");
			}
		}

		headlinePost(process:BuilderProcess, name:string, node:HeadlineSyntaxTree) {
			process.out("</h").out(node.level).out(">\n");
			if (node.cmd) {
				process.out("</div>\n");
			}
		}

		paragraphPre(process:BuilderProcess, name:string, node:NodeSyntaxTree) {
			process.out("<p>");
		}

		paragraphPost(process:BuilderProcess, name:string, node:NodeSyntaxTree) {
			process.out("</p>\n");
		}

		ulistPre(process:BuilderProcess, name:string, node:UlistElementSyntaxTree) {
			this.ulistParentHelper(process, node, ()=> {
				process.out("<ul>\n<li>");
			});
			// TODO <p> で囲まれないようにする
			if (node.prev instanceof UlistElementSyntaxTree === false) {
				process.out("<ul>\n");
			}
			process.out("<li>");
		}

		ulistPost(process:BuilderProcess, name:string, node:UlistElementSyntaxTree) {
			process.out("</li>\n");
			if (node.next instanceof UlistElementSyntaxTree === false) {
				process.out("</ul>\n");
			}
			this.ulistParentHelper(process, node, ()=> {
				process.out("</li>\n</ul>\n");
			});
		}

		olistPre(process:BuilderProcess, name:string, node:OlistElementSyntaxTree) {
			if (node.prev instanceof OlistElementSyntaxTree === false) {
				process.out("<ol>\n");
			}
			process.out("<li>");
		}

		olistPost(process:BuilderProcess, name:string, node:OlistElementSyntaxTree) {
			process.out("</li>\n");
			if (node.next instanceof OlistElementSyntaxTree === false) {
				process.out("</ol>\n");
			}
		}

		dlistPre(process:BuilderProcess, name:string, node:DlistElementSyntaxTree) {
			if (node.prev instanceof DlistElementSyntaxTree === false) {
				process.out("<dl>\n");
			}
			return (v:ITreeVisitor)=> {
				process.out("<dt>");
				ReVIEW.visit(node.text, v);
				process.out("</dt>\n");
				process.out("<dd>");
				ReVIEW.visit(node.content, v);
				process.out("</dd>\n");
			};
		}

		dlistPost(process:BuilderProcess, name:string, node:DlistElementSyntaxTree) {
			if (node.next instanceof DlistElementSyntaxTree === false) {
				process.out("</dl>\n");
			}
		}

		block_list_pre(process:BuilderProcess, node:BlockElementSyntaxTree) {
			//TODO エスケープ処理
			process.out("<div class=\"caption-code\">\n");
			var chapter = findChapter(node, 1);
			var text = i18n.t("builder.list", chapter.fqn, node.no);
			process.out("<p class=\"caption\">").out(text).out(": ").out(node.args[1].arg).out("</p>\n");
			process.out("<pre class=\"list\">");
			return (v:ITreeVisitor)=> {
				// name, args はパスしたい
				node.childNodes.forEach((node)=> {
					ReVIEW.visit(node, v);
				});
			};
		}

		block_list_post(process:BuilderProcess, node:BlockElementSyntaxTree) {
			process.out("\n</pre>\n").out("</div>\n");
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

		inline_b_pre(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("<b>");
		}

		inline_b_post(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("</b>");
		}

		inline_code_pre(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("<tt class='inline-code'>");
		}

		inline_code_post(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("</tt>");
		}

		inline_href_pre(process:BuilderProcess, node:InlineElementSyntaxTree) {
			var href = nodeContentToString(process, node);
			process.out("<a href=\"" + href + "\">");
		}

		inline_href_post(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("</a>");
		}

		inline_tt_pre(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("<tt>"); // TODO RubyReviewではContentに改行が含まれている奴の挙動がサポートされていない。
		}

		inline_tt_post(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("</tt>");
		}

		// TODO 未完了 ←何が未完了なのかアウトラインを書く
		inline_kw_pre(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("<b>");
			return (v) => {
				// name, args はパス
				node.childNodes.forEach(node=> {
					var contentString = nodeContentToString(process, node);
					var keywordData = contentString.split(",");
					// TODO ユーザの入力内容のチェックが必要
					process.out(keywordData[0] + "(" + keywordData[1] + ")");
				});
			};
		}

		inline_kw_post(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("</b>");
		}

		inline_em_pre(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("<em>");
		}

		inline_em_post(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("</em>");
		}

		block_image(process:BuilderProcess, node:BlockElementSyntaxTree) {
			// TODO ファイル名探索ロジックをもっと頑張る(jpgとかsvgとか)
			var chapterFileName = process.base.chapter.name;
			var chapterName = chapterFileName.substring(0, chapterFileName.length - 3);
			var imagePath = "images/" + chapterName + "-" + node.args[0].arg + ".png";
			var caption = node.args[1].arg;
			var scale:number = 1;
			if (node.args[2]) {
				var arg3 = node.args[2].arg;
				var regexp = new RegExp("scale=(\\d+(?:\\.\\d+))");
				var result = regexp.exec(node.args[2].arg);
				if (result) {
					scale = parseFloat(result[1]);
				}
			}
			process.out("<div class=\"image\">\n");
			process.out("<img src=\"" + imagePath + "\" alt=\"" + caption + "\" width=\"" + (scale * 100) + "%\" />\n");
			process.out("<p class=\"caption\">\n");
			process.out("図").out(process.base.chapter.no).out(".").out(node.no).out(": ").out(caption);
			process.out("\n</p>\n");
			process.out("</div>\n");
			return false;
		}

		inline_img(process:BuilderProcess, node:InlineElementSyntaxTree) {
			var imgNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
			process.out("図").out(process.base.chapter.no).out(".").out(imgNode.no);
			return false;
		}

		block_footnote(process:BuilderProcess, node:BlockElementSyntaxTree) {
			process.out("<div class=\"footnote\"><p class=\"footnote\">[<a id=\"fn-");
			process.out(node.args[0].arg).out("\">*").out(node.no).out("</a>] ");
			process.out(node.args[1].arg);
			process.out("</p></div>\n");
			return false;
		}

		inline_fn(process:BuilderProcess, node:InlineElementSyntaxTree) {
			var footnoteNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
			process.out("<a href=\"#fn-").out(footnoteNode.args[0].arg).out("\">*").out(footnoteNode.no).out("</a>");
			return false;
		}
	}
}
