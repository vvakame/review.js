module.exports = function (grunt) {
	require("time-grunt")(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		bwr: grunt.file.readJSON('bower.json'),
		// Java用プロジェクト構成向け設定
		opt: {
			client: {
				"jsMain": "lib/js",
				"tsMain": "lib",
				"tsMainLib": "lib/typings",
				"tsTest": "test/suite",
				"tsTestLib": "test/suite/libs",
				"peg": "resources",

				"outBase": "dist",
				"jsMainOut": "lib",
				"jsTestOut": "test"
			}
		},

		ts: {
			options: {
				compile: true,                 // perform compilation. [true (default) | false]
				comments: false,               // same as !removeComments. [true | false (default)]
				target: 'es5',                 // target javascript language. [es3 (default) | es5]
				module: 'commonjs',            // target javascript module style. [amd (default) | commonjs]
				noImplicitAny: true,
				sourceMap: false,              // generate a source map for every output js file. [true (default) | false]
				sourceRoot: '',                // where to locate TypeScript files. [(default) '' == source ts location]
				mapRoot: '',                   // where to locate .map.js files. [(default) '' == generated js location.]
				declaration: false             // generate a declaration .d.ts file for every output js file. [true | false (default)]
			},
			clientCli: {
				src: ['<%= opt.client.tsMain %>/Cli.ts'],
				options: {
					module: 'commonjs'
				}
			},
			clientMain: {
				src: ['<%= opt.client.tsMain %>/Main.ts'],
				out: '<%= opt.client.jsMainOut %>/main.js',
				options: {
					declaration: true
				}
			},
			clientTest: {
				src: ['<%= opt.client.tsTest %>/MainSpec.ts'],
				out: '<%= opt.client.jsTestOut %>/main-spec.js'
			}
		},
		tslint: {
			options: {
				formatter: "prose",
				configuration: {
					// https://github.com/palantir/tslint#supported-rules
					"rules": {
						"bitwise": true,
						"classname": true,
						"curly": true,
						"debug": false,
						"dupkey": true,
						"eofline": true,
						"eqeqeq": true,
						"evil": true,
						"forin": false, // TODO 解消方法よくわからない
						// "indent": [false, 4], // WebStormのFormatterと相性が悪い
						"labelpos": true,
						"label-undefined": true,
						// "maxlen": [false, 140],
						"noarg": true,
						"noconsole": [false,
							"debug",
							"info",
							"time",
							"timeEnd",
							"trace"
						],
						"noconstruct": true,
						"nounreachable": false, // switch で怒られるので
						"noempty": false, // プロパティアクセス付き引数有りのコンストラクタまで怒られるので
						"oneline": [true,
							"check-open-brace",
							"check-catch",
							"check-else",
							"check-whitespace"
						],
						"quotemark": [true, "double"],
						"radix": false, // 10の基数指定するのめんどいので
						"semicolon": true,
						"sub": true,
						"trailing": true,
						"varname": false, // _hoge とかが許可されなくなるので…
						"whitespace": [false, // WebStormのFormatterと相性が悪い
							"check-branch",
							"check-decl",
							"check-operator",
							"check-separator" ,
							"check-type"
						]
					}
				}
			},
			files: {
				src: ['<%= opt.client.tsMain %>/**/*.ts', '<%= opt.client.tsTest %>/**/*.ts'],
				filter: function (filepath) {
					var mainLib = grunt.config.get("opt.client.tsMainLib") + "/";
					var testLib = grunt.config.get("opt.client.tsTestLib") + "/";
					if (filepath.indexOf(mainLib) !== -1 || filepath.indexOf(testLib) !== -1) {
						return false;
					}

					return true;
				}
			}
		},
		watch: {
			"typescript-main": {
				files: ['<%= opt.client.tsMain %>/**/*.ts'],
				tasks: ['typescript:main']
			},
			"typescript-test": {
				files: [ '<%= opt.client.tsTest %>/**/*.ts'],
				tasks: ['typescript']
			}
		},
		bower: {
			install: {
				options: {
					targetDir: 'bower-task',
					layout: 'byType', // exportsOverride の左辺に従って分類
					install: true,
					verbose: true, // ログの詳細を出すかどうか
					cleanTargetDir: true,
					cleanBowerDir: false
				}
			}
		},
		tsd: {
			client: {
				options: {
					// execute a command
					command: 'reinstall',

					//optional: always get from HEAD
					latest: false,

					// optional: specify config file
					config: './tsd.json'
				}
			}
		},
		copy: {
			bower: {
				files: [
					{
						expand: true,
						flatten: true,
						cwd: 'bower-task/',
						src: ['main-js/**/*.js'],
						dest: '<%= opt.client.tsTest %>/libs/'
					},
					{
						expand: true,
						flatten: true,
						cwd: 'bower-task/',
						src: ['test-js/**/*.js', 'test-css/**/*.css'],
						dest: '<%= opt.client.tsTest %>/libs/'
					}
				]
			},
			tsd: {
				files: [
					{
						expand: true,
						cwd: 'd.ts/DefinitelyTyped/',
						src: ['*/*.d.ts'],
						dest: '<%= opt.client.tsMain %>/libs/DefinitelyTyped/'
					},
					{
						expand: true,
						cwd: 'd.ts/DefinitelyTyped/',
						src: ['*/*.d.ts'],
						dest: '<%= opt.client.tsTest %>/libs/DefinitelyTyped/'
					}
				]
			}
		},
		concat: {
			options: {
				separator: ';'
			},
			browser: {
				src: [
					'<%= opt.client.peg %>/grammer.js',
					'<%= opt.client.jsMain %>/Exception.js',
					'<%= opt.client.jsMainOut %>/*.js',
					'!<%= opt.client.jsMainOut %>/Cli.js',
					'!<%= opt.client.jsMainOut %>/api.js'
				],
				dest: '<%= opt.client.outBase %>/review.js'
			},
			test: {
				src: [
					'<%= opt.client.peg %>/grammer.js',
					'<%= opt.client.jsMain %>/Exception.js',
					'<%= opt.client.jsTestOut %>/main-spec.js'
				],
				dest: '<%= opt.client.jsTestOut %>/test.js'
			},
			nodeRuntime: {
				src: [
					'<%= opt.client.peg %>/grammer.js',
					'<%= opt.client.jsMain %>/Exception.js',
					'<%= opt.client.jsMainOut %>/main.js'
				],
				dest: '<%= opt.client.jsMainOut %>/api.js'
			}
		},
		replace: {
			definitions: {
				src: ['<%= opt.client.jsMainOut %>/main.d.ts'],
				dest: '<%= opt.client.outBase %>/review.js.d.ts',
				replacements: [
					{
						from: /^\/\/\/.*$/gm,
						to: ''
					},
					{
						from: /interface String \{[^}]*\}/gm,
						to: ''
					},
					{
						from: "declare var define: any;",
						to: ''
					},
					{
						from: /$/g,
						to: '\ndeclare module "review.js" {\n    export = ReVIEW;\n}\n'
					}
				]
			}
		},
		uglify: {
			browser: {
				options: {
					report: 'gzip',
					// 変数名の圧縮類は作業コストが大きすぎるのでやらない
					mangle: false,
					preserveComments: 'some'
				},
				files: {
					'<%= opt.client.outBase %>/review.min.js': [
						'<%= opt.client.peg %>/grammer.js',
						'<%= opt.client.jsMain %>/Exception.js',
						'<%= opt.client.jsMainOut %>/*.js',
						'!<%= opt.client.jsMainOut %>/Cli.js',
						'!<%= opt.client.jsMainOut %>/api.js'
					]
				}
			}
		},
		clean: {
			clientScript: {
				src: [
					// client
					'<%= opt.client.jsMainOut %>/*.js',
					'<%= opt.client.jsMainOut %>/*.d.ts',
					'<%= opt.client.jsMainOut %>/*.js.map',
					// client test
					'<%= opt.client.jsTestOut %>/*.js',
					'<%= opt.client.jsTestOut %>/*.js.map',
					'<%= opt.client.jsTestOut %>/*.d.ts',
					// peg.js
					'<%= opt.client.peg %>/grammer.js'
				]
			},
			tsd: {
				src: [
					// tsd installed
					"d.ts/",
					'<%= opt.client.tsMain %>/libs/DefinitelyTyped',
					'<%= opt.client.tsTest %>/libs/DefinitelyTyped'
				]
			},
			bower: {
				src: [
					// bower installed
					"bower-task/",
					"bower_componenets",
					'<%= opt.client.jsMainOut %>/libs',
					'<%= opt.client.jsTestOut %>/libs/*.js',
					'<%= opt.client.tsTest %>/libs/*.css'
				]
			}
		},
		mochaTest: {
			test: {
				options: {
					reporter: 'spec',
					require: [
						function () {
							require('espower-loader')({
								cwd: process.cwd() + '/' + grunt.config.get("opt.client.jsTestOut"),
								pattern: '**/*.js'
							});
						},
						function () {
							assert = require('power-assert');
						}
					]
				},
				src: [
					'<%= opt.client.jsTestOut %>/**/test.js'
				]
			}
		},
		karma: {
			unit: {
				options: {
					configFile: 'karma.conf.js',
					autoWatch: false,
					browsers: ['PhantomJS', 'Firefox'],
					reporters: ['progress', 'junit'],
					singleRun: true,
					keepalive: true
				}
			}
		},
		open: {
			"test-browser": {
				path: '<%= opt.client.jsTestOut %>/index.html'
			}
		},
		exec: {
			"pegjs": {
				cmd: function () {
					var peg = grunt.config.get("opt.client.peg") + "/";
					return "./util/review-parser-generator > " + peg + "/grammer.js";
				}
			}
		}
	});

	grunt.registerTask(
		'setup',
		"プロジェクトの初期セットアップを行う。",
		['clean', 'bower', 'tsd', 'copy']);

	grunt.registerTask(
		'compile-prepare',
		"npm用(nodeモジュール兼コマンドラインクライアント)のコンパイルを行う",
		['clean:clientScript', 'ts:clientMain', 'exec:pegjs']);

	grunt.registerTask(
		'compile-for-npm',
		"npm用(nodeモジュール兼コマンドラインクライアント)のコンパイルを行う",
		['concat:nodeRuntime', 'replace:definitions', 'ts:clientCli', 'tslint']);

	grunt.registerTask(
		'compile-for-browser',
		"ブラウザライブラリ用のコンパイルを行う",
		['concat:browser', 'replace:definitions', 'uglify:browser']);

	grunt.registerTask(
		'default',
		"必要なコンパイルを行い画面表示できるようにする。",
		['compile-prepare', 'compile-for-npm', 'compile-for-browser', 'tslint']);

	grunt.registerTask(
		'test-preprocess',
		"テストに必要な前準備を実行する。",
		['default', 'ts:clientTest', 'concat:test']);

	grunt.registerTask(
		'test',
		"必要なコンパイルを行いテストを実行する。",
		['test-node']);

	grunt.registerTask(
		'test-node',
		"必要なコンパイルを行いnode.js上でテストを実行する。",
		['test-preprocess', 'mochaTest']);

	grunt.registerTask(
		'test-karma',
		"必要なコンパイルを行いkarma上でテストを実行する。",
		['test-preprocess', 'karma']);

	grunt.registerTask(
		'test-browser',
		"必要なコンパイルを行いブラウザ上でテストを実行する。",
		['test-preprocess', 'open:test-browser']);

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
};
