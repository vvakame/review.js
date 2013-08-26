///<reference path='libs/DefinitelyTyped/jasmine/jasmine.d.ts' />
///<reference path='libs/DefinitelyTyped/node/node.d.ts' />

///<reference path='../../main/typescript/libs/peg.js.d.ts' />

///<reference path='../../main/typescript/Ignite.ts' />

"use strict";

function updateIfSyntaxError(e:any) {
	if (e instanceof PEG.SyntaxError) {
		var se:PEG.SyntaxError = e;
		var additionalInfo = "raised: offset=" + se.offset + ", line=" + se.line + ", column=" + se.column;
		se.message = additionalInfo + ". " + se.message;
	}
}

describe("ReVIEW構文の", ()=> {
	if (typeof require !== "undefined") {
		var fs = require("fs");
		// PhantomJS 環境下専用のテスト
		describe("正しい構文のファイルが処理できること", ()=> {
			var path = "src/test/resources/valid/";
			var files = fs.readdirSync(path);
			files.filter((file) => file.indexOf(".re") !== -1).forEach((file)=> {
				it("ファイル:" + file, ()=> {
					var data = fs.readFileSync(path + file, "utf8");
					try {
						var result = ReVIEW.Parser.parse(data);
						// console.log(result);
						// console.log(JSON.stringify(result));
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
			files.filter((file) => file.indexOf(".re") !== -1).forEach((file)=> {
				it("ファイル:" + file, ()=> {
					var data = fs.readFileSync(path + file, "utf8");
					try {
						ReVIEW.Parser.parse(data);
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
			"= level 1\n== level 2\n===level 3\n====     level 4\n\n=[hoge] []付き\n={fuga} {}付き\n=[hoge]{fuga} 両方付き\n"
		];
		strings.forEach((str)=> {
			it("try: " + str.substr(0, 15), ()=> {
				try {
					var result = ReVIEW.Parser.parse(str);
					// console.log(result);
					// console.log(JSON.stringify(result));
				} catch (e) {
					updateIfSyntaxError(e);
					throw e;
				}
			});
		});
	});
});
