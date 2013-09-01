///<reference path='Parser.ts' />
///<reference path='Builder.ts' />

module ReVIEW {

	/**
	 * コマンドライン引数を解釈した結果のオプション。
	 */
	export interface Options {
		reviewfile?:string;
		base?:string;
	}

	/**
	 * コンパイル実行時の設定。
	 * 本についての情報や処理実行時のプログラムの差し替え。
	 */
	export interface Config {
		// TODO めんどくさくてまだ書いてない要素がたくさんある

		read?:(path:string)=>string;
		write?:(path:string, data:string)=>void;

		analyzer:Build.IAnalyzer;
		validators:Build.IValidator[];
		builders:Build.IBuilder[];

		book:{
			preface?:string[];
			chapters:string[];
			afterword?:string[];
		};
	}

	/**
	 * コンパイル処理時の出力ハンドリング。
	 */
	export class Process {
		symbols:Symbol[] = [];
		indexCounter:{ [kind:string]:number; } = {};
		afterProcess:Function[] = [];

		constructor(public part:Part, public chapter:Chapter) {
		}

		result:string = "";

		info(message:string, node?:Parse.SyntaxTree) {
			console.log(message, node);
		}

		warn(message:string, node?:Parse.SyntaxTree) {
			console.warn(message, node);
		}

		error(message:string, node?:Parse.SyntaxTree) {
			console.error(message, node);
		}

		out(data:any):Process {
			// 最近のブラウザだと単純結合がアホみたいに早いらしいので
			this.result += data;
			return this;
		}

		addSymbol(symbol:Symbol) {
			this.symbols.push(symbol);
		}

		nextIndex(kind:string) {
			var nextIndex = this.indexCounter[kind];
			if (typeof nextIndex === "undefined") {
				nextIndex = 1;
			} else {
				nextIndex++;
			}
			this.indexCounter[kind] = nextIndex;
			return nextIndex;
		}

		addAfterProcess(func:Function) {
			this.afterProcess.push(func);
		}

		doAfterProcess() {
			this.afterProcess.forEach((func)=>func());
			this.afterProcess = [];
		}
	}

	/**
	 * シンボルについての情報。
	 */
	export interface Symbol {
		symbolName:string;
		labelName?:string;
		referenceTo?:ReferenceTo;
		node:ReVIEW.Parse.SyntaxTree;
	}

	/**
	 * 参照先についての情報。
	 */
	export interface ReferenceTo {
		part?:string;
		chapter?:string;
		label:string;
		// 上記情報から解決した結果のNode
		referenceNode?:ReVIEW.Parse.SyntaxTree;
	}

	/**
	 * 本全体を表す。
	 */
	export class Book {
		parts:Part[] = [];

		constructor(public config:Config) {
		}
	}

	/**
	 * パートを表す。
	 * パートは 前書き、本文、後書き など。
	 * Ruby版でいうと PREDEF, CHAPS, POSTDEF。
	 * 章番号はパート毎に採番される。(Ruby版では PREDEF は採番されない)
	 */
	export class Part {
		chapters:Chapter[];

		constructor(public parent:Book, public no:number, public name:string) {
		}
	}

	/**
	 * チャプターを表す。
	 */
	export class Chapter {
		process:Process;

		constructor(public parent:Part, public no:number, public name:string, public root:ReVIEW.Parse.SyntaxTree) {
			this.process = new Process(this.parent, this);
		}
	}

	/**
	 * 構文解析用途のモジュール。
	 */
	export module Parse {

		/**
		 * 構文解析時に発生したエラー。
		 */
		export class ParseError implements Error {
			name:string;

			constructor(public syntax:ConcreatSyntaxTree, public message:string) {
				if ((<any>Error).captureStackTrace) {
					(<any>Error).captureStackTrace(this, ParseError);
				}
				this.name = "ParseError";
			}
		}

		/**
		 * 構文解析直後の生データ。
		 */
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

		/**
		 * 構文解析時のルール名。
		 */
		export enum RuleName {
			Start,
			Chapters,
			Chapter,
			Headline,
			Paragraphs,
			Paragraph,
			Contents,
			Content,
			ContentText,
			BlockElement,
			InlineElement,
			BracketArg,
			BraceArg,
			BlockElementContents,
			BlockElementContent,
			BlockElementContentText,
			InlineElementContents,
			InlineElementContent,
			InlineElementContentText,
			SinglelineContent,
			ContentInlines,
			ContentInline,
			ContentInlineText,
			Ulist,
			UlistElement,
			Olist,
			OlistElement,
			Dlist,
			DlistElement,
			DlistElementContent,
			SinglelineComment,
		}

		/**
		 * 構文解析後の少し加工したデータ。
		 */
		export class SyntaxTree {
			parentNode:SyntaxTree;
			offset:number;
			line:number;
			column:number;
			ruleName:RuleName;
			// analyzer 中で設定する項目
			no:number;

			constructor(data:ConcreatSyntaxTree) {
				this.ruleName = RuleName[data.syntax];
				if (typeof this.ruleName === "undefined") {
					throw new ParseError(data, "unknown rule: " + data.syntax);
				}
				this.offset = data.offset;
				this.line = data.line;
				this.column = data.column;
			}

			toJSON():any {
				var result = {};
				for (var k in this) {
					if (k === "ruleName") {
						result[k] = RuleName[this[k]];
					} else if (k !== "parentNode" && typeof this[k] !== "function") {
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
				result += this.makeIndent(indentLevel + 1) + "name=" + RuleName[this.ruleName] + ",\n";
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

			/**
			 * 引数が数字かどうかチェックして違うならば例外を投げる。
			 * @param value
			 * @returns {*=}
			 */
				checkNumber(value:any):number {
				if (typeof value !== "number") {
					throw new Error("number required. actual:" + (typeof value) + ":" + value);
				} else {
					return value;
				}
			}

			/**
			 * 引数が文字列かどうかチェックして違うならば例外を投げる。
			 * @param value
			 * @returns {*=}
			 */
				checkString(value:any):string {
				if (typeof value !== "string") {
					throw new Error("string required. actual:" + (typeof value) + ":" + value);
				} else {
					return value;
				}
			}

			/**
			 * 引数がオブジェクトかどうかチェックして違うならば例外を投げる。
			 * @param value
			 * @returns {*=}
			 */
				checkObject(value:any):any {
				if (typeof value !== "object") {
					throw new Error("object required. actual:" + (typeof value) + ":" + value);
				} else {
					return value;
				}
			}

			/**
			 * 引数がArrayかどうかチェックして違うならば例外を投げる。
			 * @param value
			 * @returns {*=}
			 */
				checkArray(value:any):any[] {
				if (!Array.isArray(value)) {
					throw new Error("array required. actual:" + (typeof value) + ":" + value);
				} else {
					return value;
				}
			}

			private toOtherNode<T extends SyntaxTree >(clazz:any):T {
				if (this instanceof clazz) {
					return <T>this;
				} else {
					throw new Error("this node is not " + clazz.name);
				}
			}

			/**
			 * thisをNodeSyntaxTreeにcast可能か調べ、可能ならcastして返し、そうでなければ例外を投げる。
			 */
				toNode():NodeSyntaxTree {
				return this.toOtherNode<NodeSyntaxTree>(NodeSyntaxTree);
			}

			/**
			 * thisをBlockElementSyntaxTreeにcast可能か調べ、可能ならcastして返し、そうでなければ例外を投げる。
			 */
				toBlockElement():BlockElementSyntaxTree {
				return this.toOtherNode<BlockElementSyntaxTree>(BlockElementSyntaxTree);
			}

			/**
			 * thisをInlineElementSyntaxTreeにcast可能か調べ、可能ならcastして返し、そうでなければ例外を投げる。
			 */
				toInlineElement():InlineElementSyntaxTree {
				return this.toOtherNode<InlineElementSyntaxTree>(InlineElementSyntaxTree);
			}

			/**
			 * thisをArgumentSyntaxTreeにcast可能か調べ、可能ならcastして返し、そうでなければ例外を投げる。
			 */
				toArgument():ArgumentSyntaxTree {
				return this.toOtherNode<ArgumentSyntaxTree>(ArgumentSyntaxTree);
			}

			/**
			 * thisをChapterSyntaxTreeにcast可能か調べ、可能ならcastして返し、そうでなければ例外を投げる。
			 */
				toChapter():ChapterSyntaxTree {
				return this.toOtherNode<ChapterSyntaxTree>(ChapterSyntaxTree);
			}

			/**
			 * thisをHeadlineSyntaxTreeにcast可能か調べ、可能ならcastして返し、そうでなければ例外を投げる。
			 */
				toHeadline():HeadlineSyntaxTree {
				return this.toOtherNode<HeadlineSyntaxTree>(HeadlineSyntaxTree);
			}

			/**
			 * thisをUlistElementSyntaxTreeにcast可能か調べ、可能ならcastして返し、そうでなければ例外を投げる。
			 */
				toUlist():UlistElementSyntaxTree {
				return this.toOtherNode<UlistElementSyntaxTree>(UlistElementSyntaxTree);
			}

			/**
			 * thisをOlistElementSyntaxTreeにcast可能か調べ、可能ならcastして返し、そうでなければ例外を投げる。
			 */
				toOlist():OlistElementSyntaxTree {
				return this.toOtherNode<OlistElementSyntaxTree>(OlistElementSyntaxTree);
			}

			/**
			 * thisをDlistElementSyntaxTreeにcast可能か調べ、可能ならcastして返し、そうでなければ例外を投げる。
			 */
				toDlist():DlistElementSyntaxTree {
				return this.toOtherNode<DlistElementSyntaxTree>(DlistElementSyntaxTree);
			}

			/**
			 * thisをTextNodeSyntaxTreeにcast可能か調べ、可能ならcastして返し、そうでなければ例外を投げる。
			 */
				toTextNode():TextNodeSyntaxTree {
				return this.toOtherNode<TextNodeSyntaxTree>(TextNodeSyntaxTree);
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
							this.childNodes.push(tree);
						}
					});
				} else if (content !== "" && content) {
					((rawResult:ConcreatSyntaxTree)=> {
						var tree = transform(rawResult);
						if (tree) {
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

				this.headline = transform(this.checkObject(data.headline)).toHeadline();
				if (typeof data.text === "string") {
					return;
				}
				this.text = this.checkArray(data.text.content).map((data:ConcreatSyntaxTree)=> {
					return transform(data);
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
			caption:NodeSyntaxTree;

			constructor(data:ConcreatSyntaxTree) {
				super(data);

				this.level = this.checkNumber(data.level);
				if (data.label !== "") {
					this.label = transform(this.checkObject(data.label)).toArgument();
				}
				if (data.tag !== "") {
					this.tag = transform(this.checkObject(data.tag)).toArgument();
				}
				this.caption = transform(this.checkObject(data.caption)).toNode();
			}
		}

		export class BlockElementSyntaxTree extends NodeSyntaxTree {
			name:string;
			args:ArgumentSyntaxTree[];

			constructor(data:ConcreatSyntaxTree) {
				super(data);
				this.name = this.checkString(data.name);
				this.args = this.checkArray(data.args).map((data:ConcreatSyntaxTree)=> {
					return transform(data).toArgument();
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

		export class UlistElementSyntaxTree extends NodeSyntaxTree {
			level:number;
			text:SyntaxTree;

			constructor(data:ConcreatSyntaxTree) {
				super(data);
				this.level = this.checkNumber(data.level);
				this.text = transform(this.checkObject(data.text));

				delete this.childNodes; // JSON化した時の属性順制御のため…
				this.childNodes = [];
			}
		}

		export class OlistElementSyntaxTree extends SyntaxTree {
			no:number;
			text:SyntaxTree;

			constructor(data:ConcreatSyntaxTree) {
				super(data);
				this.no = this.checkNumber(data.no);
				this.text = transform(this.checkObject(data.text));
			}
		}

		export class DlistElementSyntaxTree extends SyntaxTree {
			text:SyntaxTree;
			content:SyntaxTree;

			constructor(data:ConcreatSyntaxTree) {
				super(data);
				this.text = transform(this.checkObject(data.text));
				this.content = transform(this.checkObject(data.content));
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
