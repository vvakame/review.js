///<reference path='../utils/Utils.ts' />
///<reference path='../i18n/i18n.ts' />
///<reference path='../model/CompilerModel.ts' />
///<reference path='../parser/Analyzer.ts' />

module ReVIEW.Build {

import SyntaxTree = ReVIEW.Parse.SyntaxTree;
import NodeSyntaxTree = ReVIEW.Parse.NodeSyntaxTree;
import BlockElementSyntaxTree = ReVIEW.Parse.BlockElementSyntaxTree;
import InlineElementSyntaxTree = ReVIEW.Parse.InlineElementSyntaxTree;
import HeadlineSyntaxTree = ReVIEW.Parse.HeadlineSyntaxTree;
import TextNodeSyntaxTree = ReVIEW.Parse.TextNodeSyntaxTree;
import ChapterSyntaxTree = ReVIEW.Parse.ChapterSyntaxTree;

	/**
	 * IAnalyzerとIValidatorでチェックをした後に構文木から出力を生成する。
	 */
	export interface IBuilder {
		name:string;
		init(book:Book);
		chapterPre(process:BuilderProcess, node:ChapterSyntaxTree):any;
		chapterPost(process:BuilderProcess, node:ChapterSyntaxTree):any;
		headlinePre(process:BuilderProcess, name:string, node:HeadlineSyntaxTree):any;
		headlinePost(process:BuilderProcess, name:string, node:HeadlineSyntaxTree):any;
		blockPre(process:BuilderProcess, name:string, node:BlockElementSyntaxTree):any;
		blockPost(process:BuilderProcess, name:string, node:BlockElementSyntaxTree):any;
		inlinePre(process:BuilderProcess, name:string, node:InlineElementSyntaxTree):any;
		inlinePost(process:BuilderProcess, name:string, node:InlineElementSyntaxTree):any;
		text(process:BuilderProcess, name:string, node:TextNodeSyntaxTree):any;
	}

	export class DefaultBuilder implements IBuilder {
		book:Book;

		get name():string {
			return (<any>this).constructor.name;
		}

		init(book:Book) {
			this.book = book;

			book.parts.forEach((part) => {
				part.chapters.forEach((chapter) => {
					var process = chapter.createBuilderProcess(this);
					ReVIEW.visit(chapter.root, {
						visitDefaultPre: (node:SyntaxTree)=> {
						},
						visitChapterPre: (node:ChapterSyntaxTree)=> {
							return this.chapterPre(process, node);
						},
						visitChapterPost: (node:ChapterSyntaxTree)=> {
							return this.chapterPost(process, node);
						},
						visitHeadlinePre: (node:HeadlineSyntaxTree)=> {
							return this.headlinePre(process, "hd", node);
						},
						visitHeadlinePost: (node:HeadlineSyntaxTree)=> {
							return this.headlinePost(process, "hd", node);
						},
						visitBlockElementPre: (node:BlockElementSyntaxTree)=> {
							return this.blockPre(process, node.name, node);
						},
						visitBlockElementPost: (node:BlockElementSyntaxTree)=> {
							return this.blockPost(process, node.name, node);
						},
						visitInlineElementPre: (node:InlineElementSyntaxTree)=> {
							return this.inlinePre(process, node.name, node);
						},
						visitInlineElementPost: (node:InlineElementSyntaxTree)=> {
							return this.inlinePost(process, node.name, node);
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

		chapterPre(process:BuilderProcess, node:ChapterSyntaxTree):any {
		}

		chapterPost(process:BuilderProcess, node:ChapterSyntaxTree):any {
		}

		headlinePre(process:BuilderProcess, name:string, node:HeadlineSyntaxTree):any {
		}

		headlinePost(process:BuilderProcess, name:string, node:HeadlineSyntaxTree):any {
		}

		text(process:BuilderProcess, name:string, node:TextNodeSyntaxTree):any {
			process.out(node.text);
		}

		blockPre(process:BuilderProcess, name:string, node:BlockElementSyntaxTree):any {
			var func:Function;
			func = this["block_" + name];
			if (typeof func === "function") {
				return func.call(this, process, node);
			}

			func = this["block_" + name + "_pre"];
			if (typeof func !== "function") {
				throw new AnalyzerError("block_" + name + "_pre or block_" + name + " is not Function");
			}
			return func.call(this, process, node);
		}

		blockPost(process:BuilderProcess, name:string, node:BlockElementSyntaxTree):any {
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

		inlinePre(process:BuilderProcess, name:string, node:InlineElementSyntaxTree):any {
			var func:Function;
			func = this["inline_" + name];
			if (typeof func === "function") {
				return func.call(this, process, node);
			}

			func = this["inline_" + name + "_pre"];
			if (typeof func !== "function") {
				throw new AnalyzerError("inline_" + name + "_pre or inline_" + name + " is not Function");
			}
			return func.call(this, process, node);
		}

		inlinePost(process:BuilderProcess, name:string, node:InlineElementSyntaxTree):any {
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

		findReference(process:BuilderProcess, node:SyntaxTree):ISymbol {
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
