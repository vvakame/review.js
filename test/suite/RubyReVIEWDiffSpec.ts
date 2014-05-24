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

	function convertByRubyReVIEW(fileName:string, target:string, callback?:(result:string, error:any)=>void):void {
		var result:string;
		var error:any;
		exec(
				"review-compile  --level=1 --target=" + target + " " + fileName + ".re",
			{
				cwd: "test/fixture/valid",
				env: process.env
			},
			(err:Error, stdout:NodeBuffer, stderr:NodeBuffer)=> {
				assert(!err);
				result = stdout.toString();
				error = err;
				if (callback) {
					callback(result, error);
				}
			}
		);
	}

	// PhantomJS 環境下専用のテスト
	describe("正しい構文のファイルが処理できること", ()=> {
		var fs = require("fs");

		var typeList:{ext:string;target:string;builder:()=>ReVIEW.Build.IBuilder;}[] = [
			{
				ext: "txt",
				target: "text",
				builder: ()=> new ReVIEW.Build.TextBuilder()
			},
			{
				ext: "html",
				target: "html",
				builder: ()=> new ReVIEW.Build.HtmlBuilder()
			}
		];

		var ignoreFiles = [
			"block.re", // ブロック構文にParagraphを持ち込んだ影響で
			"ch01.re", // lead, emplist がまだサポートされていない
			"empty.re", // empty への対応をまだ行っていない
			"headline.re", // プロセス終了しない謎があるので
			"inline.re", // tti がまだサポートされていない
			"inline_nested.re", // Ruby版はネストを許可しない
			"inline_with_newline.re", // Ruby版の処理が腐っている気がする
			"lead.re", // ブロック構文内でのParagraphの扱いがおかしいのを直していない
			"preface.re", // めんどくさいので
			"preproc.re", // めんどくさいので
			"single_comment.re" // #@# をまだサポートしていない
		];

		var path = "test/fixture/valid/";
		fs.readdirSync(path)
			.filter((file:string) => file.indexOf(".re") !== -1 && !ignoreFiles.some(ignore => ignore === file))
			.forEach((file:string) => {
				var baseName = file.substr(0, file.length - 3);

				typeList.forEach(typeInfo => {
					var targetFileName = path + baseName + "." + typeInfo.ext;
					it("ファイル:" + targetFileName, (done)=> {

						var s = Test.compileSingle(
							fs.readFileSync(path + file, "utf8"),
							{
								builders: [typeInfo.builder()]
							})
							.success();
						assert(s.result !== null);

						var assertResult = () => {
							var expected = fs.readFileSync(targetFileName, "utf8");
							assert(s.result === expected);
							done();
						};

						if (!fs.existsSync(targetFileName)) {
							// Ruby版の出力ファイルがない場合、出力処理を行う
							convertByRubyReVIEW(baseName, typeInfo.target, (data, error) => {
								console.log(error);
								assert(!error);
								fs.writeFileSync(targetFileName, data);

								assertResult();
							});
						} else {
							assertResult();
						}
					});
				});
			});
	});
});
