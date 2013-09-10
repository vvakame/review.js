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
	 * SyntaxTree全体 を String に変換する。
	 * @param process
	 * @param node
	 */
	export function nodeToString(process:Process, node:ReVIEW.Parse.SyntaxTree):string ;

	export function nodeToString(process:BuilderProcess, node:ReVIEW.Parse.SyntaxTree):string ;

	export function nodeToString(process:any, node:ReVIEW.Parse.SyntaxTree):string {
		return process.input.substring(node.offset, node.endPos);
	}

	/**
	 * SyntaxTreeの中身部分 を String に変換する。
	 * @param process
	 * @param node
	 */
	export function nodeContentToString(process:Process, node:ReVIEW.Parse.SyntaxTree):string ;

	export function nodeContentToString(process:BuilderProcess, node:ReVIEW.Parse.SyntaxTree):string ;

	export function nodeContentToString(process:any, node:ReVIEW.Parse.SyntaxTree):string {
		var minPos = Number.MAX_VALUE;
		var maxPos = -1;
		// child
		var childVisitor:ReVIEW.ITreeVisitor = {
			visitDefaultPre: (node:ReVIEW.Parse.SyntaxTree)=> {
				minPos = Math.min(minPos, node.offset);
				maxPos = Math.max(maxPos, node.endPos);
			}
		};
		// root (子要素だけ抽出したい)
		ReVIEW.visit(node, {
			visitDefaultPre: (node:ReVIEW.Parse.SyntaxTree)=> {
			},
			visitNodePre: (node:ReVIEW.Parse.NodeSyntaxTree) => {
				// Chapter, Inline, Block もここに来る
				node.childNodes.forEach(child => ReVIEW.visit(child, childVisitor));
				return false;
			},
			visitHeadlinePre: (node:ReVIEW.Parse.HeadlineSyntaxTree) => {
				ReVIEW.visit(node.caption, childVisitor);
				return false;
			},
			visitUlistPre: (node:ReVIEW.Parse.UlistElementSyntaxTree) => {
				ReVIEW.visit(node.text, childVisitor);
				return false;
			},
			visitDlistPre: (node:ReVIEW.Parse.DlistElementSyntaxTree) => {
				ReVIEW.visit(node.text, childVisitor);
				ReVIEW.visit(node.content, childVisitor);
				return false;
			},
			visitOlistPre: (node:ReVIEW.Parse.OlistElementSyntaxTree) => {
				ReVIEW.visit(node.text, childVisitor);
				return false;
			},
			visitTextPre: (text:ReVIEW.Parse.TextNodeSyntaxTree) => {
				ReVIEW.visit(node, childVisitor);
				return false;
			}
		});
		if (maxPos < 0) {
			return "";
		} else {
			return process.input.substring(minPos, maxPos);
		}
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
