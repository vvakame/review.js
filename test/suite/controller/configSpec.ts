import * as assert from "power-assert";

import { BookStructure, ConfigBook } from "../../../lib/controller/configRaw";

describe("ReVIEWのConfig.tsの", () => {
    "use strict";

    function verifyBookData(book: BookStructure) {
        assert(book.predef.length === 1);
        assert(!book.predef[0].part);
        assert(book.predef[0].chapter!.file === "pre.re");

        assert(book.contents.length === 4);
        assert(!book.contents[0].part);
        assert(book.contents[0].chapter!.file === "fullsetA.re");

        assert(!book.contents[1].part);
        assert(book.contents[1].chapter!.file === "fullsetB.re");

        assert(!book.contents[2].chapter);
        assert(book.contents[2].part!.file === "parent.re");
        assert(book.contents[2].part!.chapters.length === 1);
        assert(book.contents[2].part!.chapters[0].file === "child.re");

        assert(!book.contents[3].part);
        assert(book.contents[3].chapter!.file === "fullsetC.re");

        assert(book.appendix.length === 1);
        assert(!book.appendix[0].part);
        assert(book.appendix[0].chapter!.file === "appendix.re");

        assert(book.postdef.length === 1);
        assert(!book.postdef[0].part);
        assert(book.postdef[0].chapter!.file === "post.re");
    }

    it("IConfigBookに設定ができる IConfigPartOrChapterでchapterプロパティを使う", () => {
        let book: ConfigBook = {
            predef: [
                { file: "pre.re" }
            ],
            contents: [
                { chapter: { file: "fullsetA.re" } },
                { chapter: { file: "fullsetB.re" } },
                {
                    part: {
                        file: "parent.re",
                        chapters: [
                            { file: "child.re" }
                        ]
                    }
                },
                { chapter: { file: "fullsetC.re" } }
            ],
            appendix: [
                { file: "appendix.re" }
            ],
            postdef: [
                { file: "post.re" }
            ]
        };
        verifyBookData(BookStructure.createBook(book));
    });

    it("IConfigBookに設定ができる IConfigPartOrChapterでnameプロパティを使う", () => {
        let book: ConfigBook = {
            predef: [
                { file: "pre.re" }
            ],
            contents: [
                { file: "fullsetA.re" },
                { file: "fullsetB.re" },
                {
                    part: {
                        file: "parent.re",
                        chapters: [
                            { file: "child.re" }
                        ]
                    }
                },
                { file: "fullsetC.re" }
            ],
            appendix: [
                { file: "appendix.re" }
            ],
            postdef: [
                { file: "post.re" }
            ]
        };
        verifyBookData(BookStructure.createBook(book));
    });

    it("IConfigBookに設定ができる JS(型なし)用短縮形式", () => {
        let book: any = {
            predef: [
                "pre.re"
            ],
            contents: [
                "fullsetA.re",
                "fullsetB.re",
                {
                    file: "parent.re",
                    chapters: [
                        "child.re"
                    ]
                },
                "fullsetC.re"
            ],
            appendix: [
                "appendix.re"
            ],
            postdef: [
                "post.re"
            ]
        };
        verifyBookData(BookStructure.createBook(book));
    });

    it("IConfigBookに設定ができる YAML形式より", () => {
        // TODO
        let book: any = {
            PREDEF: ['pre.re'],
            CHAPS: [
                'fullsetA.re',
                'fullsetB.re',
                {
                    'parent.re': [
                        'child.re'
                    ]
                },
                'fullsetC.re'
            ],
            APPENDIX: ['appendix.re'],
            POSTDEF: ['post.re']
        };
        verifyBookData(BookStructure.createBook(book));
    });
});
