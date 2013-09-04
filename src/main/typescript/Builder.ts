///<reference path='Utils.ts' />
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

	import flatten = ReVIEW.flatten;
	import nodeToString = ReVIEW.nodeToString;
	import findChapter = ReVIEW.findChapter;

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
			init(book:Book, builders:IBuilder[]);
		}

		/**
		 * IAnalyzerとIValidatorでチェックをした後に構文木から出力を生成する。
		 */
		export interface IBuilder {
			init(book:Book);
			chapterPre(process:Process, node:ChapterSyntaxTree):any;
			chapterPost(process:Process, node:ChapterSyntaxTree):any;
			headlinePre(process:Process, name:string, node:HeadlineSyntaxTree):any;
			headlinePost(process:Process, name:string, node:HeadlineSyntaxTree):any;
			blockPre(process:Process, name:string, node:BlockElementSyntaxTree):any;
			blockPost(process:Process, name:string, node:BlockElementSyntaxTree):any;
			inlinePre(process:Process, name:string, node:InlineElementSyntaxTree):any;
			inlinePost(process:Process, name:string, node:InlineElementSyntaxTree):any;
			text(process:Process, name:string, node:TextNodeSyntaxTree):any;
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

				this.resolveSymbolAndReference(book);
			}

			resolveSymbolAndReference(book:Book) {
				// symbols の解決
				// Arrayにflatten がなくて悲しい reduce だと長い…
				var symbols:Symbol[] = flatten(book.parts.map(part=>part.chapters.map(chapter=>chapter.process.symbols)));
				symbols.forEach(symbol=> {
					// referenceToのpartやchapterの解決
					var referenceTo = symbol.referenceTo;
					if (!referenceTo) {
						return;
					}
					if (!referenceTo.part) {
						book.parts.forEach(part=> {
							if (referenceTo.partName === part.name) {
								referenceTo.part = part;
							}
						});
					}
					if (!referenceTo.part) {
						symbol.chapter.process.error("Part is missing " + symbol.part.name, symbol.node);
						return;
					}
					if (!referenceTo.chapter) {
						referenceTo.part.chapters.forEach(chap=> {
							if (referenceTo.chapterName === chap.name) {
								referenceTo.chapter = chap;
							}
						});
					}
					if (!referenceTo.chapter) {
						symbol.chapter.process.error("Chapter is missing " + symbol.chapter.name, symbol.node);
						return;
					}
				});
				// referenceTo.node の解決
				symbols.forEach(symbol=> {
					if (symbol.referenceTo && !symbol.referenceTo.referenceNode) {
						var reference = symbol.referenceTo;
						symbols.forEach(symbol=> {
							if (reference.part === symbol.part && reference.chapter === symbol.chapter && reference.targetSymbol === symbol.symbolName && reference.label === symbol.labelName) {
								reference.referenceNode = symbol.node;
							}
						});
						if (!reference.referenceNode) {
							symbol.chapter.process.error("Refenrece is missing " + symbol.labelName, symbol.node);
							return;
						}
					}
				});
				// 同一チャプター内に同一シンボル(listとか)で同一labelの要素がないかチェック
				symbols.forEach(symbol1=> {
					symbols.forEach(symbol2=> {
						if (symbol1 === symbol2) {
							return;
						}
						if (symbol1.chapter === symbol2.chapter && symbol1.symbolName === symbol2.symbolName) {
							if (symbol1.labelName && symbol2.labelName && symbol1.labelName === symbol2.labelName) {
								symbol1.chapter.process.error("Duplicated symbol", symbol1.node, symbol2.node);
								return;
							}
						}
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

			constructReferenceTo(process:Process, node:InlineElementSyntaxTree, value:string, targetSymbol?:string, separator?:string):ReferenceTo;

			constructReferenceTo(process:Process, node:BlockElementSyntaxTree, value:string, targetSymbol:string, separator?:string):ReferenceTo;

			constructReferenceTo(process:Process, node, value:string, targetSymbol = node.name, separator = "|"):ReferenceTo {
				var splitted = value.split(separator);
				if (splitted.length === 3) {
					return {
						partName: splitted[0],
						chapterName: splitted[1],
						targetSymbol: targetSymbol,
						label: splitted[2]
					};
				} else if (splitted.length === 2) {
					return {
						part: process.part,
						partName: process.part.name,
						chapterName: splitted[0],
						targetSymbol: targetSymbol,
						label: splitted[1]
					};
				} else if (splitted.length === 1) {
					return {
						part: process.part,
						partName: process.part.name,
						chapter: process.chapter,
						chapterName: process.chapter.name,
						targetSymbol: targetSymbol,
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
					referenceTo: this.constructReferenceTo(process, node, nodeToString(node)),
					node: node
				});
			}

			inline_hd(process:Process, node:InlineElementSyntaxTree) {
				if (node.childNodes.length !== 1) {
					process.error("element body mismatch, only string");
				}
				process.addSymbol({
					symbolName: node.name,
					referenceTo: this.constructReferenceTo(process, node, nodeToString(node)),
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

			init(book:Book, builders:IBuilder[]) {
				this.checkBook(book);
			}

			checkBook(book:Book) {
				book.parts.forEach(part=> this.checkPart(part));
			}

			checkPart(part:Part) {
				part.chapters.forEach(chapter=>this.checkChapter(chapter));
			}

			checkChapter(chapter:Chapter) {
				// 章の下に項がいきなり来ていないか(節のレベルを飛ばしている)
				// 最初は必ず Level 1, 1以外の場合は1つ上のChapterとのレベル差が1でなければならない
				ReVIEW.visit(chapter.root, {
					visitDefaultPre: (node:SyntaxTree) => {
					},
					visitChapterPre: (node:ChapterSyntaxTree) => {
						if (node.level === 1) {
							if (!findChapter(node)) {
								// ここに来るのは実装のバグのはず
								chapter.process.error("This is Level 1 chapter, but not top level", node);
							}
						} else {
							var parent = findChapter(node.parentNode);
							if (!parent) {
								chapter.process.error("Top level chapter must level 1", node);
							} else if (parent.level !== node.level - 1) {
								chapter.process.error("This is Level " + node.level + " chapter, but parent chapter is not level " + (node.level - 1) + ". actual " + (parent ? String(parent.level) : "none"), node);
							}
						}
					}
				});
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
							visitChapterPre: (node:ChapterSyntaxTree)=> {
								return this.chapterPre(chapter.process, node);
							},
							visitChapterPost: (node:ChapterSyntaxTree)=> {
								return this.chapterPost(chapter.process, node);
							},
							visitHeadlinePre: (node:HeadlineSyntaxTree)=> {
								return this.headlinePre(chapter.process, "hd", node);
							},
							visitHeadlinePost: (node:HeadlineSyntaxTree)=> {
								return this.headlinePost(chapter.process, "hd", node);
							},
							visitBlockElementPre: (node:BlockElementSyntaxTree)=> {
								return this.blockPre(chapter.process, node.name, node);
							},
							visitBlockElementPost: (node:BlockElementSyntaxTree)=> {
								return this.blockPost(chapter.process, node.name, node);
							},
							visitInlineElementPre: (node:InlineElementSyntaxTree)=> {
								return this.inlinePre(chapter.process, node.name, node);
							},
							visitInlineElementPost: (node:InlineElementSyntaxTree)=> {
								return this.inlinePost(chapter.process, node.name, node);
							},
							visitTextPre: (node:TextNodeSyntaxTree) => {
								this.text(process, node.text, node);
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

			chapterPre(process:Process, node:ChapterSyntaxTree):any {
			}

			chapterPost(process:Process, node:ChapterSyntaxTree):any {
			}

			headlinePre(process:Process, name:string, node:HeadlineSyntaxTree):any {
			}

			headlinePost(process:Process, name:string, node:HeadlineSyntaxTree):any {
			}

			text(process:Process, name:string, node:TextNodeSyntaxTree):any {
				process.out(node.text);
			}

			blockPre(process:Process, name:string, node:BlockElementSyntaxTree):any {
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
				return func.call(this, process, node);
			}

			blockPost(process:Process, name:string, node:BlockElementSyntaxTree):any {
				var func:Function;
				func = this["block_" + name];
				if (typeof func === "function") {
					return;
				}

				func = this["block_" + name + "_post"];
				if (typeof func !== "function") {
					throw new AnalyzerError("block_" + name + "_post is not Function");
				}
				return func.call(this, process, node);
			}

			inlinePre(process:Process, name:string, node:InlineElementSyntaxTree):any {
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
				return func.call(this, process, node);
			}

			inlinePost(process:Process, name:string, node:InlineElementSyntaxTree):any {
				var func:Function;
				func = this["inline_" + name];
				if (typeof func === "function") {
					return;
				}

				func = this["inline_" + name + "_post"];
				if (typeof func !== "function") {
					throw new AnalyzerError("inline_" + name + "_post is not Function");
				}
				return func.call(this, process, node);
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
		}
	}
}
