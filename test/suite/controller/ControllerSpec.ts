///<reference path='../../../typings/mocha/mocha.d.ts' />
///<reference path='../../../typings/assert/assert.d.ts' />

import {start} from "../../../lib/Main";

import {TextBuilder} from "../../../lib/builder/TextBuilder";

describe("ReVIEW.Controllerの", () => {
	"use strict";

	it("処理が正しく動くこと", () => {
		var files: any = {
			"ch01.re": "={ch01} ちゃぷたーだよ\n今日の晩ご飯はラフテーだった",
			"ch02.re": "={ch02} チャプター2\n参照 @<hd>{ch02} とか\n//list[hoge][fuga]{\ntest\n//}"
		};
		var result: any = {
		};
		return start(review => {
			review.initConfig({
				read: (path: string) => {
					return Promise.resolve(files[path]);
				},
				write: (path: string, content: any) => {
					result[path] = content;
					return Promise.resolve<void>(null);
				},

				listener: {
					onCompileSuccess: () => {
					},
					onCompileFailed: () => {
					}
				},

				builders: [new TextBuilder()],

				book: {
					contents: [
						{ file: "ch01.re" },
						{ file: "ch02.re" }
					]
				}
			});
		}).then(book=> {
			assert(book.contents.length === 2);
			book.contents.forEach(chunk=> {
				assert(!!chunk.tree.ast);
			});

			assert(book.contents[0].process.symbols.length === 1);
			assert(book.contents[1].process.symbols.length === 3);
		});
	});

	it("章番号の連番が正しく振られること", () => {
		var files: any = {
			"ch01.re": "={ch01} 章1",
			"ch02.re": "={ch02} 章2"
		};
		var result: any = {
		};
		return start(review => {
			review.initConfig({
				read: (path: string) => {
					return Promise.resolve(files[path]);
				},
				write: (path: string, content: any) => {
					result[path] = content;
					return Promise.resolve<void>(null);
				},

				listener: {
					onCompileSuccess: () => {
					},
					onCompileFailed: () => {
					}
				},

				builders: [new TextBuilder()],

				book: {
					contents: [
						{ file: "ch01.re" },
						{ file: "ch02.re" }
					]
				}
			});
		}).then(book=> {
			assert(book.contents.length === 2);
			book.contents.forEach(chunk=> {
				assert(!!chunk.tree.ast);
			});

			assert(book.contents[0].builderProcesses[0].result === "■H1■第1章　章1\n\n");
			assert(book.contents[1].builderProcesses[0].result === "■H1■第2章　章2\n\n");
		});
	});
});
