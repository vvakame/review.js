// Karma configuration
// Generated on Mon Aug 19 2013 12:58:48 GMT+0900 (JST)

module.exports = function (config) {
	config.set({

		// base path, that will be used to resolve files and exclude
		basePath: './',


		// frameworks to use
		frameworks: ['mocha'],


		// list of files / patterns to load in the browser
		files: [
			'bower_components/es5-shim/es5-shim.js',
			'bower_components/ypromise/promise.js',
			'bower_components/i18next/i18next.js',
			'bower_components/power-assert/build/power-assert.js',
			'test/test.js'
		],


		// list of files to exclude
		exclude: [
		],


		// test results reporter to use
		// possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
		reporters: ['progress', 'junit'],


		// web server port
		port: 9876,


		// enable / disable colors in the output (reporters and logs)
		colors: true,


		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,


		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,


		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera
		// - Safari (only Mac)
		// - PhantomJS
		// - IE (only Windows)
		browsers: ['Chrome', 'Firefox', 'PhantomJS'],


		// If browser does not capture in given timeout [ms], kill it
		captureTimeout: 60000,


		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun: false
	});
};
