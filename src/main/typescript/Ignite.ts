///<reference path='libs/DefinitelyTyped/node/node.d.ts' />

///<reference path='Utils.ts' />
///<reference path='Parser.ts' />

if (ReVIEW.isNodeJS()) {
	var program = require("commander");
	program
		.version("TODO", "-v, --version");

	// <hoge> は required, [hoge] は optional
	program
		.command("compile <document>")
		.description("compile ReVIEW document")
		.option("--ast", "output JSON format abstract syntax tree")
		.option("-t, --target <target>", "output format of document")
		.action(function (document, options) {
			var ast = options.ast || false;
			// TODO
		});

	// grunt test で動かれても困るので
	if (process.argv[0].indexOf("review") !== -1) {
		program.parse(process.argv);
	}
}
