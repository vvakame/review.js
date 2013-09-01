///<reference path='libs/DefinitelyTyped/node/node.d.ts' />

///<reference path='Utils.ts' />
///<reference path='Walker.ts' /> // Walker が import で Parser.ts に実行順序依存している
///<reference path='Model.ts' />
///<reference path='Parser.ts' />
///<reference path='Controller.ts' />

module ReVIEW {

	export function start(setup:(review:any)=>void, options?:ReVIEW.Options) {
		var controller = new Controller(options);
		// setup 中で initConfig が呼び出される
		setup(controller);
		return controller.process();
	}
}

if (ReVIEW.isNodeJS()) {
	var program = require("commander");
	program
		.version("TODO", "-v, --version")
		.option("--reviewfile <file>", "where is ReVIEWconfig.js?")
		.option("--base <path>", "alternative base path")
	;

	// <hoge> は required, [hoge] は optional
	program
		.command("compile <document>")
		.description("compile ReVIEW document")
		.option("--ast", "output JSON format abstract syntax tree")
		.option("-t, --target <target>", "output format of document")
		.action((document, options)=> {
			var ast = options.ast || false;
			// TODO
		})
	;

	program
		.command("*")
		.action((args, options)=> {
			var reviewfile = program.reviewfile || "./ReVIEWconfig";
			var setup = require(reviewfile);
			ReVIEW.start(setup, {
				reviewfile: reviewfile,
				base: program.base
			});
		})
	;

	// grunt test で動かれても困るので
	var endWith = (str, target) => {
		return str.indexOf(target, str.length - target.length) !== -1;
	};
	if (endWith(process.argv[1], "review.js")) {
		program.parse(process.argv);
	}
}
