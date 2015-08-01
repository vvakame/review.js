"use strict";

import {Builder, DefaultBuilder} from "../builder/builder";
import {BookStructure, ConfigRaw, Options, ConfigListener} from "./configRaw";
import {ProcessReport, ReportLevel, Book} from "../model/compilerModel";
import {Analyzer, DefaultAnalyzer} from "../parser/analyzer";
import {Validator, DefaultValidator} from "../parser/validator";

import {IO} from "../utils/Utils";

export class Config {
	_builders: Builder[];
	_bookStructure: BookStructure;

	constructor(public original: ConfigRaw) {
	}

	get read(): (path: string) => Promise<string> {
		throw new Error("please implements this method");
	}

	get write(): (path: string, data: string) => Promise<void> {
		throw new Error("please implements this method");
	}

	get exists(): (path: string) => Promise<{ path: string; result: boolean; }> {
		throw new Error("please implements this method");
	}

	get analyzer(): Analyzer {
		return this.original.analyzer || new DefaultAnalyzer();
	}

	get validators(): Validator[] {
		var config = this.original;
		if (!config.validators || config.validators.length === 0) {
			return [new DefaultValidator()];
		} else if (!Array.isArray(config.validators)) {
			return [<any>config.validators];
		} else {
			return config.validators;
		}
	}

	get builders(): Builder[] {
		if (this._builders) {
			return this._builders;
		}

		var config = this.original;
		if (!config.builders || config.builders.length === 0) {
			// TODO DefaultBuilder は微妙感
			this._builders = [new DefaultBuilder()];
		} else if (!Array.isArray(config.builders)) {
			this._builders = [<any>config.builders];
		} else {
			this._builders = config.builders;
		}
		return this._builders;
	}

	get listener(): ConfigListener {
		throw new Error("please implements this method");
	}

	get book(): BookStructure {
		if (!this._bookStructure) {
			this._bookStructure = BookStructure.createBook(this.original.book);
		}
		return this._bookStructure;
	}

	resolvePath(path: string): string {
		throw new Error("please implements this method");
	}
}

export class NodeJSConfig extends Config {
	_listener: ConfigListener;

	constructor(public options: Options, public original: ConfigRaw) {
		super(original);
	}

	get read(): (path: string) => Promise<string> {
		return this.original.read || IO.read;
	}

	get write(): (path: string, data: string) => Promise<void> {
		return this.original.write || IO.write;
	}

	get exists(): (path: string) => Promise<{ path: string; result: boolean; }> {
		return path => {
			/* tslint:disable:no-require-imports */
			let fs = require("fs");
			let _path = require("path");
			/* tslint:enable:no-require-imports */

			var basePath = this.original.basePath || __dirname;
			var promise = new Promise<{ path: string; result: boolean; }>((resolve, reject) => {
				fs.exists(_path.resolve(basePath, path), (result: boolean) => {
					resolve({ path: path, result: result });
				});
			});
			return promise;
		};
	}

	get listener(): ConfigListener {
		if (this._listener) {
			return this._listener;
		}

		var listener: ConfigListener = this.original.listener || {
		};
		listener.onAcceptables = listener.onAcceptables || (() => {
		});
		listener.onSymbols = listener.onSymbols || (() => {
		});
		listener.onReports = listener.onReports || this.onReports;
		listener.onCompileSuccess = listener.onCompileSuccess || this.onCompileSuccess;
		listener.onCompileFailed = listener.onCompileFailed || this.onCompileFailed;

		this._listener = listener;
		return this._listener;
	}

	onReports(reports: ProcessReport[]): void {
		/* tslint:disable:no-require-imports */
		let colors = require("colors");
		/* tslint:enable:no-require-imports */
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
			if (report.level === ReportLevel.Error) {
				console.warn(message.error);
			} else if (report.level === ReportLevel.Warning) {
				console.error(message.warn);
			} else if (report.level === ReportLevel.Info) {
				console.info(message.info);
			} else {
				throw new Error("unknown report level.");
			}
		});
	}

	onCompileSuccess(book: Book) {
		process.exit(0);
	}

	onCompileFailed() {
		process.exit(1);
	}

	resolvePath(path: string): string {
		/* tslint:disable:no-require-imports */
		let p = require("path");
		/* tslint:enable:no-require-imports */
		var base = this.options.base || "./";
		return p.join(base, path);
	}
}

export class WebBrowserConfig extends Config {
	_listener: ConfigListener;

	constructor(public options: Options, public original: ConfigRaw) {
		super(original);
	}

	get read(): (path: string) => Promise<string> {
		return this.original.read || ((): Promise<string>=> {
			throw new Error("please implement config.read method");
		});
	}

	get write(): (path: string, data: string) => Promise<void> {
		return this.original.write || ((): Promise<void>=> {
			throw new Error("please implement config.write method");
		});
	}

	get exists(): (path: string) => Promise<{ path: string; result: boolean; }> {
		return path => {
			if (window.location.protocol === "file:") {
				return this._existsFileScheme(path);
			} else {
				return this._existsHttpScheme(path);
			}
		};
	}

	_existsFileScheme(path: string): Promise<{ path: string; result: boolean; }> {
		var promise = new Promise<{ path: string; result: boolean; }>((resolve, reject) => {
			var canvas = document.createElement('canvas');
			canvas.width = 200;
			canvas.height = 14;
			var ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
			ctx.fillText("file://では画像の存在チェックができません", 2, 10);
			var dataUrl = canvas.toDataURL();
			resolve({ path: dataUrl, result: true });
		});
		return promise;
	}

	_existsHttpScheme(path: string): Promise<{ path: string; result: boolean; }> {
		var promise = new Promise<{ path: string; result: boolean; }>((resolve, reject) => {
			try {
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function() {
					if (xhr.readyState === 4) {
						if (xhr.status === 200 || xhr.status === 304) {
							resolve({ path: path, result: true });
						} else {
							resolve({ path: path, result: false });
						}
					}
				};
				xhr.open("GET", path);
				// If-Modified-Since をDate.now()で送って304返して貰ったほうが効率が良いのでは という発想
				xhr.setRequestHeader("If-Modified-Since", new Date().toUTCString());
				xhr.send();
			} catch (e) {
				if (e instanceof DOMException) {
					var de: DOMException = <DOMException> e;
					console.log(de.message);
				}
				resolve({ path: path, result: false });
			}
		});
		return promise;
	}

	get listener(): ConfigListener {
		if (this._listener) {
			return this._listener;
		}

		var listener: ConfigListener = this.original.listener || {
		};
		listener.onAcceptables = listener.onAcceptables || (() => {
		});
		listener.onSymbols = listener.onSymbols || (() => {
		});
		listener.onReports = listener.onReports || this.onReports;
		listener.onCompileSuccess = listener.onCompileSuccess || this.onCompileSuccess;
		listener.onCompileFailed = listener.onCompileFailed || this.onCompileFailed;

		this._listener = listener;
		return this._listener;
	}

	onReports(reports: ProcessReport[]): void {
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
			if (report.level === ReportLevel.Error) {
				console.warn(message);
			} else if (report.level === ReportLevel.Warning) {
				console.error(message);
			} else if (report.level === ReportLevel.Info) {
				console.info(message);
			} else {
				throw new Error("unknown report level.");
			}
		});
	}

	onCompileSuccess(book: Book) {
	}

	onCompileFailed(book?: Book) {
	}

	resolvePath(path: string): string {
		if (!this.options.base) {
			return path;
		}

		var base = this.options.base;
		if (!this.endWith(base, "/") && !this.startWith(path, "/")) {
			base += "/";
		}
		return base + path;
	}

	private startWith(str: string, target: string): boolean {
		return str.indexOf(target) === 0;
	}

	private endWith(str: string, target: string): boolean {
		return str.indexOf(target, str.length - target.length) !== -1;
	}
}
