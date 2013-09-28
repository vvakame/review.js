module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		bwr: grunt.file.readJSON('bower.json'),
		// Java用プロジェクト構成向け設定
		opt: {
			"tsMain": "src/main/typescript",
			"tsMainLib": "src/main/typescript/libs",
			"tsTest": "src/test/typescript",
			"tsTestLib": "src/test/typescript/libs",
			"peg": "src/main/peg",
			"res": "src/main/resources",
			"jsLib": "bin/lib",

			"outBase": "bin",
			"jsMainOut": "bin/out",
			"jsTestOut": "src/test/typescript"
		},

		typescript: {
			main: { // --declarations --sourcemap --target ES5 --out client/scripts/main.js client/scripts/main.ts
				src: ['<%= opt.tsMain %>/Ignite.ts'],
				dest: '<%= opt.jsMainOut %>/main.js',
				options: {
					target: 'es5',
					base_path: '<%= opt.tsMain %>',
					sourcemap: false,
					declaration: true,
					noImplicitAny: false // node.d.ts がエラー吐く
				}
			},
			test: {
				src: ['<%= opt.tsTest %>/MainSpec.ts'],
				dest: '<%= opt.tsTest %>/main-spec.js',
				options: {
					target: 'es5',
					sourcemap: false,
					declaration: false,
					noImplicitAny: false // node.d.ts がエラー吐く
				}
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
				src: ['<%= opt.tsMain %>/**/*.ts', '<%= opt.tsTest %>/**/*.ts'],
				filter: function (filepath) {
					var mainLib = grunt.config.get("opt.tsMainLib") + "/";
					var testLib = grunt.config.get("opt.tsTestLib") + "/";
					if (filepath.indexOf(mainLib) !== -1 || filepath.indexOf(testLib) !== -1) {
						return false;
					}

					return true;
				}
			}
		},
		watch: {
			"typescript-main": {
				files: ['<%= opt.tsMain %>/**/*.ts'],
				tasks: ['typescript:main']
			},
			"typescript-test": {
				files: [ '<%= opt.tsTest %>/**/*.ts'],
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
		copy: {
			bower: {
				files: [
					{
						expand: true,
						flatten: true,
						cwd: 'bower-task/',
						src: ['main-js/**/*.js'],
						dest: '<%= opt.jsLib %>/'
					},
					{
						expand: true,
						flatten: true,
						cwd: 'bower-task/',
						src: ['test-js/**/*.js', 'test-css/**/*.css'],
						dest: '<%= opt.tsTest %>/libs/'
					}
				]
			},
			tsd: {
				files: [
					{
						expand: true,
						cwd: 'd.ts/DefinitelyTyped/',
						src: ['*/*.d.ts'],
						dest: '<%= opt.tsMain %>/libs/DefinitelyTyped/'
					},
					{
						expand: true,
						cwd: 'd.ts/DefinitelyTyped/',
						src: ['*/*.d.ts'],
						dest: '<%= opt.tsTest %>/libs/DefinitelyTyped/'
					}
				]
			}
		},
		concat: {
			options: {
				separator: ';'
			},
			dev: {
				src: [
					'<%= opt.peg %>/grammer.js',
					'<%= opt.jsMainOut %>/*.js'
				],
				dest: '<%= opt.outBase %>/review.js'
			},
			test: {
				src: [
					'<%= opt.peg %>/grammer.js',
					'<%= opt.jsTestOut %>/main-spec.js'
				],
				dest: '<%= opt.jsTestOut %>/test.js'
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
					'<%= opt.outBase %>/review.min.js': [
						'<%= opt.jsLib %>/i18next-<%= bwr.dependencies.i18next %>.js',
						'<%= opt.peg %>/grammer.js',
						'<%= opt.jsMainOut %>/*.js'
					]
				}
			}
		},
		clean: {
			clientScript: {
				src: [
					// client
					'<%= opt.jsMainOut %>/*.js',
					'<%= opt.jsMainOut %>/*.d.ts',
					'<%= opt.jsMainOut %>/*.js.map',
					// client test
					'<%= opt.jsTestOut %>/*.js',
					'<%= opt.jsTestOut %>/*.js.map',
					'<%= opt.jsTestOut %>/*.d.ts',
					// peg.js
					'<%= opt.peg %>/grammer.js'
				]
			},
			tsd: {
				src: [
					// tsd installed
					"d.ts/",
					'<%= opt.tsMain %>/libs/DefinitelyTyped',
					'<%= opt.tsTest %>/libs/DefinitelyTyped'
				]
			},
			bower: {
				src: [
					// bower installed
					"bower-task/",
					"bower_componenets",
					'<%= opt.jsLib %>',
					'<%= opt.jsMainOut %>/libs',
					'<%= opt.jsTestOut %>/libs/*.js',
					'<%= opt.tsTest %>/libs/*.css'
				]
			}
		},
		jasmine: {
			all: {
				src: ['<%= opt.tsTest %>/SpecRunner.html'],
				errorReporting: true
			}
		},
		"jasmine-node": {
			options: {
				match: "test.",
				matchall: true
			},
			run: {
				spec: "<%= opt.jsTestOut %>/"
			},
			env: {
				NODE_PATH: "lib"
			},
			executable: './node_modules/.bin/jasmine-node'
		},
		karma: {
			unit: {
				options: {
					configFile: 'karma.conf.js',
					autoWatch: false,
					browsers: ['PhantomJS'],
					reporters: ['progress', 'junit'],
					singleRun: true,
					keepalive: true
				}
			}
		},
		open: {
			"test-browser": {
				path: '<%= opt.tsTest %>/SpecRunner.html'
			}
		},
		exec: {
			tsd: {
				cmd: function () {
					// jquery は i18next がコンパイル時に依存している
					return "./node_modules/.bin/tsd install node jasmine jquery i18next";
				}
			},
			"pegjs": {
				cmd: function () {
					var peg = grunt.config.get("opt.peg") + "/";
					return "./util/review-parser-generator > " + peg + "/grammer.js";
				}
			}
		}
	});

	grunt.registerTask(
		'setup',
		"プロジェクトの初期セットアップを行う。",
		['clean', 'bower', 'exec:tsd', 'copy']);

	grunt.registerTask(
		'default',
		"必要なコンパイルを行い画面表示できるようにする。",
		['clean:clientScript', 'typescript:main', 'tslint', 'exec:pegjs', 'concat:dev', 'uglify:browser']);

	grunt.registerTask(
		'test-preprocess',
		"テストに必要な前準備を実行する。",
		['clean:clientScript', 'typescript:test', 'tslint', 'exec:pegjs', 'concat:dev', 'concat:test']);

	grunt.registerTask(
		'test',
		"必要なコンパイルを行いテストを実行する。",
		['test-node']);

	grunt.registerTask(
		'test-node',
		"必要なコンパイルを行いjasmine-nodeでテストを実行する。",
		['test-preprocess', 'jasmine-node']);

	grunt.registerTask(
		'test-karma',
		"必要なコンパイルを行いブラウザ上でテストを実行する。",
		['test-preprocess', 'karma']);

	grunt.registerTask(
		'test-browser',
		"必要なコンパイルを行いブラウザ上でテストを実行する。",
		['test-preprocess', 'open:test-browser']);

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
};
