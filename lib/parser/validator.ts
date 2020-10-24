"use strict";

import { t } from "../i18n/i18n";

import { Book, ContentChunk, Symbol } from "../model/compilerModel";

import { SyntaxTree, ChapterSyntaxTree, ColumnSyntaxTree, HeadlineSyntaxTree, BlockElementSyntaxTree, InlineElementSyntaxTree, NodeSyntaxTree } from "./parser";

import { AcceptableSyntaxes, SyntaxType } from "./analyzer";

import { Builder } from "../builder/builder";

import { visit } from "./walker";

import { findChapter, nodeContentToString } from "../utils/utils";

/**
 * IAnalyzerで処理した後の構文木について構文上のエラーがないかチェックする。
 * また、Builderと対比させて、未実装の候補がないかをチェックする。
 */
export interface Validator {
    start(book: Book, acceptableSyntaxes: AcceptableSyntaxes, builders: Builder[]): void;
}

export class DefaultValidator implements Validator {
    acceptableSyntaxes: AcceptableSyntaxes;
    builders: Builder[];

    start(book: Book, acceptableSyntaxes: AcceptableSyntaxes, builders: Builder[]) {
        this.acceptableSyntaxes = acceptableSyntaxes;
        this.builders = builders;

        this.checkBuilder(book, acceptableSyntaxes, builders);
        this.checkBook(book);
        this.resolveSymbolAndReference(book);
    }

    checkBuilder(book: Book, acceptableSyntaxes: AcceptableSyntaxes, builders: Builder[] = []) {
        acceptableSyntaxes.acceptableSyntaxes.forEach(syntax => {
            let prefix = "";
            switch (syntax.type) {
                case SyntaxType.Other:
                    // Other系は実装をチェックする必要はない…。(ということにしておく
                    return;
                case SyntaxType.Block:
                    prefix = "block_";
                    break;
                case SyntaxType.Inline:
                    prefix = "inline_";
                    break;
            }
            let funcName1 = prefix + syntax.symbolName;
            let funcName2 = prefix + syntax.symbolName + "_pre";
            builders.forEach(builder => {
                let func = (<any>builder)[funcName1] || (<any>builder)[funcName2];
                if (!func) {
                    book.process.error(SyntaxType[syntax.type] + " " + syntax.symbolName + " is not supported in " + builder.name);
                }
            });
        });
    }

    checkBook(book: Book) {
        book.predef.forEach(chunk => this.checkChunk(chunk));
        book.contents.forEach(chunk => this.checkChunk(chunk));
        book.appendix.forEach(chunk => this.checkChunk(chunk));
        book.postdef.forEach(chunk => this.checkChunk(chunk));
    }

    checkChunk(chunk: ContentChunk) {
        // Analyzer 内で生成した構文規則に基づき処理
        visit(chunk.tree.ast, {
            visitDefaultPre: (_node: SyntaxTree) => {
            },
            visitHeadlinePre: (node: HeadlineSyntaxTree) => {
                let results = this.acceptableSyntaxes.find(node);
                if (results.length !== 1) {
                    chunk.process.error(t("compile.syntax_definietion_error"), node);
                    return;
                }
                return results[0].process(chunk.process, node);
            },
            visitColumnPre: (node: ColumnSyntaxTree) => {
                let results = this.acceptableSyntaxes.find(node);
                if (results.length !== 1) {
                    chunk.process.error(t("compile.syntax_definietion_error"), node);
                    return;
                }
                return results[0].process(chunk.process, node);
            },
            visitBlockElementPre: (node: BlockElementSyntaxTree) => {
                let results = this.acceptableSyntaxes.find(node);
                if (results.length !== 1) {
                    chunk.process.error(t("compile.block_not_supported", node.symbol), node);
                    return;
                }
                let expects = results[0].argsLength;
                let arg: NodeSyntaxTree[] = node.args || [];
                if (expects.indexOf(arg.length) === -1) {
                    let expected = expects.map((n) => Number(n).toString()).join(" or ");
                    let message = t("compile.args_length_mismatch", expected, arg.length);
                    chunk.process.error(message, node);
                    return;
                }

                return results[0].process(chunk.process, node);
            },
            visitInlineElementPre: (node: InlineElementSyntaxTree) => {
                let results = this.acceptableSyntaxes.find(node);
                if (results.length !== 1) {
                    chunk.process.error(t("compile.inline_not_supported", node.symbol), node);
                    return;
                }
                return results[0].process(chunk.process, node);
            }
        });

        // 最初は必ず Level 1
        visit(chunk.tree.ast, {
            visitDefaultPre: (_node: SyntaxTree) => {
            },
            visitChapterPre: (node: ChapterSyntaxTree) => {
                if (node.level === 1) {
                    if (!findChapter(node)) {
                        // ここに来るのは実装のバグのはず
                        chunk.process.error(t("compile.chapter_not_toplevel"), node);
                    }
                } else {
                    let parent = findChapter(node.parentNode);
                    if (!parent) {
                        chunk.process.error(t("compile.chapter_topleve_eq1"), node);
                    }
                }
            }
        });

        this.chechBlockGraphTool(chunk);
    }

    chechBlockGraphTool(chunk: ContentChunk) {
        // graph記法の外部ツール利用について内容が正しいかチェックする
        visit(chunk.tree.ast, {
            visitDefaultPre: (_node: SyntaxTree) => {
            },
            visitBlockElementPre: (node: BlockElementSyntaxTree) => {
                if (node.symbol !== "graph") {
                    return;
                }
                let toolNameNode = node.args[1];
                if (!toolNameNode) {
                    // ここのNodeがないのは別でチェックするので気にしない
                    return;
                }
                let toolName = nodeContentToString(chunk.process, toolNameNode);
                switch (toolName) {
                    case "graphviz":
                        break;
                    case "gnuplot":
                    case "blockdiag":
                    case "aafigure":
                        chunk.process.info(t("compile.graph_tool_is_not_recommended"), toolNameNode);
                        break;
                    default:
                        chunk.process.error(t("compile.unknown_graph_tool", toolName), toolNameNode);
                }
            }
        });
    }

    resolveSymbolAndReference(book: Book) {
        // symbols の解決
        // Arrayにflatten がなくて悲しい reduce だと長い…
        let symbols: Symbol[] = book.allChunks.reduce<Symbol[]>((p, c) => p.concat(c.process.symbols), []);
        symbols.forEach(symbol => {
            // referenceToのpartやchapterの解決
            const referenceTo = symbol.referenceTo;
            if (!referenceTo) {
                return;
            }

            if (!referenceTo.chapter && referenceTo.chapterName) {
                // 各章の名前は拡張子付きで入っているので、比較の為にファイル名にする
                const chapterFileName = `${referenceTo.chapterName}.re`;
                book.allChunks.forEach(chunk => {
                    if (chapterFileName === chunk.name) {
                        referenceTo.chapter = chunk;
                    }
                });
            }
        });
        // referenceTo.node の解決
        symbols.forEach(symbol => {
            if (symbol.referenceTo && !symbol.referenceTo.referenceNode) {
                let reference = symbol.referenceTo;
                symbols.forEach(symbol => {
                    if (reference.chapter === symbol.chapter &&
                        reference.targetSymbol === symbol.symbolName &&
                        (reference.label == null || reference.label === symbol.labelName)) {
                        reference.referenceNode = symbol.node;
                    }
                });
                if (!reference.referenceNode) {
                    symbol.chapter!.process.error(t("compile.reference_is_missing", reference.targetSymbol, reference.label ?? reference.chapterName), symbol.node);
                    return;
                }
            }
        });
        // 同一チャプター内に同一シンボル(listとか)で同一labelの要素がないかチェック
        symbols.forEach(symbol1 => {
            symbols.forEach(symbol2 => {
                if (symbol1 === symbol2) {
                    return;
                }
                if (symbol1.chapter === symbol2.chapter && symbol1.symbolName === symbol2.symbolName) {
                    if (symbol1.labelName && symbol2.labelName && symbol1.labelName === symbol2.labelName) {
                        if (symbol1.symbolName === "hd") {
                            symbol1.chapter!.process.error(t("compile.duplicated_label_headline"), symbol1.node, symbol2.node);
                        } else {
                            symbol1.chapter!.process.error(t("compile.duplicated_label"), symbol1.node, symbol2.node);
                        }
                        return;
                    }
                }
            });
        });
    }
}
