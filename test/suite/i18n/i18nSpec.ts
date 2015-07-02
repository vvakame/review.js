///<reference path='../../../typings/mocha/mocha.d.ts' />
///<reference path='../../../typings/assert/assert.d.ts' />

import {t, setup} from "../../../lib/i18n/i18n";

describe("ReVIEW.i18nの", () => {
	"use strict";

	it("tで正しく文字列が取れること", () => {
		assert(t("sample") === "こんちゃーす！");

		setup("en");
		assert(t("sample") === "Hello!");

		setup("ja");
		assert(t("builder.chapter", 1) === "第1章");
	});
});
