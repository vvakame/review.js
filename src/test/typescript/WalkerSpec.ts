///<reference path='libs/DefinitelyTyped/jasmine/jasmine.d.ts' />

///<reference path='../../main/typescript/Walker.ts' />

"use strict";

describe("ReVIEW.walkについて", ()=> {
	it("挙動のサンプル", ()=> {
		var input = "= 今日のお昼ごはん\n\n断固としてカレーライス！\n";
		var result = ReVIEW.Parser.parse(input);
		var actual = "";
		ReVIEW.walk(result.ast, {
			visitDefault: (ast:ReVIEW.SyntaxTree)=> {
				if (ast instanceof ReVIEW.TextNodeSyntaxTree) {
					actual += (<ReVIEW.TextNodeSyntaxTree>ast).text + "\n";
				}
			}
		});
		expect(actual).toBe("今日のお昼ごはん\n断固としてカレーライス！\n\n");
	});

	describe("visitBlockElementについて", () => {
		var input = "= test\n//list{\nhoge\n//}";
		var result = ReVIEW.Parser.parse(input);

		it("BlockElementSyntaxTreeが処理できる", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.SyntaxTree)=> {
				},
				visitBlockElement: (ast:ReVIEW.NodeSyntaxTree) => {
					actual += "n";
				}
			});
			expect(actual).toBe("n");
		});
		it("visitBlockElementが無い時visitNodeに行く", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.SyntaxTree)=> {
				},
				visitNode: (ast:ReVIEW.NodeSyntaxTree) => {
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
				visitDefault: (ast:ReVIEW.SyntaxTree)=> {
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
		var result = ReVIEW.Parser.parse(input);

		it("InlineElementSyntaxTreeが処理できる", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.SyntaxTree)=> {
				},
				visitInlineElement: (ast:ReVIEW.InlineElementSyntaxTree) => {
					actual += "n";
				}
			});
			expect(actual).toBe("n");
		});
		it("visitInlineElementが無い時visitNodeに行く", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.SyntaxTree)=> {
				},
				visitNode: (ast:ReVIEW.NodeSyntaxTree) => {
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
				visitDefault: (ast:ReVIEW.SyntaxTree)=> {
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
		var result = ReVIEW.Parser.parse(input);

		it("NodeSyntaxTreeが処理できる", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.SyntaxTree)=> {
				},
				visitNode: (ast:ReVIEW.NodeSyntaxTree) => {
					actual += "n";
				}
			});
			// Start, Chapters, ContentInlines
			expect(actual).toBe("nnn");
		});
		it("visitNodeが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.SyntaxTree)=> {
					actual += "n";
				}
			});
			// Start, Chapters, Chapter, Headline, ContentInlines, ContentInlineText
			expect(actual).toBe("nnnnnn");
		});
	});

	describe("visitArgumentについて", () => {
		var input = "=[column] hoge";
		var result = ReVIEW.Parser.parse(input);

		it("ArgumentSyntaxTreeが処理できる", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.SyntaxTree)=> {
				},
				visitArgument: (ast:ReVIEW.ArgumentSyntaxTree) => {
					actual += "n";
				}
			});
			expect(actual).toBe("n");
		});
		it("visitArgumentが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.SyntaxTree)=> {
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
		var result = ReVIEW.Parser.parse(input);

		it("ChapterSyntaxTreeが処理できる", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.SyntaxTree)=> {
				},
				visitChapter: (ast:ReVIEW.ChapterSyntaxTree) => {
					actual += "n";
				}
			});
			expect(actual).toBe("nn");
		});
		it("visitChapterが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.SyntaxTree)=> {
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
		var result = ReVIEW.Parser.parse(input);

		it("HeadlineSyntaxTreeが処理できる", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.SyntaxTree)=> {
				},
				visitHeadline: (ast:ReVIEW.HeadlineSyntaxTree) => {
					actual += "n";
				}
			});
			expect(actual).toBe("n");
		});
		it("visitHeadlineが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.SyntaxTree)=> {
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
		var result = ReVIEW.Parser.parse(input);

		it("UlistElementSyntaxTreeが処理できる", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.SyntaxTree)=> {
				},
				visitUlist: (ast:ReVIEW.UlistElementSyntaxTree) => {
					actual += "n";
				}
			});
			expect(actual).toBe("n");
		});
		it("visitUlistが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.SyntaxTree)=> {
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
		var result = ReVIEW.Parser.parse(input);

		it("OlistElementSyntaxTreeが処理できる", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.SyntaxTree)=> {
				},
				visitOlist: (ast:ReVIEW.OlistElementSyntaxTree) => {
					actual += "n";
				}
			});
			expect(actual).toBe("n");
		});
		it("visitOlistが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.SyntaxTree)=> {
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
		var result = ReVIEW.Parser.parse(input);

		it("DlistElementSyntaxTreeが処理できる", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.SyntaxTree)=> {
				},
				visitDlist: (ast:ReVIEW.DlistElementSyntaxTree) => {
					actual += "n";
				}
			});
			expect(actual).toBe("n");
		});
		it("visitDlistが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.SyntaxTree)=> {
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
		var result = ReVIEW.Parser.parse(input);

		it("TextNodeSyntaxTreeが処理できる", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.SyntaxTree)=> {
				},
				visitText: (ast:ReVIEW.TextNodeSyntaxTree) => {
					actual += "n";
				}
			});
			expect(actual).toBe("n");
		});
		it("visitTextが無い時visitDefaultに行く", ()=> {
			var actual = "";
			ReVIEW.walk(result.ast, {
				visitDefault: (ast:ReVIEW.SyntaxTree)=> {
					if (ast instanceof ReVIEW.TextNodeSyntaxTree) {
						actual += "n";
					}
				}
			});
			expect(actual).toBe("n");
		});
	});
});
