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
			default: {
				tsconfig: {
					tsconfig: "./tsconfig.json",
					updateFiles:false
				}
			}
		},
		tsconfig: {
				main: {
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
					module: "commonjs",
					out: './docs',
					name: '<%= pkg.name %>',
					target: "es5",
					experimentalDecorators: ""
				},
				src: [
					"./**/*.ts",
					"./**/*.tsx",
					"!./**/*.d.ts",
					"!./lib/cli.ts",
					"./lib/typings/**/*.d.ts",
					"./typings/**/*.d.ts",
					"!./test/**/*.ts",
					"!./example/**/*.ts",
					"!./pages/**/*.ts",
					"!./bower_components/**/*.ts",
					"!./node_modules/**/*",
					"./node_modules/typescript/lib/lib.es6.d.ts"
				]
			},
			travisCI: {
				options: {
					module: "commonjs",
					out: './pages/docs',
					name: '<%= pkg.name %>',
					target: "es5",
					experimentalDecorators: ""
				},
				src: [
					"./**/*.ts",
					"./**/*.tsx",
					"!./**/*.d.ts",
					"!./lib/cli.ts",
					"./lib/typings/**/*.d.ts",
					"./typings/**/*.d.ts",
					"!./test/**/*.ts",
					"!./example/**/*.ts",
					"!./pages/**/*.ts",
					"!./bower_components/**/*.ts",
					"!./node_modules/**/*",
					"./node_modules/typescript/lib/lib.es6.d.ts"
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
		browserify: {
			main: {
				files: {
					"dist/review.js": [
						"lib/index.js"
					]
				},
				options: {
					browserifyOptions: {
						bundleExternal: false,
						standalone: "ReVIEW",
						detectGlobals: false
					}
				}
			},
			test: {
				files: {
					"test/test.js": [
						"test/suite/indexSpec.js"
					]
				},
				options: {
					browserifyOptions: {
						bundleExternal: false,
						detectGlobals: false
					}
				}
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
						'<%= opt.client.outBase %>/review.js'
					]
				}
			}
		},
		clean: {
			clientScript: {
				src: [
					// client
					'<%= opt.client.jsMainOut %>/**/*.js',
					'<%= opt.client.jsMainOut %>/**/*.d.ts',
					'<%= opt.client.jsMainOut %>/**/*.js.map',
					'!<%= opt.client.jsMainOut %>/typings/**/*.d.ts',
					// client test
					'<%= opt.client.jsTestOut %>/*.js',
					'<%= opt.client.jsTestOut %>/suite/**/*.js',
					'<%= opt.client.jsTestOut %>/suite/**/*.js.map',
					'<%= opt.client.jsTestOut %>/suite/**/*.d.ts',
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
					'<%= opt.client.jsTestOut %>/suite/indexSpec.js'
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
					return "./node_modules/.bin/pegjs --cache " + peg + "/grammar.pegjs " + peg + "/grammar.js";
				}
			}
		}
	});

	grunt.registerTask(
		'setup',
		['clean', 'bower', 'dtsm']);

	grunt.registerTask(
		'default',
		['clean:clientScript', 'tsconfig', 'ts', 'tslint', 'exec:pegjs', 'browserify:main', 'uglify:browser']);

	grunt.registerTask(
		'test-preprocess',
		['default', 'browserify:test']);

	grunt.registerTask(
		'test',
		['test-node']);

	grunt.registerTask(
		'test-node',
		['test-preprocess', 'mochaTest']);

	grunt.registerTask(
		'test-browser',
		['test-preprocess', 'open:test-browser']);

	require('load-grunt-tasks')(grunt);
};
