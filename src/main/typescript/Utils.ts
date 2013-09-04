module ReVIEW {

	/**
	 * Node.js上での実行かどうかを判別する。
	 * @returns {boolean}
	 */
	export function isNodeJS() {
		return typeof window === "undefined";
	}

	/**
	 * ネストしたArrayを潰して平らにする。
	 * Arrayかどうかの判定は Array.isArray を利用。
	 * @param data
	 * @returns {*[]}
	 */
	export function flatten(data:any[]):any[] {
		if (data.some((d)=>Array.isArray(d))) {
			return flatten(data.reduce((p, c)=> p.concat(c), []));
		} else {
			return data;
		}
	}

	/**
	 * SyntaxTree を String に変換する。
	 * TODO 現在の実装だと space とか newline が無かったことにされてしまう… offset から頑張って計算するのが正しい
	 * TODO node で parent だけじゃなくて 兄と弟も取れたほうが楽そう…
	 * @param node
	 * @returns {string}
	 */
	export function nodeToString(node:ReVIEW.Parse.SyntaxTree):string {
		var result = "";
		ReVIEW.visit(node, {
			visitDefaultPre: (node:ReVIEW.Parse.SyntaxTree)=> {
			},
			visitTextPre: (text:ReVIEW.Parse.TextNodeSyntaxTree) => {
				result += text.text;
			}
		});
		return result;
	}

	/**
	 * 渡した要素から直近のChapterを探して返す。
	 * 見つからなかった場合 null を返す。
	 * もし、渡した要素自身がChapterだった場合、自身を返すのでnode.parentNode を渡すこと。
	 * @param node
	 * @param level 探すChapterのlevel
	 * @returns {ReVIEW.Parse.ChapterSyntaxTree}
	 */
	export function findChapter(node:ReVIEW.Parse.SyntaxTree, level?:number):ReVIEW.Parse.ChapterSyntaxTree {
		var chapter:ReVIEW.Parse.ChapterSyntaxTree = null;
		ReVIEW.walk(node, (node:ReVIEW.Parse.SyntaxTree) => {
			if (node instanceof ReVIEW.Parse.ChapterSyntaxTree) {
				chapter = node.toChapter();
				if (typeof level === "undefined" || chapter.level === level) {
					return null;
				}
			}
			return node.parentNode;
		});
		return chapter;
	}


	/**
	 * Node.jsでのIOをざっくり行うためのモジュール。
	 */
	export module IO {
		/**
		 * 指定されたファイルを読み文字列として返す。
		 * @param path
		 * @returns {*}
		 */
		export function read(path:string):string {
			var fs = require("fs");
			return fs.readFileSync(path, "utf8");
		}

		/**
		 * 指定されたファイルへ文字列を書く。
		 * @param path
		 * @param content
		 */
		export function write(path:string, content:string):void {
			var fs = require("fs");
			fs.writeFileSync(path, content);
		}
	}
}
