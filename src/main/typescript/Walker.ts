///<reference path='Model.ts' />
///<reference path='Parser.ts' />

module ReVIEW {

	export function walk(ast:Parse.SyntaxTree, actor:(ast:Parse.SyntaxTree)=>Parse.SyntaxTree) {
		var next = actor(ast);
		if (next !== null) {
			walk(next, actor);
		}
	}

	export function visit(ast:Parse.SyntaxTree, v:TreeVisitor) {
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

	function visitSub(parent:Parse.SyntaxTree, ast:Parse.SyntaxTree, v:TreeVisitor) {
		if (ast instanceof Parse.BlockElementSyntaxTree) {
			var block:Parse.BlockElementSyntaxTree = <Parse.BlockElementSyntaxTree>ast;
			v.visitBlockElement(parent, block);
			block.args.forEach((next)=> {
				visitSub(ast, next, v);
			});
			block.childNodes.forEach((next)=> {
				visitSub(ast, next, v);
			});
		} else if (ast instanceof Parse.InlineElementSyntaxTree) {
			var inline:Parse.InlineElementSyntaxTree = <Parse.InlineElementSyntaxTree>ast;
			v.visitInlineElement(parent, inline);
			inline.childNodes.forEach((next)=> {
				visitSub(ast, next, v);
			});
		} else if (ast instanceof Parse.ArgumentSyntaxTree) {
			var arg:Parse.ArgumentSyntaxTree = <Parse.ArgumentSyntaxTree>ast;
			v.visitArgument(parent, arg);
		} else if (ast instanceof Parse.ChapterSyntaxTree) {
			var chap:Parse.ChapterSyntaxTree = <Parse.ChapterSyntaxTree>ast;
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
		} else if (ast instanceof Parse.HeadlineSyntaxTree) {
			var head:Parse.HeadlineSyntaxTree = <Parse.HeadlineSyntaxTree>ast;
			v.visitHeadline(parent, head);
			visitSub(ast, head.label, v);
			visitSub(ast, head.tag, v);
			visitSub(ast, head.caption, v);
		} else if (ast instanceof Parse.UlistElementSyntaxTree) {
			var ul:Parse.UlistElementSyntaxTree = <Parse.UlistElementSyntaxTree>ast;
			v.visitUlist(parent, ul);
			visitSub(ast, ul.text, v);
			ul.childNodes.forEach((next)=> {
				visitSub(ast, next, v);
			});
		} else if (ast instanceof Parse.OlistElementSyntaxTree) {
			var ol:Parse.OlistElementSyntaxTree = <Parse.OlistElementSyntaxTree>ast;
			v.visitOlist(parent, ol);
			visitSub(ast, ol.text, v);
		} else if (ast instanceof Parse.DlistElementSyntaxTree) {
			var dl:Parse.DlistElementSyntaxTree = <Parse.DlistElementSyntaxTree>ast;
			v.visitDlist(parent, dl);
			visitSub(ast, dl.text, v);
			visitSub(ast, dl.content, v);
		} else if (ast instanceof Parse.NodeSyntaxTree) {
			var node:Parse.NodeSyntaxTree = <Parse.NodeSyntaxTree>ast;
			v.visitNode(parent, node);
			node.childNodes.forEach((next)=> {
				visitSub(ast, next, v);
			});
		} else if (ast instanceof Parse.TextNodeSyntaxTree) {
			var text:Parse.TextNodeSyntaxTree = <Parse.TextNodeSyntaxTree>ast;
			v.visitText(parent, text);
		} else if (ast) {
			v.visitDefault(parent, ast);
		}
	}

	export interface TreeVisitor {
		visitDefault(parent:Parse.SyntaxTree, ast:Parse.SyntaxTree);
		visitNode?(parent:Parse.SyntaxTree, ast:Parse.NodeSyntaxTree);
		visitBlockElement?(parent:Parse.SyntaxTree, ast:Parse.BlockElementSyntaxTree);
		visitInlineElement?(parent:Parse.SyntaxTree, ast:Parse.InlineElementSyntaxTree);
		visitArgument?(parent:Parse.SyntaxTree, ast:Parse.ArgumentSyntaxTree);
		visitChapter?(parent:Parse.SyntaxTree, ast:Parse.ChapterSyntaxTree);
		visitHeadline?(parent:Parse.SyntaxTree, ast:Parse.HeadlineSyntaxTree);
		visitUlist?(parent:Parse.SyntaxTree, ast:Parse.UlistElementSyntaxTree);
		visitOlist?(parent:Parse.SyntaxTree, ast:Parse.OlistElementSyntaxTree);
		visitDlist?(parent:Parse.SyntaxTree, ast:Parse.DlistElementSyntaxTree);
		visitText?(parent:Parse.SyntaxTree, ast:Parse.TextNodeSyntaxTree);
	}
}
