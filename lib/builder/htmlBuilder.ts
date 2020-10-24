"use strict";

import { t } from "../i18n/i18n";
import { BuilderProcess, ContentChunk } from "../model/compilerModel";

import { DefaultBuilder } from "./builder";

import { NodeSyntaxTree, ChapterSyntaxTree, BlockElementSyntaxTree, InlineElementSyntaxTree, HeadlineSyntaxTree, UlistElementSyntaxTree, OlistElementSyntaxTree, DlistElementSyntaxTree, ColumnSyntaxTree, ColumnHeadlineSyntaxTree, ArgumentSyntaxTree } from "../parser/parser";

import { visit, TreeVisitor, TreeVisitorReturn } from "../parser/walker";

import { nodeContentToString, findChapter, padLeft, linesToFigure, getHeadlineLevels } from "../utils/utils";

export class HtmlBuilder extends DefaultBuilder {
    extention = "html";

    escapeMap: { [char: string]: string; } = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
    };

    constructor(private standalone = true) {
        super();
    }

    escape(data: any): string {
        let regexp = new RegExp(`[${Object.keys(this.escapeMap).join("")}]`, "g");
        return String(data).replace(regexp, c => this.escapeMap[c]);
    }

    normalizeId(label: ArgumentSyntaxTree): string {
        if (label.arg.match(/^[a-z][a-z0-9_/-]*$/i)) {
            return label.arg;
        } else if (label.arg.match(/^[0-9_.-][a-z0-9_.-]*$/i)) {
            return `id_${label.arg}`;
        } else {
            return `id_${encodeURIComponent(label.arg.replace(/_/g, "__").replace(/ /g, "-")).replace(/%/g, "_").replace(/\+/g, "-")}`;
        }
    }

    processPost(process: BuilderProcess, chunk: ContentChunk): void {
        if (this.standalone) {

            let pre = "";
            pre += `<?xml version="1.0" encoding="UTF-8"?>` + "\n";
            pre += `<!DOCTYPE html>` + "\n";
            pre += `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xmlns:ops="http://www.idpf.org/2007/ops" xml:lang="ja">` + "\n";
            pre += `<head>` + "\n";
            pre += `  <meta charset="UTF-8" />` + "\n";
            pre += `  <link rel="stylesheet" type="text/css" href="stylesheet.css" />` + "\n";
            pre += `  <meta name="generator" content="Re:VIEW" />` + "\n";
            let name: string | null = null;
            visit(chunk.tree.ast, {
                visitDefaultPre: () => {
                },
                visitChapterPre: (node: ChapterSyntaxTree) => {
                    if (node.headline.level === 1) {
                        name = nodeContentToString(process, node.headline.caption, /* textOnly */true);
                    }
                }
            });
            pre += "  <title>" + this.escape(name) + "</title>\n";
            pre += "</head>\n";
            pre += "<body>\n";
            process.pushOut(pre);

            process.outRaw("</body>\n");
            process.outRaw("</html>\n");
        }
    }

    headlinePre(process: BuilderProcess, _name: string, node: HeadlineSyntaxTree) {
        process.outRaw("<h").out(node.level);
        if (node.label) {
            process.outRaw(" id=\"").out(this.normalizeId(node.label)).outRaw("\"");
        }
        process.outRaw(">");
        process.outRaw("<a id=\"h").out(getHeadlineLevels(node).join("-")).outRaw("\"></a>");

        if (node.level === 1) {
            let text = t("builder.chapter", node.parentNode.no);
            process.outRaw(`<span class="secno">`);
            process.out(text).out("　");
            process.outRaw(`</span>`);
        } else if (node.level < 4) {
            process.out(getHeadlineLevels(node).join(".")).out("　");
        }
    }

    headlinePost(process: BuilderProcess, _name: string, node: HeadlineSyntaxTree) {
        process.outRaw("</h").out(node.level).outRaw(">\n");
    }

    columnPre(process: BuilderProcess, _node: ColumnSyntaxTree) {
        process.outRaw("<div class=\"column\">\n\n");
    }

    columnPost(process: BuilderProcess, _node: ColumnSyntaxTree) {
        process.outRaw("</div>\n");
    }

    columnHeadlinePre(process: BuilderProcess, node: ColumnHeadlineSyntaxTree) {
        process.outRaw("<h").out(node.level);
        if (node.label) {
            process.outRaw(" id=\"").out(this.normalizeId(node.label)).outRaw("\"");
        }
        process.outRaw(">");
        process.outRaw("<a id=\"column-").out(node.parentNode.no).outRaw("\"></a>");

        return (v: TreeVisitor) => {
            visit(node.caption, v);
        };
    }

    columnHeadlinePost(process: BuilderProcess, node: ColumnHeadlineSyntaxTree) {
        process.outRaw("</h").out(node.level).outRaw(">\n");
    }

    paragraphPre(process: BuilderProcess, _name: string, node: NodeSyntaxTree) {
        if (node.prev && node.prev.isBlockElement() && node.prev.toBlockElement().symbol === "noindent") {
            process.outRaw("<p class=\"noindent\">");
        } else {
            process.outRaw("<p>");
        }
    }

    paragraphPost(process: BuilderProcess, _name: string, _node: NodeSyntaxTree) {
        process.outRaw("</p>\n");
    }

    ulistPre(process: BuilderProcess, _name: string, node: UlistElementSyntaxTree) {
        this.ulistParentHelper(process, node, () => {
            process.outRaw("<ul>\n<li>");
        });
        // TODO <p> で囲まれないようにする
        if (node.prev instanceof UlistElementSyntaxTree === false) {
            process.outRaw("<ul>\n");
        }
        process.outRaw("<li>");
    }

    ulistPost(process: BuilderProcess, _name: string, node: UlistElementSyntaxTree) {
        process.outRaw("</li>\n");
        if (node.next instanceof UlistElementSyntaxTree === false) {
            process.outRaw("</ul>\n");
        }
        this.ulistParentHelper(process, node, () => {
            process.outRaw("</li>\n</ul>\n");
        });
    }

    olistPre(process: BuilderProcess, _name: string, node: OlistElementSyntaxTree) {
        if (node.prev instanceof OlistElementSyntaxTree === false) {
            process.outRaw("<ol>\n");
        }
        process.outRaw("<li>");
    }

    olistPost(process: BuilderProcess, _name: string, node: OlistElementSyntaxTree) {
        process.outRaw("</li>\n");
        if (node.next instanceof OlistElementSyntaxTree === false) {
            process.outRaw("</ol>\n");
        }
    }

    dlistPre(process: BuilderProcess, _name: string, node: DlistElementSyntaxTree) {
        if (node.prev instanceof DlistElementSyntaxTree === false) {
            process.outRaw("<dl>\n");
        }
        return (v: TreeVisitor) => {
            process.outRaw("<dt>");
            visit(node.text, v);
            process.outRaw("</dt>\n");
            process.outRaw("<dd>");
            visit(node.content, v);
            process.outRaw("</dd>\n");
        };
    }

    dlistPost(process: BuilderProcess, _name: string, node: DlistElementSyntaxTree) {
        if (node.next instanceof DlistElementSyntaxTree === false) {
            process.outRaw("</dl>\n");
        }
    }

    block_list_pre(process: BuilderProcess, node: BlockElementSyntaxTree): TreeVisitorReturn {
        process.outRaw("<div class=\"caption-code\">\n");
        let chapter = findChapter(node, 1);
        if (!chapter) {
            process.error(t("builder.chapter_not_found", 1), node);
            return false;
        }
        let text = t("builder.list", chapter.fqn, node.no);
        process.outRaw("<p class=\"caption\">").out(text).outRaw(": ");
        return (v: TreeVisitor) => {
            // name はパスしたい, langもパスしたい
            visit(node.args[1], v);

            process.outRaw("</p>\n");
            process.outRaw("<pre class=\"list\">");

            const nodeCount = node.childNodes.length;
            let nodeIndex = 0;
            node.childNodes.forEach((node) => {
                visit(node, v);

                // <pre>の中では入力の改行が保持されるべきだが、ASTのパースで消えてしまうため補完。
                // なお、\rは保持されるので、元ファイルの改行コードが\r\nの場合の考慮は不要。
                nodeIndex++;
                if (nodeIndex < nodeCount) {
                    process.out("\n");
                }
            });
        };
    }

    block_list_post(process: BuilderProcess, _node: BlockElementSyntaxTree) {
        process.outRaw("\n</pre>\n").outRaw("</div>\n");
    }

    block_listnum_pre(process: BuilderProcess, node: BlockElementSyntaxTree): TreeVisitorReturn {
        process.outRaw("<div class=\"code\">\n");
        let chapter = findChapter(node, 1);
        if (!chapter) {
            process.error(t("builder.chapter_not_found", 1), node);
            return false;
        }
        let text = t("builder.list", chapter.fqn, node.no);
        process.outRaw("<p class=\"caption\">").out(text).out(": ");
        let lineCount = 1;
        return (v: TreeVisitor) => {
            // name はパスしたい, langもパスしたい
            visit(node.args[1], v);

            process.outRaw("</p>\n");
            process.outRaw("<pre class=\"list\">");

            let lineCountMax = 0;
            node.childNodes.forEach(node => {
                if (node.isTextNode()) {
                    lineCountMax += node.toTextNode().text.split("\n").length;
                }
            });
            let lineDigit = Math.max(linesToFigure(lineCountMax), 2);

            const nodeCount = node.childNodes.length;
            let nodeIndex = 0;
            node.childNodes.forEach((node, index, childNodes) => {
                if (node.isTextNode()) {
                    // 改行する可能性があるのはTextNodeだけ…のはず
                    let hasNext = !!childNodes[index + 1];
                    let textNode = node.toTextNode();
                    let lines = textNode.text.split("\n");
                    lines.forEach((line, index) => {
                        process.out(padLeft(String(lineCount), " ", lineDigit)).out(": ");
                        process.out(line);
                        if (!hasNext || lines.length - 1 !== index) {
                            lineCount++;
                        }
                        if (lines.length - 1 !== index) {
                            process.out("\n");
                        }
                    });
                } else {
                    visit(node, v);
                }

                // <pre>の中では入力の改行が保持されるべきだが、ASTのパースで消えてしまうため補完。
                // なお、\rは保持されるので、元ファイルの改行コードが\r\nの場合の考慮は不要。
                nodeIndex++;
                if (nodeIndex < nodeCount) {
                    process.out("\n");
                }

                lineCount++;
            });
        };
    }

    block_listnum_post(process: BuilderProcess, _node: BlockElementSyntaxTree) {
        process.outRaw("\n</pre>\n").outRaw("</div>\n");
    }

    inline_list(process: BuilderProcess, node: InlineElementSyntaxTree) {
        let chapter = findChapter(node, 1);
        if (!chapter) {
            process.error(t("builder.chapter_not_found", 1), node);
            return false;
        }
        let listNode = this.findReference(process, node).referenceTo!.referenceNode!.toBlockElement();
        let text = t("builder.list", chapter.fqn, listNode.no);
        process.out(text);
        return false;
    }

    block_emlist_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
        process.outRaw("<div class=\"emlist-code\">\n");
        return (v: TreeVisitor) => {
            // name はパスしたい
            if (node.args[0]) {
                process.outRaw("<p class=\"caption\">");
                visit(node.args[0], v);
                process.outRaw("</p>\n");
            }
            process.outRaw("<pre class=\"emlist\">");

            const nodeCount = node.childNodes.length;
            let nodeIndex = 0;
            node.childNodes.forEach((node) => {
                visit(node, v);

                // <pre>の中では入力の改行が保持されるべきだが、ASTのパースで消えてしまうため補完。
                // なお、\rは保持されるので、元ファイルの改行コードが\r\nの場合の考慮は不要。
                nodeIndex++;
                if (nodeIndex < nodeCount) {
                    process.out("\n");
                }
            });
        };
    }

    block_emlist_post(process: BuilderProcess, _node: BlockElementSyntaxTree) {
        process.outRaw("\n</pre>\n").outRaw("</div>\n");
    }

    block_emlistnum_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
        process.outRaw("<div class=\"emlistnum-code\">\n");
        process.outRaw("<pre class=\"emlist\">");
        let lineCount = 1;
        return (v: TreeVisitor) => {
            // name, args はパスしたい
            let lineCountMax = 0;
            node.childNodes.forEach(node => {
                if (node.isTextNode()) {
                    lineCountMax += node.toTextNode().text.split("\n").length;
                }
            });
            let lineDigit = Math.max(linesToFigure(lineCountMax), 2);

            const nodeCount = node.childNodes.length;
            let nodeIndex = 0;
            node.childNodes.forEach((node, index, childNodes) => {
                if (node.isTextNode()) {
                    // 改行する可能性があるのはTextNodeだけ…のはず
                    let hasNext = !!childNodes[index + 1];
                    let textNode = node.toTextNode();
                    let lines = textNode.text.split("\n");
                    lines.forEach((line, index) => {
                        process.out(padLeft(String(lineCount), " ", lineDigit)).out(": ");
                        process.out(line);
                        if (!hasNext || lines.length - 1 !== index) {
                            lineCount++;
                        }
                        if (lines.length - 1 !== index) {
                            process.out("\n");
                        }
                    });
                } else {
                    visit(node, v);
                }

                // <pre>の中では入力の改行が保持されるべきだが、ASTのパースで消えてしまうため補完。
                // なお、\rは保持されるので、元ファイルの改行コードが\r\nの場合の考慮は不要。
                nodeIndex++;
                if (nodeIndex < nodeCount) {
                    process.out("\n");
                }

                lineCount++;
            });
        };
    }

    block_emlistnum_post(process: BuilderProcess, _node: BlockElementSyntaxTree) {
        process.outRaw("\n</pre>\n").outRaw("</div>\n");
    }

    inline_br(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw("<br />");
    }

    inline_b_pre(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw("<b>");
    }

    inline_b_post(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw("</b>");
    }

    inline_code_pre(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw(`<code class="inline-code tt">`);
    }

    inline_code_post(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw(`</code>`);
    }

    inline_href(process: BuilderProcess, node: InlineElementSyntaxTree) {
        let href = nodeContentToString(process, node);
        let text = href;
        if (href.indexOf(",") !== -1) {
            text = href.slice(href.indexOf(",") + 1).trimLeft();
            href = href.slice(0, href.indexOf(","));
        }
        process.outRaw("<a href=\"").outRaw(href).outRaw("\" class=\"link\">").out(text).outRaw("</a>");
        return false;
    }

    block_label(process: BuilderProcess, node: BlockElementSyntaxTree) {
        process.outRaw("<a id=\"");
        process.out(nodeContentToString(process, node.args[0]));
        process.outRaw("\"></a>\n");
        return false;
    }

    inline_tt_pre(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw(`<code class="tt">`); // TODO RubyReviewではContentに改行が含まれている奴の挙動がサポートされていない。
    }

    inline_tt_post(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw(`</code>`);
    }

    inline_ruby_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
        process.outRaw("<ruby>");
        return (_v: TreeVisitor) => {
            // name, args はパス
            node.childNodes.forEach(node => {
                let contentString = nodeContentToString(process, node);
                let keywordData = contentString.split(",");
                process.out(keywordData[0]);
                process.outRaw("<rp>（</rp>");
                process.outRaw("<rt>").out(keywordData[1]).outRaw("</rt>");
                process.outRaw("<rp>）</rp>");
            });
        };
    }

    inline_ruby_post(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw("</ruby>");
    }

    inline_u_pre(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw("<u>");
    }

    inline_u_post(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw("</u>");
    }

    inline_kw_pre(process: BuilderProcess, node: InlineElementSyntaxTree) {
        process.outRaw("<b class=\"kw\">");
        return (_v: TreeVisitor) => {
            // name, args はパス
            node.childNodes.forEach(node => {
                let contentString = nodeContentToString(process, node);
                let keywordData = contentString.split(",");
                let pre = keywordData[0];
                let post = (keywordData[1] || "").trimLeft();
                process.out(`${pre}`);
                if (post) {
                    process.out(` (${post})`);
                }
            });
        };
    }

    inline_kw_post(process: BuilderProcess, node: InlineElementSyntaxTree) {
        let contentString = nodeContentToString(process, node);
        let keywordData = contentString.split(",");
        let pre = keywordData[0];
        process.outRaw("</b>").outRaw("<!-- IDX:").out(pre).outRaw(" -->");
    }

    inline_em_pre(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw("<em>");
    }

    inline_em_post(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw("</em>");
    }

    block_image(process: BuilderProcess, node: BlockElementSyntaxTree) {
        let label = nodeContentToString(process, node.args[0]);
        return process.findImageFile(label)
            .then(imagePath => {
                let caption = nodeContentToString(process, node.args[1]); // TODO vistでinlineの処理をきっちりするべき
                let scale: number = 1;
                if (node.args[2]) {
                    // let arg3 = node.args[2].arg;
                    let regexp = new RegExp("scale=(\\d+(?:\\.\\d+))");
                    let result = regexp.exec(nodeContentToString(process, node.args[2]));
                    if (result) {
                        scale = parseFloat(result[1]);
                    }
                }
                process.outRaw(`<div id="`).out(label).outRaw(`" class="image">` + "\n");
                // imagePathは変数作成時点でユーザ入力部分をescapeしている
                if (scale !== 1) {
                    let scaleClass = `000${scale * 100}`;
                    scaleClass = scaleClass.substr(scaleClass.length - 3);
                    // TODO 各class設定にあわせたcssを同梱しないと…
                    process.outRaw(`<img src="${imagePath}" alt="`).out(caption).outRaw(`" class="width-`).out(scaleClass).outRaw("per\" />\n");
                } else {
                    process.outRaw(`<img src="${imagePath}" alt="`).out(caption).outRaw(`" />` + "\n");
                }
                process.outRaw("<p class=\"caption\">\n");
                process.out("図").out(process.base.chapter!.no).out(".").out(node.no).out(": ").out(caption);
                process.outRaw("\n</p>\n");
                process.outRaw("</div>\n");
                return false;
            })
            .catch(id => {
                process.error(t("builder.image_not_found", id), node);
                return false;
            });
    }

    block_indepimage(process: BuilderProcess, node: BlockElementSyntaxTree) {
        let label = nodeContentToString(process, node.args[0]);
        return process.findImageFile(label)
            .then(imagePath => {
                let caption: string = "";
                if (node.args[1]) {
                    caption = nodeContentToString(process, node.args[1]);
                }
                let scale: number = 1;
                if (node.args[2]) {
                    // let arg3 = node.args[2].arg;
                    let regexp = new RegExp("scale=(\\d+(?:\\.\\d+))");
                    let result = regexp.exec(nodeContentToString(process, node.args[2]));
                    if (result) {
                        scale = parseFloat(result[1]);
                    }
                }
                process.outRaw("<div class=\"image\">\n");
                // imagePathは変数作成時点でユーザ入力部分をescapeしている
                if (scale !== 1) {
                    let scaleClass = `000${scale * 100}`;
                    scaleClass = scaleClass.substr(scaleClass.length - 3);
                    // TODO 各class設定にあわせたcssを同梱しないと…
                    process.outRaw(`<img src="${imagePath}" alt="`).out(caption).outRaw(`" class="width-`).out(scaleClass).outRaw("per\" />\n");
                } else {
                    process.outRaw(`<img src="${imagePath}" alt="`).out(caption).outRaw(`" />` + "\n");
                }
                if (node.args[1]) {
                    process.outRaw("<p class=\"caption\">\n");
                    process.out("図: ").out(caption);
                    process.outRaw("\n</p>\n");
                }
                process.outRaw("</div>\n");
                return false;
            });
    }

    block_graph_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
        // TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
        process.outRaw("<div>\n");
        let toolName = nodeContentToString(process, node.args[1]);
        process.outRaw("<p>graph: ").out(toolName).outRaw("</p>\n");
        process.outRaw("<pre>");
        return (v: TreeVisitor) => {
            // name, args はパスしたい
            node.childNodes.forEach((node) => {
                visit(node, v);
            });
        };
    }

    block_graph_post(process: BuilderProcess, _node: BlockElementSyntaxTree) {
        // TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
        process.outRaw("\n</pre>\n").outRaw("</div>\n");
    }

    inline_img(process: BuilderProcess, node: InlineElementSyntaxTree) {
        let imgNode = this.findReference(process, node).referenceTo!.referenceNode!.toBlockElement();
        process.out("図").out(process.base.chapter!.no).out(".").out(imgNode.no);
        return false;
    }

    inline_icon(process: BuilderProcess, node: InlineElementSyntaxTree) {
        // TODO ファイル名探索ロジックをもっと頑張る(jpgとかsvgとか)
        let chapterFileName = process.base.chapter!.name;
        let chapterName = chapterFileName.substring(0, chapterFileName.length - 3);
        let imageName = nodeContentToString(process, node);
        let imagePath = "images/" + this.escape(chapterName) + "-" + this.escape(imageName) + ".png";
        process.outRaw("<img src=\"" + imagePath + "\" alt=\"[").out(imageName).outRaw("]\" />");
        return false;
    }

    block_footnote(process: BuilderProcess, node: BlockElementSyntaxTree) {
        let label = nodeContentToString(process, node.args[0]);
        process.outRaw("<div class=\"footnote\" epub:type=\"footnote\" id=\"fn-").outRaw(label).outRaw("\"><p class=\"footnote\">");
        process.outRaw("[*").out(node.no).outRaw("] ");
        return (v: TreeVisitor) => {
            visit(node.args[1], v);
            process.outRaw("</p></div>\n");
        };
    }

    inline_fn(process: BuilderProcess, node: InlineElementSyntaxTree) {
        let footnoteNode = this.findReference(process, node).referenceTo!.referenceNode!.toBlockElement();
        let label = nodeContentToString(process, footnoteNode.args[0]);
        process.outRaw(`<a id="fnb-`).out(label).outRaw(`" href="#fn-`).out(label).outRaw(`" class="noteref" epub:type="noteref">*`).out(footnoteNode.no).outRaw("</a>");
        return false;
    }

    block_lead_pre(process: BuilderProcess, _node: BlockElementSyntaxTree) {
        process.outRaw("<div class=\"lead\">\n");
    }

    block_lead_post(process: BuilderProcess, _node: BlockElementSyntaxTree) {
        process.outRaw("</div>\n");
    }

    inline_tti_pre(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw(`<code class="tt"><i>`);
    }

    inline_tti_post(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw(`</i></code>`);
    }

    inline_ttb_pre(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw(`<code class="tt"><b>`);
    }

    inline_ttb_post(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw(`</b></code>`);
    }

    block_noindent(_process: BuilderProcess, _node: BlockElementSyntaxTree) {
        // paragraphPre 中で処理
        return false;
    }

    block_source_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
        process.outRaw("<div class=\"source-code\">\n");
        process.outRaw("<p class=\"caption\">").out(nodeContentToString(process, node.args[0])).outRaw("</p>\n");
        process.outRaw("<pre class=\"source\">");
        return (v: TreeVisitor) => {
            // name, args はパスしたい
            node.childNodes.forEach((node) => {
                visit(node, v);
            });
        };
    }

    block_source_post(process: BuilderProcess, _node: BlockElementSyntaxTree) {
        process.outRaw("\n</pre>\n").outRaw("</div>\n");
    }

    block_cmd_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
        process.outRaw("<div class=\"cmd-code\">\n");
        process.outRaw("<pre class=\"cmd\">");
        return (v: TreeVisitor) => {
            // name, args はパスしたい
            node.childNodes.forEach((node) => {
                visit(node, v);
            });
        };
    }

    block_cmd_post(process: BuilderProcess, _node: BlockElementSyntaxTree) {
        process.outRaw("\n</pre>\n").outRaw("</div>\n");
    }

    block_quote_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
        process.outRaw("<blockquote><p>");
        return (v: TreeVisitor) => {
            // name, args はパスしたい
            node.childNodes.forEach((node) => {
                visit(node, v);
            });
        };
    }

    block_quote_post(process: BuilderProcess, _node: BlockElementSyntaxTree) {
        process.outRaw("</p></blockquote>\n");
    }

    inline_ami_pre(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw("<span class=\"ami\">");
    }

    inline_ami_post(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw("</span>");
    }

    inline_bou_pre(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw("<span class=\"bou\">");
    }

    inline_bou_post(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw("</span>");
    }

    inline_i_pre(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw("<i>");
    }

    inline_i_post(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw("</i>");
    }

    inline_m_pre(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        // TODO MathMLかなんかで…
        process.outRaw("<span>TODO: ");
    }

    inline_m_post(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw("</span>");
    }

    inline_strong_pre(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw("<strong>");
    }

    inline_strong_post(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw("</strong>");
    }

    inline_uchar_pre(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw("&#x");
    }

    inline_uchar_post(process: BuilderProcess, _node: InlineElementSyntaxTree) {
        process.outRaw(";");
    }

    block_table_pre(process: BuilderProcess, node: BlockElementSyntaxTree): TreeVisitorReturn {
        // TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
        process.outRaw("<div>\n");
        let chapter = findChapter(node, 1);
        if (!chapter) {
            process.error(t("builder.chapter_not_found", 1), node);
            return false;
        }
        let text = t("builder.table", chapter.fqn, node.no);
        process.outRaw("<p class=\"caption\">").out(text).out(": ").out(nodeContentToString(process, node.args[1])).outRaw("</p>\n");
        process.outRaw("<pre>");
        return (v: TreeVisitor) => {
            // name, args はパスしたい
            node.childNodes.forEach((node) => {
                visit(node, v);
            });
        };
    }

    block_table_post(process: BuilderProcess, _node: BlockElementSyntaxTree) {
        // TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
        process.outRaw("\n</pre>\n").outRaw("</div>\n");
    }

    inline_table(process: BuilderProcess, node: InlineElementSyntaxTree) {
        // TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
        let chapter = findChapter(node, 1);
        if (!chapter) {
            process.error(t("builder.chapter_not_found", 1), node);
            return false;
        }
        let listNode = this.findReference(process, node).referenceTo!.referenceNode!.toBlockElement();
        let text = t("builder.table", chapter.fqn, listNode.no);
        process.out(text);
        return false;
    }

    block_tsize(_process: BuilderProcess, _node: BlockElementSyntaxTree) {
        // TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
        return false;
    }

    block_comment_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
        process.outRaw("<!-- ");

        return (v: TreeVisitor) => {
            // name, args はパスしたい
            node.childNodes.forEach((node) => {
                visit(node, v);
            });
        };
    }

    block_comment_post(process: BuilderProcess, _node: BlockElementSyntaxTree) {
        process.outRaw(" -->\n");
    }

    inline_chap(process: BuilderProcess, node: InlineElementSyntaxTree) {
        let chapName = nodeContentToString(process, node);
        let chapter = process.findChapter(chapName);
        process.out("第").out(chapter.no).out("章");
        return false;
    }

    inline_title(process: BuilderProcess, node: InlineElementSyntaxTree) {
        let chapName = nodeContentToString(process, node);
        let chapter = process.findChapter(chapName);
        let title = this.getChapterTitle(process, chapter);
        process.out(title);
        return false;
    }

    inline_chapref(process: BuilderProcess, node: InlineElementSyntaxTree) {
        let chapName = nodeContentToString(process, node);
        let chapter = process.findChapter(chapName);
        let title = this.getChapterTitle(process, chapter);
        process.out("第").out(chapter.no).out("章「").out(title).out("」");
        return false;
    }

    inline_idx(process: BuilderProcess, node: InlineElementSyntaxTree) {
        const text = nodeContentToString(process, node);
        process.out(text).outRaw("<!-- IDX:").out(text).outRaw(" -->");
        return false;
    }

    inline_hidx(process: BuilderProcess, node: InlineElementSyntaxTree) {
        const text = nodeContentToString(process, node);
        process.outRaw("<!-- IDX:").out(text).outRaw(" -->");
        return false;
    }

    block_flushright_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
        process.outRaw("<p class=\"flushright\">");
        return (v: TreeVisitor) => {
            // name, args はパスしたい
            node.childNodes.forEach((node) => {
                visit(node, v);
            });
        };
    }

    block_flushright_post(process: BuilderProcess, _node: BlockElementSyntaxTree) {
        process.outRaw("</p>\n");
    }

    block_captionblock_pre(typename: string, process: BuilderProcess, node: BlockElementSyntaxTree) {
        process.outRaw(`<div class="${typename}">\n`);
        if (node.args[0]) {
            let label = nodeContentToString(process, node.args[0]);
            process.outRaw("<p class=\"caption\">").out(label).outRaw("</p>\n");
        }
    }

    block_captionblock_post(_typename: string, process: BuilderProcess, _node: BlockElementSyntaxTree) {
        process.outRaw("</div>\n");
    }

    block_info_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
        this.block_captionblock_pre("info", process, node);
    }

    block_info_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
        this.block_captionblock_post("info", process, node);
    }

    block_note_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
        this.block_captionblock_pre("note", process, node);
    }

    block_note_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
        this.block_captionblock_post("note", process, node);
    }

    block_memo_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
        this.block_captionblock_pre("memo", process, node);
    }

    block_memo_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
        this.block_captionblock_post("memo", process, node);
    }

    block_tip_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
        this.block_captionblock_pre("tip", process, node);
    }

    block_tip_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
        this.block_captionblock_post("tip", process, node);
    }

    block_warning_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
        this.block_captionblock_pre("warning", process, node);
    }

    block_warning_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
        this.block_captionblock_post("warning", process, node);
    }

    block_important_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
        this.block_captionblock_pre("important", process, node);
    }

    block_important_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
        this.block_captionblock_post("important", process, node);
    }

    block_caution_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
        this.block_captionblock_pre("caution", process, node);
    }

    block_caution_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
        this.block_captionblock_post("caution", process, node);
    }

    block_notice_pre(process: BuilderProcess, node: BlockElementSyntaxTree) {
        this.block_captionblock_pre("notice", process, node);
    }

    block_notice_post(process: BuilderProcess, node: BlockElementSyntaxTree) {
        this.block_captionblock_post("notice", process, node);
    }
}
