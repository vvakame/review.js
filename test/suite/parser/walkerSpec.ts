import * as assert from "power-assert";

import {RuleName} from "../../../lib/parser/parser";

import {parse, SyntaxTree, ChapterSyntaxTree, HeadlineSyntaxTree, TextNodeSyntaxTree, NodeSyntaxTree, InlineElementSyntaxTree, ArgumentSyntaxTree, UlistElementSyntaxTree, OlistElementSyntaxTree, DlistElementSyntaxTree, ColumnSyntaxTree, ColumnHeadlineSyntaxTree, SingleLineCommentSyntaxTree} from "../../../lib/parser/parser";

import {visit, walk, TreeVisitor} from "../../../lib/parser/walker";

describe("ReVIEW.walkについて", () => {
    "use strict";

    it("目的のNodeを発見できること", () => {
        let input = "= level1\n== level2\n=== level3\n==== level4\n===== level5";
        let parseResult = parse(input);
        let headline: HeadlineSyntaxTree = null;
        visit(parseResult.ast, {
            visitDefaultPre: (_ast: SyntaxTree, _parent: SyntaxTree) => {
            },
            visitHeadlinePre: (ast: HeadlineSyntaxTree, _parent: SyntaxTree) => {
                headline = ast;
            }
        });

        // 最後のやつが取れる
        assert(headline.level === 5);

        let result: ChapterSyntaxTree = null;
        walk(headline, (ast) => {
            if (ast.ruleName === RuleName.Chapter && ast.toChapter().level === 2) {
                result = ast.toChapter();
                return null;
            } else {
                return ast.parentNode;
            }
        });
        // level に応じた適切な構造になってないの忘れてた
        assert(result.level === 2);
    });
});

describe("ReVIEW.visitについて", () => {

    it("挙動のサンプル", () => {
        let input = "= 今日のお昼ごはん\n\n断固としてカレーライス！\n";
        let result = parse(input);
        let actual = "";
        visit(result.ast, {
            visitDefaultPre: (ast: SyntaxTree) => {
                if (ast instanceof TextNodeSyntaxTree) {
                    actual += ast.toTextNode().text + "\n";
                }
            }
        });
        assert(actual === "今日のお昼ごはん\n断固としてカレーライス！\n");
    });

    describe("visitBlockElementについて", () => {
        let input = "= test\n//list{\nhoge\n//}";
        let result = parse(input);

        it("BlockElementSyntaxTreeが処理できる", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (_ast: SyntaxTree) => {
                },
                visitBlockElementPre: (_ast: NodeSyntaxTree) => {
                    actual += "n";
                }
            });
            assert(actual === "n");
        });
        it("visitBlockElementが無い時visitNodeに行く", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (_ast: SyntaxTree) => {
                },
                visitNodePre: (ast: NodeSyntaxTree) => {
                    if (ast.ruleName === RuleName.BlockElement) {
                        actual += "n";
                    }
                }
            });
            assert(actual === "n");
        });
        it("visitBlockElementもvisitNodeも無い時visitDefaultに行く", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (ast: SyntaxTree) => {
                    if (ast.ruleName === RuleName.BlockElement) {
                        actual += "n";
                    }
                }
            });
            assert(actual === "n");
        });
    });

    describe("visitInlineElementについて", () => {
        let input = "= test\n@<fn>{footnote}";
        let result = parse(input);

        it("InlineElementSyntaxTreeが処理できる", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (_ast: SyntaxTree) => {
                },
                visitInlineElementPre: (_ast: InlineElementSyntaxTree) => {
                    actual += "n";
                }
            });
            assert(actual === "n");
        });
        it("visitInlineElementが無い時visitNodeに行く", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (_ast: SyntaxTree) => {
                },
                visitNodePre: (ast: NodeSyntaxTree) => {
                    if (ast.ruleName === RuleName.InlineElement) {
                        actual += "n";
                    }
                }
            });
            assert(actual === "n");
        });
        it("visitInlineElementもvisitNodeも無い時visitDefaultに行く", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (ast: SyntaxTree) => {
                    if (ast.ruleName === RuleName.InlineElement) {
                        actual += "n";
                    }
                }
            });
            assert(actual === "n");
        });
    });

    describe("visitNodeについて", () => {
        let input = "= test"; // Start, Chapters は NodeSyntaxTree
        let result = parse(input);

        it("NodeSyntaxTreeが処理できる", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (_ast: SyntaxTree) => {
                },
                visitNodePre: (_ast: NodeSyntaxTree) => {
                    actual += "n";
                }
            });
            // Start, Chapters, ContentInlines
            assert(actual === "nnnn");
        });
        it("visitNodeが無い時visitDefaultに行く", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (_ast: SyntaxTree) => {
                    actual += "n";
                }
            });
            // Start, Chapters, Chapter, Headline, ContentInlines, ContentInlineText
            assert(actual === "nnnnnn");
        });
    });

    describe("visitArgumentについて", () => {
        let input = "={fuga} hoge";
        let result = parse(input);

        it("ArgumentSyntaxTreeが処理できる", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (_ast: SyntaxTree) => {
                },
                visitArgumentPre: (_ast: ArgumentSyntaxTree) => {
                    actual += "n";
                }
            });
            assert(actual === "n");
        });
        it("visitArgumentが無い時visitDefaultに行く", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (ast: SyntaxTree) => {
                    if (RuleName[ast.ruleName].indexOf("Arg") !== -1) {
                        actual += "n";
                    }
                }
            });
            assert(actual === "n");
        });
    });

    describe("visitChapterについて", () => {
        let input = "= chap1\n= chap2";
        let result = parse(input);

        it("ChapterSyntaxTreeが処理できる", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (_ast: SyntaxTree) => {
                },
                visitChapterPre: (_ast: ChapterSyntaxTree) => {
                    actual += "n";
                }
            });
            assert(actual === "nn");
        });
        it("visitChapterが無い時visitNodeに行く", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (_ast: SyntaxTree) => {
                },
                visitNodePre: (ast: NodeSyntaxTree) => {
                    if (ast.ruleName === RuleName.Chapter) {
                        actual += "n";
                    }
                }
            });
            assert(actual === "nn");
        });
        it("visitChapterが無い時visitDefaultに行く", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (ast: SyntaxTree) => {
                    if (ast.ruleName === RuleName.Chapter) {
                        actual += "n";
                    }
                }
            });
            assert(actual === "nn");
        });
    });

    describe("visitHeadlineについて", () => {
        let input = "= chap1";
        let result = parse(input);

        it("HeadlineSyntaxTreeが処理できる", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (_ast: SyntaxTree) => {
                },
                visitHeadlinePre: (_ast: HeadlineSyntaxTree) => {
                    actual += "n";
                }
            });
            assert(actual === "n");
        });
        it("visitHeadlineが無い時visitDefaultに行く", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (ast: SyntaxTree) => {
                    if (ast.ruleName === RuleName.Headline) {
                        actual += "n";
                    }
                }
            });
            assert(actual === "n");
        });
    });

    describe("visitUlistについて", () => {
        let input = "= chap1\n * ulist";
        let result = parse(input);

        it("UlistElementSyntaxTreeが処理できる", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (_ast: SyntaxTree) => {
                },
                visitUlistPre: (_ast: UlistElementSyntaxTree) => {
                    actual += "n";
                }
            });
            assert(actual === "n");
        });
        it("visitUlistが無い時visitNodeに行く", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (_ast: SyntaxTree) => {
                },
                visitNodePre: (ast: NodeSyntaxTree) => {
                    if (ast.ruleName === RuleName.UlistElement) {
                        actual += "n";
                    }
                }
            });
            assert(actual === "n");
        });
        it("visitUlistが無い時visitDefaultに行く", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (ast: SyntaxTree) => {
                    if (ast.ruleName === RuleName.UlistElement) {
                        actual += "n";
                    }
                }
            });
            assert(actual === "n");
        });
    });

    describe("visitOlistについて", () => {
        let input = "= chap1\n 1. olist";
        let result = parse(input);

        it("OlistElementSyntaxTreeが処理できる", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (_ast: SyntaxTree) => {
                },
                visitOlistPre: (_ast: OlistElementSyntaxTree) => {
                    actual += "n";
                }
            });
            assert(actual === "n");
        });
        it("visitOlistが無い時visitDefaultに行く", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (ast: SyntaxTree) => {
                    if (ast.ruleName === RuleName.OlistElement) {
                        actual += "n";
                    }
                }
            });
            assert(actual === "n");
        });
    });

    describe("visitDlistについて", () => {
        let input = "= chap1\n : dlist\n\tdescription";
        let result = parse(input);

        it("DlistElementSyntaxTreeが処理できる", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (_ast: SyntaxTree) => {
                },
                visitDlistPre: (_ast: DlistElementSyntaxTree) => {
                    actual += "n";
                }
            });
            assert(actual === "n");
        });
        it("visitDlistが無い時visitDefaultに行く", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (ast: SyntaxTree) => {
                    if (ast.ruleName === RuleName.DlistElement) {
                        actual += "n";
                    }
                }
            });
            assert(actual === "n");
        });
    });

    describe("visitColumnについて", () => {
        let input = "= chap1\n===[column] コラム\n";
        let result = parse(input);

        it("ColumnSyntaxTreeが処理できる", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (_ast: SyntaxTree) => {
                },
                visitColumnPre: (_ast: ColumnSyntaxTree) => {
                    actual += "n";
                }
            });
            assert(actual === "n");
        });
        it("visitColumnが無い時visitNodeに行く", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (_ast: SyntaxTree) => {
                },
                visitNodePre: (ast: NodeSyntaxTree) => {
                    if (ast.ruleName === RuleName.Column) {
                        actual += "n";
                    }
                }
            });
            assert(actual === "n");
        });
        it("visitColumnが無い時visitDefaultに行く", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (ast: SyntaxTree) => {
                    if (ast.ruleName === RuleName.Column) {
                        actual += "n";
                    }
                }
            });
            assert(actual === "n");
        });
    });

    describe("visitColumnHeadlineについて", () => {
        let input = "= chap1\n===[column] コラム\n";
        let result = parse(input);

        it("ColumnHeadlineSyntaxTreeが処理できる", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (_ast: SyntaxTree) => {
                },
                visitColumnHeadlinePre: (_ast: ColumnHeadlineSyntaxTree) => {
                    actual += "n";
                }
            });
            assert(actual === "n");
        });
        it("visitColumnHeaderが無い時visitDefaultに行く", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (ast: SyntaxTree) => {
                    if (ast.ruleName === RuleName.ColumnHeadline) {
                        actual += "n";
                    }
                }
            });
            assert(actual === "n");
        });
    });

    describe("visitTextについて", () => {
        let input = "= chap1";
        let result = parse(input);

        it("TextNodeSyntaxTreeが処理できる", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (_ast: SyntaxTree) => {
                },
                visitTextPre: (_ast: TextNodeSyntaxTree) => {
                    actual += "n";
                }
            });
            assert(actual === "n");
        });
        it("visitTextが無い時visitDefaultに行く", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (ast: SyntaxTree) => {
                    if (ast instanceof TextNodeSyntaxTree) {
                        actual += "n";
                    }
                }
            });
            assert(actual === "n");
        });
    });

    describe("visitSingleLineCommentについて", () => {
        let input = "= chap1\n#@ コメントだよ\nコメントじゃないよ";
        let result = parse(input);

        it("SingleLineCommentSyntaxTreeが処理できる", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (_ast: SyntaxTree) => {
                },
                visitSingleLineCommentPre: (_ast: TextNodeSyntaxTree) => {
                    actual += "n";
                }
            });
            assert(actual === "n");
        });
        it("visitSingleLineCommentが無い時visitDefaultに行く", () => {
            let actual = "";
            visit(result.ast, {
                visitDefaultPre: (ast: SyntaxTree) => {
                    if (ast instanceof SingleLineCommentSyntaxTree) {
                        actual += "n";
                    }
                }
            });
            assert(actual === "n");
        });
    });

    describe("探索の制御について", () => {
        let input = "= chap1";
        let result = parse(input);

        it("探索をスキップできる", () => {
            let count = 0;
            visit(result.ast, {
                visitDefaultPre: (_ast: SyntaxTree) => {
                    count++;
                    return false;
                }
            });
            assert(count === 1);
        });

        it("探索方法を指定できる", () => {
            let count = 0;
            visit(result.ast, {
                visitDefaultPre: (ast: SyntaxTree): any => {
                    count++;
                    if (ast.ruleName === RuleName.Start) {
                        return (v: TreeVisitor) => {
                            visit(ast.toNode().childNodes[0], v);
                        };
                    } else {
                        return false;
                    }
                },
                visitChapterPre: (_ast: ChapterSyntaxTree) => {
                    count++;
                }
            });
            assert(count === 2);
        });
    });
});
