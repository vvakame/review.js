///<reference path='../node_modules/typescript/bin/lib.es6.d.ts' />
///<reference path='../typings/node/node.d.ts' />

///<reference path='./typings/polyfill.d.ts' />

// 本プロジェクトはWebStormを使いこなせた時に開発しやすいよう留意して設計されております
// WebStorm 豆知識
// Cmd+Shift+N で 指定したファイルを開く
// Cmd+Option+Shift+N で 指定したクラスやインタフェースを開く
// Cmd+クリック 定義へジャンプ

"use strict";

import {Book, ReportLevel} from "./model/compilerModel";
import {IOptions} from "./controller/configRaw";
import {Controller} from "./controller/controller";

import {HtmlBuilder as _HtmlBuilder} from "./builder/htmlBuilder";
import {TextBuilder as _TextBuilder} from "./builder/textBuilder";
import {SyntaxType as _SyntaxType} from "./parser/analyzer";

export namespace Build {
	"use strict";

	/* tslint:disable:variable-name */
	export var HtmlBuilder = _HtmlBuilder;
	export var TextBuilder = _TextBuilder;
	export var SyntaxType = _SyntaxType;
	/* tslint:enable:variable-name */
}

ReportLevel;
export { ReportLevel };

// AMD用
declare var define: any;

/**
 * ReVIEW文書のコンパイルを開始する。
 * @param setup
 * @param options
 * @returns {Book}
 */
export function start(setup: (review: Controller) => void, options?: IOptions): Promise<Book> {
	"use strict";

	let controller = new Controller(options);
	// setup 中で initConfig が呼び出される
	setup(controller);
	return controller.process();
}
