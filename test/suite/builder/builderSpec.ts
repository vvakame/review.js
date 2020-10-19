import * as assert from "power-assert";

import * as Test from "../testHelper";

import { ReportLevel } from "../../../lib/model/compilerModel";

import { TextBuilder } from "../../../lib/builder/textBuilder";

describe("ReVIEW.Buildの", () => {
    "use strict";

    it("処理が正しく動くこと", () => {
        return Test.compile({
            read: (path: any) => {
                return Promise.resolve((<any>{
                    "ch01.re": "={ch01} ちゃぷたーだよ\n今日の晩ご飯はラフテーだった",
                    "ch02.re": "={ch02} チャプター2\n参照 @<hd>{ch02} とか\n//list[hoge][fuga]{\ntest\n//}"
                })[path]);
            },

            book: {
                contents: [
                    { file: "ch01.re" },
                    { file: "ch02.re" }
                ]
            }
        }).then(success => {
            let book = success.book;

            assert(book.contents.length === 2);
            book.contents.forEach(chunk => {
                assert(!!chunk.tree.ast);
            });

            assert(book.contents[0].process.symbols.length === 2); // トップレベルheadlineはシンボルを1つ追加で生成する
            assert(book.contents[1].process.symbols.length === 4); // トップレベルheadlineはシンボルを1つ追加で生成する
        });
    });

    describe("DefaultAnalyzerの動作の確認として", () => {
        it("正しくsymbolの解決が出来る", () => {
            return Test.compileSingle("={ch01} chapter01\n@<hd>{ch01}\n@<hd>{missing}")
                .then(failure => {
                    let book = failure.book;
                    let missingSymbols = book.contents[0].process.missingSymbols;
                    assert(missingSymbols.length === 1);
                    let refTo = missingSymbols[0].referenceTo;
                    assert(refTo && refTo.label === "missing");
                });
        });
    });

    describe("DefaultValidatorの動作の確認として", () => {
        it("トップレベルのChapterは必ず level 1 であること", () => {
            return Test.compile({
                read: (path: any) => {
                    return Promise.resolve((<any>{
                        "ch01.re": "= level 1\n== level2",
                        "ch02.re": "== level 2"
                    })[path]);
                },

                book: {
                    contents: [
                        { file: "ch01.re" },
                        { file: "ch02.re" }
                    ]
                }
            }).then(failure => {
                let book = failure.book;
                assert(book.reports.length === 1);
                assert(book.reports[0].level === ReportLevel.Error);
            });
        });
    });

    describe("DefaultBuilderの動作の確認として", () => {
        it("正常に処理が完了できること", () => {
            let builder = new TextBuilder();
            return Test.compileSingle(
                "= hoge\n== fuga\n=== moge\n== piyo\n=== foo\n== bar\n",
                { builders: [builder] }
            )
                .then(success => {
                    let book = success.book;
                    let expected = "■H1■第1章　hoge\n\n■H2■1.1　fuga\n\n■H3■1.1.1　moge\n\n■H2■1.2　piyo\n\n■H3■1.2.1　foo\n\n■H2■1.3　bar\n\n";
                    assert(book.contents[0].findResultByBuilder(builder) === expected);
                });
        });
    });
});
