///<reference path='Model.ts' />
///<reference path='Parser.ts' />

module ReVIEW {

	// ここまでに Parser.ts の内容が実行完了していないとエラーになる
import SyntaxTree = ReVIEW.Parse.SyntaxTree;
import BlockElementSyntaxTree = ReVIEW.Parse.BlockElementSyntaxTree;
import InlineElementSyntaxTree = ReVIEW.Parse.InlineElementSyntaxTree;
import ArgumentSyntaxTree = ReVIEW.Parse.ArgumentSyntaxTree;
import ChapterSyntaxTree = ReVIEW.Parse.ChapterSyntaxTree;
import HeadlineSyntaxTree = ReVIEW.Parse.HeadlineSyntaxTree;
import UlistElementSyntaxTree = ReVIEW.Parse.UlistElementSyntaxTree;
import OlistElementSyntaxTree = ReVIEW.Parse.OlistElementSyntaxTree;
import DlistElementSyntaxTree = ReVIEW.Parse.DlistElementSyntaxTree;
import NodeSyntaxTree = ReVIEW.Parse.NodeSyntaxTree;
import TextNodeSyntaxTree = ReVIEW.Parse.TextNodeSyntaxTree;

	/**
	 * 指定された構文木を歩きまわる。
	 * 次にどちらへ歩くかは渡した関数によって決まる。
	 * null が返ってくると歩くのを中断する。
	 * @param ast
	 * @param actor
	 */
	export function walk(ast:SyntaxTree, actor:(ast:SyntaxTree)=>SyntaxTree) {
		var next = actor(ast);
		if (next !== null) {
			walk(next, actor);
		}
	}

	/**
	 * 指定された構文木の全てのノード・リーフを探索する。
	 * 親子であれば親のほうが先に探索され、兄弟であれば兄のほうが先に探索される。
	 * つまり、葉に着目すると文章に登場する順番に探索される。
	 * @param ast
	 * @param v
	 */
	export function visit(ast:SyntaxTree, v:TreeVisitor) {
		var newV:TreeVisitor = {
			visitDefaultPre: v.visitDefaultPre,
			visitBlockElementPre: v.visitBlockElementPre || v.visitNodePre || v.visitDefaultPre,
			visitInlineElementPre: v.visitInlineElementPre || v.visitNodePre || v.visitDefaultPre,
			visitNodePre: v.visitNodePre || v.visitDefaultPre,
			visitArgumentPre: v.visitArgumentPre || v.visitDefaultPre,
			visitChapterPre: v.visitChapterPre || v.visitNodePre || v.visitDefaultPre,
			visitHeadlinePre: v.visitHeadlinePre || v.visitDefaultPre,
			visitUlistPre: v.visitUlistPre || v.visitNodePre || v.visitDefaultPre,
			visitOlistPre: v.visitOlistPre || v.visitDefaultPre,
			visitDlistPre: v.visitDlistPre || v.visitDefaultPre,
			visitTextPre: v.visitTextPre || v.visitDefaultPre
		};
		newV.visitDefaultPre = newV.visitDefaultPre.bind(v);
		newV.visitBlockElementPre = newV.visitBlockElementPre.bind(v);
		newV.visitInlineElementPre = newV.visitInlineElementPre.bind(v);
		newV.visitNodePre = newV.visitNodePre.bind(v);
		newV.visitArgumentPre = newV.visitArgumentPre.bind(v);
		newV.visitChapterPre = newV.visitChapterPre.bind(v);
		newV.visitHeadlinePre = newV.visitHeadlinePre.bind(v);
		newV.visitUlistPre = newV.visitUlistPre.bind(v);
		newV.visitOlistPre = newV.visitOlistPre.bind(v);
		newV.visitDlistPre = newV.visitDlistPre.bind(v);
		newV.visitTextPre = newV.visitTextPre.bind(v);
		visitSub(null, ast, newV);
	}

	function visitSub(parent:SyntaxTree, ast:SyntaxTree, v:TreeVisitor) {
		if (ast instanceof BlockElementSyntaxTree) {
			var block = ast.toBlockElement();
			v.visitBlockElementPre(block, parent);
			block.args.forEach((next)=> {
				visitSub(ast, next, v);
			});
			block.childNodes.forEach((next)=> {
				visitSub(ast, next, v);
			});
		} else if (ast instanceof InlineElementSyntaxTree) {
			var inline = ast.toInlineElement();
			v.visitInlineElementPre(inline, parent);
			inline.childNodes.forEach((next)=> {
				visitSub(ast, next, v);
			});
		} else if (ast instanceof ArgumentSyntaxTree) {
			var arg = ast.toArgument();
			v.visitArgumentPre(arg, parent);
		} else if (ast instanceof ChapterSyntaxTree) {
			var chap = ast.toChapter();
			v.visitChapterPre(chap, parent);
			visitSub(ast, chap.headline, v);
			if (chap.text) {
				chap.text.forEach((next)=> {
					visitSub(ast, next, v);
				});
			}
			chap.childNodes.forEach((next)=> {
				visitSub(ast, next, v);
			});
		} else if (ast instanceof HeadlineSyntaxTree) {
			var head = ast.toHeadline();
			v.visitHeadlinePre(head, parent);
			visitSub(ast, head.label, v);
			visitSub(ast, head.tag, v);
			visitSub(ast, head.caption, v);
		} else if (ast instanceof UlistElementSyntaxTree) {
			var ul = ast.toUlist();
			v.visitUlistPre(ul, parent);
			visitSub(ast, ul.text, v);
			ul.childNodes.forEach((next)=> {
				visitSub(ast, next, v);
			});
		} else if (ast instanceof OlistElementSyntaxTree) {
			var ol = ast.toOlist();
			v.visitOlistPre(ol, parent);
			visitSub(ast, ol.text, v);
		} else if (ast instanceof DlistElementSyntaxTree) {
			var dl = ast.toDlist();
			v.visitDlistPre(dl, parent);
			visitSub(ast, dl.text, v);
			visitSub(ast, dl.content, v);
		} else if (ast instanceof NodeSyntaxTree) {
			var node = ast.toNode();
			v.visitNodePre(node, parent);
			node.childNodes.forEach((next)=> {
				visitSub(ast, next, v);
			});
		} else if (ast instanceof TextNodeSyntaxTree) {
			var text = ast.toTextNode();
			v.visitTextPre(text, parent);
		} else if (ast) {
			v.visitDefaultPre(parent, ast);
		}
	}

	/**
	 * 構文木を渡り歩くためのVisitor。
	 * 実装されなかったメソッドは、visitDefault または NodeSyntaxTree を継承している場合 visitNode にフォールバックする。
	 */
	export interface TreeVisitor {
		visitDefaultPre(node:SyntaxTree, parent:SyntaxTree);
		visitNodePre?(node:NodeSyntaxTree, parent:SyntaxTree);
		visitBlockElementPre?(node:BlockElementSyntaxTree, parent:SyntaxTree);
		visitInlineElementPre?(node:InlineElementSyntaxTree, parent:SyntaxTree);
		visitArgumentPre?(node:ArgumentSyntaxTree, parent:SyntaxTree);
		visitChapterPre?(node:ChapterSyntaxTree, parent:SyntaxTree);
		visitHeadlinePre?(node:HeadlineSyntaxTree, parent:SyntaxTree);
		visitUlistPre?(node:UlistElementSyntaxTree, parent:SyntaxTree);
		visitOlistPre?(node:OlistElementSyntaxTree, parent:SyntaxTree);
		visitDlistPre?(node:DlistElementSyntaxTree, parent:SyntaxTree);
		visitTextPre?(node:TextNodeSyntaxTree, parent:SyntaxTree);
	}
}
