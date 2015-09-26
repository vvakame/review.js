export function parse(input: string): any;

export class SyntaxError {
    line: number;
    column: number;
    offset: number;

    expected: any[];
    found: any;
    name: string;
    message: string;
}
