///<reference path='libs/DefinitelyTyped/jasmine/jasmine.d.ts' />

///<reference path='../../main/typescript/Ignite.ts' />

module Test {
	export interface ResultPromise {
		success():ResultSuccess;
		failure():ResultFailure;
	}

	export interface ResultSuccess {
		book:ReVIEW.Book;
		result?:string;
		results?:any;
	}

	export interface ResultFailure {

	}

	/**
	 * コンパイルを行う。
	 * すべての処理は同期的に行われる。
	 * @param tmpConfig
	 * @returns {{success: (function(): {book: ReVIEW.Book, results: *}), failure: (function(): {})}}
	 */
	export function compile(tmpConfig?:any /* ReVIEW.IConfig */):ResultPromise {
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
		config.write = config.write || ((path, content) => results[path] = content);

		var success:boolean;
		config.listener = config.listener || {
			onCompileSuccess: ()=> {
			},
			onCompileFailed: ()=> {
			}
		};
		config.listener.onCompileSuccess = config.listener.onCompileSuccess || (()=> {
		});
		config.listener.onCompileFailed = config.listener.onCompileFailed || (()=> {
		});
		var resultBook:ReVIEW.Book;
		var originalCompileSuccess = config.listener.onCompileSuccess;
		config.listener.onCompileSuccess = (book) => {
			resultBook = book;
			success = true;
			originalCompileSuccess(book);
		};
		var originalCompileFailed = config.listener.onCompileFailed;
		config.listener.onCompileFailed = ()=> {
			success = false;
			originalCompileFailed();
		};

		ReVIEW.start((review)=> {
			review.initConfig(config);
		});

		return {
			success: () => {
				expect(success).toBe(true);
				return {
					book: resultBook,
					results: results
				};
			},
			failure: () => {
				expect(success).toBe(false);
				return {
				};
			}
		};
	}

	export function compileSingle(input:string, tmpConfig?:any /* ReVIEW.IConfig */):ResultPromise {
		var config:ReVIEW.IConfig = tmpConfig || <any>{};
		config.read = config.read || (()=>input);
		config.listener = config.listener || {
			onCompileSuccess: ()=> {
			}
		};
		var result:string;
		var originalCompileSuccess = config.listener.onCompileSuccess;
		config.listener.onCompileSuccess = (book) => {
			result = book.parts[0].chapters[0].builderProcesses[0].result;
			originalCompileSuccess(book);
		};

		var ret = compile(config);
		return {
			success: () => {
				var success = ret.success();
				success.result = result;
				return success;
			},
			failure: () => {
				return ret.failure();
			}
		};
	}
}
