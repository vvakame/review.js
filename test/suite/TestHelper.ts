///<reference path='../../typings/mocha/mocha.d.ts' />
///<reference path='../../typings/assert/assert.d.ts' />

///<reference path='../../lib/Main.ts' />

module Test {
	"use strict";

	/**
	 * コンパイルを行う。
	 * すべての処理は同期的に行われる。
	 * @param tmpConfig
	 * @returns {{success: (function(): {book: ReVIEW.Book, results: *}), failure: (function(): {})}}
	 */
	export function compile(tmpConfig?:any /* ReVIEW.IConfig */) {
		var config:ReVIEW.IConfig = tmpConfig || <any>{};
		config.analyzer = config.analyzer || new ReVIEW.Build.DefaultAnalyzer();
		config.validators = config.validators || [new ReVIEW.Build.DefaultValidator()];
		config.builders = config.builders || [new ReVIEW.Build.TextBuilder()];
		config.book = config.book || {
			chapters: [
				"sample.re"
			]
		};
		config.book.chapters = config.book.chapters || [
			"sample.re"
		];

		var results:any = {};
		config.write = config.write || ((path:string, content:any) => {
			results[path] = content;
			return Promise.resolve<void>(null);
		});

		config.listener = config.listener || {
			onReports: () => {
			},
			onCompileSuccess: ()=> {
			},
			onCompileFailed: ()=> {
			}
		};
		config.listener.onReports = config.listener.onReports || (()=> {
		});
		config.listener.onCompileSuccess = config.listener.onCompileSuccess || (()=> {
		});
		config.listener.onCompileFailed = config.listener.onCompileFailed || (()=> {
		});
		var success:boolean;
		var originalCompileSuccess = config.listener.onCompileSuccess;
		config.listener.onCompileSuccess = (book) => {
			success = true;
			originalCompileSuccess(book);
		};
		var originalReports = config.listener.onReports;
		var reports:ReVIEW.ProcessReport[];
		config.listener.onReports = _reports => {
			reports = _reports;
			originalReports(_reports);
		};
		var originalCompileFailed = config.listener.onCompileFailed;
		config.listener.onCompileFailed = ()=> {
			success = false;
			originalCompileFailed();
		};

		return ReVIEW
			.start((review)=> {
				review.initConfig(config);
			})
			.then(book=> {
				return    {
					book: book,
					results: results
				};
			});
	}

	export function compileSingle(input:string, tmpConfig?:any /* ReVIEW.IConfig */) {
		var config:ReVIEW.IConfig = tmpConfig || <any>{};
		config.read = config.read || (()=>Promise.resolve(input));
		config.listener = config.listener || {
			onCompileSuccess: (book)=> {
			}
		};
		var resultString:string;
		var originalCompileSuccess = config.listener.onCompileSuccess;
		config.listener.onCompileSuccess = (book) => {
			resultString = book.parts[0].chapters[0].builderProcesses[0].result;
			originalCompileSuccess(book);
		};

		return compile(config).then(result=> {
			return {
				book: result.book,
				results: result.results,
				result: resultString
			};
		});
	}
}
