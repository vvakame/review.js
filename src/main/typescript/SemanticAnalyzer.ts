// 意味解析を行う
// 後から拡張(review-ext.rb的な)可能な設計にすること

// Original ReVIEW について
// CHAPS, PREDEF, POSTDEF, config.yml が存在する

// ブラウザ, Node.js 上両方で動作するためにFileIOの抽象化層が必要

// review-compile に secnolevel, toclevel

module ReVIEW {
	export function analyse(ast:ReVIEW.Parse.SyntaxTree) {

	}

	export module Book {
		export class Book {
			parts:Part[];
		}

		// PREDEF, CHAPS, POSTDEF かな？
		// Part毎に章番号を採番する
		// PREDEF は採番しない
		export class Part {
			chaps:Chapter[];
		}

		export class Chapter {

		}
	}
}
