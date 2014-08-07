///<reference path='../../../typings/mocha/mocha.d.ts' />
///<reference path='../../../typings/assert/assert.d.ts' />

///<reference path='../../../lib/model/CompilerModel.ts' />
///<reference path='../../../lib/builder/TextBuilder.ts' />

describe("ReVIEW.Controllerの", ()=> {
	"use strict";

	it("処理が正しく動くこと", ()=> {
		var files:any = {
			"ch01.re": "={ch01} ちゃぷたーだよ\n今日の晩ご飯はラフテーだった",
			"ch02.re": "={ch02} チャプター2\n参照 @<hd>{ch02} とか\n//list[hoge][fuga]{\ntest\n//}"
		};
		var result:any = {
		};
		return ReVIEW.start(review => {
			review.initConfig({
				read: (path:string) => {
					return Promise.resolve(files[path]);
				},
				write: (path:string, content:any) => {
					result[path] = content;
					return Promise.resolve<void>(null);
				},

				listener: {
					onCompileSuccess: ()=> {
					},
					onCompileFailed: ()=> {
					}
				},

				builders: [new ReVIEW.Build.TextBuilder()],

				book: {
					contents: [
						{file: "ch01.re"},
						{file: "ch02.re"}
					]
				}
			});
		}).then(book=> {
			assert(book.parts.length === 1);

			var part = book.parts[0];
			assert(part.chapters.length === 2);
			part.chapters.forEach((chapter)=> {
				assert(!!chapter.root);
			});

			assert(part.chapters[0].process.symbols.length === 1);
			assert(part.chapters[1].process.symbols.length === 3);
		});
	});
});
