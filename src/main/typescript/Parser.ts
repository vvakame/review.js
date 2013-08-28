///<reference path='libs/peg.js.d.ts' />

///<reference path='Model.ts' />

module ReVIEW {
	export module Parse {
		export function parse(input:string):{ast:SyntaxTree;cst:ConcreatSyntaxTree} {
			var rawResult = PEG.parse(input);
			var root = transform(rawResult);
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
	}
}
