// parser/ と builder/ で共用するモデル

"use strict";

import { t } from "../i18n/i18n";

import { ConcreatSyntaxTree, NodeLocation, SyntaxTree, InlineElementSyntaxTree, BlockElementSyntaxTree, ChapterSyntaxTree } from "../parser/parser";

import { AcceptableSyntaxes } from "../parser/analyzer";
import { Builder } from "../builder/builder";
import { Config } from "../controller/config";
import { visit } from "../parser/walker";

/**
 * 参照先についての情報。
 */
export interface ReferenceTo {
    part?: ContentChunk | null;
    partName: string;
    chapter?: ContentChunk | null;
    chapterName: string;
    targetSymbol: string;
    label: string;
    // 上記情報から解決した結果のNode
    referenceNode?: SyntaxTree;
}

/**
 * シンボルについての情報。
 */
export interface Symbol {
    part?: ContentChunk;
    chapter?: ContentChunk | null;
    symbolName: string;
    labelName?: string;
    referenceTo?: ReferenceTo | null;
    node: SyntaxTree;
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
    constructor(public level: ReportLevel, public part: ContentChunk | null, public chapter: ContentChunk | null, public message: string, public nodes: NodeLocation[] = []) {
    }
}

/**
 * コンパイル処理時の出力ハンドリング。
 */
export class BookProcess {
    reports: ProcessReport[] = [];

    info(message: string) {
        this.reports.push(new ProcessReport(ReportLevel.Info, null, null, message));
    }

    warn(message: string) {
        this.reports.push(new ProcessReport(ReportLevel.Warning, null, null, message));
    }

    error(message: string) {
        this.reports.push(new ProcessReport(ReportLevel.Error, null, null, message));
    }
}

/**
 * コンパイル処理時の出力ハンドリング。
 */
export class Process {
    symbols: Symbol[] = [];
    indexCounter: { [kind: string]: number; } = {};
    afterProcess: Function[] = [];
    private _reports: ProcessReport[] = [];

    constructor(public part: ContentChunk, public chapter: ContentChunk | null, public input: string | null) {
    }

    info(message: string, ...nodes: NodeLocation[]) {
        this._reports.push(new ProcessReport(ReportLevel.Info, this.part, this.chapter, message, nodes));
    }

    warn(message: string, ...nodes: NodeLocation[]) {
        this._reports.push(new ProcessReport(ReportLevel.Warning, this.part, this.chapter, message, nodes));
    }

    error(message: string, ...nodes: NodeLocation[]) {
        this._reports.push(new ProcessReport(ReportLevel.Error, this.part, this.chapter, message, nodes));
    }

    nextIndex(kind: string) {
        let nextIndex = this.indexCounter[kind];
        if (typeof nextIndex === "undefined") {
            nextIndex = 1;
        } else {
            nextIndex++;
        }
        this.indexCounter[kind] = nextIndex;
        return nextIndex;
    }

    get reports(): ProcessReport[] {
        return this._reports.sort((a: ProcessReport, b: ProcessReport) => {
            if (a.nodes.length === 0 && b.nodes.length === 0) {
                return 0;
            } else if (a.nodes.length === 0) {
                return -1;
            } else if (b.nodes.length === 0) {
                return 1;
            } else {
                return a.nodes[0].location.start.offset - b.nodes[0].location.start.offset;
            }
        });
    }

    addSymbol(symbol: Symbol) {
        symbol.part = this.part;
        symbol.chapter = this.chapter;
        this.symbols.push(symbol);
    }

    get missingSymbols(): Symbol[] {
        let result: Symbol[] = [];
        this.symbols.forEach(symbol => {
            if (symbol.referenceTo && !symbol.referenceTo.referenceNode) {
                result.push(symbol);
            }
        });
        return result;
    }

    constructReferenceTo(node: InlineElementSyntaxTree, value: string, targetSymbol?: string, separator?: string): ReferenceTo | null;

    constructReferenceTo(node: BlockElementSyntaxTree, value: string, targetSymbol: string, separator?: string): ReferenceTo | null;

    constructReferenceTo(node: any, value: string, targetSymbol = node.symbol, separator = "|"): ReferenceTo | null {
        let splitted = value.split(separator);
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
                partName: this.part?.name,
                chapterName: splitted[0],
                targetSymbol: targetSymbol,
                label: splitted[1]
            };
        } else if (splitted.length === 1) {
            return {
                part: this.part,
                partName: this.part?.name,
                chapter: this.chapter,
                chapterName: this.chapter?.name!,
                targetSymbol: targetSymbol,
                label: splitted[0]
            };
        } else {
            let message = t("compile.args_length_mismatch", "1 or 2 or 3", splitted.length);
            this.error(message, node);
            return null;
        }
    }

    addAfterProcess(func: Function) {
        this.afterProcess.push(func);
    }

    doAfterProcess() {
        this.afterProcess.forEach((func) => func());
        this.afterProcess = [];
    }
}

export class BuilderProcess {

    constructor(public builder: Builder, public base: Process) {
    }

    get info(): (message: string, ...nodes: SyntaxTree[]) => void {
        return this.base.info.bind(this.base);
    }

    get warn(): (message: string, ...nodes: SyntaxTree[]) => void {
        return this.base.warn.bind(this.base);
    }

    get error(): (message: string, ...nodes: SyntaxTree[]) => void {
        return this.base.error.bind(this.base);
    }

    result: string = "";

    out(data: any): BuilderProcess {
        // 最近のブラウザだと単純結合がアホみたいに早いらしいので
        this.result += this.builder.escape(data);
        return this;
    }

    outRaw(data: any): BuilderProcess {
        // 最近のブラウザだと単純結合がアホみたいに早いらしいので
        this.result += data;
        return this;
    }

    // TODO pushOut いみふ感高いのでやめよう 削除だ！
    pushOut(data: string): BuilderProcess {
        this.result = data + this.result;
        return this;
    }

    get input(): string | null {
        return this.base.input;
    }

    get symbols(): Symbol[] {
        return this.base.symbols;
    }

    findChapter(chapId: string): ContentChunk {
        let book = this.base.chapter!.book;
        let chaps = book.allChunks.filter(chunk => {
            let name = chunk.name.substr(0, chunk.name.lastIndexOf(".re"));
            if (name === chapId) {
                return true;
            }
            let chapter: ChapterSyntaxTree | null = null as any;
            visit(chunk.tree.ast, {
                visitDefaultPre: (_node, _parent) => {
                    return !chapter;
                },
                visitChapterPre: (node, _parent) => {
                    chapter = node;
                    return false;
                }
            });
            if (chapter && chapter.headline.label) {
                return chapter.headline.label.arg === chapId;
            }
            return false;
        });
        return chaps[0];
    }

    /**
     * 指定されたidの画像を探す。
     * 解決ルールは https://github.com/kmuto/review/wiki/ImagePath の通り。
     * Config側で絶対パス化やリソースの差し替えを行う可能性があるため、このメソッドの返り値は無加工で使うこと。
     * @param id
     * @returns {Promise<string>}
     */
    findImageFile(id: string): Promise<string> {
        // NOTE: https://github.com/kmuto/review/wiki/ImagePath
        // 4軸マトリクス 画像dir, ビルダ有無, chapId位置, 拡張子

        let config = (this.base.part || this.base.chapter)!.book.config;

        let fileNameList: string[] = [];
        (() => {
            let imageDirList = ["images/"];
            let builderList = [this.builder.extention + "/", ""];
            let chapSwitchList = [true, false];
            let chunkName = (this.base.chapter || this.base.part).name; // TODO もっと頭良い感じに
            chunkName = chunkName.substring(0, chunkName.lastIndexOf("."));
            let chapSeparatorList = ["/", "-"];
            let extList = ["png", "jpg", "jpeg", "gif"];
            imageDirList.forEach(imageDir => {
                builderList.forEach(builder => {
                    chapSwitchList.forEach(chapSwitch => {
                        chapSeparatorList.forEach(chapSeparator => {
                            extList.forEach(ext => {
                                let fileName = "";
                                fileName += imageDir;
                                fileName += builder;
                                if (chapSwitch) {
                                    fileName += chunkName;
                                    fileName += chapSeparator;
                                }
                                fileName += id + "." + ext;
                                if (fileNameList.indexOf(fileName) === -1) {
                                    fileNameList.push(fileName);
                                }
                            });
                        });
                    });
                });
            });
        })();
        let promise = new Promise<string>((resolve, reject) => {
            let checkFileExists = () => {
                if (fileNameList.length === 0) {
                    reject(id);
                    return;
                }
                let fileName = fileNameList.shift()!;
                config.exists(fileName).then(result => {
                    if (result.result) {
                        resolve(result.path);
                        return;
                    }
                    checkFileExists();
                });
            };
            checkFileExists();
        });
        return promise;
    }
}

/**
 * 本全体を表す。
 */
export class Book {
    process: BookProcess = new BookProcess();
    acceptableSyntaxes: AcceptableSyntaxes;

    predef: ContentChunk[] = [];
    contents: ContentChunk[] = [];
    appendix: ContentChunk[] = [];
    postdef: ContentChunk[] = [];

    constructor(public config: Config) {
    }

    get allChunks(): ContentChunk[] {
        let tmpArray: ContentChunk[] = [];
        let add = (chunk: ContentChunk) => {
            tmpArray.push(chunk);
            chunk.nodes.forEach(chunk => add(chunk));
        };

        this.predef.forEach(chunk => add(chunk));
        this.contents.forEach(chunk => add(chunk));
        this.appendix.forEach(chunk => add(chunk));
        this.postdef.forEach(chunk => add(chunk));

        return tmpArray;
    }

    get reports(): ProcessReport[] {
        let results: ProcessReport[] = [];
        results = results.concat(this.process.reports);
        let gatherReports = (chunk: ContentChunk) => {
            results = results.concat(chunk.process.reports);
            chunk.nodes.forEach(chunk => gatherReports(chunk));
        };
        this.predef.forEach(chunk => gatherReports(chunk));
        this.contents.forEach(chunk => gatherReports(chunk));
        this.appendix.forEach(chunk => gatherReports(chunk));
        this.postdef.forEach(chunk => gatherReports(chunk));
        return results;
    }

    get hasError(): boolean {
        return this.reports.some(report => report.level === ReportLevel.Error);
    }

    get hasWarning(): boolean {
        return this.reports.some(report => report.level === ReportLevel.Warning);
    }
}

export class ContentChunk {
    parent: ContentChunk;
    nodes: ContentChunk[] = [];

    no: number;
    name: string;
    _input: string; // TODO get, set やめる
    tree: { ast: SyntaxTree; cst: ConcreatSyntaxTree; };

    process: Process;
    builderProcesses: BuilderProcess[] = [];

    constructor(book: Book, parent: ContentChunk | null, name: string);

    constructor(book: Book, name: string);

    constructor(public book: Book, parent: any, name?: any) {
        if (parent instanceof ContentChunk) {
            this.parent = parent;
            this.name = name;
        } else if (typeof name === "string") {
            this.name = name;
        } else {
            this.name = parent;
        }

        let part: ContentChunk = parent ? parent : null;
        let chapter: ContentChunk = this; // TODO thisがpartでchapterが無しの場合もあるよ…！！
        this.process = new Process(part, chapter, null);
    }

    get input() {
        return this._input;
    }

    set input(value: string) {
        // TODO やめる
        this._input = value;
        this.process.input = value;
    }

    createBuilderProcess(builder: Builder): BuilderProcess {
        let builderProcess = new BuilderProcess(builder, this.process);
        this.builderProcesses.push(builderProcess);
        return builderProcess;
    }

    findResultByBuilder(builderName: string): string;

    findResultByBuilder(builder: Builder): string;

    findResultByBuilder(builder: any): string {
        let founds: BuilderProcess[];
        if (typeof builder === "string") {
            founds = this.builderProcesses.filter(process => process.builder.name === builder);
        } else {
            founds = this.builderProcesses.filter(process => process.builder === builder);
        }
        // TODO 何かエラー投げたほうがいい気もするなー
        return founds[0].result;
    }
}
