///<reference path='libs/DefinitelyTyped/i18next/i18next.d.ts' />

///<reference path='Utils.ts' />
///<reference path='i18n/ja.ts' />
///<reference path='i18n/en.ts' />

module ReVIEW {

	/**
	 * 国際化対応のためのモジュール。デフォルトでは日本語。
	 */
	export module i18n {
		export function setup(lang = "ja") {
			if (typeof (<any>i18next).backend !== "undefined") {
				(<any>i18next).backend({
					fetchOne: (lng, ns, func) => {
						func(null, data[lng] || data[lang]);
					}
				});
				i18next.init({ lng: lang });
			} else {
				i18next.init({
					lng: lang,
					customLoad: function (lng, ns, options, loadComplete) {
						loadComplete(null, data[lng] || data["ja-JP"]);
					}
				});
			}
		}

		export function t(str:string, ...args:any[]):string {
			return i18next.t(str, { postProcess: "sprintf", sprintf: args });
		}

		var i18next:I18nextStatic;

		if (ReVIEW.isNodeJS()) {
			i18next = require("i18next");
		} else {
			i18next = (<any>window).i18n;
		}

		var data = {
			"ja": ReVIEW.ja,
			"en": ReVIEW.en
		};

		setup();
	}
}
