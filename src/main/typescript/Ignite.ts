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
		syntax: string;
		line: number;
		column: number;
		offset: number;
	}

	export class SyntaxTree {
		parentNode:SyntaxTree;
		type:string;
		label:string;
		text:string;

		attributes:string[] = [];
		childNodes:SyntaxTree[] = [];

		static transform(rawResult:ConcreatSyntaxTree):SyntaxTree {
			if (<any>rawResult === "") {
				return null;
			}
			return new SyntaxTree(rawResult.offset, rawResult.line, rawResult.column, rawResult.syntax, rawResult);
		}

		constructor(public offset:number, public line:number, public column:number, public name:string, data:any) {
			switch (this.name) {
				// c, cc パターン
				case "Chapters":
				case "Paragraphs":
					this.type = "block";
					if (Array.isArray(data.content)) {
						data.content.forEach((rawResult:ConcreatSyntaxTree)=> {
							var tree = SyntaxTree.transform(rawResult);
							if (tree) {
								this.childNodes.push(tree);
							}
						});
					} else if (data.content !== "" && !data.content) {
						((rawResult:ConcreatSyntaxTree)=> {
							var tree = SyntaxTree.transform(rawResult);
							if (tree) {
								this.childNodes.push(tree);
							}
						})(data.content);
					}
					break;

				// c パターン
				case "Start":
				case "Paragraph":
					this.type = "block";
					((rawResult:ConcreatSyntaxTree)=> {
						var tree = SyntaxTree.transform(rawResult);
						if (tree) {
							this.childNodes.push(tree);
						}
					})(data.content);
					break;

				// TODO 特殊構文なので後で
				case "Chapter":
				case "Content":
					this.type = "block";
					break;
				case "Headline":
					this.type = "inline";
					break;

				default:
					console.warn("unknown name '" + this.name + "'");
			}
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
			if (this.attributes.length !== 0) {
				result += makeIndent(indentLevel + 1) + "attributes=[";
				this.attributes.forEach((node, index, array)=> {
					result += node;
					if (index !== array.length - 1) {
						result += ", ";
					}
				});
				result += "]\n";
			}
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
	}
}
