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

	export function walk(ast:SyntaxTree, actor:(ast:SyntaxTree)=>SyntaxTree) {
		var next = actor(ast);
		if (next !== null) {
			walk(next, actor);
		}
	}

	export function visit(ast:SyntaxTree, v:TreeVisitor) {
		var newV:TreeVisitor = {
			visitDefault: v.visitDefault,
			visitBlockElement: v.visitBlockElement || v.visitNode || v.visitDefault,
			visitInlineElement: v.visitInlineElement || v.visitNode || v.visitDefault,
			visitNode: v.visitNode || v.visitDefault,
			visitArgument: v.visitArgument || v.visitDefault,
			visitChapter: v.visitChapter || v.visitNode || v.visitDefault,
			visitHeadline: v.visitHeadline || v.visitDefault,
			visitUlist: v.visitUlist || v.visitNode || v.visitDefault,
			visitOlist: v.visitOlist || v.visitDefault,
			visitDlist: v.visitDlist || v.visitDefault,
			visitText: v.visitText || v.visitDefault
		};
		newV.visitDefault = newV.visitDefault.bind(v);
		newV.visitBlockElement = newV.visitBlockElement.bind(v);
		newV.visitInlineElement = newV.visitInlineElement.bind(v);
		newV.visitNode = newV.visitNode.bind(v);
		newV.visitArgument = newV.visitArgument.bind(v);
		newV.visitChapter = newV.visitChapter.bind(v);
		newV.visitHeadline = newV.visitHeadline.bind(v);
		newV.visitUlist = newV.visitUlist.bind(v);
		newV.visitOlist = newV.visitOlist.bind(v);
		newV.visitDlist = newV.visitDlist.bind(v);
		newV.visitText = newV.visitText.bind(v);
		visitSub(null, ast, newV);
	}

	function visitSub(parent:SyntaxTree, ast:SyntaxTree, v:TreeVisitor) {
		if (ast instanceof BlockElementSyntaxTree) {
			var block = ast.toBlockElement();
			v.visitBlockElement(parent, block);
			block.args.forEach((next)=> {
				visitSub(ast, next, v);
			});
			block.childNodes.forEach((next)=> {
				visitSub(ast, next, v);
			});
		} else if (ast instanceof InlineElementSyntaxTree) {
			var inline = ast.toInlineElement();
			v.visitInlineElement(parent, inline);
			inline.childNodes.forEach((next)=> {
				visitSub(ast, next, v);
			});
		} else if (ast instanceof ArgumentSyntaxTree) {
			var arg = ast.toArgument();
			v.visitArgument(parent, arg);
		} else if (ast instanceof ChapterSyntaxTree) {
			var chap = ast.toChapter();
			v.visitChapter(parent, chap);
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
			v.visitHeadline(parent, head);
			visitSub(ast, head.label, v);
			visitSub(ast, head.tag, v);
			visitSub(ast, head.caption, v);
		} else if (ast instanceof UlistElementSyntaxTree) {
			var ul = ast.toUlist();
			v.visitUlist(parent, ul);
			visitSub(ast, ul.text, v);
			ul.childNodes.forEach((next)=> {
				visitSub(ast, next, v);
			});
		} else if (ast instanceof OlistElementSyntaxTree) {
			var ol = ast.toOlist();
			v.visitOlist(parent, ol);
			visitSub(ast, ol.text, v);
		} else if (ast instanceof DlistElementSyntaxTree) {
			var dl = ast.toDlist();
			v.visitDlist(parent, dl);
			visitSub(ast, dl.text, v);
			visitSub(ast, dl.content, v);
		} else if (ast instanceof NodeSyntaxTree) {
			var node = ast.toNode();
			v.visitNode(parent, node);
			node.childNodes.forEach((next)=> {
				visitSub(ast, next, v);
			});
		} else if (ast instanceof TextNodeSyntaxTree) {
			var text = ast.toTextNode();
			v.visitText(parent, text);
		} else if (ast) {
			v.visitDefault(parent, ast);
		}
	}

	export interface TreeVisitor {
		visitDefault(parent:SyntaxTree, ast:SyntaxTree);
		visitNode?(parent:SyntaxTree, ast:NodeSyntaxTree);
		visitBlockElement?(parent:SyntaxTree, ast:BlockElementSyntaxTree);
		visitInlineElement?(parent:SyntaxTree, ast:InlineElementSyntaxTree);
		visitArgument?(parent:SyntaxTree, ast:ArgumentSyntaxTree);
		visitChapter?(parent:SyntaxTree, ast:ChapterSyntaxTree);
		visitHeadline?(parent:SyntaxTree, ast:HeadlineSyntaxTree);
		visitUlist?(parent:SyntaxTree, ast:UlistElementSyntaxTree);
		visitOlist?(parent:SyntaxTree, ast:OlistElementSyntaxTree);
		visitDlist?(parent:SyntaxTree, ast:DlistElementSyntaxTree);
		visitText?(parent:SyntaxTree, ast:TextNodeSyntaxTree);
	}
}
