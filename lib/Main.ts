///<reference path='../typings/node/node.d.ts' />
///<reference path='../typings/es6-promise/es6-promise.d.ts' />

///<reference path='utils/Polyfill.ts' />
///<reference path='utils/Utils.ts' />
///<reference path='i18n/i18n.ts' />
///<reference path='controller/Controller.ts' />
///<reference path='model/CompilerModel.ts' />
///<reference path='parser/Walker.ts' />
///<reference path='parser/Parser.ts' />
///<reference path='parser/Analyzer.ts' />
///<reference path='parser/Validator.ts' />
///<reference path='builder/Builder.ts' />
///<reference path='builder/TextBuilder.ts' />
///<reference path='builder/HtmlBuilder.ts' />

// 本プロジェクトはWebStormを使いこなせた時に開発しやすいよう留意して設計されております
// WebStorm 豆知識
// Cmd+Shift+N で 指定したファイルを開く
// Cmd+Option+Shift+N で 指定したクラスやインタフェースを開く
// Cmd+クリック 定義へジャンプ

// extend lib.d.ts declaration.
interface String {
	trimLeft():string;
}

// AMD用
declare var define:any;

module ReVIEW {
	"use strict";

	/**
	 * ReVIEW文書のコンパイルを開始する。
	 * @param setup
	 * @param options
	 * @returns {Book}
	 */
	export function start(setup:(review:Controller)=>void, options?:ReVIEW.IOptions):Promise<Book> {
		var controller = new Controller(options);
		// setup 中で initConfig が呼び出される
		setup(controller);
		return controller.process();
	}
}

if (ReVIEW.isAMD()) {
	define("review.js", [], () => {
		return ReVIEW;
	});
} else if (ReVIEW.isNodeJS()) {
	module.exports = ReVIEW;
}
