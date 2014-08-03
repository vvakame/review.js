///<reference path='../../../typings/mocha/mocha.d.ts' />
///<reference path='../../../typings/assert/assert.d.ts' />

///<reference path='../../../lib/controller/Config.ts' />

describe("ReVIEWのConfig.tsの", ()=> {
	"use strict";

	function verifyBookData(book:ReVIEW.BookStructure) {
		assert(book.preface.length === 1);
		assert(book.contents.length === 4);
		assert(book.afterword.length === 1);

		assert(!book.preface[0].part);
		assert(book.preface[0].chapter.file === "pre.re");

		assert(!book.contents[0].part);
		assert(book.contents[0].chapter.file === "fullsetA.re");

		assert(!book.contents[1].part);
		assert(book.contents[1].chapter.file === "fullsetB.re");

		assert(!book.contents[2].chapter);
		assert(book.contents[2].part.file === "parent.re");
		assert(book.contents[2].part.chapters.length === 1);
		assert(book.contents[2].part.chapters[0].file === "child.re");

		assert(!book.contents[3].part);
		assert(book.contents[3].chapter.file === "fullsetC.re");

		assert(!book.afterword[0].part);
		assert(book.afterword[0].chapter.file === "post.re");
	}

	it("IConfigBookに設定ができる IConfigPartOrChapterでchapterプロパティを使う", ()=> {
		var book:ReVIEW.IConfigBook = {
			preface: [
				{file: "pre.re"}
			],
			contents: [
				{chapter: {file: "fullsetA.re"}},
				{chapter: {file: "fullsetB.re"}},
				{
					part: {
						file: "parent.re",
						chapters: [
							{file: "child.re"}
						]
					}
				},
				{chapter: {file: "fullsetC.re"}}
			],
			afterword: [
				{file: "post.re"}
			]
		};
		verifyBookData(ReVIEW.BookStructure.createBook(book));
	});

	it("IConfigBookに設定ができる IConfigPartOrChapterでnameプロパティを使う", ()=> {
		var book:ReVIEW.IConfigBook = {
			preface: [
				{file: "pre.re"}
			],
			contents: [
				{file: "fullsetA.re"},
				{file: "fullsetB.re"},
				{
					part: {
						file: "parent.re",
						chapters: [
							{file: "child.re"}
						]
					}
				},
				{file: "fullsetC.re"}
			],
			afterword: [
				{file: "post.re"}
			]
		};
		verifyBookData(ReVIEW.BookStructure.createBook(book));
	});

	it("IConfigBookに設定ができる JS(型なし)用短縮形式", ()=> {
		var book:any = {
			preface: [
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
			afterword: [
				"post.re"
			]
		};
		verifyBookData(ReVIEW.BookStructure.createBook(book));
	});

	it.skip("IConfigBookに設定ができる YAML形式より", ()=> {
		// TODO
		var book:any = {
			PREDEF: [ 'pre.re' ],
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
			POSTDEF: [ 'post.re' ]
		};
		verifyBookData(ReVIEW.BookStructure.createBook(book));
	});
});
