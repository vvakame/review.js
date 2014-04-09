/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/update-notifier/update-notifier.d.ts" />
/// <reference path="../typings/commander/commander.d.ts" />

/// <reference path="./api.d.ts" />

import fs = require("fs");

var recursivePackageFinder = (path:string) => {
	if (fs.existsSync(fs.realpathSync(path))) {
		return fs.realpathSync(path);
	} else {
		return recursivePackageFinder("../" + path);
	}
};

import updateNotifier = require("update-notifier");

var notifier = updateNotifier({
	packagePath: recursivePackageFinder("./package.json")
});
if (notifier.update) {
	notifier.notify();
}

// TODO i18n

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

var r:typeof ReVIEW = require("./api");
import program = require("commander");
(<any>program)
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
		var result = r.Exec.singleCompile(input, document, target, null);
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
					case r.ReportLevel.Info:
						log = console.log;
					case r.ReportLevel.Warning:
						log = console.warn;
					case r.ReportLevel.Error:
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
		var reviewfile = (<any>program).reviewfile || "./ReVIEWconfig.js";
		if (!fs.existsSync(process.cwd() + "/" + reviewfile)) {
			console.error(reviewfile + " not exists");
			process.exit(1);
		}
		var setup = require(process.cwd() + "/" + reviewfile);
		r.start(setup, {
			reviewfile: reviewfile,
			base: (<any>program).base
		});
	})
;

program.parse(process.argv);
