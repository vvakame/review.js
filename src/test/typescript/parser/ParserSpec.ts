///<reference path='../libs/DefinitelyTyped/mocha/mocha.d.ts' />
///<reference path='../libs/DefinitelyTyped/expectations/expectations.d.ts' />

///<reference path='../../../main/typescript/libs/DefinitelyTyped/node/node.d.ts' />

///<reference path='../../../main/typescript/libs/peg.js.d.ts' />

///<reference path='../TestHelper.ts' />

///<reference path='../../../main/typescript/utils/Utils.ts' />
///<reference path='../../../main/typescript/Ignite.ts' />

"use strict";

function updateIfSyntaxError(e:any) {
	if (e instanceof PEG.SyntaxError) {
		var se:PEG.SyntaxError = e;
		var additionalInfo = "raised: offset=" + se.offset + ", line=" + se.line + ", column=" + se.column;
		se.message = additionalInfo + ". " + se.message;
	}
}

describe("ReVIEW構文の", ()=> {
	if (ReVIEW.isNodeJS()) {
		var fs = require("fs");
		// PhantomJS 環境下専用のテスト
		describe("正しい構文のファイルが処理できること", ()=> {
			var ignoreFiles = [
				"block_dont_has_body.re", // noindent がまだサポートされていない
				"ch01.re", // lead, emplist がまだサポートされていない
				"headline.re", // なんか落ちる
				"inline.re" // tti がまだサポートされていない
			];

			var path = "src/test/resources/valid/";
			var files = fs.readdirSync(path)
					.filter((file:string) => file.indexOf(".re") !== -1 && !ignoreFiles.some(ignore => ignore === file))
				;

			files
				.filter((file:string) => file.indexOf(".re") !== -1)
				.forEach((file:string)=> {
					var astFilePath = path + file.substr(0, file.length - 3) + ".ast";
					it("ファイル:" + file, ()=> {
						try {
							var s = Test.compileSingle(
								fs.readFileSync(path + file, "utf8"),
								{
									builders: [new ReVIEW.Build.TextBuilder()]
								})
								.success();
							expect(s.result).not.toBeNull();

							var ast = JSON.stringify(s.book.parts[0].chapters[0].root, null, 2);
							if (!fs.existsSync(astFilePath)) {
								// ASTファイルが無い場合、現時点で生成されるASTを出力する
								fs.writeFileSync(astFilePath, ast);
							}
							var expectedAST = fs.readFileSync(astFilePath, "utf8");
							expect(JSON.parse(expectedAST)).toEqual(JSON.parse(ast));
						} catch (e) {
							updateIfSyntaxError(e);
							throw e;
						}
					});
				});
		});

		describe("正しくない構文のファイルが処理できること", ()=> {
			var path = "src/test/resources/invalid/";
			var files = fs.readdirSync(path);
			files
				.filter((file:string) => file.indexOf(".re") !== -1)
				.forEach((file:string)=> {
					it("ファイル:" + file, ()=> {
						var data = fs.readFileSync(path + file, "utf8");
						try {
							ReVIEW.Parse.parse(data);
							throw new Error("正しく処理できてしまった");
						} catch (e) {
							if (e instanceof PEG.SyntaxError) {
								// ok
							} else {
								throw e;
							}
						}
					});
				});
		});
	}

	describe("正常に処理ができる文字列を与える", ()=> {
		var strings = [
			"= 今日のお昼ごはん\n\n断固としてカレーライス！\n",
			"= ブロック要素のテスト\n\n//list[hoge][fuga]{\nvar hoge = confirm(\"test\");\n\n// JS comment\n//}",
			"=[hoge]{fuga} 両方付き",
			"= headline\n@<kw>{hoge,fuga}\n",
			"= ＼(^o^)／\n\n#@# コメント\n",
			"= use review-preproc\n//list[hoge][]{\n#@mapfile(bin/grammer.js)\n#@end\n//}",
			"= headline\nというように、型を @<tti>{<} と　@<tti>{>} で囲んで式 expression の先頭に置くと\n",
			"= @がinlineじゃなく出てくる\n\n例えば @Override アノテーションの話とか。",
			"= 1つ目\n= 2つ目\n\n段落1\n\n段落2\n段落2続き\n\n段落3\n= 3つ目",
			"= level 1\n== level 2\n===level 3\n====     level 4\n\n=[hoge] []付き\n={fuga} {}付き\n=[hoge]{fuga} 両方付き\n",
			"= ulist\n\n * level 1\n ** level 2\n *** level 3",
			"= olist\n\n 1. No. 1\n 2. No. 2\n 3. No. 3\n",
			"= dlist\n\n: hoge\n  これはマジマッハ\n\n: fuga\n	これはマジファンキー\n"
		];
		strings.forEach((str)=> {
			it("try: " + str.substr(0, 15), ()=> {
				try {
					var result = ReVIEW.Parse.parse(str);
					// console.log(result);
					// console.log(JSON.stringify(result));
				} catch (e) {
					updateIfSyntaxError(e);
					throw e;
				}
			});
		});
	});

	describe("SyntaxTreeクラスの", ()=> {
		it("JSON.stringifyで無限再起にならないこと", ()=> {
			var syntax = new ReVIEW.Parse.SyntaxTree({
				line: 0, column: 0, offset: 0, endPos: 0,
				syntax: "SinglelineComment",
				content: ""
			});
			// syntax.parentNode = syntax;
			var json = JSON.stringify(syntax);
			expect(json).toBe("{\"ruleName\":\"SinglelineComment\",\"offset\":0,\"line\":0,\"column\":0,\"endPos\":0}");
		});
	});
});
