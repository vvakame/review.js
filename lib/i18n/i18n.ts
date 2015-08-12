///<reference path='../../typings/i18next/i18next.d.ts' />

/**
 * 国際化対応のためのモジュール。デフォルトでは日本語。
 */

"use strict";

import {isNodeJS} from "../utils/utils";

import {en} from "./en";
import {ja} from "./ja";

/* tslint:disable:no-use-before-declare */

let i18next: I18nextStatic;

export function setup(lang = "ja") {
	"use strict";

	i18next.init({
		lng: lang,
		fallbackLng: "ja",
		resStore: {
			"ja": { translation: ja },
			"en": { translation: en }
		}
	});
}

export function t(str: string, ...args: any[]): string {
	"use strict";

	return i18next.t(str, { postProcess: "sprintf", sprintf: args });
}

if (isNodeJS()) {
	i18next = require("i18next");
} else {
	i18next = (<any>window).i18n;
}

/* tslint:enable:no-use-before-declare */

setup();
