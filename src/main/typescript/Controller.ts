///<reference path='Utils.ts' />
///<reference path='Model.ts' />
///<reference path='Parser.ts' />

module ReVIEW {

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
			// TODO
			return book;
		}

		processPart(book:Book, chapters:string[]):Part {
			var part = new Part();
			part.chapters = chapters.map((chapter) => this.processChapter(book, part, chapter));
			// TODO
			return part;
		}

		processChapter(book:Book, part:Part, chapter:string):Chapter {
			var data = this.read(this.resolvePath(chapter));
			var parseResult = ReVIEW.Parse.parse(data);
			console.log(JSON.stringify(parseResult.ast, null, 2));
			var chapter = new Chapter();
			// TODO
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
