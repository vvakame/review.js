///<reference path='../node_modules/typescript/bin/lib.es6.d.ts' />
///<reference path='../typings/node/node.d.ts' />

///<reference path='./typings/polyfill.d.ts' />

// 本プロジェクトはWebStormを使いこなせた時に開発しやすいよう留意して設計されております
// WebStorm 豆知識
// Cmd+Shift+N で 指定したファイルを開く
// Cmd+Option+Shift+N で 指定したクラスやインタフェースを開く
// Cmd+クリック 定義へジャンプ

"use strict";

import {Book} from "./model/CompilerModel";
import {IOptions} from "./controller/ConfigRaw";
import {Controller} from "./controller/Controller";

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
