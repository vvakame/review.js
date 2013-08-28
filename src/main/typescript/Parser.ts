///<reference path='libs/peg.js.d.ts' />

///<reference path='Model.ts' />

module ReVIEW {
	export module Parse {
		export function parse(input:string):{ast:NodeSyntaxTree;cst:ConcreatSyntaxTree} {
			var rawResult = PEG.parse(input);
			var root = <NodeSyntaxTree> transform(rawResult);
			reconstructChapters(<NodeSyntaxTree>root.childNodes[0]);
			return {
				ast: root,
				cst: rawResult
			};
		}

		function reconstructChapters(node:NodeSyntaxTree) {
			// Chapter を Headline の level に応じて構造を組み替える
			//   level 2 は level 1 の下に来るようにしたい
			// Ulist も同様の level 構造があるので同じように処理したい
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
	}
}
