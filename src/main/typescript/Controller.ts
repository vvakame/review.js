///<reference path='Utils.ts' />
///<reference path='Model.ts' />
///<reference path='Parser.ts' />

module ReVIEW {

import SyntaxTree = ReVIEW.Parse.SyntaxTree;
import HeadlineSyntaxTree = ReVIEW.Parse.HeadlineSyntaxTree;
import BlockElementSyntaxTree = ReVIEW.Parse.BlockElementSyntaxTree;
import InlineElementSyntaxTree = ReVIEW.Parse.InlineElementSyntaxTree;
import TextNodeSyntaxTree = ReVIEW.Parse.TextNodeSyntaxTree;

import Chapter = ReVIEW.Chapter;

	export class Controller {
		data:ReVIEW.Config;

		constructor(public options:ReVIEW.Options = {}) {
		}

		initConfig(data:ReVIEW.Config):void {
			this.data = data;
		}

		processBook():Book {
			var book = new Book();
			book.parts = [
				this.data.book.preface,
				this.data.book.chapters,
				this.data.book.afterword
			].map((part) => this.processPart(book, part ? part : []));

			book.config = this.data;
			return book;
		}

		processPart(book:Book, chapters:string[]):Part {
			var part = new Part();
			part.chapters = chapters.map((chapter) => this.processChapter(book, part, chapter));
			var symbolTable:{
				chapterName:string;
				symbolName:string;
				labelName:string;
				node:SyntaxTree;
			}[] = [];
			part.chapters.forEach((chapter)=> {
				chapter.symbolTable.forEach((symbolInfo) => {
					symbolTable.push({
						chapterName: chapter.name,
						symbolName: symbolInfo.symbolName,
						labelName: symbolInfo.labelName,
						node: symbolInfo.node
					});
				});
			});

			part.symbolTable = symbolTable;
			return part;
		}

		processChapter(book:Book, part:Part, chapterPath:string):Chapter {
			var data = this.read(this.resolvePath(chapterPath));
			var parseResult = ReVIEW.Parse.parse(data);
			var chapter = new Chapter();

			var symbolTable:{
				symbolName:string;
				labelName:string;
				node:SyntaxTree;
			}[] = [];
			ReVIEW.visit(parseResult.ast, {
				visitDefault: (parent:SyntaxTree, node:SyntaxTree)=> {

				},
				visitHeadline: (parent:SyntaxTree, node:HeadlineSyntaxTree)=> {
					var label:string = null;
					if (node.tag) {
						label = node.tag.arg;
					} else if (node.caption.childNodes.length === 1) {
						var textNode = node.caption.childNodes[0].toTextNode();
						label = textNode.text;
					}
					symbolTable.push({
						symbolName: "hd",
						labelName: label,
						node: node
					});
				},
				visitBlockElement: (parent:SyntaxTree, node:BlockElementSyntaxTree)=> {
					symbolTable.push({
						symbolName: node.name,
						labelName: null,
						node: node
					});
				},
				visitInlineElement: (parent:SyntaxTree, node:InlineElementSyntaxTree)=> {
					symbolTable.push({
						symbolName: node.name,
						labelName: null,
						node: node
					});
				}
			});

			chapter.name = chapterPath;
			chapter.symbolTable = symbolTable;
			chapter.root = parseResult.ast;
			return chapter;
		}

		get read():(path:string)=>string {
			return this.data.read || ReVIEW.IO.read;
		}

		get write():(path:string, data:string)=>void {
			return this.data.write || ReVIEW.IO.write;
		}

		resolvePath(path:string):string {
			var base = this.options.base || "./";
			if (!this.endWith(base, "/") && !this.startWith(path, "/")) {
				base += "/";
			}
			return base + path;
		}

		startWith(str:string, target:string):boolean {
			return str.indexOf(target) === 0;
		}

		endWith(str:string, target:string):boolean {
			return str.indexOf(target, str.length - target.length) !== -1;
		}
	}
}
