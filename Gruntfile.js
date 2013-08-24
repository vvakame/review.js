module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		// Java用プロジェクト構成向け設定
		opt: {
			"tsMain": "src/main/typescript",
			"tsMainLib": "src/main/typescript/libs",
			"tsTest": "src/test/typescript",
			"tsTestLib": "src/test/typescript/libs",
			"peg": "src/main/peg",

			"outBase": "bin",
			"jsMainOut": "bin",
			"jsTestOut": "src/test/typescript"
		},

		typescript: {
			main: { // --declarations --sourcemap --target ES5 --out client/scripts/main.js client/scripts/main.ts
				src: ['<%= opt.tsMain %>/Ignite.ts'],
				dest: '<%= opt.jsMainOut %>',
				options: {
					target: 'es5',
					base_path: '<%= opt.tsMain %>',
					sourcemap: false,
					declaration: false,
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
						dest: '<%= opt.jsMainOut %>/libs/'
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
		replace: {
			peg: {
				src: ['<%= opt.peg %>/grammer.peg'],
				dest: '<%= opt.peg %>/grammer-processed.peg',
				replacements: [
					{
						from: /(^|\n)\s*[=\/].*/g,
						to: function (matchedWord) {
							return matchedWord + '\t\t\t{ ReVIEW.parser.parse(arguments); }';
						}
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
					'<%= opt.jsMainOut %>/grammer.js',
					'<%= opt.jsMainOut %>/*.js'
				],
				dest: '<%= opt.jsMainOut %>/main.min.js'
			}
		},
		uglify: {
			prod: {
				options: {
					report: 'gzip',
					// 変数名の圧縮類は作業コストが大きすぎるのでやらない
					mangle: false,
					preserveComments: 'some'
				},
				files: {
					'<%= opt.jsMainOut %>/main.min.js': [
						'<%= opt.jsMainOut %>/grammer.js',
						'<%= opt.jsMainOut %>/*.js'
					]
				}
			},
			test: {
				options: {
					report: 'min',
					// 変数名の圧縮類は作業コストが大きすぎるのでやらない
					beautify: true,
					mangle: false,
					preserveComments: 'some',

					sourceMap: '<%= opt.jsMainOut %>/source.js.map',
					sourceMapRoot: '',
					sourceMappingURL: 'source.js.map'
				},
				files: {
					'<%= opt.jsTestOut %>/test.js': [
						'<%= opt.jsMainOut %>/grammer.js',
						'<%= opt.jsTestOut %>/main-spec.js'
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
					// minified
					'<%= opt.jsMainOut %>/main.min.js',
					'<%= opt.jsMainOut %>/source.js.map'
				]
			},
			peg: {
				src: [
					'<%= opt.peg %>/grammer-processed.peg'
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
					return "tsd install node jasmine";
				}
			},
			"pegjs": {
				cmd: function () {
					var main = grunt.config.get("opt.jsMainOut") + "/";
					var peg = grunt.config.get("opt.peg") + "/";
					return "./util/review-parser-generator > " + main + "/grammer.js";
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
		['clean:clientScript', 'typescript:main', 'tslint', 'replace', 'exec:pegjs', 'concat:dev']);

	grunt.registerTask(
		'test-preprocess',
		"テストに必要な前準備を実行する。",
		['clean:clientScript', 'typescript:test', 'tslint', 'replace', 'exec:pegjs', 'concat:dev', 'uglify:test']);

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
