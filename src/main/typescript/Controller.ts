///<reference path='Utils.ts' />
///<reference path='Model.ts' />
///<reference path='Parser.ts' />

module ReVIEW {
	export class Controller {
		data:ReVIEW.Config;

		constructor(public options:ReVIEW.Options = {}) {
		}

		initConfig(data:ReVIEW.Config) {
			this.data = data;
		}

		process() {
			// 色々な処理の開始地点
			// 型付してあるがユーザが仕様を満たした物をくれるかというと全然そんなことはない

			var preface:string[] = [];
			if (this.data.book.preface) {
				preface = this.data.book.preface;
			}
			var chapters:string[] = [];
			if (this.data.book.chapters) {
				chapters = this.data.book.chapters;
			}
			var afterword:string[] = [];
			if (this.data.book.afterword) {
				afterword = this.data.book.afterword;
			}

			chapters.forEach((path)=> {
				var data = this.read(this.resolvePath(path));
				var parseResult = ReVIEW.Parse.parse(data);
				console.log(JSON.stringify(parseResult.ast, null, 2));
			});
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
