// https://github.com/TypeStrong/dts-bundle/issues/21 dts-bundleの新しいのがリリースできないので誤魔化す わかめの環境でしか動かない
var dts = require("../dts-bundle");
dts.bundle({
	name: "review.js",
	main: "lib/index.d.ts",
	baseDir: "",
	out: "./dist/review.js.d.ts",
	prefix: '',
	exclude: function () {return false;},
	verbose: true
});
