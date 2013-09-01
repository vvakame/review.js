///<reference path='Model.ts' />
///<reference path='Parser.ts' />

module ReVIEW {
	export module Build {

	import SyntaxTree = ReVIEW.Parse.SyntaxTree;
	import NodeSyntaxTree = ReVIEW.Parse.NodeSyntaxTree;
	import BlockElementSyntaxTree = ReVIEW.Parse.BlockElementSyntaxTree;
	import InlineElementSyntaxTree = ReVIEW.Parse.InlineElementSyntaxTree;
	import HeadlineSyntaxTree = ReVIEW.Parse.HeadlineSyntaxTree;
	import TextNodeSyntaxTree = ReVIEW.Parse.TextNodeSyntaxTree;

		/**
		 * 意味解析やシンボルの解決を行う。
		 * 未解決のシンボルのエラーを通知するのはここ。
		 */
		export interface IAnalyzer {
			init(book:Book);
			headline(process:Process, name:string, node:HeadlineSyntaxTree);
			block(process:Process, name:string, node:BlockElementSyntaxTree);
			inline(process:Process, name:string, node:InlineElementSyntaxTree);
		}

		/**
		 * IAnalyzerで処理した後の構文木について構文上のエラーがないかチェックする。
		 * また、Builderと対比させて、未実装の候補がないかをチェックする。
		 */
		export interface IValidator {
			checkByBuilders(builders:IBuilder[]);
		}

		/**
		 * IAnalyzerとIValidatorでチェックをした後に構文木から出力を生成する。
		 */
		export interface IBuilder {

		}

		/**
		 * 解析中に発生したエラーを表す。
		 * この例外は実装に不備があった時のみ利用される。
		 * ユーザの入力した文書に不備がある場合には Process.error を利用すること。
		 */
		export class AnalyzerError implements Error {
			name = "AnalyzerError";

			constructor(public message:string) {
				if ((<any>Error).captureStackTrace) {
					(<any>Error).captureStackTrace(this, AnalyzerError);
				}
			}
		}

		export class DefaultAnalyzer implements IAnalyzer {
			book:Book;

			init(book:Book) {
				this.book = book;

				book.parts.forEach((part) => {
					part.chapters.forEach((chapter) => {

						ReVIEW.visit(chapter.root, {
							visitDefault: (parent:SyntaxTree, node:SyntaxTree)=> {

							},
							visitHeadline: (parent:SyntaxTree, node:HeadlineSyntaxTree)=> {
								this.headline(chapter.process, "hd", node);
							},
							visitBlockElement: (parent:SyntaxTree, node:BlockElementSyntaxTree)=> {
								this.block(chapter.process, node.name, node);
							},
							visitInlineElement: (parent:SyntaxTree, node:InlineElementSyntaxTree)=> {
								this.inline(chapter.process, node.name, node);
							}
						});
					});
				});
				book.parts.forEach((part) => {
					part.chapters.forEach((chapter) => {
						chapter.process.doAfterProcess();
					});
				});
			}

			headline(process:Process, name:string, node:HeadlineSyntaxTree) {
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
			}

			block(process:Process, name:string, node:BlockElementSyntaxTree) {
				var func = this["block_" + name].bind(this);
				if (typeof func !== "function") {
					throw new AnalyzerError("block_" + name + " is not Function");
				}
				func(process, node);
			}

			inline(process:Process, name:string, node:InlineElementSyntaxTree) {
				var func = this["inline_" + name].bind(this);
				if (typeof func !== "function") {
					throw new AnalyzerError("inline_" + name + " is not Function");
				}
				func(process, node);
			}

			checkArgsLength(process:Process, node:BlockElementSyntaxTree, expect:number):boolean;

			checkArgsLength(process:Process, node:BlockElementSyntaxTree, expects:number[]):boolean;

			checkArgsLength(process:Process, node:BlockElementSyntaxTree, expect):boolean {
				if (typeof expect === "undefined" || expect === null) {
					throw new AnalyzerError("args length is required");
				}
				var expects:number[];
				if (Array.isArray(expect)) {
					expects = expect;
				} else {
					expects = [expect];
				}
				var arg = node.args || [];
				if (expects.indexOf(arg.length) === -1) {
					process.error("argments length mismatch, " + node.name + " expected " + expects.map((n)=>Number(n).toString()).join(" or ") + "," + node + ", actual" + arg.length);
					return false;
				} else {
					return true;
				}
			}

			contentToString(node:NodeSyntaxTree):string {
				var result = "";
				ReVIEW.visit(node, {
					visitDefault: (parent:SyntaxTree, node:SyntaxTree)=> {
					},
					visitText: (parent:SyntaxTree, text:TextNodeSyntaxTree) => {
						result += text.text;
					}
				});
				return result;
			}

			constructReferenceTo(process:Process, node:SyntaxTree, value:string, separator = "|"):ReferenceTo {
				var splitted = value.split(separator);
				if (splitted.length === 3) {
					return {
						part: splitted[0],
						chapter: splitted[1],
						label: splitted[2]
					};
				} else if (splitted.length === 2) {
					return {
						part: process.part.name,
						chapter: splitted[0],
						label: splitted[1]
					};
				} else if (splitted.length === 1) {
					return {
						part: process.part.name,
						chapter: process.chapter.name,
						label: splitted[0]
					};
				} else {
					process.error("argments length mismatch, expect 1 or 2 or 3. actual " + splitted.length, node);
					return null;
				}
			}

			block_list(process:Process, node:BlockElementSyntaxTree) {
				if (!this.checkArgsLength(process, node, 2)) {
					return;
				}
				node.index = process.nextIndex("list");
				process.addSymbol({
					symbolName: node.name,
					labelName: node.args[0].arg,
					node: node
				});
			}

			inline_list(process:Process, node:InlineElementSyntaxTree) {
				if (node.childNodes.length !== 1) {
					process.error("element body mismatch, only string");
				}
				process.addSymbol({
					symbolName: node.name,
					referenceTo: this.constructReferenceTo(process, node, this.contentToString(node)),
					node: node
				});
			}

			inline_hd(process:Process, node:InlineElementSyntaxTree) {
				if (node.childNodes.length !== 1) {
					process.error("element body mismatch, only string");
				}
				process.addSymbol({
					symbolName: node.name,
					referenceTo: this.constructReferenceTo(process, node, this.contentToString(node)),
					node: node
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

		export class DefaultValidator implements IValidator {
			constructor() {
			}

			checkByBuilders(builders:IBuilder[]) {

			}
		}

		export class DefaultBuilder implements IBuilder {
		}
	}
}
