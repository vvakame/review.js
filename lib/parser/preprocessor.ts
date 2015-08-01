"use strict";

import {Book, ContentChunk} from "../model/compilerModel";

import {SyntaxTree, NodeSyntaxTree, BlockElementSyntaxTree, InlineElementSyntaxTree, ColumnSyntaxTree, ChapterSyntaxTree, TextNodeSyntaxTree} from "./parser";

import {AcceptableSyntaxes} from "./analyzer";

import {visit} from "./walker";

import {nodeContentToString} from "../utils/utils";

/**
 * 構文木の組み換えを行う機会を提供する。
 */
export interface Preprocessor {
	start(book: Book, acceptableSyntaxes: AcceptableSyntaxes): void;
}

/**
 * インライン構文やブロック構文中で利用可能な構造について制限をかけ、構文木を組み替える。
 * 種類は主に3種類。
 * 1. テキストをベースとしてインライン構文のみ許可する(デフォルト
 * 2. 全て許可せずテキストとして扱う
 * 3. 全てを許可する(なにもしない
 * AcceptableSyntaxes にしたがって処理する。
 */
export class SyntaxPreprocessor implements Preprocessor {
	acceptableSyntaxes: AcceptableSyntaxes;

	start(book: Book) {
		this.acceptableSyntaxes = book.acceptableSyntaxes;

		book.predef.forEach(chunk=> this.preprocessChunk(chunk));
		book.contents.forEach(chunk=> this.preprocessChunk(chunk));
		book.appendix.forEach(chunk=> this.preprocessChunk(chunk));
		book.postdef.forEach(chunk=> this.preprocessChunk(chunk));
	}

	preprocessChunk(chunk: ContentChunk) {
		visit(chunk.tree.ast, {
			visitDefaultPre: (node: SyntaxTree) => {
			},
			visitColumnPre: (node: ColumnSyntaxTree) => {
				this.preprocessColumnSyntax(chunk, node);
			},
			visitBlockElementPre: (node: BlockElementSyntaxTree) => {
				this.preprocessBlockSyntax(chunk, node);
			}
		});

		chunk.nodes.forEach(chunk=> this.preprocessChunk(chunk));
	}

	/**
	 * コラム記法を組み替える。
	 * コラムの中ではHeadlineが使えるが、コラム自体の見出しレベルより深いレベルのHeadlineしか許可されない。
	 * そのため、コラム自体より浅いレベルの見出しレベルを見つけたらコラム内から脱出させる。
	 * @param chunk
	 * @param column
	 */
	preprocessColumnSyntax(chunk: ContentChunk, column: ColumnSyntaxTree) {
		function reconstruct(parent: NodeSyntaxTree, target: ChapterSyntaxTree, to = column.parentNode.toChapter()) {
			if (target.level <= to.level) {
				reconstruct(parent.parentNode.toNode(), target, to.parentNode.toChapter());
				return;
			}
			// コラムより大きなChapterを見つけた場合、それ以下のノードは全て引き上げる
			to.childNodes.splice(to.childNodes.indexOf(parent) + 1, 0, target);
			column.text.splice(column.text.indexOf(target), 1);
		}

		// 組み換え
		visit(column, {
			visitDefaultPre: (node: SyntaxTree) => {
			},
			visitColumnPre: (node: ColumnSyntaxTree) => {
				// TODO ここに来たらエラーにするべき
			},
			visitChapterPre: (node: ChapterSyntaxTree) => {
				if (column.level < node.headline.level) {
					return;
				}
				reconstruct(column, node);
			}
		});

		// Parser.ts からのコピペなので共通ロジックとしてリファクタリングする

		// parentNode を設定
		visit(chunk.tree.ast, {
			visitDefaultPre: (ast: SyntaxTree, parent: SyntaxTree) => {
				ast.parentNode = parent;
			}
		});
		// prev, next を設定
		visit(chunk.tree.ast, {
			visitDefaultPre: (ast: SyntaxTree, parent: SyntaxTree) => {
			},
			visitChapterPre: (ast: ChapterSyntaxTree) => {
				ast.text.forEach((node, i, nodes) => {
					node.prev = nodes[i - 1];
					node.next = nodes[i + 1];
				});
			},
			visitNodePre: (ast: NodeSyntaxTree) => {
				ast.childNodes.forEach((node, i, nodes) => {
					node.prev = nodes[i - 1];
					node.next = nodes[i + 1];
				});
			}
		});

	}

	/**
	 * ブロック記法の中身を組み替える。
	 * ブロック記法は 1. 全ての記法を許可 2. インライン記法のみ許可 3. 全てを許可しない の3パターンの組み換えがある。
	 * @param chapter
	 * @param node
	 */
	preprocessBlockSyntax(chunk: ContentChunk, node: BlockElementSyntaxTree) {
		if (node.childNodes.length === 0) {
			return;
		}

		var syntaxes = this.acceptableSyntaxes.find(node);
		if (syntaxes.length !== 1) {
			// TODO エラーにしたほうがいいかなぁ
			return;
		}

		var syntax = syntaxes[0];
		if (syntax.allowFullySyntax) {
			// 全て許可
			return;
		} else if (syntax.allowInline) {
			// inline構文のみ許可(Paragraphは殺す
			// inline以外の構文は叩き潰してTextにmergeする
			var info: {
				offset: number;
				line: number;
				column: number;
			};
			var resultNodes: SyntaxTree[] = [];
			var lastNode: SyntaxTree;
			node.childNodes.forEach(node=> {
				visit(node, {
					visitDefaultPre: (node: SyntaxTree) => {
						if (!info) {
							info = {
								offset: node.offset,
								line: node.line,
								column: node.column
							};
						}
						lastNode = node;
					},
					visitInlineElementPre: (node: InlineElementSyntaxTree) => {
						var textNode = new TextNodeSyntaxTree({
							syntax: "BlockElementContentText",
							offset: info.offset,
							line: info.line,
							column: info.column,
							endPos: node.offset - 1,
							text: chunk.process.input.substring(info.offset, node.offset - 1)
						});
						resultNodes.push(textNode);
						resultNodes.push(node);
						info = null;
						lastNode = node;
					}
				});
			});
			if (info) {
				(() => {
					var textNode = new TextNodeSyntaxTree({
						syntax: "BlockElementContentText",
						offset: info.offset,
						line: info.line,
						column: info.column,
						endPos: lastNode.endPos,
						text: chunk.process.input.substring(info.offset, lastNode.endPos)
					});
					resultNodes.push(textNode);
				})();
			}

			node.childNodes = resultNodes;

		} else {
			(() => {
				// 全て不許可(テキスト化
				var first = node.childNodes[0];
				var last = node.childNodes[node.childNodes.length - 1];
				var textNode = new TextNodeSyntaxTree({
					syntax: "BlockElementContentText",
					offset: first.offset,
					line: first.line,
					column: first.column,
					endPos: last.endPos,
					text: nodeContentToString(chunk.process, node)
				});
				node.childNodes = [textNode];
			})();
		}
	}
}
