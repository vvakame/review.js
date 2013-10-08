///<reference path='../libs/DefinitelyTyped/jasmine/jasmine.d.ts' />

///<reference path='../../../main/typescript/parser/Walker.ts' />

"use strict";

import RuleName = ReVIEW.Parse.RuleName;

describe("ReVIEW.walkについて", ()=> {

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
		expect(headline.level).toBe(5);

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
		expect(result.level).toBe(2);
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
		expect(actual).toBe("今日のお昼ごはん\n断固としてカレーライス！\n");
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
			expect(actual).toBe("n");
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
			expect(actual).toBe("n");
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
			expect(actual).toBe("n");
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
			expect(actual).toBe("n");
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
			expect(actual).toBe("n");
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
			expect(actual).toBe("n");
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
			expect(actual).toBe("nnnn");
		});
		it("visitNodeが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
					actual += "n";
				}
			});
			// Start, Chapters, Chapter, Headline, ContentInlines, ContentInlineText
			expect(actual).toBe("nnnnnn");
		});
	});

	describe("visitArgumentについて", () => {
		var input = "=[column] hoge";
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
			expect(actual).toBe("n");
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
			expect(actual).toBe("n");
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
			expect(actual).toBe("nn");
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
			expect(actual).toBe("nn");
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
			expect(actual).toBe("nn");
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
			expect(actual).toBe("n");
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
			expect(actual).toBe("n");
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
			expect(actual).toBe("n");
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
			expect(actual).toBe("n");
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
			expect(actual).toBe("n");
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
			expect(actual).toBe("n");
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
			expect(actual).toBe("n");
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
			expect(actual).toBe("n");
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
			expect(actual).toBe("n");
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
			expect(actual).toBe("n");
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
			expect(actual).toBe("n");
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
			expect(count).toBe(1);
		});

		it("探索方法を指定できる", ()=> {
			var count = 0;
			ReVIEW.visit(result.ast, {
				visitDefaultPre: (ast:ReVIEW.Parse.SyntaxTree)=> {
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
			expect(count).toBe(2);
		});
	});
});
