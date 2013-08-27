module ReVIEW {
	export function isNodeJS() {
		return typeof window === "undefined";
	}
}
