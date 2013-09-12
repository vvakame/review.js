///<reference path='../i18n/i18n.ts' />
///<reference path='../parser/Parser.ts' />
///<reference path='../builder/Builder.ts' />

// parser/ と builder/ で共用するモデル

module ReVIEW {

import t = ReVIEW.i18n.t;

	/**
	 * 参照先についての情報。
	 */
	export interface IReferenceTo {
		part?:Part;
		partName:string;
		chapter?:Chapter;
		chapterName:string;
		targetSymbol:string;
		label:string;
		// 上記情報から解決した結果のNode
		referenceNode?:ReVIEW.Parse.SyntaxTree;
	}

	/**
	 * シンボルについての情報。
	 */
	export interface ISymbol {
		part?:Part;
		chapter?:Chapter;
		symbolName:string;
		labelName?:string;
		referenceTo?:IReferenceTo;
		node:ReVIEW.Parse.SyntaxTree;
	}

	/**
	 * 処理時に発生したレポートのレベル。
	 */
	export enum ReportLevel {
		Info,
		Warning,
		Error
	}

	/**
	 * 処理時に発生したレポート。
	 */
	export class ProcessReport {
		constructor(public level:ReportLevel, public part:Part, public chapter:Chapter, public message:string, public nodes:Parse.SyntaxTree[] = []) {
		}
	}

	/**
	 * コンパイル処理時の出力ハンドリング。
	 */
	export class Process {
		symbols:ISymbol[] = [];
		indexCounter:{ [kind:string]:number; } = {};
		afterProcess:Function[] = [];
		private _reports:ProcessReport[] = [];

		constructor(public part:Part, public chapter:Chapter, public input:string) {
		}

		info(message:string, ...nodes:Parse.SyntaxTree[]) {
			this._reports.push(new ProcessReport(ReportLevel.Info, this.part, this.chapter, message, nodes));
		}

		warn(message:string, ...nodes:Parse.SyntaxTree[]) {
			this._reports.push(new ProcessReport(ReportLevel.Warning, this.part, this.chapter, message, nodes));
		}

		error(message:string, ...nodes:Parse.SyntaxTree[]) {
			this._reports.push(new ProcessReport(ReportLevel.Error, this.part, this.chapter, message, nodes));
		}

		nextIndex(kind:string) {
			var nextIndex = this.indexCounter[kind];
			if (typeof nextIndex === "undefined") {
				nextIndex = 1;
			} else {
				nextIndex++;
			}
			this.indexCounter[kind] = nextIndex;
			return nextIndex;
		}

		get reports():ProcessReport[] {
			return this._reports.sort((a, b) => {
				if (a.nodes.length === 0 && b.nodes.length === 0) {
					return 0;
				} else if (a.nodes.length === 0) {
					return -1;
				} else if (b.nodes.length === 0) {
					return 1;
				} else {
					return a.nodes[0].offset - b.nodes[0].offset;
				}
			});
		}

		addSymbol(symbol:ISymbol) {
			symbol.part = this.part;
			symbol.chapter = this.chapter;
			this.symbols.push(symbol);
		}

		get missingSymbols():ISymbol[] {
			var result:ISymbol[] = [];
			this.symbols.forEach(symbol=> {
				if (symbol.referenceTo && !symbol.referenceTo.referenceNode) {
					result.push(symbol);
				}
			});
			return result;
		}

		constructReferenceTo(node:ReVIEW.Parse.InlineElementSyntaxTree, value:string, targetSymbol?:string, separator?:string):IReferenceTo;

		constructReferenceTo(node:ReVIEW.Parse.BlockElementSyntaxTree, value:string, targetSymbol:string, separator?:string):IReferenceTo;

		constructReferenceTo(node, value:string, targetSymbol = node.symbol, separator = "|"):IReferenceTo {
			var splitted = value.split(separator);
			if (splitted.length === 3) {
				return {
					partName: splitted[0],
					chapterName: splitted[1],
					targetSymbol: targetSymbol,
					label: splitted[2]
				};
			} else if (splitted.length === 2) {
				return {
					part: this.part,
					partName: this.part.name,
					chapterName: splitted[0],
					targetSymbol: targetSymbol,
					label: splitted[1]
				};
			} else if (splitted.length === 1) {
				return {
					part: this.part,
					partName: this.part.name,
					chapter: this.chapter,
					chapterName: this.chapter.name,
					targetSymbol: targetSymbol,
					label: splitted[0]
				};
			} else {
				var message = t("compile.args_length_mismatch", "1 or 2 or 3", splitted.length);
				this.error(message, node);
				return null;
			}
		}

		addAfterProcess(func:Function) {
			this.afterProcess.push(func);
		}

		doAfterProcess() {
			this.afterProcess.forEach((func)=>func());
			this.afterProcess = [];
		}
	}

	export class BuilderProcess {

		constructor(public builder:ReVIEW.Build.IBuilder, public base:Process) {
		}

		get info():(message:string, ...nodes:Parse.SyntaxTree[])=>void {
			return this.base.info;
		}

		get warn():(message:string, ...nodes:Parse.SyntaxTree[])=>void {
			return this.base.warn;
		}

		get error():(message:string, ...nodes:Parse.SyntaxTree[])=>void {
			return this.base.error;
		}

		result:string = "";

		out(data:any):BuilderProcess {
			// 最近のブラウザだと単純結合がアホみたいに早いらしいので
			this.result += data;
			return this;
		}

		get input():string {
			return this.base.input;
		}

		get symbols():ISymbol[] {
			return this.base.symbols;
		}
	}

	/**
	 * 本全体を表す。
	 */
	export class Book {
		parts:Part[] = [];

		constructor(public config:IConfig) {
		}

		get reports():ProcessReport[] {
			var flatten = (data:any[])=> {
				if (data.some((d)=>Array.isArray(d))) {
					return flatten(data.reduce((p, c)=> p.concat(c), []));
				} else {
					return data;
				}
			};
			return flatten(this.parts.map(part=>part.chapters.map(chapter=>chapter.process.reports)));
		}
	}

	/**
	 * パートを表す。
	 * パートは 前書き、本文、後書き など。
	 * Ruby版でいうと PREDEF, CHAPS, POSTDEF。
	 * 章番号はパート毎に採番される。(Ruby版では PREDEF は採番されない)
	 */
	export class Part {
		chapters:Chapter[];

		constructor(public parent:Book, public no:number, public name:string) {
		}
	}

	/**
	 * チャプターを表す。
	 */
	export class Chapter {
		process:Process;
		builderProcesses:BuilderProcess[] = [];

		constructor(public parent:Part, public no:number, public name:string, public input:string, public root:ReVIEW.Parse.SyntaxTree) {
			this.process = new Process(this.parent, this, input);
		}

		createBuilderProcess(builder:ReVIEW.Build.IBuilder):BuilderProcess {
			var builderProcess = new BuilderProcess(builder, this.process);
			this.builderProcesses.push(builderProcess);
			return builderProcess;
		}

		findResultByBuilder(builderName:string);

		findResultByBuilder(builder:ReVIEW.Build.IBuilder);

		findResultByBuilder(builder:any) {
			var founds:BuilderProcess[];
			if (typeof builder === "string") {
				founds = this.builderProcesses.filter(process => process.builder.name === builder);
			} else {
				founds = this.builderProcesses.filter(process => process.builder === builder);
			}
			// TODO 何かエラー投げたほうがいい気もするなー
			return founds[0].result;
		}
	}
}
