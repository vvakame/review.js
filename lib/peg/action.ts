"use strict";

import {Location, RuleName, ConcreatSyntaxTree} from "../parser/parser";

export interface PEGEnvironment {
	text(): string;
	location(): Location;
}

let env: PEGEnvironment;

function checkRuleName(ruleName: string): string {
	"use strict";

	// undefined or index 0 is invalid name
	if (!(<any>RuleName)[ruleName]) {
		throw new Error(`unknown rule: ${ruleName}`);
	}

	return ruleName;
}

export function setup(_env: PEGEnvironment) {
	"use strict";

	env = _env;
}

export function content(ruleName: string, c: any): ConcreatSyntaxTree {
	"use strict";

	return {
		syntax: checkRuleName(ruleName),
		location: env.location(),
		content: c
	};
}

export function contents(ruleName: string, c: any, cc: any): ConcreatSyntaxTree {
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
		syntax: checkRuleName(ruleName),
		location: env.location(),
		content: processed
	};
}

export function text(ruleName: string, text: string): ConcreatSyntaxTree {
	"use strict";

	return {
		syntax: checkRuleName(ruleName),
		location: env.location(),
		text: text
	};
}

export function chapter(headline: any, text: any): ConcreatSyntaxTree {
	"use strict";

	return {
		syntax: checkRuleName("Chapter"),
		location: env.location(),
		headline: headline,
		text: text
	};
}

export function headline(level: any, label: any, caption: any): ConcreatSyntaxTree {
	"use strict";

	return {
		syntax: checkRuleName("Headline"),
		location: env.location(),
		level: level.length,
		label: label,
		caption: caption
	};
}

export function blockElement(symbol: any, args: any, contents: any[] = []): ConcreatSyntaxTree {
	"use strict";

	return {
		syntax: checkRuleName("BlockElement"),
		location: env.location(),
		symbol: symbol,
		args: args,
		content: contents
	};
}

export function inlineElement(symbol: any, contents: any[] = []): ConcreatSyntaxTree {
	"use strict";

	return {
		syntax: checkRuleName("InlineElement"),
		location: env.location(),
		symbol: symbol,
		content: contents
	};
}

export function column(headline: any, text: any): ConcreatSyntaxTree {
	"use strict";

	return {
		syntax: checkRuleName("Column"),
		location: env.location(),
		headline: headline,
		text: text
	};
}

export function columnHeadline(level: any, caption: any): ConcreatSyntaxTree {
	"use strict";

	return {
		syntax: checkRuleName("ColumnHeadline"),
		location: env.location(),
		level: level.length,
		caption: caption
	};
}

export function columnTerminator(level: any): ConcreatSyntaxTree {
	"use strict";

	return {
		syntax: checkRuleName("ColumnTerminator"),
		location: env.location(),
		level: level.length
	};
}

export function braceArg(arg: any): ConcreatSyntaxTree {
	"use strict";

	return {
		syntax: checkRuleName("BraceArg"),
		location: env.location(),
		arg: arg
	};
}

export function ulistElement(level: any, text: any): ConcreatSyntaxTree {
	"use strict";

	return {
		syntax: checkRuleName("UlistElement"),
		location: env.location(),
		level: level.length,
		text: text
	};
}

export function olistElement(n: any, text: any): ConcreatSyntaxTree {
	"use strict";

	return {
		syntax: checkRuleName("OlistElement"),
		location: env.location(),
		no: parseInt(n, 10),
		text: text
	};
}

export function dlistElement(text: any, content: any): ConcreatSyntaxTree {
	"use strict";

	return {
		syntax: checkRuleName("DlistElement"),
		location: env.location(),
		text: text,
		content: content
	};
}
