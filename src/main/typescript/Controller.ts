///<reference path='Utils.ts' />
///<reference path='Model.ts' />
///<reference path='Parser.ts' />

module ReVIEW {

import SyntaxTree = ReVIEW.Parse.SyntaxTree;
import HeadlineSyntaxTree = ReVIEW.Parse.HeadlineSyntaxTree;
import BlockElementSyntaxTree = ReVIEW.Parse.BlockElementSyntaxTree;
import InlineElementSyntaxTree = ReVIEW.Parse.InlineElementSyntaxTree;
import TextNodeSyntaxTree = ReVIEW.Parse.TextNodeSyntaxTree;

	/**
	 * ReVIEW文書を処理するためのコントローラ。
	 * 処理の起点。
	 */
	export class Controller {
		config:ReVIEW.Config;

		constructor(public options:ReVIEW.Options = {}) {
		}

		/**
		 * 設定の初期化を行う。
		 * 通常、 ReVIEW.start 経由で呼び出される。
		 * @param data
		 */
			initConfig(data:ReVIEW.Config):void {
			this.config = data;

			// analyzer の正規化
			data.analyzer = data.analyzer || new Build.DefaultAnalyzer();
			// validators の正規化
			if (!data.validators || data.validators.length === 0) {
				this.config.validators = [new Build.DefaultValidator()];
			} else if (!Array.isArray(data.validators)) {
				this.config.validators = [<any>data.validators];
			}
			// builders の正規化
			if (!data.builders || data.builders.length === 0) {
				// TODO DefaultBuilder は微妙感
				this.config.builders = [new Build.DefaultBuilder()];
			} else if (!Array.isArray(data.builders)) {
				this.config.builders = [<any>data.builders];
			}
		}

		/**
		 * 処理開始
		 * @returns {Book}
		 */
			process():Book {
			var book = this.processBook();
			var process = new Process();
			this.config.analyzer.init(book, process);
			return book;
		}

		private processBook():Book {
			var book = new Book();
			book.parts = [
				this.config.book.preface,
				this.config.book.chapters,
				this.config.book.afterword
			].map((part) => this.processPart(book, part ? part : []));

			book.config = this.config;
			return book;
		}

		private processPart(book:Book, chapters:string[]):Part {
			var part = new Part();
			part.parent = book;
			part.chapters = chapters.map((chapter) => this.processChapter(book, part, chapter));
			return part;
		}

		private processChapter(book:Book, part:Part, chapterPath:string):Chapter {
			var data = this.read(this.resolvePath(chapterPath));
			var parseResult = ReVIEW.Parse.parse(data);
			var chapter = new Chapter();
			chapter.parent = part;
			chapter.name = chapterPath;
			chapter.root = parseResult.ast;
			return chapter;
		}

		get read():(path:string)=>string {
			return this.config.read || ReVIEW.IO.read;
		}

		get write():(path:string, data:string)=>void {
			return this.config.write || ReVIEW.IO.write;
		}

		resolvePath(path:string):string {
			var base = this.options.base || "./";
			if (!this.endWith(base, "/") && !this.startWith(path, "/")) {
				base += "/";
			}
			return base + path;
		}

		private startWith(str:string, target:string):boolean {
			return str.indexOf(target) === 0;
		}

		private endWith(str:string, target:string):boolean {
			return str.indexOf(target, str.length - target.length) !== -1;
		}
	}
}
