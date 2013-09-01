///<reference path='Model.ts' />
///<reference path='Parser.ts' />

module ReVIEW {
	export module Build {

	import SyntaxTree = ReVIEW.Parse.SyntaxTree;
	import NodeSyntaxTree = ReVIEW.Parse.NodeSyntaxTree;
	import BlockElementSyntaxTree = ReVIEW.Parse.BlockElementSyntaxTree;
	import InlineElementSyntaxTree = ReVIEW.Parse.InlineElementSyntaxTree;
	import TextNodeSyntaxTree = ReVIEW.Parse.TextNodeSyntaxTree;

		/**
		 * 意味解析やシンボルの解決を行う。
		 * 未解決のシンボルのエラーを通知するのはここ。
		 */
		export interface IAnalyzer {
			init(book:Book, process:Process);
			block(name:string, node:BlockElementSyntaxTree);
			inline(name:string, node:InlineElementSyntaxTree);
		}

		export interface IValidator {
			checkByBuilders(builders:IBuilder[]);
		}

		export interface IBuilder {

		}

		export class DefaultAnalyzer implements IAnalyzer {
			process:Process;
			book:Book;
			currentPart:Part;
			currentChapter:Chapter;
			delayChecker:Function[] = [];

			init(book:Book, process:Process) {
				this.process = process;
				this.book = book;

				book.parts.forEach((part) => {
					this.currentPart = part;

					part.chapters.forEach((chapter) => {
						this.currentChapter = chapter;

						ReVIEW.visit(chapter.root, {
							visitDefault: (parent:SyntaxTree, node:SyntaxTree)=> {

							},
							visitBlockElement: (parent:SyntaxTree, node:BlockElementSyntaxTree)=> {
								this.block(node.name, node);
							},
							visitInlineElement: (parent:SyntaxTree, node:InlineElementSyntaxTree)=> {
								this.inline(node.name, node);
							}
						});
					});
				});
				this.delayChecker.forEach((func)=> func());
			}

			block(name:string, node:BlockElementSyntaxTree) {
				var func = this["block_" + name].bind(this);
				if (typeof func !== "function") {
					throw new AnalyzerError("block_" + name + " is not Function");
				}
				func(node);
			}

			inline(name:string, node:InlineElementSyntaxTree) {
				var func = this["inline_" + name].bind(this);
				if (typeof func !== "function") {
					throw new AnalyzerError("inline_" + name + " is not Function");
				}
				func(node);
			}

			checkArgsLength(node:BlockElementSyntaxTree, expect:number):boolean;

			checkArgsLength(node:BlockElementSyntaxTree, expects:number[]):boolean;

			checkArgsLength(node, expect):boolean {
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
					this.process.error("argments length mismatch, " + node.name + " expected " + expects.map((n)=>Number(n).toString()).join(" or ") + "," + node + ", actual" + arg.length);
					return false;
				} else {
					return true;
				}
			}

			addPostProcess(func:Function) {
				this.delayChecker.push(func);
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

			block_list(node:BlockElementSyntaxTree) {
				this.checkArgsLength(node, 2);
				this.currentChapter.addSymbol({
					symbolName: node.name,
					labelName: node.args[0].arg,
					node: node
				});
			}

			inline_list(node:InlineElementSyntaxTree) {
				var childLength = node.childNodes.length;
				if (childLength !== 1) {
					this.process.error("element body mismatch, only string");
				}
				this.currentChapter.addSymbol({
					symbolName: node.name,
					referenceTo: this.contentToString(node),
					node: node
				});
			}

			inline_hd(node:InlineElementSyntaxTree) {
				var childLength = node.childNodes.length;
				if (childLength !== 1) {
					this.process.error("element body mismatch, only string");
				}
				this.currentChapter.addSymbol({
					symbolName: node.name,
					// TODO | で分割記述が可能
					referenceTo: this.contentToString(node),
					node: node
				});
			}
		}

		export class DefaultValidator implements IValidator {
			constructor() {
				console.log("DefaultValidator");
			}

			checkByBuilders(builders:IBuilder[]) {

			}
		}

		export class DefaultBuilder implements IBuilder {
		}

		export class AnalyzerError implements Error {
			name = "AnalyzerError";

			constructor(public message:string) {
				if ((<any>Error).captureStackTrace) {
					(<any>Error).captureStackTrace(this, AnalyzerError);
				}
			}
		}
	}
}
