///<reference path='../libs/analyzer-error.d.ts' />

///<reference path='../i18n/i18n.ts' />
///<reference path='../model/CompilerModel.ts' />

module ReVIEW.Build {

import t = ReVIEW.i18n.t;

import SyntaxTree = ReVIEW.Parse.SyntaxTree;
import NodeSyntaxTree = ReVIEW.Parse.NodeSyntaxTree;
import BlockElementSyntaxTree = ReVIEW.Parse.BlockElementSyntaxTree;
import InlineElementSyntaxTree = ReVIEW.Parse.InlineElementSyntaxTree;
import HeadlineSyntaxTree = ReVIEW.Parse.HeadlineSyntaxTree;
import TextNodeSyntaxTree = ReVIEW.Parse.TextNodeSyntaxTree;
import ChapterSyntaxTree = ReVIEW.Parse.ChapterSyntaxTree;

	/**
	 * 構文のタイプ。
	 */
	export enum SyntaxType {
		Block,
		Inline,
		Other
	}

	/**
	 * Analyzer内で生成され実際にValidator内でSyntaxTreeの処理を行う処理。
	 */
	export interface IAnalyzeProcessor {
		(process:Process, node:SyntaxTree):any;
	}

	/**
	 * ReVIEW文書として受理可能な要素群。
	 * JSON.stringify でJSON化した時、エディタ上での入力補完に活用できるデータが得られる。
	 */
	export class AcceptableSyntaxes {
		constructor(public acceptableSyntaxes:AcceptableSyntax[]) {
		}

		/**
		 * 指定されたノードに当てはまる AcceptableSyntax を探して返す。
		 * 長さが1じゃないとおかしい。(呼び出し元でチェックする)
		 * @param node
		 * @returns {AcceptableSyntax[]}
		 */
			find(node:SyntaxTree):AcceptableSyntax[] {
			var results:AcceptableSyntax[];
			if (node instanceof ReVIEW.Parse.InlineElementSyntaxTree) {
				var inline = node.toInlineElement();
				results = this.inlines.filter(s => s.symbolName === inline.symbol);
			} else if (node instanceof ReVIEW.Parse.BlockElementSyntaxTree) {
				var block = node.toBlockElement();
				results = this.blocks.filter(s => s.symbolName === block.symbol);
			} else {
				results = this.others.filter(s => node instanceof s.clazz);
			}
			return results;
		}

		get inlines():AcceptableSyntax[] {
			return this.acceptableSyntaxes.filter(s=>s.type === SyntaxType.Inline);
		}

		get blocks():AcceptableSyntax[] {
			return this.acceptableSyntaxes.filter(s=>s.type === SyntaxType.Block);
		}

		get others():AcceptableSyntax[] {
			return this.acceptableSyntaxes.filter(s=>s.type === SyntaxType.Other);
		}

		toJSON():any {
			// そのままJSON化するとAcceptableSyntax.typeの扱いに難儀すると思うので文字列に複合可能なデータを抱き合わせにする
			return {
				"rev": "1", // データフォーマットのリビジョン
				"SyntaxType": SyntaxType,
				"acceptableSyntaxes": this.acceptableSyntaxes
			};
		}
	}

	/**
	 * ReVIEW文書として受理可能な要素。
	 */
	export class AcceptableSyntax {
		type:SyntaxType;
		clazz:any;
		symbolName:string;
		argsLength:number[] = [];
		allowInline:boolean = true;
		allowFullySyntax:boolean = false;
		description:string;
		process:IAnalyzeProcessor;

		toJSON():any {
			return {
				"type": this.type,
				"class": this.clazz ? this.clazz.name : void 0,
				"symbolName": this.symbolName,
				"argsLength": this.argsLength.length !== 0 ? this.argsLength : <any>(void 0),
				"description": this.description
			};
		}
	}

	/**
	 * 受理できる構文の定義を行う。
	 * 実際に構文木の検査などを行うのはこの後段。
	 */
	export interface IAnalyzer {
		getAcceptableSyntaxes():AcceptableSyntaxes;
	}

	/**
	 * 1つの構文についての構成要素を組み立てるためのビルダ。
	 */
	export interface IAcceptableSyntaxBuilder {
		setSyntaxType(type:SyntaxType):void;
		setClass(clazz:any):void;
		setSymbol(symbolName:string):void;
		setDescription(description:string):void;
		checkArgsLength(...argsLength:number[]):void;
		setAllowInline(enable:boolean):void; // デフォルトtrue
		setAllowFullySyntax(enable:boolean):void; // デフォルトfalse

		processNode(func:IAnalyzeProcessor):void;
	}

	class AnalyzeProcess implements IAcceptableSyntaxBuilder {
		acceptableSyntaxes:AcceptableSyntax[] = [];

		current:AcceptableSyntax;

		prepare() {
			this.current = new AcceptableSyntax();
		}

		build(methodName:string) {
			if (methodName.indexOf("block_") === 0) {
				this.current.type = this.current.type || SyntaxType.Block;
				this.current.symbolName = this.current.symbolName || methodName.substring("block_".length);
			} else if (methodName.indexOf("inline_") === 0) {
				this.current.type = this.current.type || SyntaxType.Inline;
				this.current.symbolName = this.current.symbolName || methodName.substring("inline_".length);
			} else {
				this.current.type = this.current.type || SyntaxType.Other;
				this.current.symbolName = this.current.symbolName || methodName;
			}

			switch (this.current.type) {
				case SyntaxType.Block:
					if (this.current.argsLength.length === 0) {
						throw new AnalyzerError("must call builder.checkArgsLength(...number[]) in " + methodName);
					}
					break;
				case SyntaxType.Other:
					if (!this.current.clazz) {
						throw new AnalyzerError("must call builder.setClass(class) in " + methodName);
					}
					break;
				case SyntaxType.Inline:
					break;
			}
			if (!this.current.description) {
				throw new AnalyzerError("must call builder.setDescription(string) in " + methodName);
			}
			if (!this.current.process) {
				throw new AnalyzerError("must call builder.processNode(func) in " + methodName);
			}

			this.acceptableSyntaxes.push(this.current);
		}

		setSyntaxType(type:SyntaxType) {
			this.current.type = type;
		}

		setClass(clazz:any) {
			this.current.clazz = clazz;
		}

		setSymbol(symbolName:string) {
			this.current.symbolName = symbolName;
		}

		setDescription(description:string) {
			this.current.description = description;
		}

		checkArgsLength(...argsLength:number[]) {
			this.current.argsLength = argsLength;
		}

		setAllowInline(enable:boolean) {
			this.current.allowInline = enable;
		}

		setAllowFullySyntax(enable:boolean) {
			this.current.allowFullySyntax = enable;
		}

		processNode(func:IAnalyzeProcessor) {
			this.current.process = func;
		}
	}

	export class DefaultAnalyzer implements IAnalyzer {
		private _acceptableSyntaxes:AcceptableSyntax[];

		getAcceptableSyntaxes():AcceptableSyntaxes {
			if (!this._acceptableSyntaxes) {
				this._acceptableSyntaxes = this.constructAcceptableSyntaxes();
			}
			return new AcceptableSyntaxes(this._acceptableSyntaxes);
		}

		constructAcceptableSyntaxes():AcceptableSyntax[] {
			var process = new AnalyzeProcess();

			for (var k in this) {
				if (typeof this[k] !== "function") {
					continue;
				}
				var func:Function = null;
				if (k.indexOf("block_") === 0) {
					func = this[k];
				} else if (k.indexOf("inline_") === 0) {
					func = this[k];
				} else if (k === "headline") {
					func = this[k];
				} else if (k === "ulist") {
					func = this[k];
				} else if (k === "olist") {
					func = this[k];
				} else if (k === "dlist") {
					func = this[k];
				}
				if (func) {
					process.prepare();
					func(process);
					process.build(k);
				}
			}

			return process.acceptableSyntaxes;
		}

		headline(builder:IAcceptableSyntaxBuilder) {
			builder.setSyntaxType(SyntaxType.Other);
			builder.setClass(ReVIEW.Parse.HeadlineSyntaxTree);
			builder.setDescription(t("description.headline"));
			builder.processNode((process, n)=> {
				var node = n.toHeadline();
				var label:string = null;
				if (node.label) {
					label = node.label.arg;
				} else if (node.caption.childNodes.length === 1) {
					var textNode = node.caption.childNodes[0].toTextNode();
					label = textNode.text;
				}
				process.addSymbol({
					symbolName: "hd",
					labelName: label,
					node: node
				});
			});
		}

		ulist(builder:IAcceptableSyntaxBuilder) {
			builder.setSyntaxType(SyntaxType.Other);
			builder.setClass(ReVIEW.Parse.UlistElementSyntaxTree);
			builder.setDescription(t("description.ulist"));
			builder.processNode((process, n)=> {
				var node = n.toUlist();
				process.addSymbol({
					symbolName: "ul",
					node: node
				});
			});
		}

		olist(builder:IAcceptableSyntaxBuilder) {
			builder.setSyntaxType(SyntaxType.Other);
			builder.setClass(ReVIEW.Parse.OlistElementSyntaxTree);
			builder.setDescription(t("description.olist"));
			builder.processNode((process, n)=> {
				var node = n.toOlist();
				process.addSymbol({
					symbolName: "ol",
					node: node
				});
			});
		}

		dlist(builder:IAcceptableSyntaxBuilder) {
			builder.setSyntaxType(SyntaxType.Other);
			builder.setClass(ReVIEW.Parse.DlistElementSyntaxTree);
			builder.setDescription(t("description.dlist"));
			builder.processNode((process, n)=> {
				var node = n.toDlist();
				process.addSymbol({
					symbolName: "dl",
					node: node
				});
			});
		}

		block_list(builder:IAcceptableSyntaxBuilder) {
			builder.setSyntaxType(SyntaxType.Block);
			builder.setSymbol("list");
			builder.setDescription(t("description.block_list"));
			builder.checkArgsLength(2);
			builder.processNode((process, n)=> {
				var node = n.toBlockElement();
				node.no = process.nextIndex("list");
				process.addSymbol({
					symbolName: node.symbol,
					labelName: node.args[0].arg,
					node: node
				});
			});
		}

		inline_list(builder:IAcceptableSyntaxBuilder) {
			builder.setSyntaxType(SyntaxType.Inline);
			builder.setSymbol("list");
			builder.setDescription(t("description.inline_list"));
			builder.processNode((process, n)=> {
				var node = n.toInlineElement();
				process.addSymbol({
					symbolName: node.symbol,
					referenceTo: process.constructReferenceTo(node, nodeContentToString(process, node)),
					node: node
				});
			});
		}

		inline_hd(builder:IAcceptableSyntaxBuilder) {
			builder.setSyntaxType(SyntaxType.Inline);
			builder.setSymbol("hd");
			builder.setDescription(t("description.inline_hd"));
			builder.processNode((process, n)=> {
				var node = n.toInlineElement();
				process.addSymbol({
					symbolName: node.symbol,
					referenceTo: process.constructReferenceTo(node, nodeContentToString(process, node)),
					node: node
				});
			});
		}

		inline_br(builder:IAcceptableSyntaxBuilder) {
			builder.setSyntaxType(SyntaxType.Inline);
			builder.setSymbol("br");
			builder.setDescription(t("description.inline_br"));
			builder.processNode((process, n)=> {
				var node = n.toInlineElement();
				process.addSymbol({
					symbolName: node.symbol,
					node: node
				});
			});
		}

		inline_ruby(builder:IAcceptableSyntaxBuilder) {
			builder.setSyntaxType(SyntaxType.Inline);
			builder.setSymbol("ruby");
			builder.setDescription(t("description.inline_ruby"));
			builder.processNode((process, n)=> {
				var node = n.toInlineElement();
				process.addSymbol({
					symbolName: node.symbol,
					node: node
				});
			});
		}

		inline_b(builder:IAcceptableSyntaxBuilder) {
			builder.setSyntaxType(SyntaxType.Inline);
			builder.setSymbol("b");
			builder.setDescription(t("description.inline_b"));
			builder.processNode((process, n)=> {
				var node = n.toInlineElement();
				process.addSymbol({
					symbolName: node.symbol,
					node: node
				});
			});
		}

		inline_code(builder:IAcceptableSyntaxBuilder) {
			builder.setSyntaxType(SyntaxType.Inline);
			builder.setSymbol("code");
			builder.setDescription(t("description.inline_code"));
			builder.processNode((process, n)=> {
				var node = n.toInlineElement();
				process.addSymbol({
					symbolName: node.symbol,
					node: node
				});
			});
		}

		inline_tt(builder:IAcceptableSyntaxBuilder) {
			builder.setSyntaxType(SyntaxType.Inline);
			builder.setSymbol("tt");
			builder.setDescription(t("description.inline_tt"));
			builder.processNode((process, n)=> {
				var node = n.toInlineElement();
				process.addSymbol({
					symbolName: node.symbol,
					node: node
				});
			});
		}

		inline_href(builder:IAcceptableSyntaxBuilder) {
			builder.setSyntaxType(SyntaxType.Inline);
			builder.setSymbol("href");
			builder.setDescription(t("description.inline_href"));
			builder.processNode((process, n)=> {
				var node = n.toInlineElement();
				process.addSymbol({
					symbolName: node.symbol,
					node: node
				});
			});
		}

		inline_u(builder:IAcceptableSyntaxBuilder) {
			builder.setSyntaxType(SyntaxType.Inline);
			builder.setSymbol("u");
			builder.setDescription(t("description.inline_u"));
			builder.processNode((process, n)=> {
				var node = n.toInlineElement();
				process.addSymbol({
					symbolName: node.symbol,
					node: node
				});
			});
		}

		inline_kw(builder:IAcceptableSyntaxBuilder) {
			builder.setSyntaxType(SyntaxType.Inline);
			builder.setSymbol("kw");
			builder.setDescription(t("description.inline_kw"));
			builder.processNode((process, n)=> {
				var node = n.toInlineElement();
				process.addSymbol({
					symbolName: node.symbol,
					node: node
				});
			});
		}

		inline_em(builder:IAcceptableSyntaxBuilder) {
			builder.setSyntaxType(SyntaxType.Inline);
			builder.setSymbol("em");
			builder.setDescription(t("description.inline_em"));
			builder.processNode((process, n)=> {
				var node = n.toInlineElement();
				process.addSymbol({
					symbolName: node.symbol,
					node: node
				});
			});
		}

		block_image(builder:IAcceptableSyntaxBuilder) {
			builder.setSyntaxType(SyntaxType.Block);
			builder.setSymbol("image");
			builder.setDescription(t("description.block_image"));
			builder.checkArgsLength(2, 3);
			builder.processNode((process, n)=> {
				var node = n.toBlockElement();
				node.no = process.nextIndex("image");
				process.addSymbol({
					symbolName: node.symbol,
					labelName: node.args[0].arg,
					node: node
				});
			});
		}

		inline_img(builder:IAcceptableSyntaxBuilder) {
			builder.setSyntaxType(SyntaxType.Inline);
			builder.setSymbol("img");
			builder.setDescription(t("description.inline_img"));
			builder.processNode((process, n)=> {
				var node = n.toInlineElement();
				process.addSymbol({
					symbolName: node.symbol,
					referenceTo: process.constructReferenceTo(node, nodeContentToString(process, node), "image"),
					node: node
				});
			});
		}

		block_footnote(builder:IAcceptableSyntaxBuilder) {
			builder.setSyntaxType(SyntaxType.Block);
			builder.setSymbol("footnote");
			builder.setDescription(t("description.block_footnote"));
			builder.checkArgsLength(2);
			builder.processNode((process, n)=> {
				var node = n.toBlockElement();
				node.no = process.nextIndex("footnote");
				process.addSymbol({
					symbolName: node.symbol,
					labelName: node.args[0].arg,
					node: node
				});
			});
		}

		inline_fn(builder:IAcceptableSyntaxBuilder) {
			builder.setSyntaxType(SyntaxType.Inline);
			builder.setSymbol("fn");
			builder.setDescription(t("description.inline_fn"));
			builder.processNode((process, n)=> {
				var node = n.toInlineElement();
				process.addSymbol({
					symbolName: node.symbol,
					referenceTo: process.constructReferenceTo(node, nodeContentToString(process, node), "footnote"),
					node: node
				});
			});
		}

		block_lead(builder:IAcceptableSyntaxBuilder) {
			builder.setSyntaxType(SyntaxType.Block);
			builder.setSymbol("lead");
			builder.setDescription(t("description.block_lead"));
			builder.checkArgsLength(0);
			builder.setAllowFullySyntax(true);
			builder.processNode((process, n)=> {
				var node = n.toBlockElement();
				process.addSymbol({
					symbolName: node.symbol,
					node: node
				});
			});
		}

		inline_tti(builder:IAcceptableSyntaxBuilder) {
			builder.setSyntaxType(SyntaxType.Inline);
			builder.setSymbol("tti");
			builder.setDescription(t("description.inline_tti"));
			builder.processNode((process, n)=> {
				var node = n.toInlineElement();
				process.addSymbol({
					symbolName: node.symbol,
					node: node
				});
			});
		}

		inline_ttb(builder:IAcceptableSyntaxBuilder) {
			builder.setSyntaxType(SyntaxType.Inline);
			builder.setSymbol("ttb");
			builder.setDescription(t("description.inline_ttb"));
			builder.processNode((process, n)=> {
				var node = n.toInlineElement();
				process.addSymbol({
					symbolName: node.symbol,
					node: node
				});
			});
		}

		block_noindent(builder:IAcceptableSyntaxBuilder) {
			builder.setSyntaxType(SyntaxType.Block);
			builder.setSymbol("noindent");
			builder.setDescription(t("description.block_noindent"));
			builder.checkArgsLength(0);
			builder.processNode((process, n)=> {
				var node = n.toBlockElement();
				process.addSymbol({
					symbolName: node.symbol,
					node: node
				});
			});
		}

		// TODO 以下のものの実装をすすめる
		// ↑実装が簡単
		// block_source
		// block_cmd
		// block_quote
		// inline_ami
		// inline_bou
		// inline_i
		// inline_strong
		// inline_u
		// block_bibpaper
		// inline_bib
		// block_indepimage
		// inline_ruby
		// inline_uchar
		// block_emlist
		// block_listnum
		// block_emlistnum
		// block_label
		// inline_icon
		// block_texequation
		// inline_chap
		// inline_title
		// inline_chapref
		// inline_m
		// block_raw
		// inline_raw
		// block_graph
		// block_table
		// inline_table
		// ↓実装が難しい
	}
}
