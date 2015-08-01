"use strict";

import {BuilderProcess} from "../model/compilerModel";

import {DefaultBuilder} from "./builder";

import {t} from "../i18n/i18n";

import {NodeSyntaxTree, BlockElementSyntaxTree, InlineElementSyntaxTree, HeadlineSyntaxTree, UlistElementSyntaxTree, OlistElementSyntaxTree, DlistElementSyntaxTree, ColumnSyntaxTree, ColumnHeadlineSyntaxTree} from "../parser/parser";

import {visit, TreeVisitor} from "../parser/walker";

import {nodeContentToString, findChapter} from "../utils/utils";

export class TextBuilder extends DefaultBuilder {
	extention = "txt";

	escape(data: any): string {
		return data;
	}

	headlinePre(process: BuilderProcess, name: string, node: HeadlineSyntaxTree) {
		// TODO no の採番がレベル別になっていない
		// TODO 2.3.2 みたいな階層を返せるメソッドが何かほしい
		process.out("■H").out(node.level).out("■");
		if (node.level === 1) {
			var text = t("builder.chapter", node.parentNode.no);
			process.out(text).out("　");
		} else if (node.level === 2) {
			// process.out(node.parentNode.toChapter().fqn).out("　");
		}
	}

	headlinePost(process: BuilderProcess, name: string, node: HeadlineSyntaxTree) {
		process.out("\n\n");
	}

	columnHeadlinePre(process: BuilderProcess, node: ColumnHeadlineSyntaxTree) {
		process.out("\n◆→開始:←◆\n");
		process.out("■");
		return (v: TreeVisitor) => {
			visit(node.caption, v);
		};
	}

	columnHeadlinePost(process: BuilderProcess, node: ColumnHeadlineSyntaxTree) {
		process.out("\n");
	}

	columnPost(process: BuilderProcess, node: ColumnSyntaxTree) {
		process.out("◆→終了:←◆\n\n");
	}

	paragraphPost(process: BuilderProcess, name: string, node: NodeSyntaxTree) {
		process.out("\n");
	}

	ulistPre(process: BuilderProcess, name: string, node: UlistElementSyntaxTree) {
		this.ulistParentHelper(process, node, () => {
			process.out("\n\n●\t");
		});
		if (node.parentNode instanceof UlistElementSyntaxTree && node.prev instanceof UlistElementSyntaxTree === false) {
			process.out("\n\n");
		} else if (node.parentNode instanceof UlistElementSyntaxTree) {
			process.out("");
		}
		process.out("●\t");
	}

	ulistPost(process: BuilderProcess, name: string, node: UlistElementSyntaxTree) {
		process.out("\n");
	}

	olistPre(process: BuilderProcess, name: string, node: OlistElementSyntaxTree) {
		process.out(node.no).out("\t");
	}

	olistPost(process: BuilderProcess, name: string, node: OlistElementSyntaxTree) {
		process.out("\n");
	}

	dlistPre(process: BuilderProcess, name: string, node: DlistElementSyntaxTree) {
		return (v: TreeVisitor) => {
			process.out("★");
			visit(node.text, v);
			process.out("☆\n");
			process.out("\t");
			visit(node.content, v);
			process.out("\n");
		};
	}

	dlistPost(process: BuilderProcess, name: string, node: DlistElementSyntaxTree) {
		process.out("\n");
	}

	block_list_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.out("◆→開始:リスト←◆\n");
		var chapter = findChapter(node, 1);
		var text = t("builder.list", chapter.fqn, node.no);
		process.out(text).out("　").out(node.args[1].arg).out("\n\n");
		return (v: TreeVisitor) => {
			// name, args はパスしたい
			node.childNodes.forEach((node) => {
				visit(node, v);
			});
		};
	}

	block_list_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.out("\n◆→終了:リスト←◆\n");
	}

	block_listnum_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.out("◆→開始:リスト←◆\n");
		var chapter = findChapter(node, 1);
		var text = t("builder.list", chapter.fqn, node.no);
		process.out(text).out("　").out(node.args[1].arg).out("\n\n");
		var lineCount = 1;
		return (v: TreeVisitor) => {
			// name, args はパスしたい
			node.childNodes.forEach((node, index, childNodes) => {
				if (node.isTextNode()) {
					// 改行する可能性があるのはTextNodeだけ…のはず
					var hasNext = !!childNodes[index + 1];
					var textNode = node.toTextNode();
					var lines = textNode.text.split("\n");
					lines.forEach((line, index) => {
						process.out(" ").out(lineCount).out(": ");
						process.out(line);
						if (!hasNext || lines.length - 1 !== index) {
							lineCount++;
						}
						process.out("\n");
					});
				} else {
					visit(node, v);
				}
			});
		};
	}

	block_listnum_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.out("◆→終了:リスト←◆\n");
	}

	inline_list(process: BuilderProcess, node: InlineElementSyntaxTree) {
		var chapter = findChapter(node, 1);
		var listNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
		var text = t("builder.list", chapter.fqn, listNode.no);
		process.out(text);
		return false;
	}

	block_emlist_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.out("◆→開始:インラインリスト←◆\n");
		if (node.args[0]) {
			process.out("■").out("").out(node.args[0].arg).out("\n");
		}
		return (v: TreeVisitor) => {
			// name, args はパスしたい
			node.childNodes.forEach((node) => {
				visit(node, v);
			});
		};
	}

	block_emlist_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.out("\n◆→終了:インラインリスト←◆\n");
	}

	block_emlistnum_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.out("◆→開始:インラインリスト←◆\n");
		if (node.args[0]) {
			process.out("■").out("").out(node.args[0].arg).out("\n");
		}
		var lineCount = 1;
		return (v: TreeVisitor) => {
			// name, args はパスしたい
			node.childNodes.forEach((node, index, childNodes) => {
				if (node.isTextNode()) {
					// 改行する可能性があるのはTextNodeだけ…のはず
					var hasNext = !!childNodes[index + 1];
					var textNode = node.toTextNode();
					var lines = textNode.text.split("\n");
					lines.forEach((line, index) => {
						process.out(" ").out(lineCount).out(": ");
						process.out(line);
						if (!hasNext || lines.length - 1 !== index) {
							lineCount++;
						}
						process.out("\n");
					});
				} else {
					visit(node, v);
				}
			});
		};
	}

	block_emlistnum_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.out("◆→終了:インラインリスト←◆\n");
	}

	inline_hd_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
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

	inline_hd_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("」");
	}

	inline_br(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("\n");
	}

	inline_b_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("★");
	}

	inline_b_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("☆");
	}

	inline_code_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("△");
	}

	inline_code_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("☆");
	}

	inline_href_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("△");
	}

	inline_href_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("☆");
	}

	inline_href(process: BuilderProcess, node: InlineElementSyntaxTree) {
		var href: string = null;
		var text = nodeContentToString(process, node);
		if (text.indexOf(",") !== -1) {
			href = text.slice(0, text.indexOf(","));
			text = text.slice(text.indexOf(",") + 1).trimLeft();
		}
		if (href) {
			process.out(text).out("（△").out(href).out("☆）");
		} else {
			process.out("△").out(text).out("☆");
		}
		return false;
	}

	block_label(process: BuilderProcess, node: BlockElementSyntaxTree) {
		return false;
	}

	inline_ruby(process: BuilderProcess, node: InlineElementSyntaxTree) {
		var contentString = nodeContentToString(process, node);
		var keywordData = contentString.split(",");
		process.out(keywordData[0]);
		return (v: TreeVisitor) => {
			// name, args はパス
			node.childNodes.forEach(node=> {
				process.out("◆→DTP連絡:「").out(keywordData[0]);
				process.out("」に「 ").out(keywordData[1].trim()).out("」とルビ←◆");
			});
		};
	}

	inline_u_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("＠");
	}

	inline_u_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("＠◆→＠〜＠部分に下線←◆");
	}

	inline_kw(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("★");
		return (v: TreeVisitor) => {
			// name, args はパス
			node.childNodes.forEach(node=> {
				var contentString = nodeContentToString(process, node);
				var keywordData = contentString.split(",");
				process.out(keywordData[0] + "☆（" + keywordData[1].trimLeft() + "）");
			});
		};
	}

	inline_tt_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("△");
	}

	inline_tt_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("☆");
	}

	inline_em_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.warn(t("compile.deprecated_inline_symbol", "em"), node);
		process.out("@<em>{");
	}

	inline_em_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("}");
	}

	block_image(process: BuilderProcess, node: BlockElementSyntaxTree) {
		return process.findImageFile(node.args[0].arg)
			.then(imagePath=> {
			var caption = node.args[1].arg;
			process.out("◆→開始:図←◆\n");
			process.out("図").out(process.base.chapter.no).out(".").out(node.no).out("　").out(caption).out("\n");
			process.out("\n");
			process.out("◆→").out(imagePath).out("←◆\n");
			process.out("◆→終了:図←◆\n");
			return false;
		})
			.catch(id=> {
			process.error(t("builder.image_not_found", id), node);
			return false;
		});
	}

	block_indepimage(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.out("◆→画像 ").out(node.args[0].arg).out("←◆\n");
		if (node.args[1]) {
			process.out("図　").out(node.args[1].arg).out("\n\n");
		}
		return false;
	}

	inline_img(process: BuilderProcess, node: InlineElementSyntaxTree) {
		var imgNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
		process.out("図").out(process.base.chapter.no).out(".").out(imgNode.no).out("\n");
		return false;
	}

	inline_icon(process: BuilderProcess, node: InlineElementSyntaxTree) {
		// TODO ファイル名探索ロジックをもっと頑張る(jpgとかsvgとか)
		var chapterFileName = process.base.chapter.name;
		var chapterName = chapterFileName.substring(0, chapterFileName.length - 3);
		var imageName = nodeContentToString(process, node);
		var imagePath = "images/" + chapterName + "-" + imageName + ".png";
		process.out("◆→画像 ").out(imagePath).out("←◆");
		return false;
	}

	block_footnote(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.out("【注").out(node.no).out("】").out(node.args[1].arg).out("\n");
		return false;
	}

	inline_fn(process: BuilderProcess, node: InlineElementSyntaxTree) {
		var footnoteNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
		process.out("【注").out(footnoteNode.no).out("】");
		return false;
	}

	block_lead_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.out("◆→開始:リード←◆\n");
	}

	block_lead_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.out("◆→終了:リード←◆\n");
	}

	inline_tti_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("▲");
	}

	inline_tti_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("☆◆→等幅フォントイタ←◆");
	}

	inline_ttb_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("★");
	}

	inline_ttb_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("☆◆→等幅フォント太字←◆");
	}

	block_noindent(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.out("◆→DTP連絡:次の1行インデントなし←◆\n");
		return false;
	}

	block_source_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.out("◆→開始:ソースコードリスト←◆\n");
		process.out("■").out(node.args[0].arg).out("\n");

		return (v: TreeVisitor) => {
			// name, args はパスしたい
			node.childNodes.forEach((node) => {
				visit(node, v);
			});
		};
	}

	block_source_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.out("\n◆→終了:ソースコードリスト←◆\n");
	}

	block_cmd_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.out("◆→開始:コマンド←◆\n");

		return (v: TreeVisitor) => {
			// name, args はパスしたい
			node.childNodes.forEach((node) => {
				visit(node, v);
			});
		};
	}

	block_cmd_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.out("\n◆→終了:コマンド←◆\n");
	}

	block_quote_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.out("◆→開始:引用←◆\n");

		return (v: TreeVisitor) => {
			// name, args はパスしたい
			node.childNodes.forEach((node) => {
				visit(node, v);
			});
		};
	}

	block_quote_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.out("\n◆→終了:引用←◆\n");
	}

	inline_ami_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
	}

	inline_ami_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		// TODO 入れ子になっている場合オペレータさんにイミフな出力になっちゃう
		process.out("◆→DTP連絡:「").out(nodeContentToString(process, node)).out("」に網カケ←◆");
	}

	inline_bou_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
	}

	inline_bou_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		// TODO 入れ子になっている場合オペレータさんにイミフな出力になっちゃう
		process.out("◆→DTP連絡:「").out(nodeContentToString(process, node)).out("」に傍点←◆");
	}

	inline_i_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("▲");
	}

	inline_i_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("☆");
	}

	inline_strong_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("★");
	}

	inline_strong_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("☆");
	}

	inline_uchar(process: BuilderProcess, node: InlineElementSyntaxTree) {
		var hexString = nodeContentToString(process, node);
		var code = parseInt(hexString, 16);
		var result = "";
		/* tslint:disable:no-bitwise */
		while (code !== 0) {
			result = String.fromCharCode(code & 0xFFFF) + result;
			code >>>= 16;
		}
		/* tslint:enable:no-bitwise */
		process.out(result);
		return false;
	}

	block_table_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
		// TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
		process.out("◆→開始:表←◆\n");
		process.out("TODO 現在table記法は仮実装です\n");
		var chapter = findChapter(node, 1);
		var text = t("builder.table", chapter.fqn, node.no);
		process.out(text).out("　").out(node.args[1].arg).out("\n\n");
		return (v: TreeVisitor) => {
			// name, args はパスしたい
			node.childNodes.forEach((node) => {
				visit(node, v);
			});
		};
	}

	block_table_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
		// TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
		process.out("\n◆→終了:表←◆\n");
	}

	inline_table(process: BuilderProcess, node: InlineElementSyntaxTree) {
		// TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
		var chapter = findChapter(node, 1);
		var listNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
		var text = t("builder.table", chapter.fqn, listNode.no);
		process.out(text);
		return false;
	}

	block_tsize(process: BuilderProcess, node: BlockElementSyntaxTree) {
		// TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
		return false;
	}

	block_comment_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.out("◆→DTP連絡:");

		return (v: TreeVisitor) => {
			// name, args はパスしたい
			node.childNodes.forEach((node) => {
				visit(node, v);
			});
		};
	}

	block_comment_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
		process.out("←◆\n");
	}

	inline_comment_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("◆→DTP連絡:");
	}

	inline_comment_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
		process.out("←◆");
	}
}
