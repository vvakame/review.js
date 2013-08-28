///<reference path='libs/DefinitelyTyped/jasmine/jasmine.d.ts' />

///<reference path='../../main/typescript/Walker.ts' />

"use strict";

describe("ReVIEW.walkについて", ()=> {
	it("挙動のサンプル", ()=> {
		var input = "= 今日のお昼ごはん\n\n断固としてカレーライス！\n";
		var result = ReVIEW.Parse.parse(input);
		var actual = "";
		ReVIEW.walk(result.ast, {
			visitDefault: (ast:ReVIEW.Parse.SyntaxTree)=> {
				if (ast instanceof ReVIEW.Parse.TextNodeSyntaxTree) {
					actual += (<ReVIEW.Parse.TextNodeSyntaxTree>ast).text + "\n";
				}
			}
		});
		expect(actual).toBe("今日のお昼ごはん\n断固としてカレーライス！\n\n");
	});

	describe("visitBlockElementについて", () => {
		var input = "= test\n//list{\nhoge\n//}";
		var result = ReVIEW.Parse.parse(input);

		it("BlockElementSyntaxTreeが処理できる", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitBlockElement: (ast:ReVIEW.Parse.NodeSyntaxTree) => {
					actual += "n";
				}
			});
			expect(actual).toBe("n");
		});
		it("visitBlockElementが無い時visitNodeに行く", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitNode: (ast:ReVIEW.Parse.NodeSyntaxTree) => {
					if (ast.ruleName === "BlockElement") {
						actual += "n";
					}
				}
			});
			expect(actual).toBe("n");
		});
		it("visitBlockElementもvisitNodeも無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.Parse.SyntaxTree)=> {
					if (ast.ruleName === "BlockElement") {
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
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitInlineElement: (ast:ReVIEW.Parse.InlineElementSyntaxTree) => {
					actual += "n";
				}
			});
			expect(actual).toBe("n");
		});
		it("visitInlineElementが無い時visitNodeに行く", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitNode: (ast:ReVIEW.Parse.NodeSyntaxTree) => {
					if (ast.ruleName === "InlineElement") {
						actual += "n";
					}
				}
			});
			expect(actual).toBe("n");
		});
		it("visitInlineElementもvisitNodeも無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.Parse.SyntaxTree)=> {
					if (ast.ruleName === "InlineElement") {
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
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitNode: (ast:ReVIEW.Parse.NodeSyntaxTree) => {
					actual += "n";
				}
			});
			// Start, Chapters, ContentInlines
			expect(actual).toBe("nnn");
		});
		it("visitNodeが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.Parse.SyntaxTree)=> {
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
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitArgument: (ast:ReVIEW.Parse.ArgumentSyntaxTree) => {
					actual += "n";
				}
			});
			expect(actual).toBe("n");
		});
		it("visitArgumentが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.Parse.SyntaxTree)=> {
					if (ast.ruleName.indexOf("Arg") !== -1) {
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
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitChapter: (ast:ReVIEW.Parse.ChapterSyntaxTree) => {
					actual += "n";
				}
			});
			expect(actual).toBe("nn");
		});
		it("visitChapterが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.Parse.SyntaxTree)=> {
					if (ast.ruleName === "Chapter") {
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
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitHeadline: (ast:ReVIEW.Parse.HeadlineSyntaxTree) => {
					actual += "n";
				}
			});
			expect(actual).toBe("n");
		});
		it("visitHeadlineが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.Parse.SyntaxTree)=> {
					if (ast.ruleName === "Headline") {
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
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitUlist: (ast:ReVIEW.Parse.UlistElementSyntaxTree) => {
					actual += "n";
				}
			});
			expect(actual).toBe("n");
		});
		it("visitUlistが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.Parse.SyntaxTree)=> {
					if (ast.ruleName === "UlistElement") {
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
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitOlist: (ast:ReVIEW.Parse.OlistElementSyntaxTree) => {
					actual += "n";
				}
			});
			expect(actual).toBe("n");
		});
		it("visitOlistが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.Parse.SyntaxTree)=> {
					if (ast.ruleName === "OlistElement") {
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
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitDlist: (ast:ReVIEW.Parse.DlistElementSyntaxTree) => {
					actual += "n";
				}
			});
			expect(actual).toBe("n");
		});
		it("visitDlistが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.Parse.SyntaxTree)=> {
					if (ast.ruleName === "DlistElement") {
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
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.Parse.SyntaxTree)=> {
				},
				visitText: (ast:ReVIEW.Parse.TextNodeSyntaxTree) => {
					actual += "n";
				}
			});
			expect(actual).toBe("n");
		});
		it("visitTextが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.Parse.SyntaxTree)=> {
					if (ast instanceof ReVIEW.Parse.TextNodeSyntaxTree) {
						actual += "n";
					}
				}
			});
			expect(actual).toBe("n");
		});
	});
});
