///<reference path='../node_modules/typescript/bin/lib.es6.d.ts' />
///<reference path='../typings/node/node.d.ts' />

///<reference path='./typings/polyfill.d.ts' />

// 本プロジェクトはWebStormを使いこなせた時に開発しやすいよう留意して設計されております
// WebStorm 豆知識
// Cmd+Shift+N で 指定したファイルを開く
// Cmd+Option+Shift+N で 指定したクラスやインタフェースを開く
// Cmd+クリック 定義へジャンプ

"use strict";

import {Book, ReportLevel, ProcessReport, Symbol} from "./model/compilerModel";
import {Options} from "./controller/configRaw";
import {Controller} from "./controller/controller";

import {SyntaxTree} from "./parser/parser";
import {AcceptableSyntaxes, Analyzer, DefaultAnalyzer} from "./parser/analyzer";

import {Builder, DefaultBuilder} from "./builder/builder";
import {HtmlBuilder} from "./builder/htmlBuilder";
import {TextBuilder} from "./builder/textBuilder";
import {SyntaxType} from "./parser/analyzer";

export { Book, ReportLevel, ProcessReport, Symbol, SyntaxTree, AcceptableSyntaxes, Analyzer, DefaultAnalyzer, Builder, DefaultBuilder, HtmlBuilder, TextBuilder, SyntaxType };

// AMD用
declare var define: any;

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

// hack for https://github.com/Microsoft/TypeScript/issues/4274
export function _doNotUseHackForTypeScriptIssue4274() {
	"use strict";

	/* tslint:disable:variable-name */
	let Symbol: Symbol;
	let Analyzer: Analyzer;
	let Builder: Builder;
	return {
		Book, ReportLevel, ProcessReport, Symbol,
		SyntaxTree,
		AcceptableSyntaxes, Analyzer, DefaultAnalyzer,
		Builder, DefaultBuilder, HtmlBuilder, TextBuilder, SyntaxType
	};
	/* tslint:enable:variable-name */
}
