///<reference path='libs/peg.js.d.ts' />

///<reference path='Model.ts' />
///<reference path='Walker.ts' />

module ReVIEW {
	export module Parse {
		export function parse(input:string):{ast:NodeSyntaxTree;cst:ConcreatSyntaxTree} {
			var rawResult = PEG.parse(input);
			var root = <NodeSyntaxTree> transform(rawResult);

			// Chapter と Ulist の構造を正しい親子関係になるように組替え
			if (root.childNodes.length !== 0) {
				reconstructChapters(<NodeSyntaxTree>root.childNodes[0]);
			}
			var ulistSet:NodeSyntaxTree[] = [];
			ReVIEW.visit(root, {
				visitDefault: (parent:Parse.SyntaxTree, ast:Parse.SyntaxTree)=> {
					if (ast.ruleName === "Ulist") {
						ulistSet.push(<NodeSyntaxTree>ast);
					}
				}
			});
			ulistSet.forEach((ulist)=> {
				reconstructUlist(ulist);
			});

			// parentNode を設定
			ReVIEW.visit(root, {
				visitDefault: (parent:Parse.SyntaxTree, ast:Parse.SyntaxTree)=> {
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
			switch (rawResult.syntax) {
				case "Chapter":
					return new ChapterSyntaxTree(rawResult);
				case "BlockElement":
					return new BlockElementSyntaxTree(rawResult);
				case "Headline":
					return new HeadlineSyntaxTree(rawResult);
				case "InlineElement":
					return new InlineElementSyntaxTree(rawResult);
				case "BracketArg":
				case "BraceArg":
					return new ArgumentSyntaxTree(rawResult);
				case "UlistElement":
					return new UlistElementSyntaxTree(rawResult);
				case "OlistElement":
					return new OlistElementSyntaxTree(rawResult);
				case "DlistElement":
					return new DlistElementSyntaxTree(rawResult);
				case "ContentText":
				case "BlockElementContentText":
				case "InlineElementContentText":
				case "ContentInlineText":
				case "SinglelineComment":
					return new TextNodeSyntaxTree(rawResult);
				// c, cc パターン
				case "Chapters":
				case "Paragraphs":
				case "Contents":
				case "BlockElementContents":
				case "InlineElementContents":
				case "ContentInlines":
				case "Ulist":
				case "Olist":
				case "Dlist":
					return new NodeSyntaxTree(rawResult);
				// c パターン
				case "Start":
				case "Paragraph":
				case "DlistElementContent":
					return new NodeSyntaxTree(rawResult);
				case "Content":
				case "BlockElementContent":
				case "InlineElementContent":
				case "SinglelineContent":
				case "ContentInline":
					// パースした内容は直接役にたたない c / c / c 系
					return transform(rawResult.content);
				default:
					console.warn("unknown rule : " + rawResult.syntax);
					return new SyntaxTree(rawResult);
			}
		}

		function reconstructChapters(node:NodeSyntaxTree) {
			// Chapter を Headline の level に応じて構造を組み替える
			//   level 2 は level 1 の下に来るようにしたい
			var originalChildNodes = node.childNodes;
			node.childNodes = [];

			var chapterSets:ChapterSyntaxTree[][] = [];
			var currentSet:ChapterSyntaxTree[] = [];

			originalChildNodes.forEach((chapter:ChapterSyntaxTree)=> {
				if (currentSet.length === 0) {
					currentSet.push(chapter);

				} else if (currentSet[0].headline.level < chapter.headline.level) {
					currentSet.push(chapter);

				} else {
					chapterSets.push(currentSet);
					currentSet = [];
					currentSet.push(chapter);
				}
			});
			if (currentSet.length !== 0) {
				chapterSets.push(currentSet);
			}
			chapterSets.forEach((chapters:ChapterSyntaxTree[])=> {
				var parent = chapters[0];
				node.childNodes.push(parent);
				chapters.splice(1).forEach((child) => {
					parent.childNodes.push(child);
				});
				reconstructChapters(parent);
			});
		}

		function reconstructUlist(node:NodeSyntaxTree) {
			// Ulist もChapter 同様の level 構造があるので同じように処理したい
			var originalChildNodes = node.childNodes;
			node.childNodes = [];

			var ulistSets:UlistElementSyntaxTree[][] = [];
			var currentSet:UlistElementSyntaxTree[] = [];

			originalChildNodes.forEach((ulistElement:UlistElementSyntaxTree) => {
				if (currentSet.length === 0) {
					currentSet.push(ulistElement);

				} else if (currentSet[0].level < ulistElement.level) {
					currentSet.push(ulistElement);

				} else {
					ulistSets.push(currentSet);
					currentSet = [];
					currentSet.push(ulistElement);
				}
			});
			if (currentSet.length !== 0) {
				ulistSets.push(currentSet);
			}
			ulistSets.forEach((chapters:UlistElementSyntaxTree[])=> {
				var parent = chapters[0];
				node.childNodes.push(parent);
				chapters.splice(1).forEach((child) => {
					parent.childNodes.push(child);
				});
				reconstructUlist(parent);
			});
		}
	}
}
