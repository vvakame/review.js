///<reference path='../utils/Utils.ts' />
///<reference path='../i18n/i18n.ts' />
///<reference path='../model/CompilerModel.ts' />

module ReVIEW.Build {
	"use strict";

	import t = ReVIEW.i18n.t;

	import SyntaxTree = ReVIEW.Parse.SyntaxTree;
	import NodeSyntaxTree = ReVIEW.Parse.NodeSyntaxTree;
	import BlockElementSyntaxTree = ReVIEW.Parse.BlockElementSyntaxTree;
	import InlineElementSyntaxTree = ReVIEW.Parse.InlineElementSyntaxTree;
	import TextNodeSyntaxTree = ReVIEW.Parse.TextNodeSyntaxTree;

	import nodeContentToString = ReVIEW.nodeContentToString;

	/**
	 * 構文木の組み換えを行う機会を提供する。
	 */
	export interface IPreprocessor {
		start(book:Book, acceptableSyntaxes:AcceptableSyntaxes):void;
	}

	/**
	 * インライン構文やブロック構文中で利用可能な構造について制限をかけ、構文木を組み替える。
	 * 種類は主に3種類。
	 * 1. テキストをベースとしてインライン構文のみ許可する(デフォルト
	 * 2. 全て許可せずテキストとして扱う
	 * 3. 全てを許可する(なにもしない
	 * AcceptableSyntaxes にしたがって処理する。
	 */
	export class SyntaxPreprocessor implements IPreprocessor {
		acceptableSyntaxes:AcceptableSyntaxes;

		start(book:Book, acceptableSyntaxes:AcceptableSyntaxes) {
			this.acceptableSyntaxes = acceptableSyntaxes;

			this.preprocessBook(book);
		}

		preprocessBook(book:Book) {
			book.parts.forEach(part=> this.preprocessPart(part));
		}

		preprocessPart(part:Part) {
			part.chapters.forEach(chapter=>this.preprocessChapter(chapter));
		}

		preprocessChapter(chapter:Chapter) {
			ReVIEW.visit(chapter.root, {
				visitDefaultPre: (node:SyntaxTree)=> {
				},
				visitBlockElementPre: (node:BlockElementSyntaxTree) => {
					this.preprocessBlockSyntax(chapter, node);
				}
			});
		}

		preprocessBlockSyntax(chapter:Chapter, node:BlockElementSyntaxTree) {
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
				var info:{
					offset: number;
					line: number;
					column: number;
				};
				var resultNodes:SyntaxTree[] = [];
				var lastNode:SyntaxTree;
				node.childNodes.forEach(node=> {
					ReVIEW.visit(node, {
						visitDefaultPre: (node:SyntaxTree) => {
							if (!info) {
								info = {
									offset: node.offset,
									line: node.line,
									column: node.column
								};
							}
							lastNode = node;
						},
						visitInlineElementPre: (node:InlineElementSyntaxTree) => {
							var textNode = new TextNodeSyntaxTree({
								syntax: "BlockElementContentText",
								offset: info.offset,
								line: info.line,
								column: info.column,
								endPos: node.offset - 1,
								text: chapter.process.input.substring(info.offset, node.offset - 1)
							});
							resultNodes.push(textNode);
							resultNodes.push(node);
							info = null;
							lastNode = node;
						}
					});
				});
				if (info) {
					var textNode = new TextNodeSyntaxTree({
						syntax: "BlockElementContentText",
						offset: info.offset,
						line: info.line,
						column: info.column,
						endPos: lastNode.endPos,
						text: chapter.process.input.substring(info.offset, lastNode.endPos)
					});
					resultNodes.push(textNode);
				}

				node.childNodes = resultNodes;

			} else {
				// 全て不許可(テキスト化
				var first = node.childNodes[0];
				var last = node.childNodes[node.childNodes.length - 1];
				var textNode = new TextNodeSyntaxTree({
					syntax: "BlockElementContentText",
					offset: first.offset,
					line: first.line,
					column: first.column,
					endPos: last.endPos,
					text: nodeContentToString(chapter.process, node)
				});
				node.childNodes = [textNode];
			}
		}
	}
}
