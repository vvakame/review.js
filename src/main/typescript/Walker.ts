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
			visitChapter: v.visitChapter || v.visitDefault,
			visitHeadline: v.visitHeadline || v.visitDefault,
			visitUlist: v.visitUlist || v.visitDefault,
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
		visitSub(ast, newV);
	}

	function visitSub(ast:Parse.SyntaxTree, v:TreeVisitor) {
		if (ast instanceof Parse.BlockElementSyntaxTree) {
			var block:Parse.BlockElementSyntaxTree = <Parse.BlockElementSyntaxTree>ast;
			v.visitBlockElement(block);
			block.args.forEach((ast)=> {
				visitSub(ast, v);
			});
			block.childNodes.forEach((ast)=> {
				visitSub(ast, v);
			});
		} else if (ast instanceof Parse.InlineElementSyntaxTree) {
			var inline:Parse.InlineElementSyntaxTree = <Parse.InlineElementSyntaxTree>ast;
			v.visitInlineElement(inline);
			inline.childNodes.forEach((ast)=> {
				visitSub(ast, v);
			});
		} else if (ast instanceof Parse.ArgumentSyntaxTree) {
			var arg:Parse.ArgumentSyntaxTree = <Parse.ArgumentSyntaxTree>ast;
			v.visitArgument(arg);
		} else if (ast instanceof Parse.ChapterSyntaxTree) {
			var chap:Parse.ChapterSyntaxTree = <Parse.ChapterSyntaxTree>ast;
			v.visitChapter(chap);
			visitSub(chap.headline, v);
			if (chap.text) {
				chap.text.forEach((ast)=> {
					visitSub(ast, v);
				});
			}
			chap.childNodes.forEach((ast)=> {
				visitSub(ast, v);
			});
		} else if (ast instanceof Parse.HeadlineSyntaxTree) {
			var head:Parse.HeadlineSyntaxTree = <Parse.HeadlineSyntaxTree>ast;
			v.visitHeadline(head);
			visitSub(head.label, v);
			visitSub(head.tag, v);
			visitSub(head.caption, v);
		} else if (ast instanceof Parse.UlistElementSyntaxTree) {
			var ul:Parse.UlistElementSyntaxTree = <Parse.UlistElementSyntaxTree>ast;
			v.visitUlist(ul);
			visitSub(ul.text, v);
			ul.childNodes.forEach((ast)=> {
				visitSub(ast, v);
			});
		} else if (ast instanceof Parse.OlistElementSyntaxTree) {
			var ol:Parse.OlistElementSyntaxTree = <Parse.OlistElementSyntaxTree>ast;
			v.visitOlist(ol);
			visitSub(ol.text, v);
		} else if (ast instanceof Parse.DlistElementSyntaxTree) {
			var dl:Parse.DlistElementSyntaxTree = <Parse.DlistElementSyntaxTree>ast;
			v.visitDlist(dl);
			visitSub(dl.text, v);
			visitSub(dl.content, v);
		} else if (ast instanceof Parse.NodeSyntaxTree) {
			var node:Parse.NodeSyntaxTree = <Parse.NodeSyntaxTree>ast;
			v.visitNode(node);
			node.childNodes.forEach((ast)=> {
				visitSub(ast, v);
			});
		} else if (ast instanceof Parse.TextNodeSyntaxTree) {
			var text:Parse.TextNodeSyntaxTree = <Parse.TextNodeSyntaxTree>ast;
			v.visitText(text);
		} else if (ast) {
			v.visitDefault(ast);
		}
	}

	export interface TreeVisitor {
		visitDefault(ast:Parse.SyntaxTree);
		visitNode?(ast:Parse.NodeSyntaxTree);
		visitBlockElement?(ast:Parse.BlockElementSyntaxTree); // fallback to visitNode
		visitInlineElement?(ast:Parse.InlineElementSyntaxTree); // fallback to visitNode
		visitArgument?(ast:Parse.ArgumentSyntaxTree);
		visitChapter?(ast:Parse.ChapterSyntaxTree);
		visitHeadline?(ast:Parse.HeadlineSyntaxTree);
		visitUlist?(ast:Parse.UlistElementSyntaxTree);
		visitOlist?(ast:Parse.OlistElementSyntaxTree);
		visitDlist?(ast:Parse.DlistElementSyntaxTree);
		visitText?(ast:Parse.TextNodeSyntaxTree);
	}
}
