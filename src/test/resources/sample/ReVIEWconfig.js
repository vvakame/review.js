var setup = function (ReVIEW) {
	// js-yaml で config.yml を読み込んだり CHAPS から依存を読み込んだり色々できるよ！
	ReVIEW.initConfig({
		"bookname": "book",
		"booktitle": "Effective Android",
		"aut": "TechBooster",
		"prt": "たつまき出版会",
		"prt_url": "http://techbooster.org/",
		"edt": "mhidakaが全てやりました…",
		"date": "2013-08-29T00:00:00.000Z",
		"rights": "(C) 2013 techbooster.org\n",
		"description": {
			"edt": "mhidaka",
			"dsr": "yuyu",
			"date": "2013-08-29T00:00:00.000Z"
		},
		"coverfile": "_cover.html",
		"coverimage": "cover.jpg",
		"urnid": "http://techbooster.org/book/effective_android",
		"stylesheet": "main.css",
		"texdocumentclass": [
			"jsbook",
			"oneside,14pt"
		],
		"toclevel": 2,
		"secnolevel": 2,
		"params": "--stylesheet=main.css",
		"mytoc": true,
		"colophon": true,
		"texstyle": "tatsumacro",
		"pubhistory": "2013年8月29日 初版発行 v2.0.0\n",

		// ここまでは js-yaml -j config.yml で変換した内容

		read: function (path) {
			var fs = require("fs");
			return fs.readFileSync(path, "utf8");
		},
		write: function (path, content) {
			var fs = require("fs");
		},

		book: {
			preface: [
			],
			chapters: [
				"ch01.re",
				"ch02.re"
			],
			afterword: [
			]
		}
	});
};

if (typeof module !== "undefined") {
	module.exports = setup;
} else {
	ReVIEW.start(setup);
}
