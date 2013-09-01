///<reference path='libs/DefinitelyTyped/jasmine/jasmine.d.ts' />

///<reference path='../../main/typescript/Model.ts' />

describe("ReVIEW.Controllerの", ()=> {
	it("処理が正しく動くこと", ()=> {
		var files:any = {
			"./ch01.re": "={ch01} ちゃぷたーだよ\n今日の晩ご飯はラフテーだった",
			"./ch02.re": "= チャプター2\n参照 @<hd>{ch01} とか\n//list[hoge][fuga]{\ntest\n//}"
		};
		var result:any = {
		};
		var book = ReVIEW.start((review)=> {
			review.initConfig({
				read: function (path) {
					return files[path];
				},
				write: function (path, content) {
					result[path] = content;
				},

				book: {
					preface: [
					],
					chapters: [
						"ch01.re",
						"ch02.re"
					],
					afterword: [
					]
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
