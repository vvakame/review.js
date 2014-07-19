module.exports = function (grunt) {
	require("time-grunt")(grunt);

	grunt.initConfig({
		bower: {
			install: {
				options: {
					install: true,
					copy: false,
					verbose: true,
					cleanBowerDir: false
				}
			}
		},
		wiredep: {
			main: {
				src: ['index.html'] // point to your HTML file.
			}
		}
	});

	grunt.registerTask(
		'setup',
		"プロジェクトの初期セットアップを行う。",
		['bower', 'wiredep']);

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
};
