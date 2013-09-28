///<reference path='../model/CompilerModel.ts' />
///<reference path='Parser.ts' />

module ReVIEW {

	export module Parse {
		// Parser.ts との読み込み順序の関係で undefined を参照するエラーを避ける
		void 0;
	}

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
		if (next) {
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
	export function visit(ast:SyntaxTree, v:ITreeVisitor) {
		var newV:ITreeVisitor = {
			visitDefaultPre: v.visitDefaultPre,
			visitDefaultPost: v.visitDefaultPost || (()=> {
			}),
			visitBlockElementPre: v.visitBlockElementPre || v.visitNodePre || v.visitDefaultPre,
			visitBlockElementPost: v.visitBlockElementPost || v.visitNodePost || v.visitDefaultPost || (()=> {
			}),
			visitInlineElementPre: v.visitInlineElementPre || v.visitNodePre || v.visitDefaultPre,
			visitInlineElementPost: v.visitInlineElementPost || v.visitNodePost || v.visitDefaultPost || (()=> {
			}),
			visitNodePre: v.visitNodePre || v.visitDefaultPre,
			visitNodePost: v.visitNodePost || v.visitDefaultPost || (()=> {
			}),
			visitArgumentPre: v.visitArgumentPre || v.visitDefaultPre,
			visitArgumentPost: v.visitArgumentPost || v.visitDefaultPost || (()=> {
			}),
			visitChapterPre: v.visitChapterPre || v.visitNodePre || v.visitDefaultPre,
			visitChapterPost: v.visitChapterPost || v.visitNodePost || v.visitDefaultPost || (()=> {
			}),
			visitChapterContentPre: v.visitChapterContentPre || (()=> {
			}),
			visitChapterContentPost: v.visitChapterContentPost || (()=> {
			}),
			visitHeadlinePre: v.visitHeadlinePre || v.visitDefaultPre,
			visitHeadlinePost: v.visitHeadlinePost || v.visitDefaultPost || (()=> {
			}),
			visitUlistPre: v.visitUlistPre || v.visitNodePre || v.visitDefaultPre,
			visitUlistPost: v.visitUlistPost || v.visitNodePost || v.visitDefaultPost || (()=> {
			}),
			visitOlistPre: v.visitOlistPre || v.visitDefaultPre,
			visitOlistPost: v.visitOlistPost || v.visitDefaultPost || (()=> {
			}),
			visitDlistPre: v.visitDlistPre || v.visitDefaultPre,
			visitDlistPost: v.visitDlistPost || v.visitDefaultPost || (()=> {
			}),
			visitTextPre: v.visitTextPre || v.visitDefaultPre,
			visitTextPost: v.visitTextPost || v.visitDefaultPost || (()=> {
			})
		};
		newV.visitDefaultPre = newV.visitDefaultPre.bind(v);
		newV.visitDefaultPost = newV.visitDefaultPost.bind(v);
		newV.visitBlockElementPre = newV.visitBlockElementPre.bind(v);
		newV.visitBlockElementPost = newV.visitBlockElementPost.bind(v);
		newV.visitInlineElementPre = newV.visitInlineElementPre.bind(v);
		newV.visitInlineElementPost = newV.visitInlineElementPost.bind(v);
		newV.visitNodePre = newV.visitNodePre.bind(v);
		newV.visitNodePost = newV.visitNodePost.bind(v);
		newV.visitArgumentPre = newV.visitArgumentPre.bind(v);
		newV.visitArgumentPost = newV.visitArgumentPost.bind(v);
		newV.visitChapterPre = newV.visitChapterPre.bind(v);
		newV.visitChapterPost = newV.visitChapterPost.bind(v);
		newV.visitChapterContentPre = newV.visitChapterContentPre.bind(v);
		newV.visitChapterContentPost = newV.visitChapterContentPost.bind(v);
		newV.visitHeadlinePre = newV.visitHeadlinePre.bind(v);
		newV.visitHeadlinePost = newV.visitHeadlinePost.bind(v);
		newV.visitUlistPre = newV.visitUlistPre.bind(v);
		newV.visitUlistPost = newV.visitUlistPost.bind(v);
		newV.visitOlistPre = newV.visitOlistPre.bind(v);
		newV.visitOlistPost = newV.visitOlistPost.bind(v);
		newV.visitDlistPre = newV.visitDlistPre.bind(v);
		newV.visitDlistPost = newV.visitDlistPost.bind(v);
		newV.visitTextPre = newV.visitTextPre.bind(v);
		newV.visitTextPost = newV.visitTextPost.bind(v);
		visitSub(null, ast, newV);
	}

	function visitSub(parent:SyntaxTree, ast:SyntaxTree, v:ITreeVisitor) {
		if (ast instanceof ReVIEW.Parse.BlockElementSyntaxTree) {
			var block = ast.toBlockElement();
			var ret = v.visitBlockElementPre(block, parent);
			if (typeof ret === "undefined" || (typeof ret === "boolean" && ret)) {
				block.args.forEach((next)=> {
					visitSub(ast, next, v);
				});
				block.childNodes.forEach((next)=> {
					visitSub(ast, next, v);
				});
			} else if (typeof ret === "function") {
				ret(v);
			}
			v.visitBlockElementPost(block, parent);
		} else if (ast instanceof ReVIEW.Parse.InlineElementSyntaxTree) {
			var inline = ast.toInlineElement();
			var ret = v.visitInlineElementPre(inline, parent);
			if (typeof ret === "undefined" || (typeof ret === "boolean" && ret)) {
				inline.childNodes.forEach((next)=> {
					visitSub(ast, next, v);
				});
			} else if (typeof ret === "function") {
				ret(v);
			}
			v.visitInlineElementPost(inline, parent);
		} else if (ast instanceof ReVIEW.Parse.ArgumentSyntaxTree) {
			var arg = ast.toArgument();
			var ret = v.visitArgumentPre(arg, parent);
			if (typeof ret === "function") {
				ret(v);
			}
			v.visitArgumentPost(arg, parent);
		} else if (ast instanceof ReVIEW.Parse.ChapterSyntaxTree) {
			var chap = ast.toChapter();
			var ret = v.visitChapterPre(chap, parent);
			if (typeof ret === "undefined" || (typeof ret === "boolean" && ret)) {
				visitSub(ast, chap.headline, v);
				v.visitChapterContentPre(chap, parent);
				if (chap.text) {
					chap.text.forEach((next)=> {
						visitSub(ast, next, v);
					});
				}
				chap.childNodes.forEach((next)=> {
					visitSub(ast, next, v);
				});
				v.visitChapterContentPost(chap, parent);
			} else if (typeof ret === "function") {
				ret(v);
			}
			v.visitChapterPost(chap, parent);
		} else if (ast instanceof ReVIEW.Parse.HeadlineSyntaxTree) {
			var head = ast.toHeadline();
			var ret = v.visitHeadlinePre(head, parent);
			if (typeof ret === "undefined" || (typeof ret === "boolean" && ret)) {
				visitSub(ast, head.cmd, v);
				visitSub(ast, head.label, v);
				visitSub(ast, head.caption, v);
			} else if (typeof ret === "function") {
				ret(v);
			}
			v.visitHeadlinePost(head, parent);
		} else if (ast instanceof ReVIEW.Parse.UlistElementSyntaxTree) {
			var ul = ast.toUlist();
			var ret = v.visitUlistPre(ul, parent);
			if (typeof ret === "undefined" || (typeof ret === "boolean" && ret)) {
				visitSub(ast, ul.text, v);
				ul.childNodes.forEach((next)=> {
					visitSub(ast, next, v);
				});
			} else if (typeof ret === "function") {
				ret(v);
			}
			v.visitUlistPost(ul, parent);
		} else if (ast instanceof ReVIEW.Parse.OlistElementSyntaxTree) {
			var ol = ast.toOlist();
			var ret = v.visitOlistPre(ol, parent);
			if (typeof ret === "undefined" || (typeof ret === "boolean" && ret)) {
				visitSub(ast, ol.text, v);
			} else if (typeof ret === "function") {
				ret(v);
			}
			v.visitOlistPost(ol, parent);
		} else if (ast instanceof ReVIEW.Parse.DlistElementSyntaxTree) {
			var dl = ast.toDlist();
			var ret = v.visitDlistPre(dl, parent);
			if (typeof ret === "undefined" || (typeof ret === "boolean" && ret)) {
				visitSub(ast, dl.text, v);
				visitSub(ast, dl.content, v);
			} else if (typeof ret === "function") {
				ret(v);
			}
			v.visitDlistPost(dl, parent);
		} else if (ast instanceof ReVIEW.Parse.NodeSyntaxTree) {
			var node = ast.toNode();
			var ret = v.visitNodePre(node, parent);
			if (typeof ret === "undefined" || (typeof ret === "boolean" && ret)) {
				node.childNodes.forEach((next)=> {
					visitSub(ast, next, v);
				});
			} else if (typeof ret === "function") {
				ret(v);
			}
			v.visitNodePost(node, parent);
		} else if (ast instanceof ReVIEW.Parse.TextNodeSyntaxTree) {
			var text = ast.toTextNode();
			var ret = v.visitTextPre(text, parent);
			if (typeof ret === "function") {
				ret(v);
			}
			v.visitTextPost(text, parent);
		} else if (ast) {
			var ret = v.visitDefaultPre(parent, ast);
			if (typeof ret === "function") {
				ret(v);
			}
			v.visitDefaultPost(parent, ast);
		}
	}

	/**
	 * 構文木を渡り歩くためのVisitor。
	 * 実装されなかったメソッドは、visitDefault または NodeSyntaxTree を継承している場合 visitNode にフォールバックする。
	 * 各メソッドの返り値としてanyを返す。
	 * undefined, true を返した時、子要素の探索は継続される。
	 * false を返した時、子要素の探索は行われない。
	 * Function を返した時、子要素の探索を行う代わりにその関数が実行される。Functionには引数として実行中のTreeVisitorが渡される。
	 */
	export interface ITreeVisitor {
		visitDefaultPre(node:SyntaxTree, parent:SyntaxTree):any;
		visitDefaultPost?(node:SyntaxTree, parent:SyntaxTree);
		visitNodePre?(node:NodeSyntaxTree, parent:SyntaxTree):any;
		visitNodePost?(node:NodeSyntaxTree, parent:SyntaxTree);
		visitBlockElementPre?(node:BlockElementSyntaxTree, parent:SyntaxTree):any;
		visitBlockElementPost?(node:BlockElementSyntaxTree, parent:SyntaxTree);
		visitInlineElementPre?(node:InlineElementSyntaxTree, parent:SyntaxTree):any;
		visitInlineElementPost?(node:InlineElementSyntaxTree, parent:SyntaxTree);
		visitArgumentPre?(node:ArgumentSyntaxTree, parent:SyntaxTree):any;
		visitArgumentPost?(node:ArgumentSyntaxTree, parent:SyntaxTree);
		visitChapterPre?(node:ChapterSyntaxTree, parent:SyntaxTree):any;
		visitChapterPost?(node:ChapterSyntaxTree, parent:SyntaxTree);
		visitChapterContentPre?(node:ChapterSyntaxTree, parent:SyntaxTree):any;
		visitChapterContentPost?(node:ChapterSyntaxTree, parent:SyntaxTree);
		visitHeadlinePre?(node:HeadlineSyntaxTree, parent:SyntaxTree):any;
		visitHeadlinePost?(node:HeadlineSyntaxTree, parent:SyntaxTree);
		visitUlistPre?(node:UlistElementSyntaxTree, parent:SyntaxTree):any;
		visitUlistPost?(node:UlistElementSyntaxTree, parent:SyntaxTree);
		visitOlistPre?(node:OlistElementSyntaxTree, parent:SyntaxTree):any;
		visitOlistPost?(node:OlistElementSyntaxTree, parent:SyntaxTree);
		visitDlistPre?(node:DlistElementSyntaxTree, parent:SyntaxTree):any;
		visitDlistPost?(node:DlistElementSyntaxTree, parent:SyntaxTree);
		visitTextPre?(node:TextNodeSyntaxTree, parent:SyntaxTree):any;
		visitTextPost?(node:TextNodeSyntaxTree, parent:SyntaxTree);
	}
}
