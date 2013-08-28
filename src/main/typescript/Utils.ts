module ReVIEW {
	export function isNodeJS() {
		return typeof window === "undefined";
	}

	export module IO {
		export function read(path:string):string {
			var fs = require("fs");
			return fs.readFileSync(path, "utf8");
		}

		export function write(path:string, content:string):void {
			var fs = require("fs");
			fs.writeFileSync(path, content);
		}
	}
}
