module.exports = function (review) {
	var ReVIEW = require("review.js");

	review.initConfig({

		builders: [new ReVIEW.Build.HtmlBuilder()],
		book: {
			contents: [
				"ch01.re",
				"ch02.re"
			]
		}
	});
};
