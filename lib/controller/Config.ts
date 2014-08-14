///<reference path='../model/CompilerModel.ts' />

module ReVIEW {
	"use strict";

	export class Config {
		_builders:Build.IBuilder[];
		_bookStructure:BookStructure;

		constructor(public original:IConfigRaw) {
		}

		get read():(path:string)=>Promise<string> {
			throw new Error("please implements this method");
		}

		get write():(path:string, data:string)=>Promise<void> {
			throw new Error("please implements this method");
		}

		get analyzer():Build.IAnalyzer {
			return this.original.analyzer || new Build.DefaultAnalyzer();
		}

		get validators():Build.IValidator[] {
			var config = this.original;
			if (!config.validators || config.validators.length === 0) {
				return [new Build.DefaultValidator()];
			} else if (!Array.isArray(config.validators)) {
				return [<any>config.validators];
			} else {
				return config.validators;
			}
		}

		get builders():Build.IBuilder[] {
			if (this._builders) {
				return this._builders;
			}

			var config = this.original;
			if (!config.builders || config.builders.length === 0) {
				// TODO DefaultBuilder は微妙感
				this._builders = [new Build.DefaultBuilder()];
			} else if (!Array.isArray(config.builders)) {
				this._builders = [<any>config.builders];
			} else {
				this._builders = config.builders;
			}
			return this._builders;
		}

		get listener():IConfigListener {
			throw new Error("please implements this method");
		}

		get book():BookStructure {
			if (!this._bookStructure) {
				this._bookStructure = BookStructure.createBook(this.original.book);
			}
			return this._bookStructure;
		}

		resolvePath(path:string):string {
			throw new Error("please implements this method");
		}
	}

	export class NodeJSConfig extends Config {
		_listener:IConfigListener;

		constructor(public options:ReVIEW.IOptions, public original:IConfigRaw) {
			super(original);
		}

		get read():(path:string)=>Promise<string> {
			return this.original.read || ReVIEW.IO.read;
		}

		get write():(path:string, data:string)=>Promise<void> {
			return this.original.write || ReVIEW.IO.write;
		}

		get listener():IConfigListener {
			if (this._listener) {
				return this._listener;
			}

			var listener:IConfigListener = this.original.listener || {
			};
			listener.onAcceptables = listener.onAcceptables || (()=> {
			});
			listener.onSymbols = listener.onSymbols || (()=> {
			});
			listener.onReports = listener.onReports || this.onReports;
			listener.onCompileSuccess = listener.onCompileSuccess || this.onCompileSuccess;
			listener.onCompileFailed = listener.onCompileFailed || this.onCompileFailed;

			this._listener = listener;
			return this._listener;
		}

		onReports(reports:ReVIEW.ProcessReport[]):void {
			var colors = require("colors");
			colors.setTheme({
				info: "cyan",
				warn: "yellow",
				error: "red"
			});

			reports.forEach(report=> {
				var message = "";
				if (report.chapter) {
					message += report.chapter.name + " ";
				}
				if (report.nodes) {
					report.nodes.forEach(node => {
						message += "[" + node.line + "," + node.column + "] ";
					});
				}
				message += report.message;
				if (report.level === ReVIEW.ReportLevel.Error) {
					console.warn(message.error);
				} else if (report.level === ReVIEW.ReportLevel.Warning) {
					console.error(message.warn);
				} else if (report.level === ReVIEW.ReportLevel.Info) {
					console.info(message.info);
				} else {
					throw new Error("unknown report level.");
				}
			});
		}

		onCompileSuccess(book:Book) {
			process.exit(0);
		}

		onCompileFailed() {
			process.exit(1);
		}

		resolvePath(path:string):string {
			var p = require("path");
			var base = this.options.base || "./";
			return p.join(base, path);
		}
	}

	export class WebBrowserConfig extends Config {
		_listener:IConfigListener;

		constructor(public options:ReVIEW.IOptions, public original:IConfigRaw) {
			super(original);
		}

		get read():(path:string)=>Promise<string> {
			return this.original.read || (():Promise<string>=> {
				throw new Error("please implement config.read method");
			});
		}

		get write():(path:string, data:string)=>Promise<void> {
			return this.original.write || (():Promise<void>=> {
				throw new Error("please implement config.write method");
			});
		}

		get listener():IConfigListener {
			if (this._listener) {
				return this._listener;
			}

			var listener:IConfigListener = this.original.listener || {
			};
			listener.onAcceptables = listener.onAcceptables || (()=> {
			});
			listener.onSymbols = listener.onSymbols || (()=> {
			});
			listener.onReports = listener.onReports || this.onReports;
			listener.onCompileSuccess = listener.onCompileSuccess || this.onCompileSuccess;
			listener.onCompileFailed = listener.onCompileFailed || this.onCompileFailed;

			this._listener = listener;
			return this._listener;
		}

		onReports(reports:ReVIEW.ProcessReport[]):void {
			reports.forEach(report=> {
				var message = "";
				if (report.chapter) {
					message += report.chapter.name + " ";
				}
				if (report.nodes) {
					report.nodes.forEach(node => {
						message += "[" + node.line + "," + node.column + "] ";
					});
				}
				message += report.message;
				if (report.level === ReVIEW.ReportLevel.Error) {
					console.warn(message);
				} else if (report.level === ReVIEW.ReportLevel.Warning) {
					console.error(message);
				} else if (report.level === ReVIEW.ReportLevel.Info) {
					console.info(message);
				} else {
					throw new Error("unknown report level.");
				}
			});
		}

		onCompileSuccess(book:Book) {
		}

		onCompileFailed(book?:Book) {
		}

		resolvePath(path:string):string {
			if (!this.options.base) {
				return path;
			}

			var base = this.options.base;
			if (!this.endWith(base, "/") && !this.startWith(path, "/")) {
				base += "/";
			}
			return base + path;
		}

		private startWith(str:string, target:string):boolean {
			return str.indexOf(target) === 0;
		}

		private endWith(str:string, target:string):boolean {
			return str.indexOf(target, str.length - target.length) !== -1;
		}
	}
}
