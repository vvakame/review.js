module ReVIEW {

	/**
	 * Node.js上での実行かどうかを判別する。
	 * @returns {boolean}
	 */
	export function isNodeJS() {
		return typeof window === "undefined";
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
