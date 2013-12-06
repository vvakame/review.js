///<reference path='../libs/peg.js.d.ts' />

///<reference path='../model/CompilerModel.ts' />
///<reference path='Walker.ts' />

/**
 * 構文解析用途のモジュール。
 */
module ReVIEW.Parse {
	"use strict";

	/**
	 * 文字列をReVIEW文書として解釈し構文木を返す。
	 * 解釈に失敗した場合、PEG.SyntaxError または ReVIEW.ParseError が投げられる。
	 * @param input
	 * @returns {{ast: NodeSyntaxTree, cst: *}}
	 */
	export function parse(input:string):{ast:NodeSyntaxTree;cst:IConcreatSyntaxTree;
	} {
		var rawResult = PEG.parse(input);
		var root = transform(rawResult).toNode();

		// ParagraphSubs は構文上の都合であるだけのものなので潰す
		ReVIEW.visit(root, {
			visitDefaultPre: (ast:SyntaxTree)=> {
			},
			visitParagraphPre: (ast:NodeSyntaxTree) => {
				var subs = ast.childNodes[0].toNode();
				ast.childNodes = subs.childNodes;
			}
		});

		// Chapter を Headline の level に応じて構造を組み替える
		//   level 2 は level 1 の下に来るようにしたい
		if (root.childNodes.length !== 0) {
			reconstruct(root.childNodes[0].toNode(), (chapter:ChapterSyntaxTree)=> chapter.headline.level);
		}
		// Ulist もChapter 同様の level 構造があるので同じように処理したい
		var ulistSet:NodeSyntaxTree[] = [];
		ReVIEW.visit(root, {
			visitDefaultPre: (ast:SyntaxTree)=> {
				if (ast.ruleName === RuleName.Ulist) {
					ulistSet.push(ast.toNode());
				}
			}
		});
		ulistSet.forEach((ulist)=> {
			reconstruct(ulist, (ulistElement:UlistElementSyntaxTree)=> ulistElement.level);
		});

		// parentNode を設定
		ReVIEW.visit(root, {
			visitDefaultPre: (ast:SyntaxTree, parent:SyntaxTree)=> {
				ast.parentNode = parent;
			}
		});
		// prev, next を設定
		ReVIEW.visit(root, {
			visitDefaultPre: (ast:SyntaxTree, parent:SyntaxTree)=> {
			},
			visitChapterPre: (ast:ChapterSyntaxTree) => {
				ast.text.forEach((node, i, nodes) => {
					node.prev = nodes[i - 1];
					node.next = nodes[i + 1];
				});
			},
			visitNodePre: (ast:NodeSyntaxTree) => {
				ast.childNodes.forEach((node, i, nodes) => {
					node.prev = nodes[i - 1];
					node.next = nodes[i + 1];
				});
			}
		});
		return {
			ast: root,
			cst: rawResult
		};
	}

	/**
	 * 具象構文木を抽象構文木に変換します。
	 * @param rawResult
	 * @returns {*}
	 */
	export function transform(rawResult:IConcreatSyntaxTree):SyntaxTree {
		if (<any>rawResult === "") {
			return null;
		}
		var rule = RuleName[rawResult.syntax];
		if (typeof rule === "undefined") {
			throw new ParseError(rawResult, "unknown rule: " + rawResult.syntax);
		}
		switch (rule) {
			case RuleName.Chapter:
				return new ChapterSyntaxTree(rawResult);
			case RuleName.BlockElement:
				return new BlockElementSyntaxTree(rawResult);
			case RuleName.Headline:
				return new HeadlineSyntaxTree(rawResult);
			case RuleName.InlineElement:
				return new InlineElementSyntaxTree(rawResult);
			case RuleName.BracketArg:
			case RuleName.BraceArg:
				return new ArgumentSyntaxTree(rawResult);
			case RuleName.UlistElement:
				return new UlistElementSyntaxTree(rawResult);
			case RuleName.OlistElement:
				return new OlistElementSyntaxTree(rawResult);
			case RuleName.DlistElement:
				return new DlistElementSyntaxTree(rawResult);
			case RuleName.ContentText:
			case RuleName.BlockElementContentText:
			case RuleName.InlineElementContentText:
			case RuleName.ContentInlineText:
			case RuleName.SinglelineComment:
				return new TextNodeSyntaxTree(rawResult);
			// c, cc パターン
			case RuleName.Chapters:
			case RuleName.Contents:
			case RuleName.ParagraphSubs:
			case RuleName.BlockElementContents:
			case RuleName.BlockElementParagraphSubs:
			case RuleName.InlineElementContents:
			case RuleName.ContentInlines:
			case RuleName.Ulist:
			case RuleName.Olist:
			case RuleName.Dlist:
				return new NodeSyntaxTree(rawResult);
			// c パターン
			case RuleName.Start:
			case RuleName.Paragraph:
			case RuleName.BlockElementParagraph:
			case RuleName.BlockElementParagraphSub:
			case RuleName.DlistElementContent:
				return new NodeSyntaxTree(rawResult);
			// パースした内容は直接役にたたない c / c / c 系
			case RuleName.Content:
			case RuleName.ParagraphSub:
			case RuleName.BlockElementContent:
			case RuleName.InlineElementContent:
			case RuleName.SinglelineContent:
			case RuleName.ContentInline:
				return transform(rawResult.content);
			default:
				return new SyntaxTree(rawResult);
		}
	}

	/**
	 * 構文木の組替えを行う。
	 * 主に兄弟ノードを親子ノードに組み替えるために使う。
	 * @param node
	 * @param pickLevel
	 */
	function reconstruct(node:NodeSyntaxTree, pickLevel:(ast:NodeSyntaxTree)=>number) {
		var originalChildNodes = node.childNodes;

		var nodeSets:{parent:NodeSyntaxTree; children:NodeSyntaxTree[];
		}[] = [];
		var currentSet:{parent:NodeSyntaxTree; children:NodeSyntaxTree[];
		} = {
			parent: null,
			children: []
		};

		originalChildNodes.forEach((child:NodeSyntaxTree)=> {
			if (child.ruleName === RuleName.SinglelineComment) {
				currentSet.children.push(child);
			} else if (!currentSet.parent) {
				currentSet.parent = child;

			} else if (pickLevel(currentSet.parent) < pickLevel(child)) {
				currentSet.children.push(child);

			} else {
				nodeSets.push(currentSet);
				currentSet = {
					parent: child,
					children: []
				};
			}
		});
		if (currentSet.parent) {
			nodeSets.push(currentSet);
		}
		node.childNodes = [];
		nodeSets.forEach(nodes=> {
			var parent = nodes.parent;
			node.childNodes.push(parent);
			nodes.children.forEach(child => {
				parent.childNodes.push(child);
			});
			reconstruct(parent, pickLevel);
		});
	}

	/**
	 * 構文解析時に発生したエラー。
	 */
	export class ParseError implements Error {
		name:string;

		constructor(public syntax:IConcreatSyntaxTree, public message:string) {
			if ((<any>Error).captureStackTrace) {
				(<any>Error).captureStackTrace(this, ParseError);
			}
			this.name = "ParseError";
		}
	}

	/**
	 * 構文解析直後の生データ。
	 */
	export interface IConcreatSyntaxTree {
		// 共通
		syntax: string;
		line: number;
		column: number;
		offset: number;
		endPos: number;

		// Ruleによっては
		headline?: any;
		text?:any;
		level?:number;
		label?:any;
		cmd?:any;
		caption?:any;
		symbol?:any;
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
		SyntaxError,

		Start,
		Chapters,
		Chapter,
		Headline,
		Contents,
		Content,
		Paragraph,
		ParagraphSubs,
		ParagraphSub,
		ContentText,
		BlockElement,
		InlineElement,
		BracketArg,
		BraceArg,
		BlockElementContents,
		BlockElementContent,
		BlockElementParagraph,
		BlockElementParagraphSubs,
		BlockElementParagraphSub,
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
		endPos:number;
		ruleName:RuleName;
		// analyzer 中で設定する項目
		no:number;
		prev:SyntaxTree;
		next:SyntaxTree;

		constructor(data:IConcreatSyntaxTree) {
			this.ruleName = RuleName[data.syntax];
			if (typeof this.ruleName === "undefined") {
				throw new ParseError(data, "unknown rule: " + data.syntax);
			}
			this.offset = data.offset;
			this.line = data.line;
			this.column = data.column;
			this.endPos = data.endPos;
		}

		toJSON():any {
			var result = {};
			for (var k in this) {
				if (k === "ruleName") {
					result[k] = RuleName[this[k]];
				} else if (k === "prev" || k === "next") {
					// 無視する
				} else if (k === "fqn") {
					// TODO あとでちゃんと出るようにする
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

		private checkSyntaxType(clazz:any):boolean {
			return this instanceof clazz;
		}


		isNode():boolean {
			return this.checkSyntaxType(NodeSyntaxTree);
		}

		isBlockElement():boolean {
			return this.checkSyntaxType(BlockElementSyntaxTree);
		}

		isInlineElement():boolean {
			return this.checkSyntaxType(InlineElementSyntaxTree);
		}

		isArgument():boolean {
			return this.checkSyntaxType(ArgumentSyntaxTree);
		}

		isChapter():boolean {
			return this.checkSyntaxType(ChapterSyntaxTree);
		}

		isHeadline():boolean {
			return this.checkSyntaxType(HeadlineSyntaxTree);
		}

		isUlist():boolean {
			return this.checkSyntaxType(UlistElementSyntaxTree);
		}

		isOlist():boolean {
			return this.checkSyntaxType(OlistElementSyntaxTree);
		}

		isDlist():boolean {
			return this.checkSyntaxType(DlistElementSyntaxTree);
		}

		isTextNode():boolean {
			return this.checkSyntaxType(TextNodeSyntaxTree);
		}

		private toOtherNode<T extends SyntaxTree >(clazz:any):T {
			if (this instanceof clazz) {
				return <T>this;
			} else {
				throw new Error("this node is not " + clazz.name + ", actual " + (<any>this).constructor.name);
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

		constructor(data:IConcreatSyntaxTree) {
			super(data);
			this.childNodes = [];
			this.processChildNodes(data.content);
		}

		private processChildNodes(content:any) {
			if (Array.isArray(content)) {
				content.forEach((rawResult:IConcreatSyntaxTree)=> {
					var tree = transform(rawResult);
					if (tree) {
						this.childNodes.push(tree);
					}
				});
			} else if (content !== "" && content) {
				((rawResult:IConcreatSyntaxTree)=> {
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

		constructor(data:IConcreatSyntaxTree) {
			super(data);

			this.headline = transform(this.checkObject(data.headline)).toHeadline();
			if (typeof data.text === "string") {
				this.text = [];
				return;
			}
			this.text = this.checkArray(data.text.content).map((data:IConcreatSyntaxTree)=> {
				return transform(data);
			});

			delete this.childNodes; // JSON化した時の属性順制御のため…
			this.childNodes = [];
		}

		get level():number {
			return this.headline.level;
		}

		get fqn():string {
			var chapters:ChapterSyntaxTree[] = [];
			ReVIEW.walk(this, (node:SyntaxTree) => {
				if (node instanceof ReVIEW.Parse.ChapterSyntaxTree) {
					chapters.unshift(node.toChapter());
				}
				return node.parentNode;
			});
			var result = chapters.map((chapter)=> {
				return chapter.no;
			}).join(".");
			return result;
		}
	}

	export class HeadlineSyntaxTree extends SyntaxTree {
		level:number;
		cmd:ArgumentSyntaxTree;
		label:ArgumentSyntaxTree;
		caption:NodeSyntaxTree;

		constructor(data:IConcreatSyntaxTree) {
			super(data);

			this.level = this.checkNumber(data.level);
			if (data.cmd !== "") {
				this.cmd = transform(this.checkObject(data.cmd)).toArgument();
			}
			if (data.label !== "") {
				this.label = transform(this.checkObject(data.label)).toArgument();
			}
			this.caption = transform(this.checkObject(data.caption)).toNode();
		}
	}

	export class BlockElementSyntaxTree extends NodeSyntaxTree {
		symbol:string;
		args:ArgumentSyntaxTree[];

		constructor(data:IConcreatSyntaxTree) {
			super(data);
			this.symbol = this.checkString(data.symbol);
			this.args = this.checkArray(data.args).map((data:IConcreatSyntaxTree)=> {
				return transform(data).toArgument();
			});
		}
	}

	export class InlineElementSyntaxTree extends NodeSyntaxTree {
		symbol:string;

		constructor(data:IConcreatSyntaxTree) {
			super(data);
			this.symbol = this.checkString(data.symbol);
		}
	}

	export class ArgumentSyntaxTree extends SyntaxTree {
		arg:string;

		constructor(data:IConcreatSyntaxTree) {
			super(data);
			this.arg = this.checkString(data.arg);
		}
	}

	export class UlistElementSyntaxTree extends NodeSyntaxTree {
		level:number;
		text:SyntaxTree;

		constructor(data:IConcreatSyntaxTree) {
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

		constructor(data:IConcreatSyntaxTree) {
			super(data);
			this.no = this.checkNumber(data.no);
			this.text = transform(this.checkObject(data.text));
		}
	}

	export class DlistElementSyntaxTree extends SyntaxTree {
		text:SyntaxTree;
		content:SyntaxTree;

		constructor(data:IConcreatSyntaxTree) {
			super(data);
			this.text = transform(this.checkObject(data.text));
			this.content = transform(this.checkObject(data.content));
		}
	}

	export class TextNodeSyntaxTree extends SyntaxTree {
		text:string;

		constructor(data:IConcreatSyntaxTree) {
			super(data);
			this.text = this.checkString(data.text).replace(/\n+$/, "");
		}
	}
}
