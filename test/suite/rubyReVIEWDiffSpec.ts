"use strict";

import * as Test from "./testHelper";

import {isNodeJS} from "../../lib/utils/utils";

import {Builder} from "../../lib/builder/builder";
import {TextBuilder} from "../../lib/builder/textBuilder";
import {HtmlBuilder} from "../../lib/builder/htmlBuilder";

describe("Ruby版ReVIEWとの出力差確認", () => {
    "use strict";

    if (!isNodeJS()) {
        return;
    }

    let exec = require("child_process").exec;

    function convertByRubyReVIEW(fileName: string, target: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            exec(
                `bundle exec review-compile --level=1 --target=${target} content.re`,
                {
                    cwd: `test/fixture/valid/${fileName}/`,
                    env: process.env
                },
                (err: Error, stdout: NodeBuffer, stderr: NodeBuffer) => {
                    if (err) {
                        reject(err);
                        return;
                    } else {
                        resolve(stdout.toString());
                    }
                }
            );
        });
    }

    // PhantomJS 環境下専用のテスト
    describe("正しい構文のファイルが処理できること", () => {
        /* tslint:disable:no-require-imports */
        let fs = require("fs");
        let glob = require("glob");
        /* tslint:enable:no-require-imports */

        let typeList: { ext: string; target: string; builder: () => Builder; }[] = [
            {
                ext: "txt",
                target: "text",
                builder: () => new TextBuilder()
            },
            {
                ext: "html",
                target: "html",
                builder: () => new HtmlBuilder()
            }
        ];

        let path = "test/fixture/valid/";

        let ignoreFiles = [
            "ch01", // lead, emplist がまだサポートされていない
            "empty", // empty への対応をまだ行っていない ファイル実体は存在していない
            "block_graph", // graph への対応がまだ不完全なので
            "inline", // tti がまだサポートされていない < のエスケープとかも
            "inline_nested", // Ruby版はネストを許可しない
            "inline_with_newline", // Ruby版の処理が腐っている気がする
            "lead", // ブロック構文内でのParagraphの扱いがおかしいのを直していない
            "preface", // めんどくさいので
            "preproc",  // めんどくさいので
            "inline_title", // Ruby版の処理がおかしい https://github.com/kmuto/review/issues/624
            "inline_chapref", // Ruby版の処理がおかしい https://github.com/kmuto/review/issues/624
            "inline_chap", // Ruby版の処理がおかしい https://github.com/kmuto/review/issues/624
            "inline_comment", // Ruby版の処理がおかしい https://github.com/kmuto/review/pull/625
            "inline_m", // まだ真面目に実装していない
        ];
        function matchIgnoreFiles(filePath: string) {
            return ignoreFiles
                .map(name => `${path}${name}/content.re`)
                .some(ignoreFilePath => ignoreFilePath === filePath);
        }

        glob.sync(`${path}**/*.re`)
            .filter((filePath: string) => !matchIgnoreFiles(filePath))
            .forEach((filePath: string) => {
                let baseName = filePath
                    .substr(0, filePath.length - "/content.re".length)
                    .substr(path.length);

                typeList.forEach(typeInfo => {
                    let targetFileName = `${path}${baseName}/content.${typeInfo.ext}`;
                    it(`ファイル: ${baseName}/content.${typeInfo.ext}`, () => {
                        let text = fs.readFileSync(filePath, "utf8");
                        return Test.compile({
                            basePath: `${process.cwd()}/test/fixture/valid/${baseName}`,
                            read: path => Promise.resolve(text),
                            builders: [typeInfo.builder()],
                            book: {
                                contents: [
                                    "content.re",
                                ]
                            }
                        })
                            .then(s => {
                                let result: string = s.results["content." + typeInfo.ext];
                                assert(result !== null);

                                let assertResult = () => {
                                    let expected = fs.readFileSync(targetFileName, "utf8");
                                    assert(result === expected);
                                };

                                if (!fs.existsSync(targetFileName)) {
                                    // Ruby版の出力ファイルがない場合、出力処理を行う
                                    return convertByRubyReVIEW(baseName, typeInfo.target)
                                        .then(data => {
                                            fs.writeFileSync(targetFileName, data);

                                            assertResult();
                                            return true;
                                        });
                                } else {
                                    assertResult();
                                    return Promise.resolve(true);
                                }
                            });
                    });
                });
            });
    });
});
