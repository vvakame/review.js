///<reference path='../libs/DefinitelyTyped/mocha/mocha.d.ts' />
///<reference path='../libs/DefinitelyTyped/expectations/expectations.d.ts' />

///<reference path='../../../main/typescript/i18n/i18n.ts' />

describe("ReVIEW.i18nの", ()=> {
	it("tで正しく文字列が取れること", ()=> {
		expect(ReVIEW.i18n.t("sample")).toBe("こんちゃーす！");

		ReVIEW.i18n.setup("en");
		expect(ReVIEW.i18n.t("sample")).toBe("Hello!");

		ReVIEW.i18n.setup("ja");
		expect(ReVIEW.i18n.t("builder.chapter", 1)).toBe("第1章");
	});
});
