///<reference path='libs/DefinitelyTyped/mocha/mocha.d.ts' />
///<reference path='libs/DefinitelyTyped/expectations/expectations.d.ts' />

///<reference path='../../main/typescript/libs/DefinitelyTyped/node/node.d.ts' />

///<reference path='../../main/typescript/Ignite.ts' />
///<reference path='../../main/typescript/builder/Builder.ts' />
///<reference path='../../main/typescript/builder/TextBuilder.ts' />
///<reference path='../../main/typescript/builder/HtmlBuilder.ts' />

"use strict";

describe("未解決のエラー", ()=> {
	"use strict";

	describe("Builderのパース", ()=> {
		it.skip("listの中身の途中に改行を含んでいる", ()=> {
			var files:any = {
				"./ch01.re": "= title\n//list[hoge][きゃぷしょん]{\nalert('hello');\n\n//}\n"

				//死なないパターン
				//"./ch01.re": "= title\n//list[hoge][きゃぷしょん]{\nalert('hello');\n//}\n"
			};
			var result:any = {
			};
			var builder = new ReVIEW.Build.TextBuilder();
			var book = ReVIEW.start((review)=> {
				review.initConfig({
					read: (path:string) => {
						return files[path];
					},
					write: (path:string, content:any) => {
						result[path] = content;
					},

					compileSuccess: ()=> {
					},
					compileFailed: ()=> {
					},

					builders: [builder],

					book: {
						chapters: [
							"ch01.re"
						],
					}
				});
			});
			var expected = "■H1■第1章　title\n\n◆→開始:リスト←◆\nリスト1.1　きゃぷしょん\nalert('hello');\n\n◆→終了:リスト←◆\n\n";

			//死なないパターンのexpected
			//var expected = "■H1■第1章　title\n\n◆→開始:リスト←◆\nリスト1.1　きゃぷしょん\nalert('hello');\n◆→終了:リスト←◆\n\n";

			expect(book.parts[0].chapters[0].findResultByBuilder(builder)).toBe(expected);
		});
	});
});
