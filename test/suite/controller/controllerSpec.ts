import * as assert from "power-assert";

import { Builder, start } from "../../../lib/index";

import { TextBuilder } from "../../../lib/builder/textBuilder";
import { HtmlBuilder } from "../../../lib/builder/htmlBuilder";

import { Book } from "../../../lib/model/compilerModel";

describe("ReVIEW.Controllerの", () => {
    "use strict";

    it("処理が正しく動くこと", () => {
        let files: any = {
            "ch01.re": "={ch01} ちゃぷたーだよ\n今日の晩ご飯はラフテーだった",
            "ch02.re": "={ch02} チャプター2\n参照 @<hd>{ch02} とか\n//list[hoge][fuga]{\ntest\n//}"
        };
        let result: any = {
        };
        return start(review => {
            review.initConfig({
                read: (path: string) => {
                    return Promise.resolve(files[path]);
                },
                write: (path: string, content: any) => {
                    result[path] = content;
                    return Promise.resolve<null>(null);
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
        }).then(book => {
            assert(book.contents.length === 2);
            book.contents.forEach(chunk => {
                assert(!!chunk.tree.ast);
            });

            assert(book.contents[0].process.symbols.length === 2); // トップレベルheadlineはシンボルを1つ追加で生成する
            assert(book.contents[1].process.symbols.length === 4); // トップレベルheadlineはシンボルを1つ追加で生成する
        });
    });

    it("章番号の連番が正しく振られること", () => {
        let files: any = {
            "ch01.re": "={ch01} 章1",
            "ch02.re": "={ch02} 章2"
        };
        let result: any = {
        };
        return start(review => {
            review.initConfig({
                read: (path: string) => {
                    return Promise.resolve(files[path]);
                },
                write: (path: string, content: any) => {
                    result[path] = content;
                    return Promise.resolve<null>(null);
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
        }).then(book => {
            assert(book.contents.length === 2);
            book.contents.forEach(chunk => {
                assert(!!chunk.tree.ast);
            });

            assert(book.contents[0].builderProcesses[0].result === "■H1■第1章　章1\n\n");
            assert(book.contents[1].builderProcesses[0].result === "■H1■第2章　章2\n\n");
        });
    });

    function testCrossChapterHeadingReference(builder: Builder, assertion: (book: Book) => void) {
        let files: any = {
            "ch01.re": "={ch01} ちゃぷたーだよ\n\n@<hd>{ch02|sec}を見るのだ",
            "ch02.re": "={ch02} チャプター！\n\n=={sec} せくしょん\n\nここに本文がある"
        };
        let result: any = {
        };
        return start(review => {
            review.initConfig({
                read: (path: string) => {
                    return Promise.resolve(files[path]);
                },
                write: (path: string, content: any) => {
                    result[path] = content;
                    return Promise.resolve<null>(null);
                },

                listener: {
                    onCompileSuccess: () => {
                    },
                    onCompileFailed: () => {
                    }
                },

                builders: [builder],

                book: {
                    contents: [
                        { file: "ch01.re" },
                        { file: "ch02.re" }
                    ]
                }
            });
        }).then(book => {
            assert(book.contents.length === 2);
            book.contents.forEach(chunk => {
                assert(!!chunk.tree.ast);
            });

            assertion(book);
        });
    }

    it("章を越えた@<hd>{...}が正しく動くこと（Text）", () =>
        testCrossChapterHeadingReference(
            new TextBuilder(),
            book => {
                assert(book.contents[0].builderProcesses.length > 0);
                assert(book.contents[0].builderProcesses[0].result === "■H1■第1章　ちゃぷたーだよ\n\n「2.1 せくしょん」を見るのだ\n");
            }
        )
    );

    it("章を越えた@<hd>{...}が正しく動くこと（HTML）", () =>
        testCrossChapterHeadingReference(
            new HtmlBuilder(),
            book => {
                assert(book.contents[0].builderProcesses.length > 0);
                assert(book.contents[0].builderProcesses[0].result.includes("<p>「2.1 せくしょん」を見るのだ</p>"));
            }
        )
    );
});
