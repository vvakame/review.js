///<reference path='Parser.ts' />

module ReVIEW {
	export interface Options {
		reviewfile?:string;
		base?:string;
	}

	export interface Config {
		read?:(path:string)=>string;
		write?:(path:string, data:string)=>void;
		book:{
			preface?:string[];
			chapters:string[];
			afterword?:string[];
		};
	}

	export class Book {
		parts:Part[] = [];
	}

	// PREDEF, CHAPS, POSTDEF かな？
	// Part毎に章番号を採番する
	// PREDEF は採番しない
	export class Part {
		chapters:Chapter[];
	}

	export class Chapter {
	}

	export module Parse {
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
						var tree = transform(rawResult);
						if (tree) {
							tree.parentNode = this;
							this.childNodes.push(tree);
						}
					});
				} else if (content !== "" && content) {
					((rawResult:ConcreatSyntaxTree)=> {
						var tree = transform(rawResult);
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
		export class ChapterSyntaxTree extends NodeSyntaxTree {
			headline:HeadlineSyntaxTree;
			text:SyntaxTree[];

			constructor(data:ConcreatSyntaxTree) {
				super(data);

				this.headline = <HeadlineSyntaxTree>transform(this.checkObject(data.headline));
				this.headline.parentNode = this;
				if (typeof data.text === "string") {
					return;
				}
				this.text = this.checkArray(data.text.content).map((data:ConcreatSyntaxTree)=> {
					var syntax = transform(data);
					syntax.parentNode = this;
					return syntax;
				});

				delete this.childNodes; // JSON化した時の属性順制御のため…
				this.childNodes = [];
			}

			get level():number {
				return this.headline.level;
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
					this.label = <ArgumentSyntaxTree> transform(this.checkObject(data.label));
					this.label.parentNode = this;
				}
				if (data.tag !== "") {
					this.tag = <ArgumentSyntaxTree> transform(this.checkObject(data.tag));
					this.tag.parentNode = this;
				}
				this.caption = transform(this.checkObject(data.caption));
				this.caption.parentNode = this;
			}
		}

		export class BlockElementSyntaxTree extends NodeSyntaxTree {
			name:string;
			args:SyntaxTree[];

			constructor(data:ConcreatSyntaxTree) {
				super(data);
				this.name = this.checkString(data.name);
				this.args = this.checkArray(data.args).map((data:ConcreatSyntaxTree)=> {
					var syntax = transform(data);
					syntax.parentNode = this;
					return syntax;
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
				this.text = transform(this.checkObject(data.text));
				this.text.parentNode = this;
			}
		}

		export class OlistElementSyntaxTree extends SyntaxTree {
			no:number;
			text:SyntaxTree;

			constructor(data:ConcreatSyntaxTree) {
				super(data);
				this.no = this.checkNumber(data.no);
				this.text = transform(this.checkObject(data.text));
				this.text.parentNode = this;
			}
		}

		export class DlistElementSyntaxTree extends SyntaxTree {
			text:SyntaxTree;
			content:SyntaxTree;

			constructor(data:ConcreatSyntaxTree) {
				super(data);
				this.text = transform(this.checkObject(data.text));
				this.text.parentNode = this;
				this.content = transform(this.checkObject(data.content));
				this.content.parentNode = this;
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
}
