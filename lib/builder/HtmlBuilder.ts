///<reference path='../utils/Utils.ts' />
///<reference path='Builder.ts' />
///<reference path='../i18n/i18n.ts' />

module ReVIEW.Build {
	"use strict";

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
	import ColumnSyntaxTree = ReVIEW.Parse.ColumnSyntaxTree;
	import ColumnHeadlineSyntaxTree = ReVIEW.Parse.ColumnHeadlineSyntaxTree;

	import nodeContentToString = ReVIEW.nodeContentToString;
	import findChapter = ReVIEW.findChapter;
	import findUp = ReVIEW.findUp;

	export class HtmlBuilder extends DefaultBuilder {
		extention = "html";

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
				pre += "  <meta name=\"generator\" content=\"Re:VIEW\" />\n";
				var name:string = null;
				ReVIEW.visit(chapter.root, {
					visitDefaultPre: ()=> {
					},
					visitChapterPre: (node:ChapterSyntaxTree)=> {
						if (node.headline.level === 1) {
							name = nodeContentToString(process, node.headline.caption);
						}
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

		headlinePre(process:BuilderProcess, name:string, node:HeadlineSyntaxTree) {
			process.out("<h").out(node.level);
			if (node.label) {
				process.out(" id=\"").out(node.label.arg).out("\"");
			}
			process.out(">");
			var constructLabel = (node:SyntaxTree) => {
				var numbers:{[no:number]:number;} = {};
				var maxLevel = 0;
				ReVIEW.walk(node, (node:SyntaxTree) => {
					if (node instanceof ReVIEW.Parse.ChapterSyntaxTree) {
						numbers[node.toChapter().level] = node.no;
						maxLevel = Math.max(maxLevel, node.toChapter().level);
					} else if (node instanceof  ReVIEW.Parse.ColumnSyntaxTree) {
						numbers[node.toColumn().level] = -1;
						maxLevel = Math.max(maxLevel, node.toColumn().level);
					}
					return node.parentNode;
				});
				var result:number[] = [];
				for (var i = 1; i <= maxLevel; i++) {
					if (numbers[i] === -1) {
						result.push(0);
					} else if (typeof numbers[i] === "undefined") {
						result.push(1);
					} else {
						result.push(numbers[i] || 0);
					}
				}
				return result.join("-");
			};
			process.out("<a id=\"h").out(constructLabel(node)).out("\"></a>");

			if (node.level === 1) {
				var text = i18n.t("builder.chapter", node.parentNode.no);
				process.out(text).out("　");
			} else if (node.level === 2) {
				// process.out(node.parentNode.toChapter().fqn).out("　");
			}
		}

		headlinePost(process:BuilderProcess, name:string, node:HeadlineSyntaxTree) {
			process.out("</h").out(node.level).out(">\n");
		}

		columnPre(process:BuilderProcess, node:ColumnSyntaxTree) {
			process.out("<div class=\"column\">\n\n");
		}

		columnPost(process:BuilderProcess, node:ColumnSyntaxTree) {
			process.out("</div>\n");
		}

		columnHeadlinePre(process:BuilderProcess, node:ColumnHeadlineSyntaxTree) {
			process.out("<h").out(node.level).out(">");
			process.out("<a id=\"column-").out(node.parentNode.no).out("\"></a>");

			return (v:ITreeVisitor)=> {
				ReVIEW.visit(node.caption, v);
			};
		}

		columnHeadlinePost(process:BuilderProcess, node:ColumnHeadlineSyntaxTree) {
			process.out("</h").out(node.level).out(">\n");
		}

		paragraphPre(process:BuilderProcess, name:string, node:NodeSyntaxTree) {
			if (node.prev && node.prev.isBlockElement() && node.prev.toBlockElement().symbol === "noindent") {
				process.out("<p class=\"noindent\">");
			} else {
				process.out("<p>");
			}
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

		block_listnum_pre(process:BuilderProcess, node:BlockElementSyntaxTree) {
			//TODO エスケープ処理
			process.out("<div class=\"code\">\n");
			var chapter = findChapter(node, 1);
			var text = i18n.t("builder.list", chapter.fqn, node.no);
			process.out("<p class=\"caption\">").out(text).out(": ").out(node.args[1].arg).out("</p>\n");
			process.out("<pre class=\"list\">");
			var lineCount = 1;
			return (v:ITreeVisitor)=> {
				// name, args はパスしたい
				node.childNodes.forEach((node, index, childNodes)=> {
					if (node.isTextNode()) {
						// 改行する可能性があるのはTextNodeだけ…のはず
						var hasNext = !!childNodes[index + 1];
						var textNode = node.toTextNode();
						var lines = textNode.text.split("\n");
						lines.forEach((line, index)=> {
							process.out(" ").out(lineCount).out(": ");
							process.out(line);
							if (!hasNext || lines.length - 1 !== index) {
								lineCount++;
							}
							if (lines.length - 1 !== index) {
								process.out("\n");
							}
						});
					} else {
						ReVIEW.visit(node, v);
					}
				});
			};
		}

		block_listnum_post(process:BuilderProcess, node:BlockElementSyntaxTree) {
			process.out("\n</pre>\n").out("</div>\n");
		}

		inline_list(process:BuilderProcess, node:InlineElementSyntaxTree) {
			var chapter = findChapter(node, 1);
			var listNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
			var text = i18n.t("builder.list", chapter.fqn, listNode.no);
			process.out(text);
			return false;
		}

		block_emlist_pre(process:BuilderProcess, node:BlockElementSyntaxTree) {
			//TODO エスケープ処理
			process.out("<div class=\"emlist-code\">\n");
			if (node.args[0]) {
				process.out("<p class=\"caption\">").out(node.args[0].arg).out("</p>\n");
			}
			process.out("<pre class=\"emlist\">");
			return (v:ITreeVisitor)=> {
				// name, args はパスしたい
				node.childNodes.forEach((node)=> {
					ReVIEW.visit(node, v);
				});
			};
		}

		block_emlist_post(process:BuilderProcess, node:BlockElementSyntaxTree) {
			process.out("\n</pre>\n").out("</div>\n");
		}

		block_emlistnum_pre(process:BuilderProcess, node:BlockElementSyntaxTree) {
			//TODO エスケープ処理
			process.out("<div class=\"emlistnum-code\">\n");
			process.out("<pre class=\"emlist\">");
			var lineCount = 1;
			return (v:ITreeVisitor)=> {
				// name, args はパスしたい
				node.childNodes.forEach((node, index, childNodes)=> {
					if (node.isTextNode()) {
						// 改行する可能性があるのはTextNodeだけ…のはず
						var hasNext = !!childNodes[index + 1];
						var textNode = node.toTextNode();
						var lines = textNode.text.split("\n");
						lines.forEach((line, index)=> {
							process.out(" ").out(lineCount).out(": ");
							process.out(line);
							if (!hasNext || lines.length - 1 !== index) {
								lineCount++;
							}
							if (lines.length - 1 !== index) {
								process.out("\n");
							}
						});
					} else {
						ReVIEW.visit(node, v);
					}
				});
			};
		}

		block_emlistnum_post(process:BuilderProcess, node:BlockElementSyntaxTree) {
			process.out("\n</pre>\n").out("</div>\n");
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
			process.out("<br />");
		}

		inline_b_pre(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("<b>");
		}

		inline_b_post(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("</b>");
		}

		inline_code_pre(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("<tt class=\"inline-code\">");
		}

		inline_code_post(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("</tt>");
		}

		inline_href(process:BuilderProcess, node:InlineElementSyntaxTree) {
			var href = nodeContentToString(process, node);
			var text = href;
			if (href.indexOf(",") !== -1) {
				text = href.slice(href.indexOf(",") + 1).trimLeft();
				href = href.slice(0, href.indexOf(","));
			}
			process.out("<a href=\"" + href + "\" class=\"link\">").out(text).out("</a>");
			return false;
		}

		block_label(process:BuilderProcess, node:BlockElementSyntaxTree) {
			process.out("<a id=\"").out(node.args[0].arg).out("\"></a>\n");
			return false;
		}

		inline_tt_pre(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("<tt>"); // TODO RubyReviewではContentに改行が含まれている奴の挙動がサポートされていない。
		}

		inline_tt_post(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("</tt>");
		}

		inline_ruby_pre(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("<ruby>");
			return (v:ReVIEW.ITreeVisitor) => {
				// name, args はパス
				node.childNodes.forEach(node=> {
					var contentString = nodeContentToString(process, node);
					var keywordData = contentString.split(",");
					// TODO ユーザの入力内容のチェックが必要
					process.out("<rb>").out(keywordData[0]).out("</rb>");
					process.out("<rp>（</rp><rt>");
					process.out(keywordData[1]);
					process.out("</rt><rp>）</rp>");
				});
			};
		}

		inline_ruby_post(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("</ruby>");
		}

		inline_u_pre(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("<u>");
		}

		inline_u_post(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("</u>");
		}

		inline_kw_pre(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("<b class=\"kw\">");
			return (v:ReVIEW.ITreeVisitor) => {
				// name, args はパス
				node.childNodes.forEach(node=> {
					var contentString = nodeContentToString(process, node);
					var keywordData = contentString.split(",");
					// TODO ユーザの入力内容のチェックが必要
					process.out(keywordData[0] + " (" + keywordData[1].trimLeft() + ")");
				});
			};
		}

		inline_kw_post(process:BuilderProcess, node:InlineElementSyntaxTree) {
			var contentString = nodeContentToString(process, node);
			var keywordData = contentString.split(",");
			process.out("</b>").out("<!-- IDX:").out(keywordData[0]).out(" -->");
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

		block_indepimage(process:BuilderProcess, node:BlockElementSyntaxTree) {
			// TODO ファイル名探索ロジックをもっと頑張る(jpgとかsvgとか)
			var chapterFileName = process.base.chapter.name;
			var chapterName = chapterFileName.substring(0, chapterFileName.length - 3);
			var imagePath = "images/" + chapterName + "-" + node.args[0].arg + ".png";
			var caption:string = "";
			if (node.args[1]) {
				caption = node.args[1].arg;
			}
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
			if (scale !== 1) {
				process.out("<img src=\"" + imagePath + "\" alt=\"" + caption + "\" width=\"" + (scale * 100) + "%\" />\n");
			} else {
				process.out("<img src=\"" + imagePath + "\" alt=\"" + caption + "\" />\n");
			}
			if (node.args[1]) {
				process.out("<p class=\"caption\">\n");
				process.out("図: ").out(caption);
				process.out("\n</p>\n");
			}
			process.out("</div>\n");
			return false;
		}

		inline_img(process:BuilderProcess, node:InlineElementSyntaxTree) {
			var imgNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
			process.out("図").out(process.base.chapter.no).out(".").out(imgNode.no);
			return false;
		}

		inline_icon(process:BuilderProcess, node:InlineElementSyntaxTree) {
			// TODO ファイル名探索ロジックをもっと頑張る(jpgとかsvgとか)
			var chapterFileName = process.base.chapter.name;
			var chapterName = chapterFileName.substring(0, chapterFileName.length - 3);
			var imageName = nodeContentToString(process, node);
			var imagePath = "images/" + chapterName + "-" + imageName + ".png";
			process.out("<img src=\"").out(imagePath).out("\" alt=\"[").out(imageName).out("]\" />");
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

		block_lead_pre(process:BuilderProcess, node:BlockElementSyntaxTree) {
			process.out("<div class=\"lead\">\n");
		}

		block_lead_post(process:BuilderProcess, node:BlockElementSyntaxTree) {
			process.out("</div>\n");
		}

		inline_tti_pre(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("<tt><i>");
		}

		inline_tti_post(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("</i></tt>");
		}

		inline_ttb_pre(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("<tt><b>");
		}

		inline_ttb_post(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("</b></tt>");
		}

		block_noindent(process:BuilderProcess, node:BlockElementSyntaxTree) {
			// paragraphPre 中で処理
			return false;
		}

		block_source_pre(process:BuilderProcess, node:BlockElementSyntaxTree) {
			//TODO エスケープ処理
			process.out("<div class=\"source-code\">\n");
			process.out("<p class=\"caption\">").out(node.args[0].arg).out("</p>\n");
			process.out("<pre class=\"source\">");
			return (v:ITreeVisitor)=> {
				// name, args はパスしたい
				node.childNodes.forEach((node)=> {
					ReVIEW.visit(node, v);
				});
			};
		}

		block_source_post(process:BuilderProcess, node:BlockElementSyntaxTree) {
			process.out("\n</pre>\n").out("</div>\n");
		}

		block_cmd_pre(process:BuilderProcess, node:BlockElementSyntaxTree) {
			//TODO エスケープ処理
			process.out("<div class=\"cmd-code\">\n");
			process.out("<pre class=\"cmd\">");
			return (v:ITreeVisitor)=> {
				// name, args はパスしたい
				node.childNodes.forEach((node)=> {
					ReVIEW.visit(node, v);
				});
			};
		}

		block_cmd_post(process:BuilderProcess, node:BlockElementSyntaxTree) {
			process.out("\n</pre>\n").out("</div>\n");
		}

		block_quote_pre(process:BuilderProcess, node:BlockElementSyntaxTree) {
			process.out("<blockquote><p>");
			return (v:ITreeVisitor)=> {
				// name, args はパスしたい
				node.childNodes.forEach((node)=> {
					ReVIEW.visit(node, v);
				});
			};
		}

		block_quote_post(process:BuilderProcess, node:BlockElementSyntaxTree) {
			process.out("</p></blockquote>\n");
		}

		inline_ami_pre(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("<span class=\"ami\">");
		}

		inline_ami_post(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("</span>");
		}

		inline_bou_pre(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("<span class=\"bou\">");
		}

		inline_bou_post(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("</span>");
		}

		inline_i_pre(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("<i>");
		}

		inline_i_post(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("</i>");
		}

		inline_strong_pre(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("<strong>");
		}

		inline_strong_post(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("</strong>");
		}

		inline_uchar_pre(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("&#x");
		}

		inline_uchar_post(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out(";");
		}

		block_table_pre(process:BuilderProcess, node:BlockElementSyntaxTree) {
			// TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
			//TODO エスケープ処理
			process.out("<div>\n");
			var chapter = findChapter(node, 1);
			var text = i18n.t("builder.table", chapter.fqn, node.no);
			process.out("<p class=\"caption\">").out(text).out(": ").out(node.args[1].arg).out("</p>\n");
			process.out("<pre>");
			return (v:ITreeVisitor)=> {
				// name, args はパスしたい
				node.childNodes.forEach((node)=> {
					ReVIEW.visit(node, v);
				});
			};
		}

		block_table_post(process:BuilderProcess, node:BlockElementSyntaxTree) {
			// TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
			process.out("\n</pre>\n").out("</div>\n");
		}

		inline_table(process:BuilderProcess, node:InlineElementSyntaxTree) {
			// TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
			var chapter = findChapter(node, 1);
			var listNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
			var text = i18n.t("builder.table", chapter.fqn, listNode.no);
			process.out(text);
			return false;
		}

		block_tsize(process:BuilderProcess, node:BlockElementSyntaxTree) {
			// TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
			return false;
		}

		block_comment_pre(process:BuilderProcess, node:BlockElementSyntaxTree) {
			process.out("<!-- ");

			return (v:ITreeVisitor)=> {
				// name, args はパスしたい
				node.childNodes.forEach((node)=> {
					ReVIEW.visit(node, v);
				});
			};
		}

		block_comment_post(process:BuilderProcess, node:BlockElementSyntaxTree) {
			process.out(" -->\n");
		}

		inline_comment_pre(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out("<!-- ");
		}

		inline_comment_post(process:BuilderProcess, node:InlineElementSyntaxTree) {
			process.out(" -->");
		}
	}
}
