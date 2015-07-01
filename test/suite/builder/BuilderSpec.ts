///<reference path='../../../typings/mocha/mocha.d.ts' />
///<reference path='../../../typings/assert/assert.d.ts' />

///<reference path='../TestHelper.ts' />

///<reference path='../../../lib/builder/Builder.ts' />
///<reference path='../../../lib/builder/TextBuilder.ts' />

describe("ReVIEW.Buildの", () => {
	"use strict";

	it("処理が正しく動くこと", () => {
		return Test.compile({
			read: (path: any) => {
				return Promise.resolve((<any>{
					"ch01.re": "={ch01} ちゃぷたーだよ\n今日の晩ご飯はラフテーだった",
					"ch02.re": "={ch02} チャプター2\n参照 @<hd>{ch02} とか\n//list[hoge][fuga]{\ntest\n//}"
				})[path]);
			},

			book: {
				contents: [
					{ file: "ch01.re" },
					{ file: "ch02.re" }
				]
			}
		}).then(success=> {
			var book = success.book;

			assert(book.contents.length === 2);
			book.contents.forEach(chunk=> {
				assert(!!chunk.tree.ast);
			});

			assert(book.contents[0].process.symbols.length === 1);
			assert(book.contents[1].process.symbols.length === 3);
		});
	});

	describe("DefaultAnalyzerの動作の確認として", () => {
		it("正しくsymbolの解決が出来る", () => {
			return Test.compileSingle("={ch01} chapter01\n@<hd>{ch01}\n@<hd>{missing}")
				.then(failure=> {
				var book = failure.book;
				var missingSymbols = book.contents[0].process.missingSymbols;
				assert(missingSymbols.length === 1);
				assert(missingSymbols[0].referenceTo.label === "missing");
			});
		});
	});

	describe("DefaultValidatorの動作の確認として", () => {
		it("トップレベルのChapterは必ず level 1 であること", () => {
			return Test.compile({
				read: (path: any) => {
					return Promise.resolve((<any>{
						"ch01.re": "= level 1\n== level2",
						"ch02.re": "== level 2"
					})[path]);
				},

				book: {
					contents: [
						{ file: "ch01.re" },
						{ file: "ch02.re" }
					]
				}
			}).then(failure=> {
				var book = failure.book;
				assert(book.reports.length === 1);
				assert(book.reports[0].level === ReVIEW.ReportLevel.Error);
			});
		});
	});

	describe("DefaultBuilderの動作の確認として", () => {
		it("正常に処理が完了できること", () => {
			var builder = new ReVIEW.Build.TextBuilder();
			return Test.compileSingle(
				"= hoge\n== fuga\n=== moge\n== piyo\n=== foo\n= bar\n",
				{ builders: [builder] }
				)
				.then(success=> {
				var book = success.book;
				var expected = "■H1■第1章　hoge\n\n■H2■fuga\n\n■H3■moge\n\n■H2■piyo\n\n■H3■foo\n\n■H1■第2章　bar\n\n";
				assert(book.contents[0].findResultByBuilder(builder) === expected);
			});
		});
	});
});
