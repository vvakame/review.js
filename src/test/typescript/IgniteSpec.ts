///<reference path='libs/DefinitelyTyped/jasmine/jasmine.d.ts' />
///<reference path='libs/DefinitelyTyped/node/node.d.ts' />

///<reference path='../../main/typescript/libs/peg.js.d.ts' />

///<reference path='../../main/typescript/Ignite.ts' />

"use strict";

describe("ReVIEW構文の", ()=> {
	if (typeof require !== "undefined") {
		var fs = require("fs");
		// PhantomJS 環境下専用のテスト
		describe("正しい構文のファイルが処理できること", ()=> {
			var path = "src/test/resources/valid/";
			var files = fs.readdirSync(path);
			files.forEach((file)=> {
				it("ファイル:" + file, ()=> {
					var data = fs.readFileSync(path + file, "utf8");
					new ReVIEW.Parser(data);
				});
			});
		});

		describe("正しくない構文のファイルが処理できること", ()=> {
			var path = "src/test/resources/invalid/";
			var files = fs.readdirSync(path);
			files.forEach((file)=> {
				it("ファイル:" + file, ()=> {
					var data = fs.readFileSync(path + file, "utf8");
					try {
						new ReVIEW.Parser(data);
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

	it("テスト0件エラー避け", ()=> {
		// new ReVIEW.Parser("= 今日のお昼ごはん\n\n断固としてカレーライス！\n");
	});

	xit("captionのテスト label無し", ()=> {
		var parser = new ReVIEW.Parser("= hoge");
		var root = parser.root;
		expect(root.childNodes.length).toBe(1);

		var chapter = root.childNodes[0];
		expect(chapter.childNodes.length).toBe(1);
		expect(chapter.type).toBe("block");
		expect(chapter.name).toBe("chapter");

		var caption = chapter.childNodes[0];
		expect(caption.attributes.length).toBe(2);
		expect(caption.type).toBe("inline");
		expect(caption.name).toBe("caption");
		expect(caption.text).toBe("hoge");
		expect(caption.attributes[0]).toBe(1);
		expect(caption.attributes[1]).toBe("hoge");
	});

	xit("captionのテスト label有り", ()=> {
		var parser = new ReVIEW.Parser("={fuga} hoge");
		var root = parser.root;
		expect(root.childNodes.length).toBe(1);

		var chapter = root.childNodes[0];
		expect(chapter.childNodes.length).toBe(1);
		expect(chapter.type).toBe("block");
		expect(chapter.name).toBe("chapter");

		var caption = chapter.childNodes[0];
		expect(caption.attributes.length).toBe(3);
		expect(caption.type).toBe("inline");
		expect(caption.name).toBe("caption");
		expect(caption.label).toBe("fuga");
		expect(caption.text).toBe("hoge");
		expect(caption.attributes[0]).toBe(1);
		expect(caption.attributes[1]).toBe("fuga");
		expect(caption.attributes[2]).toBe("hoge");
	});

	xit("captionのテスト tag&label有り", ()=> {
		var parser = new ReVIEW.Parser("=[piyo]{fuga} hoge");
		var root = parser.root;
		expect(root.childNodes.length).toBe(1);

		var chapter = root.childNodes[0];
		expect(chapter.childNodes.length).toBe(1);
		expect(chapter.type).toBe("block");
		expect(chapter.name).toBe("chapter");

		var caption = chapter.childNodes[0];
		expect(caption.attributes.length).toBe(3);
		expect(caption.type).toBe("inline");
		expect(caption.name).toBe("caption");
		expect(caption.label).toBe("fuga");
		expect(caption.text).toBe("hoge");
		expect(caption.attributes[0]).toBe(1);
		expect(caption.attributes[1]).toBe("fuga");
		expect(caption.attributes[2]).toBe("hoge");
	});

	xit("singlelineComment", ()=> {
		var parser = new ReVIEW.Parser("=hoge\n#@ fuga\npiyo");
		var root = parser.root;
		expect(root.childNodes.length).toBe(1);

		var chapter = root.childNodes[0];
		console.log(chapter.toString());
		expect(chapter.childNodes.length).toBe(3);
		expect(chapter.type).toBe("block");
		expect(chapter.name).toBe("chapter");

		var caption = chapter.childNodes[0];
		expect(caption.attributes.length).toBe(3);
		expect(caption.type).toBe("inline");
		expect(caption.name).toBe("caption");
		expect(caption.label).toBe("fuga");
		expect(caption.text).toBe("hoge");
		expect(caption.attributes[0]).toBe(1);
		expect(caption.attributes[1]).toBe("fuga");
		expect(caption.attributes[2]).toBe("hoge");
	});
});
