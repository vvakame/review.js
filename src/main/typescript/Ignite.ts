///<reference path='libs/peg.js.d.ts' />

module ReVIEW {
	export var parser:Parser;

	export class Parser {
		root:SyntaxTree;
		inlineNodes:SyntaxTree[] = [];
		parseRawResult:any;

		constructor(input:string) {
			ReVIEW.parser = this;
			this.parseRawResult = PEG.parse(input);
			ReVIEW.parser = null;
		}

		parse(syntaxArguments:any) {
			var name = syntaxArguments.callee.caller.toString().match(/function ([^\(]+)/)[1].split("_", 2)[1];
			var offset = syntaxArguments[0];
			var line = syntaxArguments[1];
			var column = syntaxArguments[2];
			// PEG上でラベル貼った項目が登場順に取れる
			var data:string[] = Array.prototype.splice.call(syntaxArguments, 3);

			var newNode = new SyntaxTree(offset, line, column, name, data);

			// 自分の子要素は		自分より先に評価され	offsetが自分と同じかそれ以降
			// 自分の親要素は		自分より後に評価され	offsetが自分と同じかそれ以上
			// 自分の兄要素は		自分より先に評価され	offsetが自分以前
			// 自分の弟要素は		自分より後に評価され	offsetが自分以降
			// 自分の親の兄要素は	自分より先に評価され	offsetが自分より前
			// 自分の親の弟要素は	自分より後に評価され	offsetが自分より後

			if (this.inlineNodes.length !== 0 && newNode.offset <= this.inlineNodes[0].offset) {
				// 自分の子要素は		自分より先に評価され	offsetが自分と同じかそれ以降
				newNode.childNodes = this.inlineNodes;
				this.inlineNodes = [];
			}
			this.inlineNodes.push(newNode);

			if (newNode.name === "start") {
				this.root = newNode;
				console.log(this.root.toString());
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
