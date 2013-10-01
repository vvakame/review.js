declare module ReVIEW.Build {

	interface AnalyzerError extends Error {
	}

	var AnalyzerError:{
		new (message?:string): AnalyzerError;
		(message?:string): AnalyzerError;
		prototype: AnalyzerError;
	}
}
