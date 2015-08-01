// polyfillの処理

// Node.js用対応
if (typeof Promise === "undefined" && typeof global !== "undefined") {
	global.Promise = require("ypromise");
}
