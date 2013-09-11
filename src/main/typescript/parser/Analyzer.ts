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
		(process:Process, node:SyntaxTree):void;
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
				results = this.inlines.filter(s => s.symbolName === inline.name);
			} else if (node instanceof ReVIEW.Parse.BlockElementSyntaxTree) {
				var block = node.toBlockElement();
				results = this.blocks.filter(s => s.symbolName === block.name);
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
	 * 解析中に発生したエラーを表す。
	 * この例外は実装に不備があった時のみ利用される。
	 * ユーザの入力した文書に不備がある場合には Process.error を利用すること。
	 */
	export class AnalyzerError implements Error {
		name = "AnalyzerError";

		constructor(public message:string) {
			var E = <any>Error;
			if (E.captureStackTrace) {
				E.captureStackTrace(this, AnalyzerError);
			}
		}
	}

	/**
	 * 1つの構文についての構成要素を組み立てるためのビルダ。
	 */
	export interface IAcceptableSyntaxBuilder {
		setSyntaxType(type:SyntaxType);
		setClass(clazz:any);
		setSymbol(symbolName:string);
		setDescription(description:string);
		checkArgsLength(...argsLength:number[]);
		processNode(func:IAnalyzeProcessor);
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
				if (node.tag) {
					label = node.tag.arg;
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

		block_list(builder:IAcceptableSyntaxBuilder) {
			builder.setSyntaxType(SyntaxType.Block);
			builder.setSymbol("list");
			builder.setDescription(t("description.block_list"));
			builder.checkArgsLength(2);
			builder.processNode((process, n)=> {
				var node = n.toBlockElement();
				node.no = process.nextIndex("list");
				process.addSymbol({
					symbolName: node.name,
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
					symbolName: node.name,
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
					symbolName: node.name,
					referenceTo: process.constructReferenceTo(node, nodeContentToString(process, node)),
					node: node
				});
			});
		}

		// TODO 以下のものの実装をすすめる
		// block_list
		// block_emlist
		// block_source
		// block_listnum
		// inline_list
		// emlistnum
		// inline_code
		// block_cmd
		// block_image
		// inline_img
		// block_indepimage
		// block_graph
		// block_table
		// inline_table
		// block_quote
		// block_footnote
		// inline_fn
		// block_bibpaper
		// inline_bib
		// block_lead
		// block_texequation
		// block_noindent
		// block_raw
		// inline_kw
		// inline_chap
		// inline_title
		// inline_chapref
		// inline_bou
		// inline_ruby
		// inline_ami
		// inline_b
		// inline_i
		// inline_strong
		// inline_em
		// inline_tt
		// inline_tti
		// inline_ttb
		// inline_u
		// inline_br
		// inline_m
		// inline_icon
		// inline_uchar
		// inline_href
		// inline_raw
		// block_label
	}
}
