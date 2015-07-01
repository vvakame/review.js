declare module PEG {
	function parse(input: string): any;

	class SyntaxError {
		line: number;
		column: number;
		offset: number;

		expected: any[];
		found: any;
		name: string;
		message: string;
	}
}
