///<reference path='libs/DefinitelyTyped/jasmine/jasmine.d.ts' />

///<reference path='../../main/typescript/Builder.ts' />

describe("ReVIEW.Buildの", ()=> {
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

	describe("DefaultBuilderの動作の確認として", ()=> {
		it("", ()=> {
			var files:any = {
				"./ch01.re": "= hoge\n== fuga\n=== moge\n== piyo\n=== foo\n= bar\n"
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
							"ch01.re"
						],
						afterword: [
						]
					}
				});
			});
			// TODO 想定より改行が多い… みた感じLevel3以降でおかしくなってる？
			// var expected = "■H1■第1章　hoge\n\n■H2■1.1　fuga\n\n■H3■moge\n\n■H2■1.2　piyo\n\n■H3■foo\n\n■H1■第2章　bar\n";
			var expected = "■H1■第1章　hoge\n\n■H2■1.1　fuga\n\n■H3■moge\n\n\n\n■H2■1.2　piyo\n\n■H3■foo\n\n\n\n\n■H1■第2章　bar\n\n\n";
			expect(book.parts[1].chapters[0].process.result).toBe(expected);
		});
	});
});
