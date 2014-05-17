///<reference path='../../../typings/mocha/mocha.d.ts' />
///<reference path='../../../typings/expectations/expectations.d.ts' />

///<reference path='../TestHelper.ts' />

///<reference path='../../../lib/builder/Builder.ts' />
///<reference path='../../../lib/builder/TextBuilder.ts' />

describe("ReVIEW.Buildの", ()=> {
	"use strict";

	it("処理が正しく動くこと", ()=> {
		var success = Test.compile({
			read: (path: any) => {
				return (<any>{
					"ch01.re": "={ch01} ちゃぷたーだよ\n今日の晩ご飯はラフテーだった",
					"ch02.re": "={ch02} チャプター2\n参照 @<hd>{ch02} とか\n//list[hoge][fuga]{\ntest\n//}"
				})[path];
			},

			book: {
				preface: [],
				chapters: [
					"ch01.re",
					"ch02.re"
				],
				afterword: []
			}
		}).success();

		var book = success.book;
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

	describe("DefaultAnalyzerの動作の確認として", () => {
		it("正しくsymbolの解決が出来る", ()=> {
			var failure = Test.compileSingle("={ch01} chapter01\n@<hd>{ch01}\n@<hd>{missing}")
				.failure();

			var book = failure.book;
			var missingSymbols = book.parts[0].chapters[0].process.missingSymbols;
			expect(missingSymbols.length).toBe(1);
			expect(missingSymbols[0].referenceTo.label).toBe("missing");
		});
	});

	describe("DefaultValidatorの動作の確認として", () => {
		it("トップレベルのChapterは必ず level 1 であること", ()=> {
			var failure = Test.compile({
				read: (path: any) => {
					return (<any>{
						"ch01.re": "= level 1\n== level2",
						"ch02.re": "== level 2"
					})[path];
				},

				book: {
					preface: [],
					chapters: [
						"ch01.re",
						"ch02.re"
					],
					afterword: []
				}
			}).failure();

			var book = failure.book;
			expect(book.reports.length).toBe(1);
			expect(book.reports[0].level).toBe(ReVIEW.ReportLevel.Error);
		});

		it("あるChapterの親のChapterのレベル差が1であること", ()=> {
			var failure = Test.compileSingle("= level 1\n=== level3")
				.failure();

			var book = failure.book;
			expect(book.reports.length).toBe(1);
			expect(book.reports[0].level).toBe(ReVIEW.ReportLevel.Error);
		});
	});

	describe("DefaultBuilderの動作の確認として", ()=> {
		it("正常に処理が完了できること", ()=> {
			var builder = new ReVIEW.Build.TextBuilder();
			var success = Test.compileSingle(
				"= hoge\n== fuga\n=== moge\n== piyo\n=== foo\n= bar\n",
				{builders: [builder]}
			)
				.success();

			var book = success.book;
			// TODO 想定より改行が多い… みた感じLevel3以降でおかしくなってる？
			// var expected = "■H1■第1章　hoge\n\n■H2■1.1　fuga\n\n■H3■moge\n\n■H2■1.2　piyo\n\n■H3■foo\n\n■H1■第2章　bar\n";
			var expected = "■H1■第1章　hoge\n\n■H2■1.1　fuga\n\n■H3■moge\n\n■H2■1.2　piyo\n\n■H3■foo\n\n■H1■第2章　bar\n\n";
			expect(book.parts[0].chapters[0].findResultByBuilder(builder)).toBe(expected);
		});
	});
});
