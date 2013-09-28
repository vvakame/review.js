///<reference path='libs/DefinitelyTyped/jasmine/jasmine.d.ts' />
///<reference path='../../main/typescript/libs/DefinitelyTyped/node/node.d.ts' />

///<reference path='../../main/typescript/Ignite.ts' />
///<reference path='../../main/typescript/builder/Builder.ts' />
///<reference path='../../main/typescript/builder/TextBuilder.ts' />
///<reference path='../../main/typescript/builder/HtmlBuilder.ts' />

"use strict";

describe("未解決のエラー", ()=> {
	describe("Builderのパース", ()=> {
		xit("listの中身の途中に改行を含んでいる", ()=> {
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
					read: function (path) {
						return files[path];
					},
					write: function (path, content) {
						result[path] = content;
					},

					compileSuccess: ()=> {
					},
					compileFailed: ()=> {
					},

					builders: [builder],

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
			var expected = "■H1■第1章　title\n\n◆→開始:リスト←◆\nリスト1.1　きゃぷしょん\nalert('hello');\n\n◆→終了:リスト←◆\n\n";

			//死なないパターンのexpected
			//var expected = "■H1■第1章　title\n\n◆→開始:リスト←◆\nリスト1.1　きゃぷしょん\nalert('hello');\n◆→終了:リスト←◆\n\n";


			expect(book.parts[1].chapters[0].findResultByBuilder(builder)).toBe(expected);
		});
	});

	describe("Ruby版ReVIEWとの出力差確認", () => {
		if (!ReVIEW.isNodeJS()) {
			return;
		}

		var exec = require("child_process").exec;

		function convertByRubyReVIEW(fileName:string, target:string, callback?:(result:string, error:any)=>void):void {
			var result:string;
			var error:any;
			var done = false;
			exec(
				"review-compile --target=" + target + " " + fileName + ".re",
				{
					cwd: "src/test/resources/valid",
					env: process.env
				},
				(err, stdout, stderr)=> {
					expect(error).toBeNull();
					result = stdout;
					error = err;
					done = true;
				}
			);
			waitsFor(()=> done, "ReVIEW is gone...");
			runs(()=> {
				if (callback) {
					callback(result, error);
				}
			});
		}

		// PhantomJS 環境下専用のテスト
		xdescribe("正しい構文のファイルが処理できること", ()=> {
			var fs = require("fs");

			var typeList:{ext:string;target:string;}[] = [
				{
					ext: "txt",
					target: "text"
				}
			];

			var ignoreFiles = [
				"block_dont_has_body.re",
				"ch01.re",
				"empty.re",
				"headline.re",
				"inline.re",
				"inline_nested.re"
			];

			var path = "src/test/resources/valid/";
			fs.readdirSync(path)
				.filter(file => file.indexOf(".re") !== -1 && !ignoreFiles.some(ignore => ignore === file))
				.forEach(file => {

					var baseName = file.substr(0, file.length - 3);

					typeList.forEach(typeInfo => {
						var targetFileName = path + baseName + "." + typeInfo.ext;
						it("ファイル:" + targetFileName, ()=> {
							var result:string = null;
							ReVIEW.start(review => {
								review.initConfig({
									read: (file)=> {
										return fs.readFileSync(path + file, "utf8");
									},
									write: (path, content) => {
										// TODO ここ来てない
										console.log("write");
										console.log(path);
										result = content;
									},

									listener: {
										onCompileSuccess: function (book) {
											result = book.parts[1].chapters[0].builderProcesses[0].result;
										},
										onCompileFailed: ()=> {
											// TODO fail() みたいなのなかったっけ…
											expect(true).toBeFalsy();
										}
									},

									builders: [new ReVIEW.Build.TextBuilder()],

									book: {
										preface: [
										],
										chapters: [
											file
										],
										afterword: [
										]
									}
								});
							});
							expect(result).not.toBeNull();

							if (!fs.existsSync(targetFileName)) {
								// Ruby版の出力ファイルがない場合、出力処理を行う
								convertByRubyReVIEW(baseName, typeInfo.target, (data, error) => {
									expect(error).toBeNull();
									fs.writeFileSync(targetFileName, data);

									var expected = fs.readFileSync(targetFileName, "utf8");
									expect(result).toBe(data);
								});
							} else {
								var expected = fs.readFileSync(targetFileName, "utf8");
								expect(result).toBe(expected);
							}
						});
					});
				});
		});
	});
});
