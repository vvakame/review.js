///<reference path='libs/DefinitelyTyped/jasmine/jasmine.d.ts' />

///<reference path='../../main/typescript/Ignite.ts' />

module Test {
	export interface ResultCallback {
		success();
		failure();
	}

	export interface ResultPromise {
		success():ResultSuccess;
		failure():ResultFailure;
	}

	export interface ResultSuccess {
		result:string;
	}

	export interface ResultFailure {

	}

	export function compileSingle(input:string, tmpConfig?:any /* ReVIEW.IConfig */):ResultPromise {
		var config:ReVIEW.IConfig = tmpConfig || {
			analyzer: new ReVIEW.Build.DefaultAnalyzer(),
			validators: [new ReVIEW.Build.DefaultValidator()],
			builders: [new ReVIEW.Build.TextBuilder()],
			book: {}
		};
		config.analyzer = config.analyzer || new ReVIEW.Build.DefaultAnalyzer();
		config.validators = config.validators || [new ReVIEW.Build.DefaultValidator()];
		config.builders = config.builders || [new ReVIEW.Build.TextBuilder()];
		config.book = config.book || {
			chapters: [
				"sample.re"
			]
		};

		config.read = path => input;
		config.write = (path, content) => result[path] = content;

		var result:string;
		var success:boolean;
		config.listener = config.listener || {
			onCompileSuccess: (book)=> {
				result = book.parts[0].chapters[0].builderProcesses[0].result;
				success = true;
			},
			onCompileFailed: ()=> {
				success = false;
			}
		};

		ReVIEW.start((review)=> {
			review.initConfig(config);
		});

		return {
			success: () => {
				expect(success).toBe(true);
				return {
					result: result
				};
			},
			failure: () => {
				expect(success).toBe(false);
				return {
				};
			}
		};
	}
}
