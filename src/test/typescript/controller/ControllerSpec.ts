///<reference path='../../../main/typescript/libs/typings/mocha/mocha.d.ts' />
///<reference path='../../../main/typescript/libs/typings/expectations/expectations.d.ts' />

///<reference path='../../../main/typescript/model/CompilerModel.ts' />
///<reference path='../../../main/typescript/builder/TextBuilder.ts' />

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

		expect(book.parts.length).toBe(3);
		expect(book.parts[0].chapters.length).toBe(0);
		expect(book.parts[2].chapters.length).toBe(0);

		var part = book.parts[1];
		expect(part.chapters.length).toBe(2);
		part.chapters.forEach((chapter)=> {
			expect(chapter.root).toBeDefined();
		});

		expect(part.chapters[0].process.symbols.length).toBe(1);
		expect(part.chapters[1].process.symbols.length).toBe(3);
	});
});
