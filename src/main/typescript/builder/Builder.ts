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
	import UlistElementSyntaxTree = ReVIEW.Parse.UlistElementSyntaxTree;
	import OlistElementSyntaxTree = ReVIEW.Parse.OlistElementSyntaxTree;
	import DlistElementSyntaxTree = ReVIEW.Parse.DlistElementSyntaxTree;
	import TextNodeSyntaxTree = ReVIEW.Parse.TextNodeSyntaxTree;
	import ChapterSyntaxTree = ReVIEW.Parse.ChapterSyntaxTree;

	/**
	 * IAnalyzerとIValidatorでチェックをした後に構文木から出力を生成する。
	 */
	export interface IBuilder {
		name:string;
		init(book:Book):void;
		chapterPre(process:BuilderProcess, node:ChapterSyntaxTree):any;
		chapterPost(process:BuilderProcess, node:ChapterSyntaxTree):any;
		headlinePre(process:BuilderProcess, name:string, node:HeadlineSyntaxTree):any;
		headlinePost(process:BuilderProcess, name:string, node:HeadlineSyntaxTree):any;
		ulistPre(process:BuilderProcess, name:string, node:UlistElementSyntaxTree):any;
		ulistPost(process:BuilderProcess, name:string, node:UlistElementSyntaxTree):any;
		olistPre(process:BuilderProcess, name:string, node:OlistElementSyntaxTree):any;
		olistPost(process:BuilderProcess, name:string, node:OlistElementSyntaxTree):any;
		blockPre(process:BuilderProcess, name:string, node:BlockElementSyntaxTree):any;
		blockPost(process:BuilderProcess, name:string, node:BlockElementSyntaxTree):any;
		inlinePre(process:BuilderProcess, name:string, node:InlineElementSyntaxTree):any;
		inlinePost(process:BuilderProcess, name:string, node:InlineElementSyntaxTree):any;
		text(process:BuilderProcess, node:TextNodeSyntaxTree):any;
	}

	export class DefaultBuilder implements IBuilder {
		book:Book;

		get name():string {
			return (<any>this).constructor.name;
		}

		init(book:Book) {
			this.book = book;

			book.parts.forEach(part => {
				part.chapters.forEach(chapter => {
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
						visitParagraphPre: (node:NodeSyntaxTree) => {
							return this.paragraphPre(process, "p", node);
						},
						visitParagraphPost: (node:NodeSyntaxTree) => {
							return this.paragraphPost(process, "p", node);
						},
						visitUlistPre: (node:UlistElementSyntaxTree)=> {
							return this.ulistPre(process, "ul", node);
						},
						visitUlistPost: (node:UlistElementSyntaxTree)=> {
							return this.ulistPost(process, "ul", node);
						},
						visitOlistPre: (node:OlistElementSyntaxTree)=> {
							return this.olistPre(process, "ol", node);
						},
						visitOlistPost: (node:OlistElementSyntaxTree)=> {
							return this.olistPost(process, "ol", node);
						},
						visitDlistPre: (node:DlistElementSyntaxTree)=> {
							return this.dlistPre(process, "dl", node);
						},
						visitDlistPost: (node:DlistElementSyntaxTree)=> {
							return this.dlistPost(process, "dl", node);
						},
						visitBlockElementPre: (node:BlockElementSyntaxTree)=> {
							return this.blockPre(process, node.symbol, node);
						},
						visitBlockElementPost: (node:BlockElementSyntaxTree)=> {
							return this.blockPost(process, node.symbol, node);
						},
						visitInlineElementPre: (node:InlineElementSyntaxTree)=> {
							return this.inlinePre(process, node.symbol, node);
						},
						visitInlineElementPost: (node:InlineElementSyntaxTree)=> {
							return this.inlinePost(process, node.symbol, node);
						},
						visitTextPre: (node:TextNodeSyntaxTree) => {
							this.text(process, node);
						}
					});
					this.processPost(process, chapter);
				});
			});
			book.parts.forEach(part => {
				part.chapters.forEach(chapter => {
					chapter.process.doAfterProcess();
				});
			});
		}

		processPost(process:BuilderProcess, chapter:Chapter):void {
		}

		chapterPre(process:BuilderProcess, node:ChapterSyntaxTree):any {
		}

		chapterPost(process:BuilderProcess, node:ChapterSyntaxTree):any {
		}

		headlinePre(process:BuilderProcess, name:string, node:HeadlineSyntaxTree):any {
		}

		headlinePost(process:BuilderProcess, name:string, node:HeadlineSyntaxTree):any {
		}

		paragraphPre(process:BuilderProcess, name:string, node:NodeSyntaxTree):any {
		}

		paragraphPost(process:BuilderProcess, name:string, node:NodeSyntaxTree):any {
		}

		ulistPre(process:BuilderProcess, name:string, node:UlistElementSyntaxTree):any {
		}

		ulistPost(process:BuilderProcess, name:string, node:UlistElementSyntaxTree):any {
		}

		olistPre(process:BuilderProcess, name:string, node:OlistElementSyntaxTree):any {
		}

		olistPost(process:BuilderProcess, name:string, node:OlistElementSyntaxTree):any {
		}

		dlistPre(process:BuilderProcess, name:string, node:DlistElementSyntaxTree):any {
		}

		dlistPost(process:BuilderProcess, name:string, node:DlistElementSyntaxTree):any {
		}

		text(process:BuilderProcess, node:TextNodeSyntaxTree):any {
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

		ulistParentHelper(process:BuilderProcess, node:UlistElementSyntaxTree, action:()=>void, currentLevel:number = node.level) {
			if (currentLevel !== 1) {
				var result = findUp(node.parentNode, (n)=> {
					if (n instanceof UlistElementSyntaxTree) {
						var ulist = n.toUlist();
						return ulist.level === (currentLevel - 1);
					}
					return false;
				});
				if (result) {
					return;
				}
				action();
				this.ulistParentHelper(process, node, action, currentLevel - 1);
			}
		}

		findReference(process:BuilderProcess, node:SyntaxTree):ISymbol {
			var founds = process.symbols.filter(symbol => symbol.node === node);
			if (founds.length !== 1) {
				throw new AnalyzerError("invalid status.");
			}
			return founds[0];
		}
	}
}
