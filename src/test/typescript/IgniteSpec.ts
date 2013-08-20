///<reference path='libs/DefinitelyTyped/jasmine/jasmine.d.ts' />

///<reference path='../../main/typescript/libs/peg.js.d.ts' />

///<reference path='../../main/typescript/Ignite.ts' />

"use strict";

describe("ReVIEW構文の", ()=> {
	it("captionのテスト label無し", ()=> {
		var parser = new ReVIEW.Parser("= hoge");
		var root = parser.root;
		expect(root.childNodes.length).toBe(1);

		var chapter = root.childNodes[0];
		expect(chapter.childNodes.length).toBe(1);
		expect(chapter.type).toBe("block");
		expect(chapter.name).toBe("chapter");

		var caption = chapter.childNodes[0];
		expect(caption.childNodes.length).toBe(0);
		expect(caption.attributes.length).toBe(2);
		expect(caption.type).toBe("inline");
		expect(caption.name).toBe("caption");
		expect(caption.text).toBe("hoge");
		expect(caption.attributes[0]).toBe(1);
		expect(caption.attributes[1]).toBe("hoge");
	});

	it("captionのテスト label有り", ()=> {
		var parser = new ReVIEW.Parser("={fuga} hoge");
		var root = parser.root;
		expect(root.childNodes.length).toBe(1);

		var chapter = root.childNodes[0];
		expect(chapter.childNodes.length).toBe(1);
		expect(chapter.type).toBe("block");
		expect(chapter.name).toBe("chapter");

		var caption = chapter.childNodes[0];
		expect(caption.childNodes.length).toBe(0);
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
