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

// extend lib.d.ts declaration.
interface String {
	trimLeft():string;
}

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
	module.exports = ReVIEW;
}

if (ReVIEW.isNodeJS()) {
	// Node.js 上で実行されている場合はコマンドライン引数を解釈して処理を実行する。

	// TODO i18n

	var fs = require("fs");
	var packageJson:any;
	if (fs.existsSync(__dirname + "/../package.json")) {
		// installed
		packageJson = JSON.parse(fs.readFileSync(__dirname + "/../package.json", "utf8"));
	} else {
		// grunt test
		packageJson = {
			version: "develop"
		};
	}

	var program = require("commander");
	program
		.version(packageJson.version, "-v, --version")
		.option("--reviewfile <file>", "where is ReVIEWconfig.js?")
		.option("--base <path>", "alternative base path")
	;

	// <hoge> は required, [hoge] は optional
	program
		.command("compile <document>")
		.description("compile ReVIEW document")
		.option("--ast", "output JSON format abstract syntax tree")
		.option("-t, --target <target>", "output format of document")
		.action((document:string, options:any)=> {
			var ast = !!options.ast;
			var target:string = options.target || "html";

			var targetPath = process.cwd() + "/" + document;
			if (!fs.existsSync(targetPath)) {
				console.error(targetPath + " not exists");
				process.exit(1);
			}

			var input = fs.readFileSync(targetPath, "utf8");
			var result = ReVIEW.Exec.singleCompile(input, document, target, null);
			result.success(result=> {
				result.book.parts[0].chapters[0].builderProcesses.forEach(process=> {
					console.log(process.result);
				});
				process.exit(0);
			});
			result.failure(result=> {
				result.book.reports.forEach(report=> {
					var log:Function;
					switch (report.level) {
						case ReVIEW.ReportLevel.Info:
							log = console.log;
						case ReVIEW.ReportLevel.Warning:
							log = console.warn;
						case ReVIEW.ReportLevel.Error:
							log = console.error;
					}
					var message = "";
					report.nodes.forEach(function (node) {
						message += "[" + node.line + "," + node.column + "] ";
					});
					message += report.message;
					log(message);
				});
				process.exit(1);
			});
		})
	;

	program
		.command("build")
		.description("build book")
		.action((args:any, options:any)=> {
			var reviewfile = program.reviewfile || "./ReVIEWconfig.js";
			if (!fs.existsSync(process.cwd() + "/" + reviewfile)) {
				console.error(reviewfile + " not exists");
				process.exit(1);
			}
			var setup = require(process.cwd() + "/" + reviewfile);
			ReVIEW.start(setup, {
				reviewfile: reviewfile,
				base: program.base
			});
		})
	;

	// grunt test で動かれても困るので
	var endWith = (str:string, target:string) => {
		return str.indexOf(target, str.length - target.length) !== -1;
	};
	if (endWith(process.argv[1], "reviewjs")) {
		program.parse(process.argv);
	}
}
