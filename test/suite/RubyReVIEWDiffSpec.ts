///<reference path='../../typings/mocha/mocha.d.ts' />
///<reference path='../../typings/assert/assert.d.ts' />

///<reference path='../../typings/node/node.d.ts' />

///<reference path='TestHelper.ts' />

///<reference path='../../lib/Main.ts' />
///<reference path='../../lib/builder/Builder.ts' />
///<reference path='../../lib/builder/TextBuilder.ts' />
///<reference path='../../lib/builder/HtmlBuilder.ts' />

"use strict";

describe("Ruby版ReVIEWとの出力差確認", () => {
	"use strict";

	if (!ReVIEW.isNodeJS()) {
		return;
	}

	var exec = require("child_process").exec;

	function convertByRubyReVIEW(fileName: string, target: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			exec(
				"review-compile  --level=1 --target=" + target + " " + fileName + ".re",
				{
					cwd: "test/fixture/valid",
					env: process.env
				},
				(err: Error, stdout: NodeBuffer, stderr: NodeBuffer) => {
					if (err) {
						reject(err);
						return;
					} else {
						resolve(stdout.toString());
					}
				}
				);
		});
	}

	// PhantomJS 環境下専用のテスト
	describe("正しい構文のファイルが処理できること", () => {
		var fs = require("fs");

		var typeList: { ext: string; target: string; builder: () => ReVIEW.Build.IBuilder; }[] = [
			{
				ext: "txt",
				target: "text",
				builder: () => new ReVIEW.Build.TextBuilder()
			},
			{
				ext: "html",
				target: "html",
				builder: () => new ReVIEW.Build.HtmlBuilder()
			}
		];

		var ignoreFiles = [
			"ch01.re", // lead, emplist がまだサポートされていない
			"empty.re", // empty への対応をまだ行っていない ファイル実体は存在していない
			"inline.re", // tti がまだサポートされていない < のエスケープとかも
			"inline_nested.re", // Ruby版はネストを許可しない
			"inline_with_newline.re", // Ruby版の処理が腐っている気がする
			"lead.re", // ブロック構文内でのParagraphの扱いがおかしいのを直していない
			"preface.re", // めんどくさいので
			"preproc.re", // めんどくさいので
			"single_comment.re" // #@# をまだサポートしていない
		];

		var path = "test/fixture/valid/";
		fs.readdirSync(path)
			.filter((file: string) => file.indexOf(".re") !== -1 && !ignoreFiles.some(ignore => ignore === file))
			.forEach((file: string) => {
			var baseName = file.substr(0, file.length - 3);

			typeList.forEach(typeInfo => {
				var targetFileName = path + baseName + "." + typeInfo.ext;
				it("ファイル:" + targetFileName, () => {
					var text = fs.readFileSync(path + file, "utf8");
					return Test.compile({
						basePath: __dirname + "/fixture/valid",
						read: path => Promise.resolve(text),
						builders: [typeInfo.builder()],
						book: {
							contents: [
								file
							]
						}
					})
						.then(s=> {
						var result: string = s.results[baseName + "." + typeInfo.ext];
						assert(result !== null);

						var assertResult = () => {
							var expected = fs.readFileSync(targetFileName, "utf8");
							assert(result === expected);
						};

						if (!fs.existsSync(targetFileName)) {
							// Ruby版の出力ファイルがない場合、出力処理を行う
							return convertByRubyReVIEW(baseName, typeInfo.target)
								.then(data=> {
								fs.writeFileSync(targetFileName, data);

								assertResult();
								return true;
							});
						} else {
							assertResult();
							return Promise.resolve(true);
						}
					});
				});
			});
		});
	});
});
