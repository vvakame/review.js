///<reference path='libs/peg.js.d.ts' />

module ReVIEW {
	export class Parser {
		root:SyntaxTree;
		rawResult:any;

		constructor(public input:string) {
			this.rawResult = PEG.parse(input);
			this.root = this.transform(this.rawResult);
		}

		static parse(input:string) {
			var parser = new Parser(input);
		}

		private transform(rawResult:RawSyntaxTree = this.rawResult):SyntaxTree {
			var tree = new SyntaxTree(rawResult.offset, rawResult.line, rawResult.column, rawResult.syntax, rawResult);
			return tree;
		}
	}

	interface RawSyntaxTree {
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

		constructor(public offset:number, public line:number, public column:number, public name:string, data:any) {
			switch (this.name) {
				case "start":
					this.type = "block";
					break;
				case "chapter":
					this.type = "block";
					break;
				case "headline":
					this.type = "inline";
					console.log(data);
					this.attributes = [data[0].length, data[1].join("")];
					this.label = this.attributes[2];
					this.text = this.attributes[3];
					break;
				case "content":
					// TODO
					this.type = "block";
				case "newline":
				case "space":
				case "spacing":
					this.type = "inline";
					// TODO めんどいから適当にそうした 後で再チェック
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
