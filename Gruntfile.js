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
				declaration: false,            // generate a declaration .d.ts file for every output js file. [true | false (default)]
				experimentalDecorators: true
			},
			clientCli: {
				src: ['<%= opt.client.tsMain %>/Cli.ts'],
				options: {
					module: 'commonjs'
				}
			},
			clientMain: {
				src: ['<%= opt.client.tsMain %>/Main.ts'],
				options: {
					declaration: true
				}
			},
			clientTest: {
				src: ['<%= opt.client.tsTest %>/MainSpec.ts']
			}
		},
		tslint: {
			options: {
				configuration: grunt.file.readJSON("tslint.json")
			},
			files: {
				src: [
					'<%= opt.client.tsMain %>/**/*.ts',
					'<%= opt.client.tsTest %>/**/*.ts',
					'!<%= opt.client.tsMain %>/**/*.d.ts'
				]
			}
		},
		typedoc: {
			main: {
				options: {
					module: "<%= ts.options.module %>",
					out: './docs',
					name: '<%= pkg.name %>',
					target: "<%= ts.options.target %>"
				},
				src: [
					'<%= opt.client.tsMain %>/**/*.ts',
					'!<%= opt.client.tsMain %>/main.d.ts',
					'!<%= opt.client.tsMain %>/Cli.ts' // main.d.ts読み込んでて重複が発生するので
				]
			},
			travisCI: {
				options: {
					module: "<%= ts.options.module %>",
					out: './pages/docs',
					name: '<%= pkg.name %>',
					target: "<%= ts.options.target %>"
				},
				src: [
					'<%= opt.client.tsMain %>/**/*.ts',
					'!<%= opt.client.tsMain %>/main.d.ts',
					'!<%= opt.client.tsMain %>/Cli.ts' // main.d.ts読み込んでて重複が発生するので
				]
			}
		},
		bower: {
			install: {
				options: {
					install: true,
					copy: false,
					verbose: true, // ログの詳細を出すかどうか
					cleanBowerDir: false
				}
			}
		},
		dtsm: {
			client: {
				options: {
					// optional: specify config file
					confog: './dtsm.json'
				}
			}
		},
		concat: {
			options: {
				separator: ';'
			},
			browser: {
				src: [
					'<%= opt.client.peg %>/grammar.js',
					'<%= opt.client.jsMain %>/Exception.js',
					'<%= opt.client.jsMainOut %>/*.js',
					'!<%= opt.client.jsMainOut %>/Cli.js',
					'!<%= opt.client.jsMainOut %>/api.js'
				],
				dest: '<%= opt.client.outBase %>/review.js'
			},
			test: {
				src: [
					'<%= opt.client.peg %>/grammar.js',
					'<%= opt.client.jsMain %>/Exception.js',
					'<%= opt.client.jsTestOut %>/main-spec.js'
				],
				dest: '<%= opt.client.jsTestOut %>/test.js'
			},
			nodeRuntime: {
				src: [
					'<%= opt.client.peg %>/grammar.js',
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
						'<%= opt.client.peg %>/grammar.js',
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
					'<%= opt.client.peg %>/grammar.js'
				]
			},
			dtsm: {
				src: [
					// dtsm installed
					"typings/"
				]
			},
			bower: {
				src: [
					// bower installed
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
					'<%= opt.client.jsTestOut %>/suite/MainSpec.js'
				]
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
					return "./util/review-parser-generator > " + peg + "/grammar.js";
				}
			}
		}
	});

	grunt.registerTask(
		'setup',
		"プロジェクトの初期セットアップを行う。",
		['clean', 'bower', 'dtsm']);

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
		'test-browser',
		"必要なコンパイルを行いブラウザ上でテストを実行する。",
		['test-preprocess', 'open:test-browser']);

	require('load-grunt-tasks')(grunt);
};
