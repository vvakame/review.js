///<reference path='../../typings/mocha/mocha.d.ts' />
///<reference path='../../typings/assert/assert.d.ts' />

///<reference path='../../typings/node/node.d.ts' />

"use strict";

import {start} from "../../lib/index";

import {TextBuilder} from "../../lib/builder/textBuilder";

describe("未解決のエラー", () => {
	"use strict";

	describe("Builderのパース", () => {
		it.skip("listの中身の途中に改行を含んでいる", () => {
			var files: any = {
				"./ch01.re": "= title\n//list[hoge][きゃぷしょん]{\nalert('hello');\n\n//}\n"

				//死なないパターン
				//"./ch01.re": "= title\n//list[hoge][きゃぷしょん]{\nalert('hello');\n//}\n"
			};
			var result: any = {
			};
			var builder = new TextBuilder();
			return start((review) => {
				review.initConfig({
					read: (path: string) => {
						return Promise.resolve(files[path]);
					},
					write: (path: string, content: string) => {
						result[path] = content;
						return Promise.resolve<void>(null);
					},

					compileSuccess: () => {
					},
					compileFailed: () => {
					},

					builders: [builder],

					book: {
						contents: [
							{ file: "ch01.re" }
						]
					}
				});
			}).then(book=> {
				var expected = "■H1■第1章　title\n\n◆→開始:リスト←◆\nリスト1.1　きゃぷしょん\nalert('hello');\n\n◆→終了:リスト←◆\n\n";

				//死なないパターンのexpected
				//var expected = "■H1■第1章　title\n\n◆→開始:リスト←◆\nリスト1.1　きゃぷしょん\nalert('hello');\n◆→終了:リスト←◆\n\n";

				assert(book.contents[0].findResultByBuilder(builder) === expected);
			});
		});
	});
});
