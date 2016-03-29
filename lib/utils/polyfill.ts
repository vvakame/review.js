// polyfillの処理

// Node.js用対応
if (typeof Promise === "undefined" && typeof global !== "undefined") {
    try {
        global.Promise = require("es6-promise");
    } catch (e) { }
}
if (typeof Promise === "undefined" && typeof global !== "undefined") {
    try {
        global.Promise = require("ypromise");
    } catch (e) { }
}
