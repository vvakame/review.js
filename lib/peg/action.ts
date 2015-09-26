"use strict";

export interface PEGEnvironment {
	text(): string;
	location(): any;
}

let env: PEGEnvironment;

export function setup(_env: PEGEnvironment) {
	"use strict";

	env = _env;
}

export function content(ruleName: string, c: any) {
	"use strict";

	return {
		syntax: ruleName,
		location: env.location(),
		content: c
	};
}

export function contents(ruleName: string, c: any, cc: any) {
	"use strict";

	let processed = [c];
	if (cc) {
		if (Array.isArray(cc.content)) {
			cc.content.forEach((c: any) => processed.push(c));
		} else {
			processed.push(cc.content);
		}
	}
	return {
		syntax: ruleName,
		location: env.location(),
		content: processed
	};
}

export function text(ruleName: string, text: string) {
	"use strict";

	return {
		syntax: ruleName,
		location: env.location(),
		text: text
	};
}

export function chapter(headline: any, text: any) {
	"use strict";

	return {
		syntax: "Chapter",
		location: env.location(),
		headline: headline,
		text: text
	};
}

export function headline(level: any, label: any, caption: any) {
	"use strict";

	return {
		syntax: "Headline",
		location: env.location(),
		level: level.length,
		label: label,
		caption: caption
	};
}

export function blockElement(symbol: any, args: any, contents: any[] = []) {
	"use strict";

	return {
		syntax: "BlockElement",
		location: env.location(),
		symbol: symbol,
		args: args,
		content: contents
	};
}

export function inlineElement(symbol: any, contents: any[] = []) {
	"use strict";

	return {
		syntax: "InlineElement",
		location: env.location(),
		symbol: symbol,
		content: contents
	};
}

export function column(headline: any, text: any) {
	"use strict";

	return {
		syntax: "Column",
		location: env.location(),
		headline: headline,
		text: text
	};
}

export function columnHeadline(level: any, caption: any) {
	"use strict";

	return {
		syntax: "ColumnHeadline",
		location: env.location(),
		level: level.length,
		caption: caption
	};
}

export function columnTerminator(level: any) {
	"use strict";

	return {
		syntax: "ColumnTerminator",
		location: env.location(),
		level: level.length
	};
}

export function braceArg(arg: any) {
	"use strict";

	return {
		syntax: "BraceArg",
		location: env.location(),
		arg: arg
	};
}

export function ulistElement(level: any, text: any) {
	"use strict";

	return {
		syntax: "UlistElement",
		location: env.location(),
		level: level.length,
		text: text
	};
}

export function olistElement(n: any, text: any) {
	"use strict";

	return {
		syntax: "OlistElement",
		location: env.location(),
		no: parseInt(n, 10),
		text: text
	};
}

export function dlistElement(text: any, content: any) {
	"use strict";

	return {
		syntax: "DlistElement",
		location: env.location(),
		text: text,
		content: content
	};
}
