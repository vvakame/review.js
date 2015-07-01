///<reference path='../../typings/i18next/i18next.d.ts' />

///<reference path='../utils/Utils.ts' />
///<reference path='ja.ts' />
///<reference path='en.ts' />

/**
 * 国際化対応のためのモジュール。デフォルトでは日本語。
 */
module ReVIEW.i18n {
	"use strict";

	/* tslint:disable:no-use-before-declare */

	export function setup(lang = "ja") {
		if (typeof (<any>i18next).backend !== "undefined") {
			(<any>i18next).backend({
				fetchOne: (lng: any, ns: any, func: Function) => {
					func(null, data[lng] || data[lang]);
				}
			});
			i18next.init({ lng: lang });
		} else {
			i18next.init({
				lng: lang,
				customLoad: function(lng: any, ns: any, options: any, loadComplete: Function) {
					loadComplete(null, data[lng] || data["ja-JP"]);
				}
			});
		}
	}

	export function t(str: string, ...args: any[]): string {
		return i18next.t(str, { postProcess: "sprintf", sprintf: args });
	}

	var i18next: I18nextStatic;

	if (ReVIEW.isNodeJS()) {
		i18next = require("i18next");
	} else {
		i18next = (<any>window).i18n;
	}

	var data: { [lang: string]: any; } = {
		"ja": ReVIEW.ja,
		"en": ReVIEW.en
	};

	/* tslint:enable:no-use-before-declare */

	setup();
}
