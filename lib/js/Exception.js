(function (ReVIEW) {
	(function (Build) {
		var __extends = this.__extends || function (d, b) {
			for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
			function __() {
				this.constructor = d;
			}

			__.prototype = b.prototype;
			d.prototype = new __();
		};

		var AnalyzerError = (function (_super) {
			__extends(AnalyzerError, _super);
			function AnalyzerError(message) {
				_super.call(this, message);
				this.name = "AnalyzerError";
				this.message = message;

				if (Error.captureStackTrace) {
					Error.captureStackTrace(this, AnalyzerError);
				}
			}

			return AnalyzerError;
		})(Error);
		Build.AnalyzerError = AnalyzerError;

	})(ReVIEW.Build || (ReVIEW.Build = {}));
})(ReVIEW || (ReVIEW = {}));
