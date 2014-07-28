///<reference path='../../typings/mocha/mocha.d.ts' />
///<reference path='../../typings/assert/assert.d.ts' />

///<reference path='../../typings/node/node.d.ts' />

///<reference path='../../lib/Main.ts' />
///<reference path='../../lib/builder/Builder.ts' />
///<reference path='../../lib/builder/TextBuilder.ts' />
///<reference path='../../lib/builder/HtmlBuilder.ts' />

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
			return ReVIEW.start((review)=> {
				review.initConfig({
					read: (path:string) => {
						return Promise.resolve(files[path]);
					},
					write: (path:string, content:string) => {
						result[path] = content;
						return Promise.resolve<void>(null);
					},

					compileSuccess: ()=> {
					},
					compileFailed: ()=> {
					},

					builders: [builder],

					book: {
						chapters: [
							"ch01.re"
						]
					}
				});
			}).then(book=> {
				var expected = "■H1■第1章　title\n\n◆→開始:リスト←◆\nリスト1.1　きゃぷしょん\nalert('hello');\n\n◆→終了:リスト←◆\n\n";

				//死なないパターンのexpected
				//var expected = "■H1■第1章　title\n\n◆→開始:リスト←◆\nリスト1.1　きゃぷしょん\nalert('hello');\n◆→終了:リスト←◆\n\n";

				assert(book.parts[0].chapters[0].findResultByBuilder(builder) === expected);
			});
		});
	});
});
