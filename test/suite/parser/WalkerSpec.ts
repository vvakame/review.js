///<reference path='../../../typings/mocha/mocha.d.ts' />
///<reference path='../../../typings/assert/assert.d.ts' />

///<reference path='../../../lib/parser/Walker.ts' />

"use strict";

import {RuleName} from "../../../lib/parser/Parser";

import {parse, SyntaxTree, ChapterSyntaxTree, HeadlineSyntaxTree, TextNodeSyntaxTree, NodeSyntaxTree, InlineElementSyntaxTree, ArgumentSyntaxTree, UlistElementSyntaxTree, OlistElementSyntaxTree, DlistElementSyntaxTree, ColumnSyntaxTree, ColumnHeadlineSyntaxTree} from "../../../lib/parser/Parser";

import {visit, walk, ITreeVisitor} from "../../../lib/parser/Walker";

describe("ReVIEW.walkについて", () => {
	"use strict";

	it("目的のNodeを発見できること", () => {
		var input = "= level1\n== level2\n=== level3\n==== level4\n===== level5";
		var parseResult = parse(input);
		var headline: HeadlineSyntaxTree = null;
		visit(parseResult.ast, {
			visitDefaultPre: (ast: SyntaxTree, parent: SyntaxTree) => {
			},
			visitHeadlinePre: (ast: HeadlineSyntaxTree, parent: SyntaxTree) => {
				headline = ast;
			}
		});

		// 最後のやつが取れる
		assert(headline.level === 5);

		var result: ChapterSyntaxTree = null;
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
		var input = "= 今日のお昼ごはん\n\n断固としてカレーライス！\n";
		var result = parse(input);
		var actual = "";
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
		var input = "= test\n//list{\nhoge\n//}";
		var result = parse(input);

		it("BlockElementSyntaxTreeが処理できる", () => {
			var actual = "";
			visit(result.ast, {
				visitDefaultPre: (ast: SyntaxTree) => {
				},
				visitBlockElementPre: (ast: NodeSyntaxTree) => {
					actual += "n";
				}
			});
			assert(actual === "n");
		});
		it("visitBlockElementが無い時visitNodeに行く", () => {
			var actual = "";
			visit(result.ast, {
				visitDefaultPre: (ast: SyntaxTree) => {
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
			var actual = "";
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
		var input = "= test\n@<fn>{footnote}";
		var result = parse(input);

		it("InlineElementSyntaxTreeが処理できる", () => {
			var actual = "";
			visit(result.ast, {
				visitDefaultPre: (ast: SyntaxTree) => {
				},
				visitInlineElementPre: (ast: InlineElementSyntaxTree) => {
					actual += "n";
				}
			});
			assert(actual === "n");
		});
		it("visitInlineElementが無い時visitNodeに行く", () => {
			var actual = "";
			visit(result.ast, {
				visitDefaultPre: (ast: SyntaxTree) => {
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
			var actual = "";
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
		var input = "= test"; // Start, Chapters は NodeSyntaxTree
		var result = parse(input);

		it("NodeSyntaxTreeが処理できる", () => {
			var actual = "";
			visit(result.ast, {
				visitDefaultPre: (ast: SyntaxTree) => {
				},
				visitNodePre: (ast: NodeSyntaxTree) => {
					actual += "n";
				}
			});
			// Start, Chapters, ContentInlines
			assert(actual === "nnnn");
		});
		it("visitNodeが無い時visitDefaultに行く", () => {
			var actual = "";
			visit(result.ast, {
				visitDefaultPre: (ast: SyntaxTree) => {
					actual += "n";
				}
			});
			// Start, Chapters, Chapter, Headline, ContentInlines, ContentInlineText
			assert(actual === "nnnnnn");
		});
	});

	describe("visitArgumentについて", () => {
		var input = "={fuga} hoge";
		var result = parse(input);

		it("ArgumentSyntaxTreeが処理できる", () => {
			var actual = "";
			visit(result.ast, {
				visitDefaultPre: (ast: SyntaxTree) => {
				},
				visitArgumentPre: (ast: ArgumentSyntaxTree) => {
					actual += "n";
				}
			});
			assert(actual === "n");
		});
		it("visitArgumentが無い時visitDefaultに行く", () => {
			var actual = "";
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
		var input = "= chap1\n= chap2";
		var result = parse(input);

		it("ChapterSyntaxTreeが処理できる", () => {
			var actual = "";
			visit(result.ast, {
				visitDefaultPre: (ast: SyntaxTree) => {
				},
				visitChapterPre: (ast: ChapterSyntaxTree) => {
					actual += "n";
				}
			});
			assert(actual === "nn");
		});
		it("visitChapterが無い時visitNodeに行く", () => {
			var actual = "";
			visit(result.ast, {
				visitDefaultPre: (ast: SyntaxTree) => {
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
			var actual = "";
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
		var input = "= chap1";
		var result = parse(input);

		it("HeadlineSyntaxTreeが処理できる", () => {
			var actual = "";
			visit(result.ast, {
				visitDefaultPre: (ast: SyntaxTree) => {
				},
				visitHeadlinePre: (ast: HeadlineSyntaxTree) => {
					actual += "n";
				}
			});
			assert(actual === "n");
		});
		it("visitHeadlineが無い時visitDefaultに行く", () => {
			var actual = "";
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
		var input = "= chap1\n * ulist";
		var result = parse(input);

		it("UlistElementSyntaxTreeが処理できる", () => {
			var actual = "";
			visit(result.ast, {
				visitDefaultPre: (ast: SyntaxTree) => {
				},
				visitUlistPre: (ast: UlistElementSyntaxTree) => {
					actual += "n";
				}
			});
			assert(actual === "n");
		});
		it("visitUlistが無い時visitNodeに行く", () => {
			var actual = "";
			visit(result.ast, {
				visitDefaultPre: (ast: SyntaxTree) => {
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
			var actual = "";
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
		var input = "= chap1\n 1. olist";
		var result = parse(input);

		it("OlistElementSyntaxTreeが処理できる", () => {
			var actual = "";
			visit(result.ast, {
				visitDefaultPre: (ast: SyntaxTree) => {
				},
				visitOlistPre: (ast: OlistElementSyntaxTree) => {
					actual += "n";
				}
			});
			assert(actual === "n");
		});
		it("visitOlistが無い時visitDefaultに行く", () => {
			var actual = "";
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
		var input = "= chap1\n : dlist\n\tdescription";
		var result = parse(input);

		it("DlistElementSyntaxTreeが処理できる", () => {
			var actual = "";
			visit(result.ast, {
				visitDefaultPre: (ast: SyntaxTree) => {
				},
				visitDlistPre: (ast: DlistElementSyntaxTree) => {
					actual += "n";
				}
			});
			assert(actual === "n");
		});
		it("visitDlistが無い時visitDefaultに行く", () => {
			var actual = "";
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
		var input = "= chap1\n===[column] コラム\n";
		var result = parse(input);

		it("ColumnSyntaxTreeが処理できる", () => {
			var actual = "";
			visit(result.ast, {
				visitDefaultPre: (ast: SyntaxTree) => {
				},
				visitColumnPre: (ast: ColumnSyntaxTree) => {
					actual += "n";
				}
			});
			assert(actual === "n");
		});
		it("visitColumnが無い時visitNodeに行く", () => {
			var actual = "";
			visit(result.ast, {
				visitDefaultPre: (ast: SyntaxTree) => {
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
			var actual = "";
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
		var input = "= chap1\n===[column] コラム\n";
		var result = parse(input);

		it("ColumnHeadlineSyntaxTreeが処理できる", () => {
			var actual = "";
			visit(result.ast, {
				visitDefaultPre: (ast: SyntaxTree) => {
				},
				visitColumnHeadlinePre: (ast: ColumnHeadlineSyntaxTree) => {
					actual += "n";
				}
			});
			assert(actual === "n");
		});
		it("visitColumnHeaderが無い時visitDefaultに行く", () => {
			var actual = "";
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
		var input = "= chap1";
		var result = parse(input);

		it("TextNodeSyntaxTreeが処理できる", () => {
			var actual = "";
			visit(result.ast, {
				visitDefaultPre: (ast: SyntaxTree) => {
				},
				visitTextPre: (ast: TextNodeSyntaxTree) => {
					actual += "n";
				}
			});
			assert(actual === "n");
		});
		it("visitTextが無い時visitDefaultに行く", () => {
			var actual = "";
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

	describe("探索の制御について", () => {
		var input = "= chap1";
		var result = parse(input);

		it("探索をスキップできる", () => {
			var count = 0;
			visit(result.ast, {
				visitDefaultPre: (ast: SyntaxTree) => {
					count++;
					return false;
				}
			});
			assert(count === 1);
		});

		it("探索方法を指定できる", () => {
			var count = 0;
			visit(result.ast, {
				visitDefaultPre: (ast: SyntaxTree): any=> {
					count++;
					if (ast.ruleName === RuleName.Start) {
						return (v: ITreeVisitor) => {
							visit(ast.toNode().childNodes[0], v);
						};
					} else {
						return false;
					}
				},
				visitChapterPre: (ast: ChapterSyntaxTree) => {
					count++;
				}
			});
			assert(count === 2);
		});
	});
});
