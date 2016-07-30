"use strict";

import {Book, ContentChunk, ReportLevel, ProcessReport, Symbol} from "./model/compilerModel";
import {Options} from "./controller/configRaw";
import {Controller} from "./controller/controller";

import {NodeLocation, SyntaxTree} from "./parser/parser";
export * from "./parser/parser";
import {AcceptableSyntaxes, Analyzer, DefaultAnalyzer} from "./parser/analyzer";
import {Validator, DefaultValidator} from "./parser/validator";

import {Builder, DefaultBuilder} from "./builder/builder";
import {HtmlBuilder} from "./builder/htmlBuilder";
import {TextBuilder} from "./builder/textBuilder";
import {SyntaxType} from "./parser/analyzer";

export { Book, ContentChunk, ReportLevel, ProcessReport, NodeLocation, Symbol, SyntaxTree, AcceptableSyntaxes, Analyzer, DefaultAnalyzer, Validator, DefaultValidator, Builder, DefaultBuilder, HtmlBuilder, TextBuilder, SyntaxType };

/**
 * ReVIEW文書のコンパイルを開始する。
 * @param setup
 * @param options
 * @returns {Book}
 */
export function start(setup: (review: Controller) => void, options?: Options): Promise<Book> {
    "use strict";

    let controller = new Controller(options);
    // setup 中で initConfig が呼び出される
    setup(controller);
    return controller.process();
}
