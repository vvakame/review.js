///<reference path='../../../typings/mocha/mocha.d.ts' />
///<reference path='../../../typings/assert/assert.d.ts' />

///<reference path='../../../lib/i18n/i18n.ts' />

describe("ReVIEW.i18nの", ()=> {
	"use strict";

	it("tで正しく文字列が取れること", ()=> {
		assert(ReVIEW.i18n.t("sample") === "こんちゃーす！");

		ReVIEW.i18n.setup("en");
		assert(ReVIEW.i18n.t("sample") === "Hello!");

		ReVIEW.i18n.setup("ja");
		assert(ReVIEW.i18n.t("builder.chapter", 1) === "第1章");
	});
});
