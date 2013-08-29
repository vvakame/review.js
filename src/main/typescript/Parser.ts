///<reference path='libs/peg.js.d.ts' />

///<reference path='Model.ts' />
///<reference path='Walker.ts' />

module ReVIEW {
	export module Parse {
		export function parse(input:string):{ast:NodeSyntaxTree;cst:ConcreatSyntaxTree;} {
			var rawResult = PEG.parse(input);
			var root = <NodeSyntaxTree> transform(rawResult);

			// Chapter を Headline の level に応じて構造を組み替える
			//   level 2 は level 1 の下に来るようにしたい
			if (root.childNodes.length !== 0) {
				reconstruct(<NodeSyntaxTree>root.childNodes[0], (chapter:ChapterSyntaxTree)=> chapter.headline.level);
			}
			// Ulist もChapter 同様の level 構造があるので同じように処理したい
			var ulistSet:NodeSyntaxTree[] = [];
			ReVIEW.visit(root, {
				visitDefault: (parent:SyntaxTree, ast:SyntaxTree)=> {
					if (ast.ruleName === RuleName.Ulist) {
						ulistSet.push(<NodeSyntaxTree>ast);
					}
				}
			});
			ulistSet.forEach((ulist)=> {
				reconstruct(ulist, (ulistElement:UlistElementSyntaxTree)=> ulistElement.level);
			});

			// parentNode を設定
			ReVIEW.visit(root, {
				visitDefault: (parent:SyntaxTree, ast:SyntaxTree)=> {
					ast.parentNode = parent;
				}
			});
			return {
				ast: root,
				cst: rawResult
			};
		}

		export function transform(rawResult:ConcreatSyntaxTree):SyntaxTree {
			if (<any>rawResult === "") {
				return null;
			}
			var rule = RuleName[rawResult.syntax];
			if (typeof rule === "undefined") {
				throw new ParseError(rawResult, "unknown rule: " + rawResult.syntax);
			}
			switch (rule) {
				case RuleName.Chapter:
					return new ChapterSyntaxTree(rawResult);
				case RuleName.BlockElement:
					return new BlockElementSyntaxTree(rawResult);
				case RuleName.Headline:
					return new HeadlineSyntaxTree(rawResult);
				case RuleName.InlineElement:
					return new InlineElementSyntaxTree(rawResult);
				case RuleName.BracketArg:
				case RuleName.BraceArg:
					return new ArgumentSyntaxTree(rawResult);
				case RuleName.UlistElement:
					return new UlistElementSyntaxTree(rawResult);
				case RuleName.OlistElement:
					return new OlistElementSyntaxTree(rawResult);
				case RuleName.DlistElement:
					return new DlistElementSyntaxTree(rawResult);
				case RuleName.ContentText:
				case RuleName.BlockElementContentText:
				case RuleName.InlineElementContentText:
				case RuleName.ContentInlineText:
				case RuleName.SinglelineComment:
					return new TextNodeSyntaxTree(rawResult);
				// c, cc パターン
				case RuleName.Chapters:
				case RuleName.Paragraphs:
				case RuleName.Contents:
				case RuleName.BlockElementContents:
				case RuleName.InlineElementContents:
				case RuleName.ContentInlines:
				case RuleName.Ulist:
				case RuleName.Olist:
				case RuleName.Dlist:
					return new NodeSyntaxTree(rawResult);
				// c パターン
				case RuleName.Start:
				case RuleName.Paragraph:
				case RuleName.DlistElementContent:
					return new NodeSyntaxTree(rawResult);
				case RuleName.Content:
				case RuleName.BlockElementContent:
				case RuleName.InlineElementContent:
				case RuleName.SinglelineContent:
				case RuleName.ContentInline:
					// パースした内容は直接役にたたない c / c / c 系
					return transform(rawResult.content);
				default:
					console.warn("unknown rule : " + rawResult.syntax);
					return new SyntaxTree(rawResult);
			}
		}

		function reconstruct(node:NodeSyntaxTree, pickLevel:(ast:NodeSyntaxTree)=>number) {
			var originalChildNodes = node.childNodes;
			node.childNodes = [];

			var nodeSets:NodeSyntaxTree[][] = [];
			var currentSet:NodeSyntaxTree[] = [];

			originalChildNodes.forEach((child:NodeSyntaxTree)=> {
				if (currentSet.length === 0) {
					currentSet.push(child);

				} else if (pickLevel(currentSet[0]) < pickLevel(child)) {
					currentSet.push(child);

				} else {
					nodeSets.push(currentSet);
					currentSet = [];
					currentSet.push(child);
				}
			});
			if (currentSet.length !== 0) {
				nodeSets.push(currentSet);
			}
			nodeSets.forEach((nodes:NodeSyntaxTree[])=> {
				var parent = nodes[0];
				node.childNodes.push(parent);
				nodes.splice(1).forEach((child) => {
					parent.childNodes.push(child);
				});
				reconstruct(parent, pickLevel);
			});
		}
	}
}
