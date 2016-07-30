import * as assert from "power-assert";

import {deepAssign} from "../../../lib/i18n/utils";

describe("ReVIEW.i18nの", () => {
    "use strict";

    it("deepAssignが正しく動くこと", () => {
        {
            let result = deepAssign({}, { a: "B" }, { a: "C" });
            assert(Object.keys(result).length === 1);
            assert(result.a === "C");
        }
        {
            let result = deepAssign({}, { a: { b: "c" } }, { a: { d: "e" } });
            assert(Object.keys(result).length === 1);
            assert(result.a.b === "c");
            assert(result.a.d === "e");
        }
    });
});
