///<reference path='libs/peg.js.d.ts' />

module ReVIEW {
	export module Parser {
		export function parse(input:string):{ast:SyntaxTree;cst:ConcreatSyntaxTree} {
			var rawResult = PEG.parse(input);
			var root = SyntaxTree.transform(rawResult);
			return {
				ast: root,
				cst: rawResult
			};
		}
	}

	export interface ConcreatSyntaxTree {
		// 共通
		syntax: string;
		line: number;
		column: number;
		offset: number;

		// Ruleによっては
		headline?: any;
		text?:any;
		level?:number;
		label?:any;
		tag?:any;
		caption?:any;
		name?:any;
		args?:any;
		content?:any;
		contents?:any;
		arg?:any;
		no?:any;
	}

	export class SyntaxTree {
		parentNode:SyntaxTree;
		type:string;
		offset:number;
		line:number;
		column:number;
		name:string;

		childNodes:SyntaxTree[] = [];

		static transform(rawResult:ConcreatSyntaxTree):SyntaxTree {
			if (<any>rawResult === "") {
				return null;
			}
			switch (rawResult.syntax) {
				case "Chapter":
				case "BlockElement":
					return null;
				case "Headline":
				case "InlineElement":
				case "BracketArg":
				case "BraceArg":
				case "UlistElement":
				case "OlistElement":
				case "DlistElement":
					return null;
				default:
					return new SyntaxTree(rawResult);
			}
		}

		constructor(data:ConcreatSyntaxTree) {
			this.offset = data.offset;
			this.line = data.line;
			this.column = data.column;
			this.name = data.syntax;

			switch (this.name) {
				// c, cc パターン
				case "Chapters":
				case "Paragraphs":
				case "Contents":
				case "BlockInnerContents":
				case "BlockInnerContent":
					this.type = "block";
					this.processChildNodes(data.content);
					break;
				case "InlineInnerContents":
				case "ContentInlineHelpers":
				case "Ulist":
				case "Olist":
				case "Dlist":
					this.type = "inline";
					this.processChildNodes(data.content);
					break;

				// c パターン
				case "Start":
				case "Paragraph":
				case "Content":
				case "ContentText":
				case "BlockInnerContentText":
				case "InlineInnerContent":
				case "EndOfInlineInnerContent":
				case "InlineInnerContentText":
				case "ContentInline":
				case "ContentInlineHelper":
				case "ContentInlineHelperText":
				case "DlistElementText":
				case "SinglelineComment":
					this.type = "block";
					this.processChildNodes(data.content);
					break;

				// 特殊構文
				case "Chapter":
				case "BlockElement":
					this.type = "block";
					break;
				case "Headline":
				case "InlineElement":
				case "BracketArg":
				case "BraceArg":
				case "UlistElement":
				case "OlistElement":
				case "DlistElement":
					this.type = "inline";
					break;

				default:
					console.warn("unknown name '" + this.name + "'");
			}
		}

		private processChildNodes(content:any) {
			if (Array.isArray(content)) {
				content.forEach((rawResult:ConcreatSyntaxTree)=> {
					var tree = SyntaxTree.transform(rawResult);
					if (tree) {
						tree.parentNode = this;
						this.childNodes.push(tree);
					}
				});
			} else if (content !== "" && !content) {
				((rawResult:ConcreatSyntaxTree)=> {
					var tree = SyntaxTree.transform(rawResult);
					if (tree) {
						tree.parentNode = this;
						this.childNodes.push(tree);
					}
				})(content);
			}
		}

		toJSON():any {
			var result = {};
			for (var k in this) {
				if (k !== "parentNode" && typeof this[k] !== "function") {
					result[k] = this[k];
				}
			}
			return result;
		}

		toString(indentLevel:number = 0):string {
			var makeIndent = function (indentLevel:number) {
				var indent = "";
				for (var i = 0; i < indentLevel; i++) {
					indent += "  ";
				}
				return indent;
			};
			var result = makeIndent(indentLevel) + "SyntaxTree:[\n";
			result += makeIndent(indentLevel + 1) + "offset = " + this.offset + ",\n";
			result += makeIndent(indentLevel + 1) + "line=" + this.line + ",\n";
			result += makeIndent(indentLevel + 1) + "column=" + this.column + ",\n";
			result += makeIndent(indentLevel + 1) + "name=" + this.name + ",\n";
			this.toStringHook(indentLevel, result);
			if (this.childNodes.length !== 0) {
				result += makeIndent(indentLevel + 1) + "childNodes[" + this.childNodes.length + "]=[\n";
				this.childNodes.forEach((node)=> {
					result += node.toString(indentLevel + 2);
					result += "\n";
				});
				result += makeIndent(indentLevel + 1) + "]\n";
			}
			result += makeIndent(indentLevel) + "]";

			return result;
		}

		toStringHook(indentLevel:number, result:string) {
		}
	}
}
