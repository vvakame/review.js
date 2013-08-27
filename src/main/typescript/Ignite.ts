///<reference path='libs/peg.js.d.ts' />

module ReVIEW {
	export module Parser {
		export function parse(input:string):{ast:SyntaxTree;cst:ConcreatSyntaxTree} {
			var rawResult = PEG.parse(input);
			var root = SyntaxTree.transform(rawResult);
			console.warn("まだ開発中です。生成されるASTは今後圧縮される可能性が100%です。");
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
		ruleName:string;
		childNodes:SyntaxTree[];

		static transform(rawResult:ConcreatSyntaxTree):SyntaxTree {
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
				case "ContentInlineHelperText":
				case "DlistElementText":
				case "SinglelineComment":
					return new TextNodeSyntaxTree(rawResult);
				case "Content":
				case "BlockElementContent":
				case "InlineElementContent":
				case "ContentInline":
				case "ContentInlineHelper":
					// パースした内容は直接役にたたない c / c / c 系
					return SyntaxTree.transform(rawResult.content);
				default:
					return new SyntaxTree(rawResult);
			}
		}

		constructor(data:ConcreatSyntaxTree) {
			this.ruleName = data.syntax;
			this.type = "";
			this.offset = data.offset;
			this.line = data.line;
			this.column = data.column;
			this.childNodes = [];

			switch (this.ruleName) {
				// c, cc パターン
				case "Chapters":
				case "Paragraphs":
				case "Contents":
				case "BlockElementContents":
				case "BlockElementContent":
					this.type = "block";
					this.processChildNodes(data.content);
					break;
				case "InlineElementContent":
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
				case "BlockElement":
				case "InlineElementContent":
				case "ContentInline":
				case "ContentInlineHelper":
					this.type = "block";
					this.processChildNodes(data.content);
					break;
				// c パターン (テキスト)
				case "ContentText":
				case "BlockElementContentText":
				case "InlineElementContentText":
				case "ContentInlineHelperText":
				case "DlistElementText":
				case "SinglelineComment":
					this.type = "block";
					break;

				// 特殊構文
				case "Chapter":
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
					console.warn("unknown name '" + this.ruleName + "'");
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
			} else if (content !== "" && content) {
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
			result += makeIndent(indentLevel + 1) + "name=" + this.ruleName + ",\n";
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

		checkNumber(value:any):number {
			if (typeof value !== "number") {
				throw new Error("number required. actual:" + (typeof value) + ":" + value);
			} else {
				return value;
			}
		}

		checkString(value:any):string {
			if (typeof value !== "string") {
				throw new Error("string required. actual:" + (typeof value) + ":" + value);
			} else {
				return value;
			}
		}

		checkObject(value:any):any {
			if (typeof value !== "object") {
				throw new Error("object required. actual:" + (typeof value) + ":" + value);
			} else {
				return value;
			}
		}

		checkArray(value:any):any[] {
			if (!Array.isArray(value)) {
				throw new Error("array required. actual:" + (typeof value) + ":" + value);
			} else {
				return value;
			}
		}
	}

	class ChapterSyntaxTree extends SyntaxTree {
		headline:SyntaxTree;
		text:SyntaxTree[];

		constructor(data:ConcreatSyntaxTree) {
			super(data);
			this.headline = SyntaxTree.transform(this.checkObject(data.headline));
			if (typeof data.text === "string") {
				return;
			}
			this.text = this.checkArray(data.text.content).map((data:ConcreatSyntaxTree)=> {
				return SyntaxTree.transform(data);
			});
		}
	}

	class HeadlineSyntaxTree extends SyntaxTree {
		level:number;
		label:ArgumentSyntaxTree;
		tag:ArgumentSyntaxTree;
		caption:SyntaxTree;

		constructor(data:ConcreatSyntaxTree) {
			super(data);

			this.level = this.checkNumber(data.level);
			if (data.label !== "") {
				this.label = <ArgumentSyntaxTree> SyntaxTree.transform(this.checkObject(data.label));
			}
			if (data.tag !== "") {
				this.tag = <ArgumentSyntaxTree> SyntaxTree.transform(this.checkObject(data.tag));
			}
			this.caption = SyntaxTree.transform(this.checkObject(data.caption));
		}
	}

	class BlockElementSyntaxTree extends SyntaxTree {
		name:string;
		args:SyntaxTree[]; // TODO

		constructor(data:ConcreatSyntaxTree) {
			super(data);
			this.name = this.checkString(data.name);
			this.args = this.checkArray(data.args).map((data:ConcreatSyntaxTree)=> {
				return SyntaxTree.transform(data);
			});
		}
	}

	class InlineElementSyntaxTree extends SyntaxTree {
		name:string;

		constructor(data:ConcreatSyntaxTree) {
			super(data);
			this.name = this.checkString(data.name);
		}
	}

	class ArgumentSyntaxTree extends SyntaxTree {
		arg:string;

		constructor(data:ConcreatSyntaxTree) {
			super(data);
			this.arg = this.checkString(data.arg);
		}
	}

	class UlistElementSyntaxTree extends SyntaxTree {
		level:number;
		text:SyntaxTree;

		constructor(data:ConcreatSyntaxTree) {
			super(data);
			this.level = this.checkNumber(data.level);
			this.text = SyntaxTree.transform(this.checkObject(data.text));
		}
	}

	class OlistElementSyntaxTree extends SyntaxTree {
		no:number;
		text:SyntaxTree;

		constructor(data:ConcreatSyntaxTree) {
			super(data);
			this.no = this.checkNumber(data.no);
			this.text = SyntaxTree.transform(this.checkObject(data.text));
		}
	}

	class DlistElementSyntaxTree extends SyntaxTree {
		text:SyntaxTree;
		content:SyntaxTree;

		constructor(data:ConcreatSyntaxTree) {
			super(data);
			this.text = SyntaxTree.transform(this.checkObject(data.text));
			this.content = SyntaxTree.transform(this.checkObject(data.content));
		}
	}

	class TextNodeSyntaxTree extends SyntaxTree {
		text:string;

		constructor(data:ConcreatSyntaxTree) {
			super(data);
			this.text = this.checkString(data.text);
		}
	}
}
