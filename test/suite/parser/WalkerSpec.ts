///<reference path='../../../typings/mocha/mocha.d.ts' />
///<reference path='../../../typings/assert/assert.d.ts' />

///<reference path='../../../lib/parser/Walker.ts' />

"use strict";

/* tslint:disable:no-unused-variable */
import RuleName = ReVIEW.Parse.RuleName;
/* tslint:enable:no-unused-variable */

describe("ReVIEW.walkについて", ()=> {
	"use strict";

	it("目的のNodeを発見できること", ()=> {
		var input = "= level1\n== level2\n=== level3\n==== level4\n===== level5";
		var parseResult = ReVIEW.Parse.parse(input);
		var headline:ReVIEW.Parse.HeadlineSyntaxTree = null;
		ReVIEW.visit(parseResult.ast, {
			visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree, parent:ReVIEW.Parse.SyntaxTree)=> {
			},
			visitHeadlinePre: (ast:ReVIEW.Parse.HeadlineSyntaxTree, parent:ReVIEW.Parse.SyntaxTree)=> {
				headline = ast;
			}
		});

		// 最後のやつが取れる
		assert(headline.level === 5);

		var result:ReVIEW.Parse.ChapterSyntaxTree = null;
		ReVIEW.walk(headline, (ast)=> {
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

describe("ReVIEW.visitについて", ()=> {

	it("挙動のサンプル", ()=> {
		var input = "= 今日のお昼ごはん\n\n断固としてカレーライス！\n";
		var result = ReVIEW.Parse.parse(input);
		var actual = "";
		ReVIEW.visit(result.ast, {
			visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
				if (ast instanceof ReVIEW.Parse.TextNodeSyntaxTree) {
					actual += ast.toTextNode().text + "\n";
				}
			}
		});
		assert(actual === "今日のお昼ごはん\n断固としてカレーライス！\n");
	});

	describe("visitBlockElementについて", () => {
		var input = "= test\n//list{\nhoge\n//}";
		var result = ReVIEW.Parse.parse(input);

		it("BlockElementSyntaxTreeが処理できる", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitBlockElementPre: (ast:ReVIEW.Parse.NodeSyntaxTree) => {
					actual += "n";
				}
			});
			assert(actual === "n");
		});
		it("visitBlockElementが無い時visitNodeに行く", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitNodePre: (ast:ReVIEW.Parse.NodeSyntaxTree) => {
					if (ast.ruleName === RuleName.BlockElement) {
						actual += "n";
					}
				}
			});
			assert(actual === "n");
		});
		it("visitBlockElementもvisitNodeも無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
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
		var result = ReVIEW.Parse.parse(input);

		it("InlineElementSyntaxTreeが処理できる", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitInlineElementPre: (ast:ReVIEW.Parse.InlineElementSyntaxTree) => {
					actual += "n";
				}
			});
			assert(actual === "n");
		});
		it("visitInlineElementが無い時visitNodeに行く", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitNodePre: (ast:ReVIEW.Parse.NodeSyntaxTree) => {
					if (ast.ruleName === RuleName.InlineElement) {
						actual += "n";
					}
				}
			});
			assert(actual === "n");
		});
		it("visitInlineElementもvisitNodeも無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
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
		var result = ReVIEW.Parse.parse(input);

		it("NodeSyntaxTreeが処理できる", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitNodePre: (ast:ReVIEW.Parse.NodeSyntaxTree) => {
					actual += "n";
				}
			});
			// Start, Chapters, ContentInlines
			assert(actual === "nnnn");
		});
		it("visitNodeが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
					actual += "n";
				}
			});
			// Start, Chapters, Chapter, Headline, ContentInlines, ContentInlineText
			assert(actual === "nnnnnn");
		});
	});

	describe("visitArgumentについて", () => {
		var input = "={fuga} hoge";
		var result = ReVIEW.Parse.parse(input);

		it("ArgumentSyntaxTreeが処理できる", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitArgumentPre: (ast:ReVIEW.Parse.ArgumentSyntaxTree) => {
					actual += "n";
				}
			});
			assert(actual === "n");
		});
		it("visitArgumentが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
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
		var result = ReVIEW.Parse.parse(input);

		it("ChapterSyntaxTreeが処理できる", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitChapterPre: (ast:ReVIEW.Parse.ChapterSyntaxTree) => {
					actual += "n";
				}
			});
			assert(actual === "nn");
		});
		it("visitChapterが無い時visitNodeに行く", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitNodePre: (ast:ReVIEW.Parse.NodeSyntaxTree) => {
					if (ast.ruleName === RuleName.Chapter) {
						actual += "n";
					}
				}
			});
			assert(actual === "nn");
		});
		it("visitChapterが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
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
		var result = ReVIEW.Parse.parse(input);

		it("HeadlineSyntaxTreeが処理できる", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitHeadlinePre: (ast:ReVIEW.Parse.HeadlineSyntaxTree) => {
					actual += "n";
				}
			});
			assert(actual === "n");
		});
		it("visitHeadlineが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
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
		var result = ReVIEW.Parse.parse(input);

		it("UlistElementSyntaxTreeが処理できる", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitUlistPre: (ast:ReVIEW.Parse.UlistElementSyntaxTree) => {
					actual += "n";
				}
			});
			assert(actual === "n");
		});
		it("visitUlistが無い時visitNodeに行く", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitNodePre: (ast:ReVIEW.Parse.NodeSyntaxTree) => {
					if (ast.ruleName === RuleName.UlistElement) {
						actual += "n";
					}
				}
			});
			assert(actual === "n");
		});
		it("visitUlistが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
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
		var result = ReVIEW.Parse.parse(input);

		it("OlistElementSyntaxTreeが処理できる", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitOlistPre: (ast:ReVIEW.Parse.OlistElementSyntaxTree) => {
					actual += "n";
				}
			});
			assert(actual === "n");
		});
		it("visitOlistが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
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
		var result = ReVIEW.Parse.parse(input);

		it("DlistElementSyntaxTreeが処理できる", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitDlistPre: (ast:ReVIEW.Parse.DlistElementSyntaxTree) => {
					actual += "n";
				}
			});
			assert(actual === "n");
		});
		it("visitDlistが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
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
		var result = ReVIEW.Parse.parse(input);

		it("ColumnSyntaxTreeが処理できる", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitColumnPre: (ast:ReVIEW.Parse.ColumnSyntaxTree) => {
					actual += "n";
				}
			});
			assert(actual === "n");
		});
		it("visitColumnが無い時visitNodeに行く", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitNodePre: (ast:ReVIEW.Parse.NodeSyntaxTree) => {
					if (ast.ruleName === RuleName.Column) {
						actual += "n";
					}
				}
			});
			assert(actual === "n");
		});
		it("visitColumnが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
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
		var result = ReVIEW.Parse.parse(input);

		it("ColumnHeadlineSyntaxTreeが処理できる", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitColumnHeadlinePre: (ast:ReVIEW.Parse.ColumnHeadlineSyntaxTree) => {
					actual += "n";
				}
			});
			assert(actual === "n");
		});
		it("visitColumnHeaderが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
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
		var result = ReVIEW.Parse.parse(input);

		it("TextNodeSyntaxTreeが処理できる", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitTextPre: (ast:ReVIEW.Parse.TextNodeSyntaxTree) => {
					actual += "n";
				}
			});
			assert(actual === "n");
		});
		it("visitTextが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
					if (ast instanceof ReVIEW.Parse.TextNodeSyntaxTree) {
						actual += "n";
					}
				}
			});
			assert(actual === "n");
		});
	});

	describe("探索の制御について", () => {
		var input = "= chap1";
		var result = ReVIEW.Parse.parse(input);

		it("探索をスキップできる", ()=> {
			var count = 0;
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
					count++;
					return false;
				}
			});
			assert(count === 1);
		});

		it("探索方法を指定できる", ()=> {
			var count = 0;
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree):any=> {
					count++;
					if (ast.ruleName === ReVIEW.Parse.RuleName.Start) {
						return (v:ReVIEW.ITreeVisitor) => {
							ReVIEW.visit(ast.toNode().childNodes[0], v);
						};
					} else {
						return false;
					}
				},
				visitChapterPre: (ast:ReVIEW.Parse.ChapterSyntaxTree) => {
					count++;
				}
			});
			assert(count === 2);
		});
	});
});
