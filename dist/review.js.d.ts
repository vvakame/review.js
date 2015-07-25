


import { Book } from "./model/CompilerModel";
import { IOptions } from "./controller/ConfigRaw";
import { Controller } from "./controller/Controller";
import { HtmlBuilder as _HtmlBuilder } from "./builder/HtmlBuilder";
import { TextBuilder as _TextBuilder } from "./builder/TextBuilder";
import { SyntaxType as _SyntaxType } from "./parser/Analyzer";
export declare module Build {
    var HtmlBuilder: typeof _HtmlBuilder;
    var TextBuilder: typeof _TextBuilder;
    var SyntaxType: typeof _SyntaxType;
}
export declare function start(setup: (review: Controller) => void, options?: IOptions): Promise<Book>;

declare module "review.js" {
    export = ReVIEW;
}
