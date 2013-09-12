///<reference path='libs/DefinitelyTyped/node/node.d.ts' />

///<reference path='utils/Utils.ts' />
///<reference path='i18n/i18n.ts' />
///<reference path='controller/Controller.ts' />
///<reference path='model/CompilerModel.ts' />
///<reference path='parser/Walker.ts' />
///<reference path='parser/Parser.ts' />
///<reference path='parser/Analyzer.ts' />
///<reference path='parser/Validator.ts' />
///<reference path='builder/Builder.ts' />
///<reference path='builder/TextBuilder.ts' />
///<reference path='builder/HtmlBuilder.ts' />

// 本プロジェクトはWebStormを使いこなせた時に開発しやすいよう留意して設計されております
// WebStorm 豆知識
// Cmd+Shift+N で 指定したファイルを開く
// Cmd+Option+Shift+N で 指定したクラスやインタフェースを開く
// Cmd+クリック 定義へジャンプ

module ReVIEW {

	/**
	 * ReVIEW文書のコンパイルを開始する。
	 * @param setup
	 * @param options
	 * @returns {Book}
	 */
	export function start(setup:(review:any)=>void, options?:ReVIEW.IOptions):Book {
		var controller = new Controller(options);
		// setup 中で initConfig が呼び出される
		setup(controller);
		return controller.process();
	}
}

if (ReVIEW.isNodeJS()) {
	// Node.js 上で実行されている場合はコマンドライン引数を解釈して処理を実行する。

	// TODO i18n

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
