@replace(Error)
export class DummyError {
    name: string;
    constructor(public message: string) {
    }
}

function replace(src: any) {
	"use strict";

    return (_: any) => src;
}

export class AnalyzerError extends DummyError {
    constructor(message: string) {
        super(message);
        this.name = "AnalyzerError";
        this.message = message;

        if ((<any>Error).captureStackTrace) {
            (<any>Error).captureStackTrace(this, AnalyzerError);
        }
    }
}
