module.exports = function (review) {
	review.initConfig({
		builders: [new review.builders.HtmlBuilder()],
		book: {
			contents: [
				"ch01.re",
				"ch02.re"
			]
		}
	});
};
