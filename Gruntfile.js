module.exports = function (grunt) {
	require("time-grunt")(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
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
					preserveComments: false
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
		shell: {
			"tsc": {
				command: function () {
					return "\"./node_modules/.bin/tsc\" -p ./";
				}
			},
			"pegjs": {
				command: function () {
					var peg = grunt.config.get("opt.client.peg");
					return "\"./node_modules/.bin/pegjs\" --output " + peg + "/grammar.js " + peg + "/grammar.pegjs";
				}
			}
		}
	});

	grunt.registerTask(
		'setup',
		['clean']);

	grunt.registerTask(
		'default',
		['clean:clientScript', 'shell:tsc', 'tslint', 'shell:pegjs', 'browserify:main', 'uglify:browser']);

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
