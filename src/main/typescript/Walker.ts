///<reference path='Parser.ts' />

module ReVIEW {

	export function walk(ast:SyntaxTree, v:TreeVisitor) {
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
		walkSub(ast, newV);
	}

	function walkSub(ast:SyntaxTree, v:TreeVisitor) {
		if (ast instanceof BlockElementSyntaxTree) {
			var block:BlockElementSyntaxTree = <BlockElementSyntaxTree>ast;
			v.visitBlockElement(block);
			block.args.forEach((ast)=> {
				walkSub(ast, v);
			});
			block.childNodes.forEach((ast)=> {
				walkSub(ast, v);
			});
		} else if (ast instanceof InlineElementSyntaxTree) {
			var inline:InlineElementSyntaxTree = <InlineElementSyntaxTree>ast;
			v.visitInlineElement(inline);
			inline.childNodes.forEach((ast)=> {
				walkSub(ast, v);
			});
		} else if (ast instanceof NodeSyntaxTree) {
			var node:NodeSyntaxTree = <NodeSyntaxTree>ast;
			v.visitNode(node);
			node.childNodes.forEach((ast)=> {
				walkSub(ast, v);
			});
		} else if (ast instanceof ArgumentSyntaxTree) {
			var arg:ArgumentSyntaxTree = <ArgumentSyntaxTree>ast;
			v.visitArgument(arg);
		} else if (ast instanceof ChapterSyntaxTree) {
			var chap:ChapterSyntaxTree = <ChapterSyntaxTree>ast;
			v.visitChapter(chap);
			walkSub(chap.headline, v);
			if (chap.text) {
				chap.text.forEach((ast)=> {
					walkSub(ast, v);
				});
			}
		} else if (ast instanceof HeadlineSyntaxTree) {
			var head:HeadlineSyntaxTree = <HeadlineSyntaxTree>ast;
			v.visitHeadline(head);
			walkSub(head.label, v);
			walkSub(head.tag, v);
			walkSub(head.caption, v);
		} else if (ast instanceof UlistElementSyntaxTree) {
			var ul:UlistElementSyntaxTree = <UlistElementSyntaxTree>ast;
			v.visitUlist(ul);
			walkSub(ul.text, v);
		} else if (ast instanceof OlistElementSyntaxTree) {
			var ol:OlistElementSyntaxTree = <OlistElementSyntaxTree>ast;
			v.visitOlist(ol);
			walkSub(ol.text, v);
		} else if (ast instanceof DlistElementSyntaxTree) {
			var dl:DlistElementSyntaxTree = <DlistElementSyntaxTree>ast;
			v.visitDlist(dl);
			walkSub(dl.text, v);
			walkSub(dl.content, v);
		} else if (ast instanceof TextNodeSyntaxTree) {
			var text:TextNodeSyntaxTree = <TextNodeSyntaxTree>ast;
			v.visitText(text);
		} else if (ast) {
			v.visitDefault(ast);
		}
	}

	export interface TreeVisitor {
		visitDefault(ast:SyntaxTree);
		visitNode?(ast:NodeSyntaxTree);
		visitBlockElement?(ast:BlockElementSyntaxTree); // fallback to visitNode
		visitInlineElement?(ast:InlineElementSyntaxTree); // fallback to visitNode
		visitArgument?(ast:ArgumentSyntaxTree);
		visitChapter?(ast:ChapterSyntaxTree);
		visitHeadline?(ast:HeadlineSyntaxTree);
		visitUlist?(ast:UlistElementSyntaxTree);
		visitOlist?(ast:OlistElementSyntaxTree);
		visitDlist?(ast:DlistElementSyntaxTree);
		visitText?(ast:TextNodeSyntaxTree);
	}
}
