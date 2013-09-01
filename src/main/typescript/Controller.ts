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

			// analyzer の正規化
			data.analyzer = data.analyzer || new Build.DefaultAnalyzer();
			// validators の正規化
			if (!data.validators || data.validators.length === 0) {
				this.data.validators = [new Build.DefaultValidator()];
			} else if (!Array.isArray(data.validators)) {
				this.data.validators = [<any>data.validators];
			}
			// builders の正規化
		}

		process():Book {
			var book = this.processBook();
			var process = new Process();
			this.data.analyzer.init(book, process);
			return book;
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
			part.parent = book;
			part.chapters = chapters.map((chapter) => this.processChapter(book, part, chapter));
			return part;
		}

		processChapter(book:Book, part:Part, chapterPath:string):Chapter {
			var data = this.read(this.resolvePath(chapterPath));
			var parseResult = ReVIEW.Parse.parse(data);
			var chapter = new Chapter();
			chapter.parent = part;

			var symbolTable:{
				symbolName:string;
				labelName:string;
				node:SyntaxTree;
			}[] = [];
			ReVIEW.visit(parseResult.ast, {
				visitDefault: (parent:SyntaxTree, node:SyntaxTree)=> {

				},
				// TODO 後で頑張って消す
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
