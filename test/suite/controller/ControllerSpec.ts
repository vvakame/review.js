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
		var book = ReVIEW.start(review => {
			review.initConfig({
				read: (path:string) => {
					return files[path];
				},
				write: (path:string, content:any) => {
					result[path] = content;
				},

				listener: {
					onCompileSuccess: ()=> {
					},
					onCompileFailed: ()=> {
					}
				},

				builders: [new ReVIEW.Build.TextBuilder()],

				book: {
					preface: new Array<string>(),
					chapters: [
						"ch01.re",
						"ch02.re"
					],
					afterword: new Array<string>()
				}
			});
		});

		assert(book.parts.length === 3);
		assert(book.parts[0].chapters.length === 0);
		assert(book.parts[2].chapters.length === 0);

		var part = book.parts[1];
		assert(part.chapters.length === 2);
		part.chapters.forEach((chapter)=> {
			assert(!!chapter.root);
		});

		assert(part.chapters[0].process.symbols.length === 1);
		assert(part.chapters[1].process.symbols.length === 3);
	});
});
