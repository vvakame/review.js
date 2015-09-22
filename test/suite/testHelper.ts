"use strict";

import {isNodeJS} from "../../lib/utils/utils";

import {start} from "../../lib/index";

import {ConfigRaw} from "../../lib/controller/configRaw";
import {Book, ProcessReport} from "../../lib/model/compilerModel";

import {DefaultAnalyzer} from "../../lib/parser/analyzer";
import {DefaultValidator} from "../../lib/parser/validator";

import {TextBuilder} from "../../lib/builder/textBuilder";

/**
 * コンパイルを行う。
 * すべての処理は同期的に行われる。
 * @param tmpConfig
 * @returns {{success: (function(): {book: ReVIEW.Book, results: *}), failure: (function(): {})}}
 */
export function compile(config?: ConfigRaw): Promise<{book:Book; results: any;}>  {
	"use strict";

	config = config || <any>{};
	config.basePath = config.basePath || (isNodeJS() ? __dirname + "/../" : void 0); // __dirname は main-spec.js の位置になる
	config.analyzer = config.analyzer || new DefaultAnalyzer();
	config.validators = config.validators || [new DefaultValidator()];
	config.builders = config.builders || [new TextBuilder()];
	config.book = config.book || {
		contents: [
			{ file: "sample.re" }
		]
	};
	config.book.contents = config.book.contents || [
		{ file: "sample.re" }
	];

	let results: any = {};
	config.write = config.write || ((path: string, content: any) => {
		results[path] = content;
		return Promise.resolve<void>(null);
	});

	config.listener = config.listener || {
		onReports: () => {
		},
		onCompileSuccess: () => {
		},
		onCompileFailed: () => {
		}
	};
	config.listener.onReports = config.listener.onReports || (() => {
	});
	config.listener.onCompileSuccess = config.listener.onCompileSuccess || (() => {
	});
	config.listener.onCompileFailed = config.listener.onCompileFailed || (() => {
	});
	let success: boolean;
	let originalCompileSuccess = config.listener.onCompileSuccess;
	config.listener.onCompileSuccess = (book) => {
		success = true;
		originalCompileSuccess(book);
	};
	let originalReports = config.listener.onReports;
	let reports: ProcessReport[];
	config.listener.onReports = _reports => {
		reports = _reports;
		originalReports(_reports);
	};
	let originalCompileFailed = config.listener.onCompileFailed;
	config.listener.onCompileFailed = (book) => {
		success = false;
		originalCompileFailed(book);
	};

	return start((review) => {
		review.initConfig(config);
	})
		.then(book=> {
			return {
				book: book,
				results: results
			};
		});
}

// TODO basePathの解決がうまくないのでそのうち消す
export function compileSingle(input: string, tmpConfig?: any /* ReVIEW.IConfigRaw */): Promise<{book:Book; results: any; result: string;}> {
	"use strict";

	let config: ConfigRaw = tmpConfig || <any>{};
	config.read = config.read || (() => Promise.resolve(input));
	config.listener = config.listener || {
		onCompileSuccess: (book) => {
		}
	};
	let resultString: string;
	let originalCompileSuccess = config.listener.onCompileSuccess;
	config.listener.onCompileSuccess = (book) => {
		resultString = book.allChunks[0].builderProcesses[0].result;
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
