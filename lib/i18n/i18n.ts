"use strict";

import { deepAssign } from "./utils";
import { isNodeJS } from "../utils/utils";

import { en } from "./en";
import { ja } from "./ja";

let langs: any = {
    ja: ja,
    en: en,
};

let resource: any = deepAssign({}, langs.en, langs.ja);

export function setup(lang = "ja") {
    "use strict";

    resource = deepAssign({}, langs.en, langs.ja, langs[lang]);
}

let sprintf: any;
if (typeof window !== "undefined" && (<any>window).sprintf) {
    sprintf = (<any>window).sprintf;
} else {
    sprintf = require("sprintf-js").sprintf;
}

if (isNodeJS != null) {
    isNodeJS(); // TODO utilsをi18n.ts内で使わないと実行時エラーになる
}

export function t(str: string, ...args: any[]): string {
    "use strict";

    let parts = str.split(".");
    let base = resource;
    parts.forEach(part => {
        base = base[part];
    });
    if (typeof base !== "string") {
        throw new Error(`unknown key: ${str}`);
    }

    return sprintf(base, ...args);
}

setup();
