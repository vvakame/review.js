/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/update-notifier/update-notifier.d.ts" />
/// <reference path="../typings/js-yaml/js-yaml.d.ts" />

/// <reference path="../node_modules/commandpost/commandpost.d.ts" />

/// <reference path="./main.d.ts" />

import fs = require("fs");
import jsyaml = require("js-yaml");
import updateNotifier = require("update-notifier");
var pkg = require("../package.json");

var notifier = updateNotifier({
	packageName: pkg.name,
	packageVersion: pkg.version
});
if (notifier.update) {
	notifier.notify();
}

var packageJson = JSON.parse(fs.readFileSync(__dirname + "/../package.json", "utf8"));

var r:typeof ReVIEW = require("./api");

import commandpost = require("commandpost");

interface IRootOpts {
	reviewfile:string[];
	base:string[];
}

var root = commandpost
	.create<IRootOpts, {}>("reviewjs")
	.version(packageJson.version, "-v, --version")
	.option("--reviewfile <file>", "where is ReVIEWconfig.js?")
	.option("--base <path>", "alternative base path")
	.action(()=> {
		process.stdout.write(root.helpText() + '\n');
		process.exit(0);
	});

interface ICompileOpts {
	ast:boolean;
	target:string[];
}

interface ICompileArgs {
	document: string;
}

root
	.subCommand<ICompileOpts, ICompileArgs>("compile [document]")
	.description("compile ReVIEW document")
	.option("--ast", "output JSON format abstract syntax tree")
	.option("-t, --target <target>", "output format of document")
	.action((opts, args)=> {
		// .action((document:string, options:any)=> {
		var ast = !!opts.ast;
		var target:string = opts.target[0] || "html";

		new Promise<{fileName:string; input:string;}>((resolve, reject)=> {
			var input = "";
			if (args.document) {
				var targetPath = process.cwd() + "/" + args.document;
				if (!fs.existsSync(targetPath)) {
					console.error(targetPath + " not exists");
					reject(null);
				}
				input = fs.readFileSync(targetPath, "utf8");
				resolve({fileName: args.document, input: input});
			} else {
				process.stdin.resume();
				process.stdin.setEncoding("utf8");
				process.stdin.on("data", (chunk:string) => {
					input += chunk;
				});
				process.stdin.on("end", () => {
					resolve({fileName: "content.re", input: input});
				});
			}
		})
			.then(value=> r.Exec.singleCompile(value.input, value.fileName, target, null))
			.then(result=> {
				if (!result.book.hasError && !ast) {
					result.book.allChunks[0].builderProcesses.forEach(process=> {
						console.log(process.result);
					});
					process.exit(0);
				} else if (!result.book.hasError) {
					var jsonString = JSON.stringify(result.book.allChunks[0].tree.ast, null, 2);
					console.log(jsonString);
					process.exit(0);
				} else {
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
				}
			}, err=> {
				console.error("unexpected error", err);
				if (err.stack) {
					console.error(err.stack);
				}
				return Promise.reject(null);
			})
			.catch(()=> {
				process.exit(1);
			});
	});

interface IBuildArgs {
	target: string;
}

root
	.subCommand<{}, IBuildArgs>("build [target]")
	.description("build book")
	.action((opts, args)=> {
		// .action((target:string, options:any)=> {
		if (!args.target) {
			console.log("set target to html");
		}
		var target = args.target || "html";
		var reviewfile = root.parsedOpts.reviewfile[0] || "./ReVIEWconfig.js";

		function byReVIEWConfig() {
			var setup = require(process.cwd() + "/" + reviewfile);
			r.start(setup, {
				reviewfile: reviewfile,
				base: root.parsedOpts.base[0]
			})
				.then(book=> {
					console.log("completed!");
					process.exit(0);
				})
				.catch(err=> {
					console.error("unexpected error", err);
					process.exit(1);
				});
		}

		function byConfigYaml() {
			// var configYaml = jsyaml.safeLoad(fs.readFileSync(process.cwd() + "/" + "config.yml", "utf8"));
			var catalogYaml = jsyaml.safeLoad(fs.readFileSync(process.cwd() + "/" + "catalog.yml", "utf8"));

			var configRaw:ReVIEW.IConfigRaw = {
				builders: [r.target2builder(target)],
				book: catalogYaml
			};

			r.start(review=> {
				review.initConfig(configRaw);
			}, {
				reviewfile: reviewfile,
				base: root.parsedOpts.base[0]
			})
				.then(book=> {
					console.log("completed!");
					process.exit(0);
				})
				.catch(err=> {
					console.error("unexpected error", err);
					process.exit(1);
				});
		}

		if (fs.existsSync(process.cwd() + "/" + reviewfile)) {
			byReVIEWConfig();
			return;
		} else if (fs.existsSync(process.cwd() + "/" + "config.yml")) {
			byConfigYaml();
			return;
		} else {
			console.log("can not found ReVIEWconfig.js or config.yml");
			process.exit(1);
		}
	});

commandpost.exec(root, process.argv);
