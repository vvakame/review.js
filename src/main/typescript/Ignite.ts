///<reference path='libs/peg.js.d.ts' />

module ReVIEW {
	export var parser:Parser;

	export class Parser {
		root:SyntaxTree;
		inlineNodes:SyntaxTree[] = [];

		constructor(input:string) {
			parser = this;
			PEG.parse(input);
			parser = null;
		}

		parse(syntaxArguments:any) {
			var name = syntaxArguments.callee.caller.toString().match(/function ([^\(]+)/)[1].split("_", 2)[1];
			var offset = syntaxArguments[0];
			var line = syntaxArguments[1];
			var column = syntaxArguments[2];
			var data:string[] = Array.prototype.splice.call(syntaxArguments, 3);

			var newNode = new SyntaxTree(offset, line, column, name, data);
			if (this.inlineNodes.length !== 0 && newNode.offset >= this.inlineNodes[0].offset) {
				// 既に評価された子要素より今評価したNodeの方が後に記述されていれば少なくとも兄弟もしくは親である。
				newNode.childNodes = this.inlineNodes;
				this.inlineNodes = [];
			}
			this.inlineNodes.push(newNode);

			if (newNode.name === "start") {
				this.root = newNode;
			}
		}
	}

	export class SyntaxTree {
		parentNode:SyntaxTree;
		type:string;
		label:string;
		text:string;

		attributes:string[] = [];
		childNodes:SyntaxTree[] = [];

		constructor(public offset:number, public line:number, public column:number, public name:string, data:any[]) {
			switch (this.name) {
				case "start":
					this.type = "block";
					break;
				case "chapter":
					this.type = "block";
					break;
				case "caption":
					this.type = "inline";
					if (data.length === 2) {
						// == hoge
						this.attributes = [data[0].length, data[1].join("")];
						this.text = this.attributes[1];
					} else {
						// =={fuga} hoge
						this.attributes = [data[0].length, data[1].join(""), data[2].join("")];
						this.label = this.attributes[1];
						this.text = this.attributes[2];
					}
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
				result += makeIndent(indentLevel + 1) + "childNodes=[\n";
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
