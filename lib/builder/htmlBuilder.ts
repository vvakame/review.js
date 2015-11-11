"use strict";

import {t} from "../i18n/i18n";
import {BuilderProcess, ContentChunk} from "../model/compilerModel";

import {DefaultBuilder} from "./builder";

import {SyntaxTree, NodeSyntaxTree, ChapterSyntaxTree, BlockElementSyntaxTree, InlineElementSyntaxTree, HeadlineSyntaxTree, UlistElementSyntaxTree, OlistElementSyntaxTree, DlistElementSyntaxTree, ColumnSyntaxTree, ColumnHeadlineSyntaxTree} from "../parser/parser";

import {visit, walk, TreeVisitor} from "../parser/walker";

import {nodeContentToString, findChapter, padLeft, linesToFigure} from "../utils/utils";

export class HtmlBuilder extends DefaultBuilder {
	extention = "html";

	escapeMap: { [char: string]: string; } = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': '&quot;',
		"'": '&#39;',
		"/": '&#x2F;'
	};

	constructor(private standalone = true) {
		super();
	}

	escape(data: any): string {
		return String(data).replace(/[&<>"'\/]/g, c=> this.escapeMap[c]);
	}

	processPost(process: BuilderProcess, chunk: ContentChunk): void {
		if (this.standalone) {

			let pre = "";
			pre += "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
			pre += "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.1//EN\" \"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd\">\n";
			pre += "<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:ops=\"http://www.idpf.org/2007/ops\" xml:lang=\"ja\">\n";
			pre += "<head>\n";
			pre += "  <meta http-equiv=\"Content-Type\" content=\"text/html;charset=UTF-8\" />\n";
			pre += "  <meta http-equiv=\"Content-Style-Type\" content=\"text/css\" />\n";
			pre += "  <meta name=\"generator\" content=\"Re:VIEW\" />\n";
			let name: string = null;
			visit(chunk.tree.ast, {
				visitDefaultPre: () => {
				},
				visitChapterPre: (node: ChapterSyntaxTree) => {
					if (node.headline.level === 1) {
						name = nodeContentToString(process, node.headline.caption);
					}
				}
			});
			pre += "  <title>" + this.escape(name) + "</title>\n";
			pre += "</head>\n";
			pre += "<body>\n";
			process.pushOut(pre);

			process.outRaw("</body>\n");
			process.outRaw("</html>\n");
		}
	}

	headlinePre(process: BuilderProcess, name: string, node: HeadlineSyntaxTree) {
		process.outRaw("<h").out(node.level);
		if (node.label) {
			process.outRaw(" id=\"").out(node.label.arg).outRaw("\"");
		}
		process.outRaw(">");
		let constructLabel = (node: SyntaxTree) => {
			let numbers: { [no: number]: number; } = {};
			let maxLevel = 0;
			walk(node, (node: SyntaxTree) => {
				if (node instanceof ChapterSyntaxTree) {
					numbers[node.level] = node.no;
					maxLevel = Math.max(maxLevel, node.level);
				} else if (node instanceof ColumnSyntaxTree) {
					numbers[node.level] = -1;
					maxLevel = Math.max(maxLevel, node.level);
				}
				return node.parentNode;
			});
			let result: number[] = [];
			for (let i = 1; i <= maxLevel; i++) {
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
		process.outRaw("<a id=\"h").out(constructLabel(node)).outRaw("\"></a>");

		if (node.level === 1) {
			let text = t("builder.chapter", node.parentNode.no);
			process.out(text).out("　");
		} else if (node.level === 2) {
			// process.out(node.parentNode.toChapter().fqn).out("　");
		}
	}

	headlinePost(process: BuilderProcess, name: string, node: HeadlineSyntaxTree) {
		process.outRaw("</h").out(node.level).outRaw(">\n");
	}

	columnPre(process: BuilderProcess, node: ColumnSyntaxTree) {
		process.outRaw("<div class=\"column\">\n\n");
	}

	columnPost(process: BuilderProcess, node: ColumnSyntaxTree) {
		process.outRaw("</div>\n");
	}

	columnHeadlinePre(process: BuilderProcess, node: ColumnHeadlineSyntaxTree) {
		process.outRaw("<h").out(node.level).outRaw(">");
		process.outRaw("<a id=\"column-").out(node.parentNode.no).outRaw("\"></a>");

		return (v: TreeVisitor) => {
			visit(node.caption, v);
		};
	}

	columnHeadlinePost(process: BuilderProcess, node: ColumnHeadlineSyntaxTree) {
		process.outRaw("</h").out(node.level).outRaw(">\n");
	}

	paragraphPre(process: BuilderProcess, name: string, node: NodeSyntaxTree) {
		if (node.prev && node.prev.isBlockElement() && node.prev.toBlockElement().symbol === "noindent") {
			process.outRaw("<p class=\"noindent\">");
		} else {
			process.outRaw("<p>");
		}
	}

	paragraphPost(process: BuilderProcess, name: string, node: NodeSyntaxTree) {
		process.outRaw("</p>\n");
	}

	ulistPre(process: BuilderProcess, name: string, node: UlistElementSyntaxTree) {
		this.ulistParentHelper(process, node, () => {
			process.outRaw("<ul>\n<li>");
		});
		// TODO <p> で囲まれないようにする
		if (node.prev instanceof UlistElementSyntaxTree === false) {
			process.outRaw("<ul>\n");
		}
		process.outRaw("<li>");
	}

	ulistPost(process: BuilderProcess, name: string, node: UlistElementSyntaxTree) {
		process.outRaw("</li>\n");
		if (node.next instanceof UlistElementSyntaxTree === false) {
			process.outRaw("</ul>\n");
		}
		this.ulistParentHelper(process, node, () => {
			process.outRaw("</li>\n</ul>\n");
		});
	}

	olistPre(process: BuilderProcess, name: string, node: OlistElementSyntaxTree) {
		if (node.prev instanceof OlistElementSyntaxTree === false) {
			process.outRaw("<ol>\n");
		}
		process.outRaw("<li>");
	}

	olistPost(process: BuilderProcess, name: string, node: OlistElementSyntaxTree) {
		process.outRaw("</li>\n");
		if (node.next instanceof OlistElementSyntaxTree === false) {
			process.outRaw("</ol>\n");
		}
	}

	dlistPre(process: BuilderProcess, name: string, node: DlistElementSyntaxTree) {
		if (node.prev instanceof DlistElementSyntaxTree === false) {
			process.outRaw("<dl>\n");
		}
		return (v: TreeVisitor) => {
			process.outRaw("<dt>");
			visit(node.text, v);
			process.outRaw("</dt>\n");
			process.outRaw("<dd>");
			visit(node.content, v);
			process.outRaw("</dd>\n");
		};
	}

	dlistPost(process: BuilderProcess, name: string, node: DlistElementSyntaxTree) {
		if (node.next instanceof DlistElementSyntaxTree === false) {
			process.outRaw("</dl>\n");
		}
	}

	block_list_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.outRaw("<div class=\"caption-code\">\n");
		let chapter = findChapter(node, 1);
		let text = t("builder.list", chapter.fqn, node.no);
		process.outRaw("<p class=\"caption\">").out(text).outRaw(": ");
		return (v: TreeVisitor) => {
			// name はパスしたい, langもパスしたい
			visit(node.args[1], v);

			process.outRaw("</p>\n");
			process.outRaw("<pre class=\"list\">");
			node.childNodes.forEach((node) => {
				visit(node, v);
			});
		};
	}

	block_list_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.outRaw("\n</pre>\n").outRaw("</div>\n");
	}

	block_listnum_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.outRaw("<div class=\"code\">\n");
		let chapter = findChapter(node, 1);
		let text = t("builder.list", chapter.fqn, node.no);
		process.outRaw("<p class=\"caption\">").out(text).out(": ");
		let lineCount = 1;
		return (v: TreeVisitor) => {
			// name はパスしたい, langもパスしたい
			visit(node.args[1], v);

			process.outRaw("</p>\n");
			process.outRaw("<pre class=\"list\">");

			let lineCountMax = 0;
			node.childNodes.forEach((node, index, childNodes) => {
				if (node.isTextNode()) {
					lineCountMax += node.toTextNode().text.split("\n").length;
				}
			});
			let lineDigit = Math.max(linesToFigure(lineCountMax), 2);

			node.childNodes.forEach((node, index, childNodes) => {
				if (node.isTextNode()) {
					// 改行する可能性があるのはTextNodeだけ…のはず
					let hasNext = !!childNodes[index + 1];
					let textNode = node.toTextNode();
					let lines = textNode.text.split("\n");
					lines.forEach((line, index) => {
						process.out(padLeft(String(lineCount), " ", lineDigit)).out(": ");
						process.out(line);
						if (!hasNext || lines.length - 1 !== index) {
							lineCount++;
						}
						if (lines.length - 1 !== index) {
							process.out("\n");
						}
					});
				} else {
					visit(node, v);
				}
			});
		};
	}

	block_listnum_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.outRaw("\n</pre>\n").outRaw("</div>\n");
	}

	inline_list(process: BuilderProcess, node: InlineElementSyntaxTree) {
		let chapter = findChapter(node, 1);
		let listNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
		let text = t("builder.list", chapter.fqn, listNode.no);
		process.out(text);
		return false;
	}

	block_emlist_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.outRaw("<div class=\"emlist-code\">\n");
		return (v: TreeVisitor) => {
			// name はパスしたい
			if (node.args[0]) {
				process.outRaw("<p class=\"caption\">");
				visit(node.args[0], v);
				process.outRaw("</p>\n");
			}
			process.outRaw("<pre class=\"emlist\">");
			node.childNodes.forEach((node) => {
				visit(node, v);
			});
		};
	}

	block_emlist_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.outRaw("\n</pre>\n").outRaw("</div>\n");
	}

	block_emlistnum_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.outRaw("<div class=\"emlistnum-code\">\n");
		process.outRaw("<pre class=\"emlist\">");
		let lineCount = 1;
		return (v: TreeVisitor) => {
			// name, args はパスしたい
			let lineCountMax = 0;
			node.childNodes.forEach((node, index, childNodes) => {
				if (node.isTextNode()) {
					lineCountMax += node.toTextNode().text.split("\n").length;
				}
			});
			let lineDigit = Math.max(linesToFigure(lineCountMax), 2);

			node.childNodes.forEach((node, index, childNodes) => {
				if (node.isTextNode()) {
					// 改行する可能性があるのはTextNodeだけ…のはず
					let hasNext = !!childNodes[index + 1];
					let textNode = node.toTextNode();
					let lines = textNode.text.split("\n");
					lines.forEach((line, index) => {
						process.out(padLeft(String(lineCount), " ", lineDigit)).out(": ");
						process.out(line);
						if (!hasNext || lines.length - 1 !== index) {
							lineCount++;
						}
						if (lines.length - 1 !== index) {
							process.out("\n");
						}
					});
				} else {
					visit(node, v);
				}
			});
		};
	}

	block_emlistnum_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.outRaw("\n</pre>\n").outRaw("</div>\n");
	}

	inline_hd_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("「");
		let chapter = findChapter(node);
		if (chapter.level === 1) {
			process.out(chapter.fqn).out("章 ");
		} else {
			process.out(chapter.fqn).out(" ");
		}
		process.out(nodeContentToString(process, chapter.headline));
		return false;
	}

	inline_hd_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("」");
	}

	inline_br(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("<br />");
	}

	inline_b_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("<b>");
	}

	inline_b_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("</b>");
	}

	inline_code_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("<tt class=\"inline-code\">");
	}

	inline_code_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("</tt>");
	}

	inline_href(process: BuilderProcess, node: InlineElementSyntaxTree) {
		let href = nodeContentToString(process, node);
		let text = href;
		if (href.indexOf(",") !== -1) {
			text = href.slice(href.indexOf(",") + 1).trimLeft();
			href = href.slice(0, href.indexOf(","));
		}
		process.outRaw("<a href=\"").outRaw(href).outRaw("\" class=\"link\">").out(text).outRaw("</a>");
		return false;
	}

	block_label(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.outRaw("<a id=\"");
		process.out(nodeContentToString(process, node.args[0]));
		process.outRaw("\"></a>\n");
		return false;
	}

	inline_tt_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("<tt>"); // TODO RubyReviewではContentに改行が含まれている奴の挙動がサポートされていない。
	}

	inline_tt_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("</tt>");
	}

	inline_ruby_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("<ruby>");
		return (v: TreeVisitor) => {
			// name, args はパス
			node.childNodes.forEach(node=> {
				let contentString = nodeContentToString(process, node);
				let keywordData = contentString.split(",");
				process.outRaw("<rb>").out(keywordData[0]).outRaw("</rb>");
				process.outRaw("<rp>（</rp><rt>");
				process.out(keywordData[1]);
				process.outRaw("</rt><rp>）</rp>");
			});
		};
	}

	inline_ruby_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("</ruby>");
	}

	inline_u_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("<u>");
	}

	inline_u_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("</u>");
	}

	inline_kw_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("<b class=\"kw\">");
		return (v: TreeVisitor) => {
			// name, args はパス
			node.childNodes.forEach(node=> {
				let contentString = nodeContentToString(process, node);
				let keywordData = contentString.split(",");
				let pre = keywordData[0];
				let post = (keywordData[1] || "").trimLeft();
				process.out(`${pre}`);
				if (post) {
					process.out(` (${post})`);
				}
			});
		};
	}

	inline_kw_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		let contentString = nodeContentToString(process, node);
		let keywordData = contentString.split(",");
		let pre = keywordData[0];
		process.outRaw("</b>").outRaw("<!-- IDX:").out(pre).outRaw(" -->");
	}

	inline_em_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("<em>");
	}

	inline_em_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("</em>");
	}

	block_image(process: BuilderProcess, node: BlockElementSyntaxTree) {
		let label = nodeContentToString(process, node.args[0]);
		return process.findImageFile(label)
			.then(imagePath=> {
				let caption = nodeContentToString(process, node.args[1]); // TODO vistでinlineの処理をきっちりするべき
				let scale: number = 1;
				if (node.args[2]) {
					// let arg3 = node.args[2].arg;
					let regexp = new RegExp("scale=(\\d+(?:\\.\\d+))");
					let result = regexp.exec(nodeContentToString(process, node.args[2]));
					if (result) {
						scale = parseFloat(result[1]);
					}
				}
				process.outRaw("<div class=\"image\">\n");
				// imagePathは変数作成時点でユーザ入力部分をescapeしている
				process.outRaw("<img src=\"" + imagePath + "\" alt=\"").out(caption).outRaw("\" width=\"").out(scale * 100).outRaw("%\" />\n");
				process.outRaw("<p class=\"caption\">\n");
				process.out("図").out(process.base.chapter.no).out(".").out(node.no).out(": ").out(caption);
				process.outRaw("\n</p>\n");
				process.outRaw("</div>\n");
				return false;
			})
			.catch(id=> {
				process.error(t("builder.image_not_found", id), node);
				return false;
			});
	}

	block_indepimage(process: BuilderProcess, node: BlockElementSyntaxTree) {
		let label = nodeContentToString(process, node.args[0]);
		return process.findImageFile(label)
			.then(imagePath=> {
				let caption: string = "";
				if (node.args[1]) {
					caption = nodeContentToString(process, node.args[1]);
				}
				let scale: number = 1;
				if (node.args[2]) {
					// let arg3 = node.args[2].arg;
					let regexp = new RegExp("scale=(\\d+(?:\\.\\d+))");
					let result = regexp.exec(nodeContentToString(process, node.args[2]));
					if (result) {
						scale = parseFloat(result[1]);
					}
				}
				process.outRaw("<div class=\"image\">\n");
				// imagePathは変数作成時点でユーザ入力部分をescapeしている
				if (scale !== 1) {
					process.outRaw("<img src=\"" + imagePath + "\" alt=\"").out(caption).outRaw("\" width=\"").out(scale * 100).outRaw("%\" />\n");
				} else {
					process.outRaw("<img src=\"" + imagePath + "\" alt=\"").out(caption).outRaw("\" />\n");
				}
				if (node.args[1]) {
					process.outRaw("<p class=\"caption\">\n");
					process.out("図: ").out(caption);
					process.outRaw("\n</p>\n");
				}
				process.outRaw("</div>\n");
				return false;
			});
	}

	block_graph_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
		// TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
		process.outRaw("<div>\n");
		let toolName = nodeContentToString(process, node.args[1]);
		process.outRaw("<p>graph: ").out(toolName).outRaw("</p>\n");
		process.outRaw("<pre>");
		return (v: TreeVisitor) => {
			// name, args はパスしたい
			node.childNodes.forEach((node) => {
				visit(node, v);
			});
		};
	}

	block_graph_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
		// TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
		process.outRaw("\n</pre>\n").outRaw("</div>\n");
	}

	inline_img(process: BuilderProcess, node: InlineElementSyntaxTree) {
		let imgNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
		process.out("図").out(process.base.chapter.no).out(".").out(imgNode.no);
		return false;
	}

	inline_icon(process: BuilderProcess, node: InlineElementSyntaxTree) {
		// TODO ファイル名探索ロジックをもっと頑張る(jpgとかsvgとか)
		let chapterFileName = process.base.chapter.name;
		let chapterName = chapterFileName.substring(0, chapterFileName.length - 3);
		let imageName = nodeContentToString(process, node);
		let imagePath = "images/" + this.escape(chapterName) + "-" + this.escape(imageName) + ".png";
		process.outRaw("<img src=\"" + imagePath + "\" alt=\"[").out(imageName).outRaw("]\" />");
		return false;
	}

	block_footnote(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.outRaw("<div class=\"footnote\"><p class=\"footnote\">[<a id=\"fn-");
		return (v: TreeVisitor) => {
			process.outRaw(nodeContentToString(process, node.args[0])).outRaw("\">*").out(node.no).outRaw("</a>] ");
			visit(node.args[1], v);
			process.outRaw("</p></div>\n");
		};
	}

	inline_fn(process: BuilderProcess, node: InlineElementSyntaxTree) {
		let footnoteNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
		process.outRaw("<a href=\"#fn-").out(nodeContentToString(process, footnoteNode.args[0])).outRaw("\">*").out(footnoteNode.no).outRaw("</a>");
		return false;
	}

	block_lead_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.outRaw("<div class=\"lead\">\n");
	}

	block_lead_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.outRaw("</div>\n");
	}

	inline_tti_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("<tt><i>");
	}

	inline_tti_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("</i></tt>");
	}

	inline_ttb_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("<tt><b>");
	}

	inline_ttb_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("</b></tt>");
	}

	block_noindent(process: BuilderProcess, node: BlockElementSyntaxTree) {
		// paragraphPre 中で処理
		return false;
	}

	block_source_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.outRaw("<div class=\"source-code\">\n");
		process.outRaw("<p class=\"caption\">").out(nodeContentToString(process, node.args[0])).outRaw("</p>\n");
		process.outRaw("<pre class=\"source\">");
		return (v: TreeVisitor) => {
			// name, args はパスしたい
			node.childNodes.forEach((node) => {
				visit(node, v);
			});
		};
	}

	block_source_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.outRaw("\n</pre>\n").outRaw("</div>\n");
	}

	block_cmd_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.outRaw("<div class=\"cmd-code\">\n");
		process.outRaw("<pre class=\"cmd\">");
		return (v: TreeVisitor) => {
			// name, args はパスしたい
			node.childNodes.forEach((node) => {
				visit(node, v);
			});
		};
	}

	block_cmd_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.outRaw("\n</pre>\n").outRaw("</div>\n");
	}

	block_quote_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.outRaw("<blockquote><p>");
		return (v: TreeVisitor) => {
			// name, args はパスしたい
			node.childNodes.forEach((node) => {
				visit(node, v);
			});
		};
	}

	block_quote_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.outRaw("</p></blockquote>\n");
	}

	inline_ami_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("<span class=\"ami\">");
	}

	inline_ami_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("</span>");
	}

	inline_bou_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("<span class=\"bou\">");
	}

	inline_bou_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("</span>");
	}

	inline_i_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("<i>");
	}

	inline_i_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("</i>");
	}

	inline_strong_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("<strong>");
	}

	inline_strong_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("</strong>");
	}

	inline_uchar_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("&#x");
	}

	inline_uchar_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw(";");
	}

	block_table_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
		// TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
		process.outRaw("<div>\n");
		let chapter = findChapter(node, 1);
		let text = t("builder.table", chapter.fqn, node.no);
		process.outRaw("<p class=\"caption\">").out(text).out(": ").out(nodeContentToString(process, node.args[1])).outRaw("</p>\n");
		process.outRaw("<pre>");
		return (v: TreeVisitor) => {
			// name, args はパスしたい
			node.childNodes.forEach((node) => {
				visit(node, v);
			});
		};
	}

	block_table_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
		// TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
		process.outRaw("\n</pre>\n").outRaw("</div>\n");
	}

	inline_table(process: BuilderProcess, node: InlineElementSyntaxTree) {
		// TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
		let chapter = findChapter(node, 1);
		let listNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
		let text = t("builder.table", chapter.fqn, listNode.no);
		process.out(text);
		return false;
	}

	block_tsize(process: BuilderProcess, node: BlockElementSyntaxTree) {
		// TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
		return false;
	}

	block_comment_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.outRaw("<!-- ");

		return (v: TreeVisitor) => {
			// name, args はパスしたい
			node.childNodes.forEach((node) => {
				visit(node, v);
			});
		};
	}

	block_comment_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.outRaw(" -->\n");
	}

	inline_comment_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw("<!-- ");
	}

	inline_comment_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.outRaw(" -->");
	}

	inline_chap(process: BuilderProcess, node: InlineElementSyntaxTree) {
		let chapName = nodeContentToString(process, node);
		let chapter = process.findChapter(chapName);
		process.out("第").out(chapter.no).out("章");
		return false;
	}

	inline_title(process: BuilderProcess, node: InlineElementSyntaxTree) {
		let chapName = nodeContentToString(process, node);
		let chapter = process.findChapter(chapName);
		let title = this.getChapterTitle(process, chapter);
		process.out(title);
		return false;
	}

	inline_chapref(process: BuilderProcess, node: InlineElementSyntaxTree) {
		let chapName = nodeContentToString(process, node);
		let chapter = process.findChapter(chapName);
		let title = this.getChapterTitle(process, chapter);
		process.out("第").out(chapter.no).out("章「").out(title).out("」");
		return false;
	}
}
