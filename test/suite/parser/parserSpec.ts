import * as assert from "power-assert";

import * as Test from "../testHelper";

import * as PEG from "../../../resources/grammar";

import { isNodeJS } from "../../../lib/utils/utils";

import { parse, SyntaxTree } from "../../../lib/parser/parser";
import { TextBuilder } from "../../../lib/builder/textBuilder";

function updateIfSyntaxError(e: any) {
    "use strict";

    if (e instanceof PEG.SyntaxError) {
        let se: PEG.SyntaxError = e;
        let additionalInfo = "raised: offset=" + se.offset + ", line=" + se.line + ", column=" + se.column;
        se.message = additionalInfo + ". " + se.message;
    }
}

describe("ReVIEW構文の", () => {
    "use strict";

    if (isNodeJS()) {
        /* tslint:disable:no-require-imports */
        let fs = require("fs");
        let glob = require("glob");
        /* tslint:enable:no-require-imports */
        // PhantomJS 環境下専用のテスト
        describe("正しい構文のファイルが処理できること", () => {
            let path = "test/fixture/valid/";

            let ignoreFiles = [
                "block_dont_has_body.re", // noindent がまだサポートされていない
                "ch01.re", // lead, emplist がまだサポートされていない
                "headline.re", // なんか落ちる
                "inline.re" // tti がまだサポートされていない
            ];
            function matchIgnoreFiles(filePath: string) {
                return ignoreFiles
                    .map(name => `${path}${name}/content.re`)
                    .some(ignoreFilePath => ignoreFilePath === filePath);
            }

            let files = glob.sync(`${path}**/*.re`)
                .filter((filePath: string) => !matchIgnoreFiles(filePath))
                ;

            files
                .forEach((filePath: string) => {
                    let baseName = filePath
                        .substr(0, filePath.length - "/content.re".length)
                        .substr(path.length);
                    let astFilePath = `${path}${baseName}/content.ast`;
                    it(`ファイル: ${baseName}/content.ast`, () => {
                        let text = fs.readFileSync(filePath, "utf8");
                        return Test.compile({
                            basePath: __dirname + "/fixture/valid",
                            read: _path => Promise.resolve(text),
                            builders: [new TextBuilder()],
                            book: {
                                contents: [
                                    "content.re",
                                ]
                            }
                        })
                            .then(s => {
                                let result: string = s.results[baseName + ".txt"];
                                assert(result !== null);

                                let ast = JSON.stringify(s.book.allChunks[0].tree.ast, null, 2);
                                if (!fs.existsSync(astFilePath)) {
                                    // ASTファイルが無い場合、現時点で生成されるASTを出力する
                                    fs.writeFileSync(astFilePath, ast);
                                }
                                let expectedAST = fs.readFileSync(astFilePath, "utf8");
                                assert.deepEqual(JSON.parse(ast), JSON.parse(expectedAST));
                            })
                            .catch(e => {
                                updateIfSyntaxError(e);
                                throw e;
                            });
                    });
                });
        });

        describe("正しくない構文のファイルが処理できること", () => {
            let path = "test/fixture/invalid/";
            let files = glob.sync(`${path}**/*.re`);
            files
                .forEach((filePath: string) => {
                    let baseName = filePath
                        .substr(0, filePath.length - "/content.re".length)
                        .substr(path.length);

                    it("ファイル:" + baseName, () => {
                        let data = fs.readFileSync(filePath, "utf8");
                        try {
                            parse(data);
                            throw new Error("正しく処理できてしまった");
                        } catch (e) {
                            if (e instanceof PEG.SyntaxError) {
                                // ok
                            } else {
                                throw e;
                            }
                        }
                    });
                });
        });
    }

    describe("正常に処理ができる文字列を与える", () => {
        let strings = [
            "= 今日のお昼ごはん\n\n断固としてカレーライス！\n",
            "= ブロック要素のテスト\n\n//list[hoge][fuga]{\nlet hoge = confirm(\"test\");\n\n// JS comment\n//}",
            "=[hoge]{fuga} 両方付き",
            "= headline\n@<kw>{hoge,fuga}\n",
            "= ＼(^o^)／\n\n#@# コメント\n",
            "= use review-preproc\n//list[hoge][]{\n#@mapfile(bin/grammar.js)\n#@end\n//}",
            "= headline\nというように、型を @<tti>{<} と　@<tti>{>} で囲んで式 expression の先頭に置くと\n",
            "= @がinlineじゃなく出てくる\n\n例えば @Override アノテーションの話とか。",
            "= 1つ目\n= 2つ目\n\n段落1\n\n段落2\n段落2続き\n\n段落3\n= 3つ目",
            "= level 1\n== level 2\n===level 3\n====     level 4\n\n=[hoge] []付き\n={fuga} {}付き\n=[hoge]{fuga} 両方付き\n",
            "= ulist\n\n * level 1\n ** level 2\n *** level 3",
            "= olist\n\n 1. No. 1\n 2. No. 2\n 3. No. 3\n",
            "= dlist\n\n: hoge\n  これはマジマッハ\n\n: fuga\n	これはマジファンキー\n",
            "= コラム\n===[column] コラム\nコラムです。\n",
            "= コラム\n===[column] コラム\nコラムです。\n===[/column]",
            "= 章1\n==[column] こらむだよー\n=== コラム見出し1\n==== コラム見出し2\n== 節だよー\n= 章2",
            "= title\n//list[hoge][きゃぷしょん]{\nalert('hello');\n\n//}\n"
        ];
        strings.forEach((str) => {
            it("try: " + str.substr(0, 15), () => {
                try {
                    let result = parse(str);
                    false && console.log(JSON.stringify(result));
                } catch (e) {
                    updateIfSyntaxError(e);
                    throw e;
                }
            });
        });
    });

    describe("SyntaxTreeクラスの", () => {
        it("JSON.stringifyで無限再起にならないこと", () => {
            let syntax = new SyntaxTree({
                location: {
                    start: { line: 0, column: 0, offset: 0 },
                    end: { line: 0, column: 0, offset: 0 }
                },
                syntax: "SinglelineComment",
                content: ""
            });
            // syntax.parentNode = syntax;
            let json = JSON.stringify(syntax);
            assert(json === "{\"ruleName\":\"SinglelineComment\",\"location\":{\"start\":{\"line\":0,\"column\":0,\"offset\":0},\"end\":{\"line\":0,\"column\":0,\"offset\":0}}}");
        });
    });
});
