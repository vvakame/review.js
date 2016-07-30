import * as fs from "fs";
import * as path from "path";
import * as jsyaml from "js-yaml";
import * as updateNotifier from "update-notifier";

import { start } from "./index";
import { ConfigRaw } from "./controller/configRaw";
import { ReportLevel } from "./model/compilerModel";
import { Exec, target2builder } from "./utils/utils";

/* tslint:disable:no-require-imports */
let pkg = require("../package.json");
/* tslint:enable:no-require-imports */

let notifier = updateNotifier({
    packageName: pkg.name,
    packageVersion: pkg.version
});
if (notifier.update) {
    notifier.notify();
}

let packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf8"));

import * as commandpost from "commandpost";

interface RootOpts {
    reviewfile: string[];
    base: string[];
}

let root = commandpost
    .create<RootOpts, {}>("reviewjs")
    .version(packageJson.version, "-v, --version")
    .option("--reviewfile <file>", "where is ReVIEWconfig.js?")
    .option("--base <path>", "alternative base path")
    .action(() => {
        process.stdout.write(root.helpText() + '\n');
    });

interface CompileOpts {
    ast: boolean;
    target: string[];
}

interface CompileArgs {
    document: string;
}

root
    .subCommand<CompileOpts, CompileArgs>("compile [document]")
    .description("compile ReVIEW document")
    .option("--ast", "output JSON format abstract syntax tree")
    .option("-t, --target <target>", "output format of document")
    .action((opts, args) => {
        // .action((document:string, options:any)=> {
        let ast = !!opts.ast;
        let target: string = opts.target[0] || "html";

        return new Promise<{ fileName: string; input: string; }>((resolve, reject) => {
            let input = "";
            if (args.document) {
                let targetPath = path.resolve(process.cwd(), args.document);
                if (!fs.existsSync(targetPath)) {
                    console.error(`${targetPath} not exists`);
                    reject(null);
                    return;
                }
                input = fs.readFileSync(targetPath, "utf8");
                resolve({ fileName: args.document, input: input });
            } else {
                process.stdin.resume();
                process.stdin.setEncoding("utf8");
                process.stdin.on("data", (chunk: string) => {
                    input += chunk;
                });
                process.stdin.on("end", () => {
                    resolve({ fileName: "content.re", input: input });
                });
            }
        })
            .then(value => Exec.singleCompile(value.input, value.fileName, target, null))
            .then(result => {
                if (!result.book.hasError && !ast) {
                    result.book.allChunks[0].builderProcesses.forEach(process => {
                        console.log(process.result);
                    });
                    return null;
                } else if (!result.book.hasError) {
                    let jsonString = JSON.stringify(result.book.allChunks[0].tree.ast, null, 2);
                    console.log(jsonString);
                    return null;
                } else {
                    result.book.reports.forEach(report => {
                        let log: Function;
                        switch (report.level) {
                            case ReportLevel.Info:
                                log = process.stdout.write;
                            case ReportLevel.Warning:
                                log = process.stderr.write;
                            case ReportLevel.Error:
                                log = process.stderr.write;
                        }
                        let message = "";
                        report.nodes.forEach(function(node) {
                            message += `[${node.location.start.line}, ${node.location.start.column}] `;
                        });
                        message += report.message + "\n";
                        log(message);
                    });

                    return Promise.reject("unexpected error occured");
                }
            });
    });

interface BuildArgs {
    target: string;
}

root
    .subCommand<{}, BuildArgs>("build [target]")
    .description("build book")
    .action((_opts, args) => {
        // .action((target:string, options:any)=> {
        if (!args.target) {
            console.log("set target to html");
        }
        let target = args.target || "html";
        let reviewfile = root.parsedOpts.reviewfile[0] || "./ReVIEWconfig.js";

        function byReVIEWConfig() {
            /* tslint:disable:no-require-imports */
            let setup = require(path.resolve(process.cwd(), reviewfile));
            /* tslint:enable:no-require-imports */
            return start(setup, {
                reviewfile: reviewfile,
                base: root.parsedOpts.base[0]
            })
                .then(book => {
                    console.log("completed!");
                    book.reports.forEach(report => {
                        let log: Function;
                        switch (report.level) {
                            case ReportLevel.Info:
                                log = process.stdout.write;
                            case ReportLevel.Warning:
                                log = process.stderr.write;
                            case ReportLevel.Error:
                                log = process.stderr.write;
                        }
                        let message = "";
                        report.nodes.forEach(node => {
                            message += `[${node.location.start.line}, ${node.location.start.column}] `;
                        });
                        message += report.message + "\n";
                        log(message);
                    });
                });
        }

        function byConfigYaml() {
            let catalogYaml = jsyaml.safeLoad(fs.readFileSync(path.resolve(process.cwd(), "catalog.yml"), "utf8"));

            let configRaw: ConfigRaw = {
                builders: [target2builder(target)],
                book: catalogYaml
            };

            return start(review => {
                review.initConfig(configRaw);
            }, {
                    reviewfile: reviewfile,
                    base: root.parsedOpts.base[0]
                })
                .then(book => {
                    process.stdout.write("completed!\n");
                    book.reports.forEach(report => {
                        let log: Function;
                        switch (report.level) {
                            case ReportLevel.Info:
                                log = process.stdout.write;
                            case ReportLevel.Warning:
                                log = process.stderr.write;
                            case ReportLevel.Error:
                                log = process.stderr.write;
                        }
                        let message = "";
                        report.nodes.forEach(node => {
                            message += `[${node.location.start.line}, ${node.location.start.column}] `;
                        });
                        message += report.message + "\n";
                        log(message);
                    });
                });
        }

        if (fs.existsSync(path.resolve(process.cwd(), reviewfile))) {
            return byReVIEWConfig();
        } else if (fs.existsSync(path.resolve(process.cwd(), "config.yml"))) {
            return byConfigYaml();
        } else {
            throw new Error("can not found ReVIEWconfig.js or config.yml");
        }
    });

commandpost
    .exec(root, process.argv)
    .then(() => {
        process.stdout.write("");
        process.stderr.write("");
        process.exit(0);
    }, err => {
        console.error("unexpected error", err);
        if (err.stack) {
            console.error(err.stack);
        }
        process.stdout.write("");
        process.stderr.write("");
        process.exit(1);
    });
