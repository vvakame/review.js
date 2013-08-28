///<reference path='libs/peg.js.d.ts' />

module ReVIEW {
	export module Parser {
		export function parse(input:string):{ast:SyntaxTree;cst:ConcreatSyntaxTree} {
			var rawResult = PEG.parse(input);
			var root = SyntaxTree.transform(rawResult);
			console.warn("まだ開発中です。生成されるASTは今後圧縮される可能性が95%です。");
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
					return SyntaxTree.transform(rawResult.content);
				default:
					console.warn("unknown rule : " + rawResult.syntax);
					return new SyntaxTree(rawResult);
			}
		}

		constructor(data:ConcreatSyntaxTree) {
			this.ruleName = data.syntax;
			this.offset = data.offset;
			this.line = data.line;
			this.column = data.column;
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
			var result = this.makeIndent(indentLevel) + "SyntaxTree:[\n";
			result += this.makeIndent(indentLevel + 1) + "offset = " + this.offset + ",\n";
			result += this.makeIndent(indentLevel + 1) + "line=" + this.line + ",\n";
			result += this.makeIndent(indentLevel + 1) + "column=" + this.column + ",\n";
			result += this.makeIndent(indentLevel + 1) + "name=" + this.ruleName + ",\n";
			this.toStringHook(indentLevel, result);
			result += this.makeIndent(indentLevel) + "]";

			return result;
		}

		makeIndent(indentLevel:number) {
			var indent = "";
			for (var i = 0; i < indentLevel; i++) {
				indent += "  ";
			}
			return indent;
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

	export class NodeSyntaxTree extends SyntaxTree {
		childNodes:SyntaxTree[];

		constructor(data:ConcreatSyntaxTree) {
			super(data);
			this.childNodes = [];
			this.processChildNodes(data.content);
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

		toStringHook(indentLevel:number, result:string) {
			if (this.childNodes.length !== 0) {
				result += this.makeIndent(indentLevel + 1) + "childNodes[" + this.childNodes.length + "]=[\n";
				this.childNodes.forEach((node)=> {
					result += node.toString(indentLevel + 2);
					result += "\n";
				});
				result += this.makeIndent(indentLevel + 1) + "]\n";
			}
		}
	}

	// TODO SyntaxTree と指定されている所についてもっと細かく書けるはず…

	// TODO Chapter も NodeSyntaxTree を継承するべき
	export class ChapterSyntaxTree extends SyntaxTree {
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

	export class HeadlineSyntaxTree extends SyntaxTree {
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

	export class BlockElementSyntaxTree extends NodeSyntaxTree {
		name:string;
		args:SyntaxTree[];

		constructor(data:ConcreatSyntaxTree) {
			super(data);
			this.name = this.checkString(data.name);
			this.args = this.checkArray(data.args).map((data:ConcreatSyntaxTree)=> {
				return SyntaxTree.transform(data);
			});
		}
	}

	export class InlineElementSyntaxTree extends NodeSyntaxTree {
		name:string;

		constructor(data:ConcreatSyntaxTree) {
			super(data);
			this.name = this.checkString(data.name);
		}
	}

	export class ArgumentSyntaxTree extends SyntaxTree {
		arg:string;

		constructor(data:ConcreatSyntaxTree) {
			super(data);
			this.arg = this.checkString(data.arg);
		}
	}

	export class UlistElementSyntaxTree extends SyntaxTree {
		level:number;
		text:SyntaxTree;

		constructor(data:ConcreatSyntaxTree) {
			super(data);
			this.level = this.checkNumber(data.level);
			this.text = SyntaxTree.transform(this.checkObject(data.text));
		}
	}

	export class OlistElementSyntaxTree extends SyntaxTree {
		no:number;
		text:SyntaxTree;

		constructor(data:ConcreatSyntaxTree) {
			super(data);
			this.no = this.checkNumber(data.no);
			this.text = SyntaxTree.transform(this.checkObject(data.text));
		}
	}

	export class DlistElementSyntaxTree extends SyntaxTree {
		text:SyntaxTree;
		content:SyntaxTree;

		constructor(data:ConcreatSyntaxTree) {
			super(data);
			this.text = SyntaxTree.transform(this.checkObject(data.text));
			this.content = SyntaxTree.transform(this.checkObject(data.content));
		}
	}

	export class TextNodeSyntaxTree extends SyntaxTree {
		text:string;

		constructor(data:ConcreatSyntaxTree) {
			super(data);
			this.text = this.checkString(data.text);
		}
	}
}
