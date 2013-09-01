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
	import ChapterSyntaxTree = ReVIEW.Parse.ChapterSyntaxTree;

		/**
		 * 意味解析やシンボルの解決を行う。
		 * 未解決のシンボルのエラーを通知するのはここ。
		 * TODO また、シンボルの重複についてもチェックする必要がある。
		 * TODO 章番号の採番についても、Part全部を横断で振る必要がある。
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
			init(book:Book);
			checkByBuilders(builders:IBuilder[]);
		}

		/**
		 * IAnalyzerとIValidatorでチェックをした後に構文木から出力を生成する。
		 */
		export interface IBuilder {
			init(book:Book);
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
							visitDefaultPre: (node:SyntaxTree)=> {
							},
							visitHeadlinePre: (node:HeadlineSyntaxTree)=> {
								this.headline(chapter.process, "hd", node);
							},
							visitBlockElementPre: (node:BlockElementSyntaxTree)=> {
								this.block(chapter.process, node.name, node);
							},
							visitInlineElementPre: (node:InlineElementSyntaxTree)=> {
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
				var func = this["block_" + name];
				if (typeof func !== "function") {
					throw new AnalyzerError("block_" + name + " is not Function");
				}
				func.call(this, process, node);
			}

			inline(process:Process, name:string, node:InlineElementSyntaxTree) {
				var func = this["inline_" + name];
				if (typeof func !== "function") {
					throw new AnalyzerError("inline_" + name + " is not Function");
				}
				func.call(this, process, node);
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
					visitDefaultPre: (node:SyntaxTree)=> {
					},
					visitTextPre: (text:TextNodeSyntaxTree) => {
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
				node.no = process.nextIndex("list");
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
			init(book:Book) {
			}

			checkByBuilders(builders:IBuilder[]) {
			}
		}

		export class DefaultBuilder implements IBuilder {
			book:Book;

			init(book:Book) {
				this.book = book;

				book.parts.forEach((part) => {
					part.chapters.forEach((chapter) => {
						var process = chapter.process;
						ReVIEW.visit(chapter.root, {
							visitDefaultPre: (node:SyntaxTree)=> {
							},
							visitTextPre: (node:TextNodeSyntaxTree) => {
								process.out(node.text);
							},
							visitHeadlinePre: (node:HeadlineSyntaxTree)=> {
								this.headline_pre(chapter.process, "hd", node);
							},
							visitHeadlinePost: (node:HeadlineSyntaxTree)=> {
								this.headline_post(chapter.process, "hd", node);
							},
							visitBlockElementPre: (node:BlockElementSyntaxTree)=> {
								this.block_pre(chapter.process, node.name, node);
							},
							visitBlockElementPost: (node:BlockElementSyntaxTree)=> {
								this.block_post(chapter.process, node.name, node);
							},
							visitInlineElementPre: (node:InlineElementSyntaxTree)=> {
								this.inline_pre(chapter.process, node.name, node);
							},
							visitInlineElementPost: (node:InlineElementSyntaxTree)=> {
								this.inline_post(chapter.process, node.name, node);
							},
							visitChapterPost: (node:ChapterSyntaxTree)=> {
								process.out("\n");
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

			block_pre(process:Process, name:string, node:BlockElementSyntaxTree) {
				var func:Function;
				func = this["block_" + name];
				if (typeof func === "function") {
					func.call(this, process, node);
					return;
				}

				func = this["block_" + name + "_pre"];
				if (typeof func !== "function") {
					throw new AnalyzerError("block_" + name + "_pre or block_" + name + " is not Function");
				}
				func.call(this, process, node);
			}

			block_post(process:Process, name:string, node:BlockElementSyntaxTree) {
				var func:Function;
				func = this["block_" + name];
				if (typeof func === "function") {
					return;
				}

				func = this["block_" + name + "_post"];
				if (typeof func !== "function") {
					throw new AnalyzerError("block_" + name + "_post is not Function");
				}
				func.call(this, process, node);
			}

			inline_pre(process:Process, name:string, node:InlineElementSyntaxTree) {
				var func:Function;
				func = this["inline_" + name];
				if (typeof func === "function") {
					func.call(this, process, node);
					return;
				}

				func = this["inline_" + name + "_pre"];
				if (typeof func !== "function") {
					throw new AnalyzerError("inline_" + name + "_pre or inline_" + name + " is not Function");
				}
				func.call(this, process, node);
			}

			inline_post(process:Process, name:string, node:InlineElementSyntaxTree) {
				var func:Function;
				func = this["inline_" + name];
				if (typeof func === "function") {
					return;
				}

				func = this["inline_" + name + "_post"];
				if (typeof func !== "function") {
					throw new AnalyzerError("inline_" + name + "_post is not Function");
				}
				func.call(this, process, node);
			}

			findChapter(node:SyntaxTree, level?:number):ChapterSyntaxTree {
				var chapter:ChapterSyntaxTree = null;
				ReVIEW.walk(node, (node:SyntaxTree) => {
					if (node instanceof ReVIEW.Parse.ChapterSyntaxTree) {
						chapter = node.toChapter();
						if (typeof level === "undefined" || chapter.level === level) {
							return null;
						}
					}
					return node.parentNode;
				});
				return chapter;
			}

			findReference(process:Process, node:SyntaxTree):Symbol {
				var founds = process.symbols.filter((symbol)=> {
					return symbol.node === node;
				});
				if (founds.length !== 1) {
					throw new AnalyzerError("invalid status.");
				}
				return founds[0];
			}

			headline_pre(process:Process, name:string, node:HeadlineSyntaxTree) {
				// TODO no の採番がレベル別になっていない
				// TODO 2.3.2 みたいな階層を返せるメソッドが何かほしい
				process.out("■H").out(node.level).out("■");
				if (node.level === 1) {
					process.out("第").out(node.parentNode.no).out("章").out("　");
				} else if (node.level === 2) {
					process.out(node.parentNode.toChapter().fqn).out("　");
				}
			}

			headline_post(process:Process, name:string, node:HeadlineSyntaxTree) {
				process.out("\n\n");
			}

			block_list_pre(process:Process, node:BlockElementSyntaxTree) {
				process.out("◆→開始:リスト←◆\n");
				var chapter = this.findChapter(node, 1);
				process.out("リスト").out(chapter.fqn).out(".").out(node.no).out("　").out(node.args[1].arg).out("\n");
			}

			block_list_post(process:Process, node:BlockElementSyntaxTree) {
				process.out("◆→終了:リスト←◆\n");
			}

			inline_list(process:Process, node:InlineElementSyntaxTree) {
				var chapter = this.findChapter(node, 1);
				var listNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
				process.out("リスト").out(chapter.fqn).out(".").out(listNode.no);
			}

			inline_hd_pre(process:Process, node:InlineElementSyntaxTree) {
				var chapter = this.findChapter(node);
				process.out("「").out(chapter.fqn).out(" ");
			}

			inline_hd_post(process:Process, node:InlineElementSyntaxTree) {
				process.out("」");
			}
		}
	}
}
