(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ReVIEW = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var exception_1 = require("../js/exception");
var parser_1 = require("../parser/parser");
var walker_1 = require("../parser/walker");
var utils_1 = require("../utils/utils");
var DefaultBuilder = (function () {
    function DefaultBuilder() {
        this.extention = "bug";
    }
    Object.defineProperty(DefaultBuilder.prototype, "name", {
        get: function () {
            return this.constructor.name;
        },
        enumerable: true,
        configurable: true
    });
    DefaultBuilder.prototype.init = function (book) {
        var _this = this;
        this.book = book;
        return Promise.all(book.allChunks.map(function (chunk) { return _this.processAst(chunk); })).then(function () { return null; });
    };
    DefaultBuilder.prototype.processAst = function (chunk) {
        var _this = this;
        var process = chunk.createBuilderProcess(this);
        return walker_1.visitAsync(chunk.tree.ast, {
            visitDefaultPre: function (node) {
            },
            visitChapterPre: function (node) {
                return _this.chapterPre(process, node);
            },
            visitChapterPost: function (node) {
                return _this.chapterPost(process, node);
            },
            visitHeadlinePre: function (node) {
                return _this.headlinePre(process, "hd", node);
            },
            visitHeadlinePost: function (node) {
                return _this.headlinePost(process, "hd", node);
            },
            visitColumnPre: function (node) {
                return _this.columnPre(process, node);
            },
            visitColumnPost: function (node) {
                return _this.columnPost(process, node);
            },
            visitColumnHeadlinePre: function (node) {
                return _this.columnHeadlinePre(process, node);
            },
            visitColumnHeadlinePost: function (node) {
                return _this.columnHeadlinePost(process, node);
            },
            visitParagraphPre: function (node) {
                return _this.paragraphPre(process, "p", node);
            },
            visitParagraphPost: function (node) {
                return _this.paragraphPost(process, "p", node);
            },
            visitUlistPre: function (node) {
                return _this.ulistPre(process, "ul", node);
            },
            visitUlistPost: function (node) {
                return _this.ulistPost(process, "ul", node);
            },
            visitOlistPre: function (node) {
                return _this.olistPre(process, "ol", node);
            },
            visitOlistPost: function (node) {
                return _this.olistPost(process, "ol", node);
            },
            visitDlistPre: function (node) {
                return _this.dlistPre(process, "dl", node);
            },
            visitDlistPost: function (node) {
                return _this.dlistPost(process, "dl", node);
            },
            visitBlockElementPre: function (node) {
                return _this.blockPre(process, node.symbol, node);
            },
            visitBlockElementPost: function (node) {
                return _this.blockPost(process, node.symbol, node);
            },
            visitInlineElementPre: function (node) {
                return _this.inlinePre(process, node.symbol, node);
            },
            visitInlineElementPost: function (node) {
                return _this.inlinePost(process, node.symbol, node);
            },
            visitTextPre: function (node) {
                _this.text(process, node);
            },
            visitSingleLineCommentPre: function (node) {
                _this.singleLineComment(process, node);
            }
        })
            .then(function () {
            _this.processPost(process, chunk);
            return Promise.all(chunk.nodes.map(function (chunk) { return _this.processAst(chunk); })).then(function () { return null; });
        });
    };
    DefaultBuilder.prototype.escape = function (data) {
        throw new Error("please override this method");
    };
    DefaultBuilder.prototype.getChapterTitle = function (process, chapter) {
        var chapterNode;
        walker_1.visit(chapter.tree.ast, {
            visitDefaultPre: function (node, parent) {
                return !chapterNode;
            },
            visitChapterPre: function (node, parent) {
                chapterNode = node;
                return false;
            }
        });
        if (!chapterNode) {
            return null;
        }
        return utils_1.nodeContentToString(process, chapterNode.headline);
    };
    DefaultBuilder.prototype.processPost = function (process, chunk) {
    };
    DefaultBuilder.prototype.chapterPre = function (process, node) {
    };
    DefaultBuilder.prototype.chapterPost = function (process, node) {
    };
    DefaultBuilder.prototype.headlinePre = function (process, name, node) {
    };
    DefaultBuilder.prototype.headlinePost = function (process, name, node) {
    };
    DefaultBuilder.prototype.columnPre = function (process, node) {
    };
    DefaultBuilder.prototype.columnPost = function (process, node) {
    };
    DefaultBuilder.prototype.columnHeadlinePre = function (process, node) {
    };
    DefaultBuilder.prototype.columnHeadlinePost = function (process, node) {
    };
    DefaultBuilder.prototype.paragraphPre = function (process, name, node) {
    };
    DefaultBuilder.prototype.paragraphPost = function (process, name, node) {
    };
    DefaultBuilder.prototype.ulistPre = function (process, name, node) {
    };
    DefaultBuilder.prototype.ulistPost = function (process, name, node) {
    };
    DefaultBuilder.prototype.olistPre = function (process, name, node) {
    };
    DefaultBuilder.prototype.olistPost = function (process, name, node) {
    };
    DefaultBuilder.prototype.dlistPre = function (process, name, node) {
    };
    DefaultBuilder.prototype.dlistPost = function (process, name, node) {
    };
    DefaultBuilder.prototype.text = function (process, node) {
        process.out(node.text);
    };
    DefaultBuilder.prototype.blockPre = function (process, name, node) {
        var func;
        func = this[("block_" + name)];
        if (typeof func === "function") {
            return func.call(this, process, node);
        }
        func = this[("block_" + name + "_pre")];
        if (typeof func !== "function") {
            throw new exception_1.AnalyzerError("block_" + name + "_pre or block_" + name + " is not Function");
        }
        return func.call(this, process, node);
    };
    DefaultBuilder.prototype.blockPost = function (process, name, node) {
        var func;
        func = this[("block_" + name)];
        if (typeof func === "function") {
            return;
        }
        func = this[("block_" + name + "_post")];
        if (typeof func !== "function") {
            throw new exception_1.AnalyzerError("block_" + name + "_post is not Function");
        }
        return func.call(this, process, node);
    };
    DefaultBuilder.prototype.inlinePre = function (process, name, node) {
        var func;
        func = this[("inline_" + name)];
        if (typeof func === "function") {
            return func.call(this, process, node);
        }
        func = this[("inline_" + name + "_pre")];
        if (typeof func !== "function") {
            throw new exception_1.AnalyzerError("inline_" + name + "_pre or inline_" + name + " is not Function");
        }
        return func.call(this, process, node);
    };
    DefaultBuilder.prototype.inlinePost = function (process, name, node) {
        var func;
        func = this[("inline_" + name)];
        if (typeof func === "function") {
            return;
        }
        func = this[("inline_" + name + "_post")];
        if (typeof func !== "function") {
            throw new exception_1.AnalyzerError("inline_" + name + "_post is not Function");
        }
        return func.call(this, process, node);
    };
    DefaultBuilder.prototype.ulistParentHelper = function (process, node, action, currentLevel) {
        if (currentLevel === void 0) { currentLevel = node.level; }
        if (currentLevel !== 1) {
            var result = utils_1.findUp(node.parentNode, function (n) {
                if (n instanceof parser_1.UlistElementSyntaxTree) {
                    return n.level === (currentLevel - 1);
                }
                return false;
            });
            if (result) {
                return;
            }
            action();
            this.ulistParentHelper(process, node, action, currentLevel - 1);
        }
    };
    DefaultBuilder.prototype.findReference = function (process, node) {
        var founds = process.symbols.filter(function (symbol) { return symbol.node === node; });
        if (founds.length !== 1) {
            throw new exception_1.AnalyzerError("invalid status.");
        }
        return founds[0];
    };
    DefaultBuilder.prototype.block_raw = function (process, node) {
        var _this = this;
        var content = utils_1.nodeContentToString(process, node.args[0]);
        var matches = content.match(/\|(.+)\|/);
        if (matches && matches[1]) {
            var target = matches[1].split(",").some(function (name) { return _this.name.toLowerCase() === name + "builder"; });
            if (target) {
                process.outRaw(content.substring(matches[0].length));
            }
        }
        else {
            process.outRaw(content);
        }
        return false;
    };
    DefaultBuilder.prototype.inline_raw = function (process, node) {
        var _this = this;
        var content = utils_1.nodeContentToString(process, node);
        var matches = content.match(/\|(.+)\|/);
        if (matches && matches[1]) {
            var target = matches[1].split(",").some(function (name) { return _this.name.toLowerCase() === name + "builder"; });
            if (target) {
                process.outRaw(content.substring(matches[0].length));
            }
        }
        else {
            process.outRaw(content);
        }
        return false;
    };
    DefaultBuilder.prototype.singleLineComment = function (process, node) {
    };
    return DefaultBuilder;
})();
exports.DefaultBuilder = DefaultBuilder;

},{"../js/exception":11,"../parser/parser":14,"../parser/walker":17,"../utils/utils":19}],2:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var i18n_1 = require("../i18n/i18n");
var builder_1 = require("./builder");
var parser_1 = require("../parser/parser");
var walker_1 = require("../parser/walker");
var utils_1 = require("../utils/utils");
var HtmlBuilder = (function (_super) {
    __extends(HtmlBuilder, _super);
    function HtmlBuilder(standalone) {
        if (standalone === void 0) { standalone = true; }
        _super.call(this);
        this.standalone = standalone;
        this.extention = "html";
        this.escapeMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;',
            "/": '&#x2F;'
        };
    }
    HtmlBuilder.prototype.escape = function (data) {
        var _this = this;
        return String(data).replace(/[&<>"'\/]/g, function (c) { return _this.escapeMap[c]; });
    };
    HtmlBuilder.prototype.processPost = function (process, chunk) {
        if (this.standalone) {
            var pre = "";
            pre += "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
            pre += "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.1//EN\" \"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd\">\n";
            pre += "<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:ops=\"http://www.idpf.org/2007/ops\" xml:lang=\"ja\">\n";
            pre += "<head>\n";
            pre += "  <meta http-equiv=\"Content-Type\" content=\"text/html;charset=UTF-8\" />\n";
            pre += "  <meta http-equiv=\"Content-Style-Type\" content=\"text/css\" />\n";
            pre += "  <meta name=\"generator\" content=\"Re:VIEW\" />\n";
            var name_1 = null;
            walker_1.visit(chunk.tree.ast, {
                visitDefaultPre: function () {
                },
                visitChapterPre: function (node) {
                    if (node.headline.level === 1) {
                        name_1 = utils_1.nodeContentToString(process, node.headline.caption);
                    }
                }
            });
            pre += "  <title>" + this.escape(name_1) + "</title>\n";
            pre += "</head>\n";
            pre += "<body>\n";
            process.pushOut(pre);
            process.outRaw("</body>\n");
            process.outRaw("</html>\n");
        }
    };
    HtmlBuilder.prototype.headlinePre = function (process, name, node) {
        process.outRaw("<h").out(node.level);
        if (node.label) {
            process.outRaw(" id=\"").out(node.label.arg).outRaw("\"");
        }
        process.outRaw(">");
        var constructLabel = function (node) {
            var numbers = {};
            var maxLevel = 0;
            walker_1.walk(node, function (node) {
                if (node instanceof parser_1.ChapterSyntaxTree) {
                    numbers[node.level] = node.no;
                    maxLevel = Math.max(maxLevel, node.level);
                }
                else if (node instanceof parser_1.ColumnSyntaxTree) {
                    numbers[node.level] = -1;
                    maxLevel = Math.max(maxLevel, node.level);
                }
                return node.parentNode;
            });
            var result = [];
            for (var i = 1; i <= maxLevel; i++) {
                if (numbers[i] === -1) {
                    result.push(0);
                }
                else if (typeof numbers[i] === "undefined") {
                    result.push(1);
                }
                else {
                    result.push(numbers[i] || 0);
                }
            }
            return result.join("-");
        };
        process.outRaw("<a id=\"h").out(constructLabel(node)).outRaw("\"></a>");
        if (node.level === 1) {
            var text = i18n_1.t("builder.chapter", node.parentNode.no);
            process.out(text).out("　");
        }
        else if (node.level === 2) {
        }
    };
    HtmlBuilder.prototype.headlinePost = function (process, name, node) {
        process.outRaw("</h").out(node.level).outRaw(">\n");
    };
    HtmlBuilder.prototype.columnPre = function (process, node) {
        process.outRaw("<div class=\"column\">\n\n");
    };
    HtmlBuilder.prototype.columnPost = function (process, node) {
        process.outRaw("</div>\n");
    };
    HtmlBuilder.prototype.columnHeadlinePre = function (process, node) {
        process.outRaw("<h").out(node.level).outRaw(">");
        process.outRaw("<a id=\"column-").out(node.parentNode.no).outRaw("\"></a>");
        return function (v) {
            walker_1.visit(node.caption, v);
        };
    };
    HtmlBuilder.prototype.columnHeadlinePost = function (process, node) {
        process.outRaw("</h").out(node.level).outRaw(">\n");
    };
    HtmlBuilder.prototype.paragraphPre = function (process, name, node) {
        if (node.prev && node.prev.isBlockElement() && node.prev.toBlockElement().symbol === "noindent") {
            process.outRaw("<p class=\"noindent\">");
        }
        else {
            process.outRaw("<p>");
        }
    };
    HtmlBuilder.prototype.paragraphPost = function (process, name, node) {
        process.outRaw("</p>\n");
    };
    HtmlBuilder.prototype.ulistPre = function (process, name, node) {
        this.ulistParentHelper(process, node, function () {
            process.outRaw("<ul>\n<li>");
        });
        if (node.prev instanceof parser_1.UlistElementSyntaxTree === false) {
            process.outRaw("<ul>\n");
        }
        process.outRaw("<li>");
    };
    HtmlBuilder.prototype.ulistPost = function (process, name, node) {
        process.outRaw("</li>\n");
        if (node.next instanceof parser_1.UlistElementSyntaxTree === false) {
            process.outRaw("</ul>\n");
        }
        this.ulistParentHelper(process, node, function () {
            process.outRaw("</li>\n</ul>\n");
        });
    };
    HtmlBuilder.prototype.olistPre = function (process, name, node) {
        if (node.prev instanceof parser_1.OlistElementSyntaxTree === false) {
            process.outRaw("<ol>\n");
        }
        process.outRaw("<li>");
    };
    HtmlBuilder.prototype.olistPost = function (process, name, node) {
        process.outRaw("</li>\n");
        if (node.next instanceof parser_1.OlistElementSyntaxTree === false) {
            process.outRaw("</ol>\n");
        }
    };
    HtmlBuilder.prototype.dlistPre = function (process, name, node) {
        if (node.prev instanceof parser_1.DlistElementSyntaxTree === false) {
            process.outRaw("<dl>\n");
        }
        return function (v) {
            process.outRaw("<dt>");
            walker_1.visit(node.text, v);
            process.outRaw("</dt>\n");
            process.outRaw("<dd>");
            walker_1.visit(node.content, v);
            process.outRaw("</dd>\n");
        };
    };
    HtmlBuilder.prototype.dlistPost = function (process, name, node) {
        if (node.next instanceof parser_1.DlistElementSyntaxTree === false) {
            process.outRaw("</dl>\n");
        }
    };
    HtmlBuilder.prototype.block_list_pre = function (process, node) {
        process.outRaw("<div class=\"caption-code\">\n");
        var chapter = utils_1.findChapter(node, 1);
        var text = i18n_1.t("builder.list", chapter.fqn, node.no);
        process.outRaw("<p class=\"caption\">").out(text).outRaw(": ");
        return function (v) {
            walker_1.visit(node.args[1], v);
            process.outRaw("</p>\n");
            process.outRaw("<pre class=\"list\">");
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    HtmlBuilder.prototype.block_list_post = function (process, node) {
        process.outRaw("\n</pre>\n").outRaw("</div>\n");
    };
    HtmlBuilder.prototype.block_listnum_pre = function (process, node) {
        process.outRaw("<div class=\"code\">\n");
        var chapter = utils_1.findChapter(node, 1);
        var text = i18n_1.t("builder.list", chapter.fqn, node.no);
        process.outRaw("<p class=\"caption\">").out(text).out(": ");
        var lineCount = 1;
        return function (v) {
            walker_1.visit(node.args[1], v);
            process.outRaw("</p>\n");
            process.outRaw("<pre class=\"list\">");
            var lineCountMax = 0;
            node.childNodes.forEach(function (node, index, childNodes) {
                if (node.isTextNode()) {
                    lineCountMax += node.toTextNode().text.split("\n").length;
                }
            });
            var lineDigit = Math.max(utils_1.linesToFigure(lineCountMax), 2);
            node.childNodes.forEach(function (node, index, childNodes) {
                if (node.isTextNode()) {
                    var hasNext = !!childNodes[index + 1];
                    var textNode = node.toTextNode();
                    var lines = textNode.text.split("\n");
                    lines.forEach(function (line, index) {
                        process.out(utils_1.padLeft(String(lineCount), " ", lineDigit)).out(": ");
                        process.out(line);
                        if (!hasNext || lines.length - 1 !== index) {
                            lineCount++;
                        }
                        if (lines.length - 1 !== index) {
                            process.out("\n");
                        }
                    });
                }
                else {
                    walker_1.visit(node, v);
                }
            });
        };
    };
    HtmlBuilder.prototype.block_listnum_post = function (process, node) {
        process.outRaw("\n</pre>\n").outRaw("</div>\n");
    };
    HtmlBuilder.prototype.inline_list = function (process, node) {
        var chapter = utils_1.findChapter(node, 1);
        var listNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
        var text = i18n_1.t("builder.list", chapter.fqn, listNode.no);
        process.out(text);
        return false;
    };
    HtmlBuilder.prototype.block_emlist_pre = function (process, node) {
        process.outRaw("<div class=\"emlist-code\">\n");
        return function (v) {
            if (node.args[0]) {
                process.outRaw("<p class=\"caption\">");
                walker_1.visit(node.args[0], v);
                process.outRaw("</p>\n");
            }
            process.outRaw("<pre class=\"emlist\">");
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    HtmlBuilder.prototype.block_emlist_post = function (process, node) {
        process.outRaw("\n</pre>\n").outRaw("</div>\n");
    };
    HtmlBuilder.prototype.block_emlistnum_pre = function (process, node) {
        process.outRaw("<div class=\"emlistnum-code\">\n");
        process.outRaw("<pre class=\"emlist\">");
        var lineCount = 1;
        return function (v) {
            var lineCountMax = 0;
            node.childNodes.forEach(function (node, index, childNodes) {
                if (node.isTextNode()) {
                    lineCountMax += node.toTextNode().text.split("\n").length;
                }
            });
            var lineDigit = Math.max(utils_1.linesToFigure(lineCountMax), 2);
            node.childNodes.forEach(function (node, index, childNodes) {
                if (node.isTextNode()) {
                    var hasNext = !!childNodes[index + 1];
                    var textNode = node.toTextNode();
                    var lines = textNode.text.split("\n");
                    lines.forEach(function (line, index) {
                        process.out(utils_1.padLeft(String(lineCount), " ", lineDigit)).out(": ");
                        process.out(line);
                        if (!hasNext || lines.length - 1 !== index) {
                            lineCount++;
                        }
                        if (lines.length - 1 !== index) {
                            process.out("\n");
                        }
                    });
                }
                else {
                    walker_1.visit(node, v);
                }
            });
        };
    };
    HtmlBuilder.prototype.block_emlistnum_post = function (process, node) {
        process.outRaw("\n</pre>\n").outRaw("</div>\n");
    };
    HtmlBuilder.prototype.inline_hd_pre = function (process, node) {
        process.out("「");
        var chapter = utils_1.findChapter(node);
        if (chapter.level === 1) {
            process.out(chapter.fqn).out("章 ");
        }
        else {
            process.out(chapter.fqn).out(" ");
        }
        process.out(utils_1.nodeContentToString(process, chapter.headline));
        return false;
    };
    HtmlBuilder.prototype.inline_hd_post = function (process, node) {
        process.out("」");
    };
    HtmlBuilder.prototype.inline_br = function (process, node) {
        process.outRaw("<br />");
    };
    HtmlBuilder.prototype.inline_b_pre = function (process, node) {
        process.outRaw("<b>");
    };
    HtmlBuilder.prototype.inline_b_post = function (process, node) {
        process.outRaw("</b>");
    };
    HtmlBuilder.prototype.inline_code_pre = function (process, node) {
        process.outRaw("<tt class=\"inline-code\">");
    };
    HtmlBuilder.prototype.inline_code_post = function (process, node) {
        process.outRaw("</tt>");
    };
    HtmlBuilder.prototype.inline_href = function (process, node) {
        var href = utils_1.nodeContentToString(process, node);
        var text = href;
        if (href.indexOf(",") !== -1) {
            text = href.slice(href.indexOf(",") + 1).trimLeft();
            href = href.slice(0, href.indexOf(","));
        }
        process.outRaw("<a href=\"").outRaw(href).outRaw("\" class=\"link\">").out(text).outRaw("</a>");
        return false;
    };
    HtmlBuilder.prototype.block_label = function (process, node) {
        process.outRaw("<a id=\"");
        process.out(utils_1.nodeContentToString(process, node.args[0]));
        process.outRaw("\"></a>\n");
        return false;
    };
    HtmlBuilder.prototype.inline_tt_pre = function (process, node) {
        process.outRaw("<tt>");
    };
    HtmlBuilder.prototype.inline_tt_post = function (process, node) {
        process.outRaw("</tt>");
    };
    HtmlBuilder.prototype.inline_ruby_pre = function (process, node) {
        process.outRaw("<ruby>");
        return function (v) {
            node.childNodes.forEach(function (node) {
                var contentString = utils_1.nodeContentToString(process, node);
                var keywordData = contentString.split(",");
                process.outRaw("<rb>").out(keywordData[0]).outRaw("</rb>");
                process.outRaw("<rp>（</rp><rt>");
                process.out(keywordData[1]);
                process.outRaw("</rt><rp>）</rp>");
            });
        };
    };
    HtmlBuilder.prototype.inline_ruby_post = function (process, node) {
        process.outRaw("</ruby>");
    };
    HtmlBuilder.prototype.inline_u_pre = function (process, node) {
        process.outRaw("<u>");
    };
    HtmlBuilder.prototype.inline_u_post = function (process, node) {
        process.outRaw("</u>");
    };
    HtmlBuilder.prototype.inline_kw_pre = function (process, node) {
        process.outRaw("<b class=\"kw\">");
        return function (v) {
            node.childNodes.forEach(function (node) {
                var contentString = utils_1.nodeContentToString(process, node);
                var keywordData = contentString.split(",");
                var pre = keywordData[0];
                var post = (keywordData[1] || "").trimLeft();
                process.out("" + pre);
                if (post) {
                    process.out(" (" + post + ")");
                }
            });
        };
    };
    HtmlBuilder.prototype.inline_kw_post = function (process, node) {
        var contentString = utils_1.nodeContentToString(process, node);
        var keywordData = contentString.split(",");
        var pre = keywordData[0];
        process.outRaw("</b>").outRaw("<!-- IDX:").out(pre).outRaw(" -->");
    };
    HtmlBuilder.prototype.inline_em_pre = function (process, node) {
        process.outRaw("<em>");
    };
    HtmlBuilder.prototype.inline_em_post = function (process, node) {
        process.outRaw("</em>");
    };
    HtmlBuilder.prototype.block_image = function (process, node) {
        var label = utils_1.nodeContentToString(process, node.args[0]);
        return process.findImageFile(label)
            .then(function (imagePath) {
            var caption = utils_1.nodeContentToString(process, node.args[1]);
            var scale = 1;
            if (node.args[2]) {
                var regexp = new RegExp("scale=(\\d+(?:\\.\\d+))");
                var result = regexp.exec(utils_1.nodeContentToString(process, node.args[2]));
                if (result) {
                    scale = parseFloat(result[1]);
                }
            }
            process.outRaw("<div class=\"image\">\n");
            process.outRaw("<img src=\"" + imagePath + "\" alt=\"").out(caption).outRaw("\" width=\"").out(scale * 100).outRaw("%\" />\n");
            process.outRaw("<p class=\"caption\">\n");
            process.out("図").out(process.base.chapter.no).out(".").out(node.no).out(": ").out(caption);
            process.outRaw("\n</p>\n");
            process.outRaw("</div>\n");
            return false;
        })
            .catch(function (id) {
            process.error(i18n_1.t("builder.image_not_found", id), node);
            return false;
        });
    };
    HtmlBuilder.prototype.block_indepimage = function (process, node) {
        var label = utils_1.nodeContentToString(process, node.args[0]);
        return process.findImageFile(label)
            .then(function (imagePath) {
            var caption = "";
            if (node.args[1]) {
                caption = utils_1.nodeContentToString(process, node.args[1]);
            }
            var scale = 1;
            if (node.args[2]) {
                var regexp = new RegExp("scale=(\\d+(?:\\.\\d+))");
                var result = regexp.exec(utils_1.nodeContentToString(process, node.args[2]));
                if (result) {
                    scale = parseFloat(result[1]);
                }
            }
            process.outRaw("<div class=\"image\">\n");
            if (scale !== 1) {
                process.outRaw("<img src=\"" + imagePath + "\" alt=\"").out(caption).outRaw("\" width=\"").out(scale * 100).outRaw("%\" />\n");
            }
            else {
                process.outRaw("<img src=\"" + imagePath + "\" alt=\"").out(caption).outRaw("\" />\n");
            }
            if (node.args[1]) {
                process.outRaw("<p class=\"caption\">\n");
                process.out("図: ").out(caption);
                process.outRaw("\n</p>\n");
            }
            process.outRaw("</div>\n");
            return false;
        });
    };
    HtmlBuilder.prototype.block_graph_pre = function (process, node) {
        process.outRaw("<div>\n");
        var toolName = utils_1.nodeContentToString(process, node.args[1]);
        process.outRaw("<p>graph: ").out(toolName).outRaw("</p>\n");
        process.outRaw("<pre>");
        return function (v) {
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    HtmlBuilder.prototype.block_graph_post = function (process, node) {
        process.outRaw("\n</pre>\n").outRaw("</div>\n");
    };
    HtmlBuilder.prototype.inline_img = function (process, node) {
        var imgNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
        process.out("図").out(process.base.chapter.no).out(".").out(imgNode.no);
        return false;
    };
    HtmlBuilder.prototype.inline_icon = function (process, node) {
        var chapterFileName = process.base.chapter.name;
        var chapterName = chapterFileName.substring(0, chapterFileName.length - 3);
        var imageName = utils_1.nodeContentToString(process, node);
        var imagePath = "images/" + this.escape(chapterName) + "-" + this.escape(imageName) + ".png";
        process.outRaw("<img src=\"" + imagePath + "\" alt=\"[").out(imageName).outRaw("]\" />");
        return false;
    };
    HtmlBuilder.prototype.block_footnote = function (process, node) {
        process.outRaw("<div class=\"footnote\"><p class=\"footnote\">[<a id=\"fn-");
        return function (v) {
            process.outRaw(utils_1.nodeContentToString(process, node.args[0])).outRaw("\">*").out(node.no).outRaw("</a>] ");
            walker_1.visit(node.args[1], v);
            process.outRaw("</p></div>\n");
        };
    };
    HtmlBuilder.prototype.inline_fn = function (process, node) {
        var footnoteNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
        process.outRaw("<a href=\"#fn-").out(utils_1.nodeContentToString(process, footnoteNode.args[0])).outRaw("\">*").out(footnoteNode.no).outRaw("</a>");
        return false;
    };
    HtmlBuilder.prototype.block_lead_pre = function (process, node) {
        process.outRaw("<div class=\"lead\">\n");
    };
    HtmlBuilder.prototype.block_lead_post = function (process, node) {
        process.outRaw("</div>\n");
    };
    HtmlBuilder.prototype.inline_tti_pre = function (process, node) {
        process.outRaw("<tt><i>");
    };
    HtmlBuilder.prototype.inline_tti_post = function (process, node) {
        process.outRaw("</i></tt>");
    };
    HtmlBuilder.prototype.inline_ttb_pre = function (process, node) {
        process.outRaw("<tt><b>");
    };
    HtmlBuilder.prototype.inline_ttb_post = function (process, node) {
        process.outRaw("</b></tt>");
    };
    HtmlBuilder.prototype.block_noindent = function (process, node) {
        return false;
    };
    HtmlBuilder.prototype.block_source_pre = function (process, node) {
        process.outRaw("<div class=\"source-code\">\n");
        process.outRaw("<p class=\"caption\">").out(utils_1.nodeContentToString(process, node.args[0])).outRaw("</p>\n");
        process.outRaw("<pre class=\"source\">");
        return function (v) {
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    HtmlBuilder.prototype.block_source_post = function (process, node) {
        process.outRaw("\n</pre>\n").outRaw("</div>\n");
    };
    HtmlBuilder.prototype.block_cmd_pre = function (process, node) {
        process.outRaw("<div class=\"cmd-code\">\n");
        process.outRaw("<pre class=\"cmd\">");
        return function (v) {
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    HtmlBuilder.prototype.block_cmd_post = function (process, node) {
        process.outRaw("\n</pre>\n").outRaw("</div>\n");
    };
    HtmlBuilder.prototype.block_quote_pre = function (process, node) {
        process.outRaw("<blockquote><p>");
        return function (v) {
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    HtmlBuilder.prototype.block_quote_post = function (process, node) {
        process.outRaw("</p></blockquote>\n");
    };
    HtmlBuilder.prototype.inline_ami_pre = function (process, node) {
        process.outRaw("<span class=\"ami\">");
    };
    HtmlBuilder.prototype.inline_ami_post = function (process, node) {
        process.outRaw("</span>");
    };
    HtmlBuilder.prototype.inline_bou_pre = function (process, node) {
        process.outRaw("<span class=\"bou\">");
    };
    HtmlBuilder.prototype.inline_bou_post = function (process, node) {
        process.outRaw("</span>");
    };
    HtmlBuilder.prototype.inline_i_pre = function (process, node) {
        process.outRaw("<i>");
    };
    HtmlBuilder.prototype.inline_i_post = function (process, node) {
        process.outRaw("</i>");
    };
    HtmlBuilder.prototype.inline_strong_pre = function (process, node) {
        process.outRaw("<strong>");
    };
    HtmlBuilder.prototype.inline_strong_post = function (process, node) {
        process.outRaw("</strong>");
    };
    HtmlBuilder.prototype.inline_uchar_pre = function (process, node) {
        process.outRaw("&#x");
    };
    HtmlBuilder.prototype.inline_uchar_post = function (process, node) {
        process.outRaw(";");
    };
    HtmlBuilder.prototype.block_table_pre = function (process, node) {
        process.outRaw("<div>\n");
        var chapter = utils_1.findChapter(node, 1);
        var text = i18n_1.t("builder.table", chapter.fqn, node.no);
        process.outRaw("<p class=\"caption\">").out(text).out(": ").out(utils_1.nodeContentToString(process, node.args[1])).outRaw("</p>\n");
        process.outRaw("<pre>");
        return function (v) {
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    HtmlBuilder.prototype.block_table_post = function (process, node) {
        process.outRaw("\n</pre>\n").outRaw("</div>\n");
    };
    HtmlBuilder.prototype.inline_table = function (process, node) {
        var chapter = utils_1.findChapter(node, 1);
        var listNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
        var text = i18n_1.t("builder.table", chapter.fqn, listNode.no);
        process.out(text);
        return false;
    };
    HtmlBuilder.prototype.block_tsize = function (process, node) {
        return false;
    };
    HtmlBuilder.prototype.block_comment_pre = function (process, node) {
        process.outRaw("<!-- ");
        return function (v) {
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    HtmlBuilder.prototype.block_comment_post = function (process, node) {
        process.outRaw(" -->\n");
    };
    HtmlBuilder.prototype.inline_comment_pre = function (process, node) {
        process.outRaw("<!-- ");
    };
    HtmlBuilder.prototype.inline_comment_post = function (process, node) {
        process.outRaw(" -->");
    };
    HtmlBuilder.prototype.inline_chap = function (process, node) {
        var chapName = utils_1.nodeContentToString(process, node);
        var chapter = process.findChapter(chapName);
        process.out("第").out(chapter.no).out("章");
        return false;
    };
    HtmlBuilder.prototype.inline_title = function (process, node) {
        var chapName = utils_1.nodeContentToString(process, node);
        var chapter = process.findChapter(chapName);
        var title = this.getChapterTitle(process, chapter);
        process.out(title);
        return false;
    };
    HtmlBuilder.prototype.inline_chapref = function (process, node) {
        var chapName = utils_1.nodeContentToString(process, node);
        var chapter = process.findChapter(chapName);
        var title = this.getChapterTitle(process, chapter);
        process.out("第").out(chapter.no).out("章「").out(title).out("」");
        return false;
    };
    return HtmlBuilder;
})(builder_1.DefaultBuilder);
exports.HtmlBuilder = HtmlBuilder;

},{"../i18n/i18n":8,"../parser/parser":14,"../parser/walker":17,"../utils/utils":19,"./builder":1}],3:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var builder_1 = require("./builder");
var i18n_1 = require("../i18n/i18n");
var parser_1 = require("../parser/parser");
var walker_1 = require("../parser/walker");
var utils_1 = require("../utils/utils");
var TextBuilder = (function (_super) {
    __extends(TextBuilder, _super);
    function TextBuilder() {
        _super.apply(this, arguments);
        this.extention = "txt";
    }
    TextBuilder.prototype.escape = function (data) {
        return data;
    };
    TextBuilder.prototype.headlinePre = function (process, name, node) {
        process.out("■H").out(node.level).out("■");
        if (node.level === 1) {
            var text = i18n_1.t("builder.chapter", node.parentNode.no);
            process.out(text).out("　");
        }
        else if (node.level === 2) {
        }
    };
    TextBuilder.prototype.headlinePost = function (process, name, node) {
        process.out("\n\n");
    };
    TextBuilder.prototype.columnHeadlinePre = function (process, node) {
        process.out("\n◆→開始:←◆\n");
        process.out("■");
        return function (v) {
            walker_1.visit(node.caption, v);
        };
    };
    TextBuilder.prototype.columnHeadlinePost = function (process, node) {
        process.out("\n");
    };
    TextBuilder.prototype.columnPost = function (process, node) {
        process.out("◆→終了:←◆\n\n");
    };
    TextBuilder.prototype.paragraphPost = function (process, name, node) {
        process.out("\n");
    };
    TextBuilder.prototype.ulistPre = function (process, name, node) {
        this.ulistParentHelper(process, node, function () {
            process.out("\n\n●\t");
        });
        if (node.parentNode instanceof parser_1.UlistElementSyntaxTree && node.prev instanceof parser_1.UlistElementSyntaxTree === false) {
            process.out("\n\n");
        }
        else if (node.parentNode instanceof parser_1.UlistElementSyntaxTree) {
            process.out("");
        }
        process.out("●\t");
    };
    TextBuilder.prototype.ulistPost = function (process, name, node) {
        process.out("\n");
    };
    TextBuilder.prototype.olistPre = function (process, name, node) {
        process.out(node.no).out("\t");
    };
    TextBuilder.prototype.olistPost = function (process, name, node) {
        process.out("\n");
    };
    TextBuilder.prototype.dlistPre = function (process, name, node) {
        return function (v) {
            process.out("★");
            walker_1.visit(node.text, v);
            process.out("☆\n");
            process.out("\t");
            walker_1.visit(node.content, v);
            process.out("\n");
        };
    };
    TextBuilder.prototype.dlistPost = function (process, name, node) {
        process.out("\n");
    };
    TextBuilder.prototype.block_list_pre = function (process, node) {
        process.out("◆→開始:リスト←◆\n");
        var chapter = utils_1.findChapter(node, 1);
        var text = i18n_1.t("builder.list", chapter.fqn, node.no);
        process.out(text).out("　");
        return function (v) {
            walker_1.visit(node.args[1], v);
            process.outRaw("\n\n");
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    TextBuilder.prototype.block_list_post = function (process, node) {
        process.out("\n◆→終了:リスト←◆\n");
    };
    TextBuilder.prototype.block_listnum_pre = function (process, node) {
        process.out("◆→開始:リスト←◆\n");
        var chapter = utils_1.findChapter(node, 1);
        var text = i18n_1.t("builder.list", chapter.fqn, node.no);
        process.out(text).out("　");
        var lineCount = 1;
        return function (v) {
            walker_1.visit(node.args[1], v);
            var lineCountMax = 0;
            node.childNodes.forEach(function (node, index, childNodes) {
                if (node.isTextNode()) {
                    lineCountMax += node.toTextNode().text.split("\n").length;
                }
            });
            var lineDigit = Math.max(utils_1.linesToFigure(lineCountMax), 2);
            process.outRaw("\n\n");
            node.childNodes.forEach(function (node, index, childNodes) {
                if (node.isTextNode()) {
                    var hasNext = !!childNodes[index + 1];
                    var textNode = node.toTextNode();
                    var lines = textNode.text.split("\n");
                    lines.forEach(function (line, index) {
                        process.out(utils_1.padLeft(String(lineCount), " ", lineDigit)).out(": ");
                        process.out(line);
                        if (!hasNext || lines.length - 1 !== index) {
                            lineCount++;
                        }
                        process.out("\n");
                    });
                }
                else {
                    walker_1.visit(node, v);
                }
            });
        };
    };
    TextBuilder.prototype.block_listnum_post = function (process, node) {
        process.out("◆→終了:リスト←◆\n");
    };
    TextBuilder.prototype.inline_list = function (process, node) {
        var chapter = utils_1.findChapter(node, 1);
        var listNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
        var text = i18n_1.t("builder.list", chapter.fqn, listNode.no);
        process.out(text);
        return false;
    };
    TextBuilder.prototype.block_emlist_pre = function (process, node) {
        process.out("◆→開始:インラインリスト←◆\n");
        return function (v) {
            if (node.args[0]) {
                process.out("■");
                walker_1.visit(node.args[0], v);
                process.out("\n");
            }
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    TextBuilder.prototype.block_emlist_post = function (process, node) {
        process.out("\n◆→終了:インラインリスト←◆\n");
    };
    TextBuilder.prototype.block_emlistnum_pre = function (process, node) {
        process.out("◆→開始:インラインリスト←◆\n");
        var lineCount = 1;
        return function (v) {
            if (node.args[0]) {
                process.out("■");
                walker_1.visit(node.args[0], v);
                process.out("\n");
            }
            var lineCountMax = 0;
            node.childNodes.forEach(function (node, index, childNodes) {
                if (node.isTextNode()) {
                    lineCountMax += node.toTextNode().text.split("\n").length;
                }
            });
            var lineDigit = Math.max(utils_1.linesToFigure(lineCountMax), 2);
            node.childNodes.forEach(function (node, index, childNodes) {
                if (node.isTextNode()) {
                    var hasNext = !!childNodes[index + 1];
                    var textNode = node.toTextNode();
                    var lines = textNode.text.split("\n");
                    lines.forEach(function (line, index) {
                        process.out(utils_1.padLeft(String(lineCount), " ", lineDigit)).out(": ");
                        process.out(line);
                        if (!hasNext || lines.length - 1 !== index) {
                            lineCount++;
                        }
                        process.out("\n");
                    });
                }
                else {
                    walker_1.visit(node, v);
                }
            });
        };
    };
    TextBuilder.prototype.block_emlistnum_post = function (process, node) {
        process.out("◆→終了:インラインリスト←◆\n");
    };
    TextBuilder.prototype.inline_hd_pre = function (process, node) {
        process.out("「");
        var chapter = utils_1.findChapter(node);
        if (chapter.level === 1) {
            process.out(chapter.fqn).out("章 ");
        }
        else {
            process.out(chapter.fqn).out(" ");
        }
        process.out(utils_1.nodeContentToString(process, chapter.headline));
        return false;
    };
    TextBuilder.prototype.inline_hd_post = function (process, node) {
        process.out("」");
    };
    TextBuilder.prototype.inline_br = function (process, node) {
        process.out("\n");
    };
    TextBuilder.prototype.inline_b_pre = function (process, node) {
        process.out("★");
    };
    TextBuilder.prototype.inline_b_post = function (process, node) {
        process.out("☆");
    };
    TextBuilder.prototype.inline_code_pre = function (process, node) {
        process.out("△");
    };
    TextBuilder.prototype.inline_code_post = function (process, node) {
        process.out("☆");
    };
    TextBuilder.prototype.inline_href_pre = function (process, node) {
        process.out("△");
    };
    TextBuilder.prototype.inline_href_post = function (process, node) {
        process.out("☆");
    };
    TextBuilder.prototype.inline_href = function (process, node) {
        var href = null;
        var text = utils_1.nodeContentToString(process, node);
        if (text.indexOf(",") !== -1) {
            href = text.slice(0, text.indexOf(","));
            text = text.slice(text.indexOf(",") + 1).trimLeft();
        }
        if (href) {
            process.out(text).out("（△").out(href).out("☆）");
        }
        else {
            process.out("△").out(text).out("☆");
        }
        return false;
    };
    TextBuilder.prototype.block_label = function (process, node) {
        return false;
    };
    TextBuilder.prototype.inline_ruby = function (process, node) {
        var contentString = utils_1.nodeContentToString(process, node);
        var keywordData = contentString.split(",");
        process.out(keywordData[0]);
        return function (v) {
            node.childNodes.forEach(function (node) {
                process.out("◆→DTP連絡:「").out(keywordData[0]);
                process.out("」に「 ").out(keywordData[1].trim()).out("」とルビ←◆");
            });
        };
    };
    TextBuilder.prototype.inline_u_pre = function (process, node) {
        process.out("＠");
    };
    TextBuilder.prototype.inline_u_post = function (process, node) {
        process.out("＠◆→＠〜＠部分に下線←◆");
    };
    TextBuilder.prototype.inline_kw = function (process, node) {
        process.out("★");
        return function (v) {
            node.childNodes.forEach(function (node) {
                var contentString = utils_1.nodeContentToString(process, node);
                var keywordData = contentString.split(",");
                var pre = keywordData[0];
                var post = (keywordData[1] || "").trimLeft();
                process.out(pre + "\u2606");
                if (post) {
                    process.out("\uFF08" + post + "\uFF09");
                }
            });
        };
    };
    TextBuilder.prototype.inline_tt_pre = function (process, node) {
        process.out("△");
    };
    TextBuilder.prototype.inline_tt_post = function (process, node) {
        process.out("☆");
    };
    TextBuilder.prototype.inline_em_pre = function (process, node) {
        process.warn(i18n_1.t("compile.deprecated_inline_symbol", "em"), node);
        process.out("@<em>{");
    };
    TextBuilder.prototype.inline_em_post = function (process, node) {
        process.out("}");
    };
    TextBuilder.prototype.block_image = function (process, node) {
        var label = utils_1.nodeContentToString(process, node.args[0]);
        return process.findImageFile(label)
            .then(function (imagePath) {
            var caption = utils_1.nodeContentToString(process, node.args[1]);
            process.out("◆→開始:図←◆\n");
            process.out("図").out(process.base.chapter.no).out(".").out(node.no).out("　").out(caption).out("\n");
            process.out("\n");
            process.out("◆→").out(imagePath).out("←◆\n");
            process.out("◆→終了:図←◆\n");
            return false;
        })
            .catch(function (id) {
            process.error(i18n_1.t("builder.image_not_found", id), node);
            return false;
        });
    };
    TextBuilder.prototype.block_indepimage = function (process, node) {
        process.out("◆→画像 ").out(utils_1.nodeContentToString(process, node.args[0])).out("←◆\n");
        if (node.args[1]) {
            process.out("図　").out(utils_1.nodeContentToString(process, node.args[1])).out("\n\n");
        }
        return false;
    };
    TextBuilder.prototype.block_graph_pre = function (process, node) {
        process.outRaw("◆→開始:図←◆\n");
        var toolName = utils_1.nodeContentToString(process, node.args[1]);
        process.outRaw("graph: ").out(toolName).outRaw("</p>\n");
        return function (v) {
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    TextBuilder.prototype.block_graph_post = function (process, node) {
        process.outRaw("◆→終了:図←◆\n");
    };
    TextBuilder.prototype.inline_img = function (process, node) {
        var imgNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
        process.out("図").out(process.base.chapter.no).out(".").out(imgNode.no).out("\n");
        return false;
    };
    TextBuilder.prototype.inline_icon = function (process, node) {
        var chapterFileName = process.base.chapter.name;
        var chapterName = chapterFileName.substring(0, chapterFileName.length - 3);
        var imageName = utils_1.nodeContentToString(process, node);
        var imagePath = "images/" + chapterName + "-" + imageName + ".png";
        process.out("◆→画像 ").out(imagePath).out("←◆");
        return false;
    };
    TextBuilder.prototype.block_footnote = function (process, node) {
        process.out("【注").out(node.no).out("】");
        return function (v) {
            walker_1.visit(node.args[1], v);
            process.out("\n");
        };
    };
    TextBuilder.prototype.inline_fn = function (process, node) {
        var footnoteNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
        process.out("【注").out(footnoteNode.no).out("】");
        return false;
    };
    TextBuilder.prototype.block_lead_pre = function (process, node) {
        process.out("◆→開始:リード←◆\n");
    };
    TextBuilder.prototype.block_lead_post = function (process, node) {
        process.out("◆→終了:リード←◆\n");
    };
    TextBuilder.prototype.inline_tti_pre = function (process, node) {
        process.out("▲");
    };
    TextBuilder.prototype.inline_tti_post = function (process, node) {
        process.out("☆◆→等幅フォントイタ←◆");
    };
    TextBuilder.prototype.inline_ttb_pre = function (process, node) {
        process.out("★");
    };
    TextBuilder.prototype.inline_ttb_post = function (process, node) {
        process.out("☆◆→等幅フォント太字←◆");
    };
    TextBuilder.prototype.block_noindent = function (process, node) {
        process.out("◆→DTP連絡:次の1行インデントなし←◆\n");
        return false;
    };
    TextBuilder.prototype.block_source_pre = function (process, node) {
        process.out("◆→開始:ソースコードリスト←◆\n");
        process.out("■").out(utils_1.nodeContentToString(process, node.args[0])).out("\n");
        return function (v) {
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    TextBuilder.prototype.block_source_post = function (process, node) {
        process.out("\n◆→終了:ソースコードリスト←◆\n");
    };
    TextBuilder.prototype.block_cmd_pre = function (process, node) {
        process.out("◆→開始:コマンド←◆\n");
        return function (v) {
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    TextBuilder.prototype.block_cmd_post = function (process, node) {
        process.out("\n◆→終了:コマンド←◆\n");
    };
    TextBuilder.prototype.block_quote_pre = function (process, node) {
        process.out("◆→開始:引用←◆\n");
        return function (v) {
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    TextBuilder.prototype.block_quote_post = function (process, node) {
        process.out("\n◆→終了:引用←◆\n");
    };
    TextBuilder.prototype.inline_ami_pre = function (process, node) {
    };
    TextBuilder.prototype.inline_ami_post = function (process, node) {
        process.out("◆→DTP連絡:「").out(utils_1.nodeContentToString(process, node)).out("」に網カケ←◆");
    };
    TextBuilder.prototype.inline_bou_pre = function (process, node) {
    };
    TextBuilder.prototype.inline_bou_post = function (process, node) {
        process.out("◆→DTP連絡:「").out(utils_1.nodeContentToString(process, node)).out("」に傍点←◆");
    };
    TextBuilder.prototype.inline_i_pre = function (process, node) {
        process.out("▲");
    };
    TextBuilder.prototype.inline_i_post = function (process, node) {
        process.out("☆");
    };
    TextBuilder.prototype.inline_strong_pre = function (process, node) {
        process.out("★");
    };
    TextBuilder.prototype.inline_strong_post = function (process, node) {
        process.out("☆");
    };
    TextBuilder.prototype.inline_uchar = function (process, node) {
        var hexString = utils_1.nodeContentToString(process, node);
        var code = parseInt(hexString, 16);
        var result = "";
        while (code !== 0) {
            result = String.fromCharCode(code & 0xFFFF) + result;
            code >>>= 16;
        }
        process.out(result);
        return false;
    };
    TextBuilder.prototype.block_table_pre = function (process, node) {
        process.out("◆→開始:表←◆\n");
        process.out("TODO 現在table記法は仮実装です\n");
        var chapter = utils_1.findChapter(node, 1);
        var text = i18n_1.t("builder.table", chapter.fqn, node.no);
        process.out(text).out("　").out(utils_1.nodeContentToString(process, node.args[1])).out("\n\n");
        return function (v) {
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    TextBuilder.prototype.block_table_post = function (process, node) {
        process.out("\n◆→終了:表←◆\n");
    };
    TextBuilder.prototype.inline_table = function (process, node) {
        var chapter = utils_1.findChapter(node, 1);
        var listNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
        var text = i18n_1.t("builder.table", chapter.fqn, listNode.no);
        process.out(text);
        return false;
    };
    TextBuilder.prototype.block_tsize = function (process, node) {
        return false;
    };
    TextBuilder.prototype.block_comment_pre = function (process, node) {
        process.out("◆→DTP連絡:");
        return function (v) {
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    TextBuilder.prototype.block_comment_post = function (process, node) {
        process.out("←◆\n");
    };
    TextBuilder.prototype.inline_comment_pre = function (process, node) {
        process.out("◆→DTP連絡:");
    };
    TextBuilder.prototype.inline_comment_post = function (process, node) {
        process.out("←◆");
    };
    TextBuilder.prototype.inline_chap = function (process, node) {
        var chapName = utils_1.nodeContentToString(process, node);
        var chapter = process.findChapter(chapName);
        process.out("第").out(chapter.no).out("章");
        return false;
    };
    TextBuilder.prototype.inline_title = function (process, node) {
        var chapName = utils_1.nodeContentToString(process, node);
        var chapter = process.findChapter(chapName);
        var title = this.getChapterTitle(process, chapter);
        process.out(title);
        return false;
    };
    TextBuilder.prototype.inline_chapref = function (process, node) {
        var chapName = utils_1.nodeContentToString(process, node);
        var chapter = process.findChapter(chapName);
        var title = this.getChapterTitle(process, chapter);
        process.out("第").out(chapter.no).out("章「").out(title).out("」");
        return false;
    };
    return TextBuilder;
})(builder_1.DefaultBuilder);
exports.TextBuilder = TextBuilder;

},{"../i18n/i18n":8,"../parser/parser":14,"../parser/walker":17,"../utils/utils":19,"./builder":1}],4:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var builder_1 = require("../builder/builder");
var configRaw_1 = require("./configRaw");
var compilerModel_1 = require("../model/compilerModel");
var analyzer_1 = require("../parser/analyzer");
var validator_1 = require("../parser/validator");
var utils_1 = require("../utils/utils");
var Config = (function () {
    function Config(original) {
        this.original = original;
    }
    Object.defineProperty(Config.prototype, "read", {
        get: function () {
            throw new Error("please implements this method");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "write", {
        get: function () {
            throw new Error("please implements this method");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "exists", {
        get: function () {
            throw new Error("please implements this method");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "analyzer", {
        get: function () {
            return this.original.analyzer || new analyzer_1.DefaultAnalyzer();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "validators", {
        get: function () {
            var config = this.original;
            if (!config.validators || config.validators.length === 0) {
                return [new validator_1.DefaultValidator()];
            }
            else if (!Array.isArray(config.validators)) {
                return [config.validators];
            }
            else {
                return config.validators;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "builders", {
        get: function () {
            if (this._builders) {
                return this._builders;
            }
            var config = this.original;
            if (!config.builders || config.builders.length === 0) {
                this._builders = [new builder_1.DefaultBuilder()];
            }
            else if (!Array.isArray(config.builders)) {
                this._builders = [config.builders];
            }
            else {
                this._builders = config.builders;
            }
            return this._builders;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "listener", {
        get: function () {
            throw new Error("please implements this method");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "book", {
        get: function () {
            if (!this._bookStructure) {
                this._bookStructure = configRaw_1.BookStructure.createBook(this.original.book);
            }
            return this._bookStructure;
        },
        enumerable: true,
        configurable: true
    });
    Config.prototype.resolvePath = function (path) {
        throw new Error("please implements this method");
    };
    return Config;
})();
exports.Config = Config;
var NodeJSConfig = (function (_super) {
    __extends(NodeJSConfig, _super);
    function NodeJSConfig(options, original) {
        _super.call(this, original);
        this.options = options;
        this.original = original;
    }
    Object.defineProperty(NodeJSConfig.prototype, "read", {
        get: function () {
            return this.original.read || utils_1.IO.read;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NodeJSConfig.prototype, "write", {
        get: function () {
            return this.original.write || utils_1.IO.write;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NodeJSConfig.prototype, "exists", {
        get: function () {
            var _this = this;
            return function (path) {
                var fs = require("fs");
                var _path = require("path");
                var basePath = _this.original.basePath || __dirname;
                var promise = new Promise(function (resolve, reject) {
                    fs.exists(_path.resolve(basePath, path), function (result) {
                        resolve({ path: path, result: result });
                    });
                });
                return promise;
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NodeJSConfig.prototype, "listener", {
        get: function () {
            if (this._listener) {
                return this._listener;
            }
            var listener = this.original.listener || {};
            listener.onAcceptables = listener.onAcceptables || (function () {
            });
            listener.onSymbols = listener.onSymbols || (function () {
            });
            listener.onReports = listener.onReports || this.onReports;
            listener.onCompileSuccess = listener.onCompileSuccess || this.onCompileSuccess;
            listener.onCompileFailed = listener.onCompileFailed || this.onCompileFailed;
            this._listener = listener;
            return this._listener;
        },
        enumerable: true,
        configurable: true
    });
    NodeJSConfig.prototype.onReports = function (reports) {
        var colors = require("colors");
        colors.setTheme({
            info: "cyan",
            warn: "yellow",
            error: "red"
        });
        reports.forEach(function (report) {
            var message = "";
            if (report.chapter) {
                message += report.chapter.name + " ";
            }
            if (report.nodes) {
                report.nodes.forEach(function (node) {
                    message += "[" + node.location.start.line + "," + node.location.start.column + "] ";
                });
            }
            message += report.message;
            if (report.level === compilerModel_1.ReportLevel.Error) {
                console.warn(message.error);
            }
            else if (report.level === compilerModel_1.ReportLevel.Warning) {
                console.error(message.warn);
            }
            else if (report.level === compilerModel_1.ReportLevel.Info) {
                console.info(message.info);
            }
            else {
                throw new Error("unknown report level.");
            }
        });
    };
    NodeJSConfig.prototype.onCompileSuccess = function (book) {
        process.exit(0);
    };
    NodeJSConfig.prototype.onCompileFailed = function () {
        process.exit(1);
    };
    NodeJSConfig.prototype.resolvePath = function (path) {
        var p = require("path");
        var base = this.options.base || "./";
        return p.join(base, path);
    };
    return NodeJSConfig;
})(Config);
exports.NodeJSConfig = NodeJSConfig;
var WebBrowserConfig = (function (_super) {
    __extends(WebBrowserConfig, _super);
    function WebBrowserConfig(options, original) {
        _super.call(this, original);
        this.options = options;
        this.original = original;
    }
    Object.defineProperty(WebBrowserConfig.prototype, "read", {
        get: function () {
            return this.original.read || (function () {
                throw new Error("please implement config.read method");
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebBrowserConfig.prototype, "write", {
        get: function () {
            return this.original.write || (function () {
                throw new Error("please implement config.write method");
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebBrowserConfig.prototype, "exists", {
        get: function () {
            var _this = this;
            return function (path) {
                if (window.location.protocol === "file:") {
                    return _this._existsFileScheme(path);
                }
                else {
                    return _this._existsHttpScheme(path);
                }
            };
        },
        enumerable: true,
        configurable: true
    });
    WebBrowserConfig.prototype._existsFileScheme = function (path) {
        var promise = new Promise(function (resolve, reject) {
            var canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 14;
            var ctx = canvas.getContext("2d");
            ctx.fillText("file://では画像の存在チェックができません", 2, 10);
            var dataUrl = canvas.toDataURL();
            resolve({ path: dataUrl, result: true });
        });
        return promise;
    };
    WebBrowserConfig.prototype._existsHttpScheme = function (path) {
        var promise = new Promise(function (resolve, reject) {
            try {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200 || xhr.status === 304) {
                            resolve({ path: path, result: true });
                        }
                        else {
                            resolve({ path: path, result: false });
                        }
                    }
                };
                xhr.open("GET", path);
                xhr.setRequestHeader("If-Modified-Since", new Date().toUTCString());
                xhr.send();
            }
            catch (e) {
                if (e instanceof DOMException) {
                    var de = e;
                    console.log(de.message);
                }
                resolve({ path: path, result: false });
            }
        });
        return promise;
    };
    Object.defineProperty(WebBrowserConfig.prototype, "listener", {
        get: function () {
            if (this._listener) {
                return this._listener;
            }
            var listener = this.original.listener || {};
            listener.onAcceptables = listener.onAcceptables || (function () {
            });
            listener.onSymbols = listener.onSymbols || (function () {
            });
            listener.onReports = listener.onReports || this.onReports;
            listener.onCompileSuccess = listener.onCompileSuccess || this.onCompileSuccess;
            listener.onCompileFailed = listener.onCompileFailed || this.onCompileFailed;
            this._listener = listener;
            return this._listener;
        },
        enumerable: true,
        configurable: true
    });
    WebBrowserConfig.prototype.onReports = function (reports) {
        reports.forEach(function (report) {
            var message = "";
            if (report.chapter) {
                message += report.chapter.name + " ";
            }
            if (report.nodes) {
                report.nodes.forEach(function (node) {
                    message += "[" + node.location.start.line + "," + node.location.start.column + "] ";
                });
            }
            message += report.message;
            if (report.level === compilerModel_1.ReportLevel.Error) {
                console.warn(message);
            }
            else if (report.level === compilerModel_1.ReportLevel.Warning) {
                console.error(message);
            }
            else if (report.level === compilerModel_1.ReportLevel.Info) {
                console.info(message);
            }
            else {
                throw new Error("unknown report level.");
            }
        });
    };
    WebBrowserConfig.prototype.onCompileSuccess = function (book) {
    };
    WebBrowserConfig.prototype.onCompileFailed = function (book) {
    };
    WebBrowserConfig.prototype.resolvePath = function (path) {
        if (!this.options.base) {
            return path;
        }
        var base = this.options.base;
        if (!this.endWith(base, "/") && !this.startWith(path, "/")) {
            base += "/";
        }
        return base + path;
    };
    WebBrowserConfig.prototype.startWith = function (str, target) {
        return str.indexOf(target) === 0;
    };
    WebBrowserConfig.prototype.endWith = function (str, target) {
        return str.indexOf(target, str.length - target.length) !== -1;
    };
    return WebBrowserConfig;
})(Config);
exports.WebBrowserConfig = WebBrowserConfig;

},{"../builder/builder":1,"../model/compilerModel":12,"../parser/analyzer":13,"../parser/validator":16,"../utils/utils":19,"./configRaw":5,"colors":undefined,"fs":undefined,"path":undefined}],5:[function(require,module,exports){
"use strict";
var BookStructure = (function () {
    function BookStructure(predef, contents, appendix, postdef) {
        this.predef = predef;
        this.contents = contents;
        this.appendix = appendix;
        this.postdef = postdef;
        this.predef = this.predef || [];
        this.contents = this.contents || [];
        this.appendix = this.appendix || [];
        this.postdef = this.postdef || [];
    }
    BookStructure.createBook = function (config) {
        if (!config) {
            return new BookStructure(null, null, null, null);
        }
        var predef = (config.predef || config.PREDEF || []).map(function (v) { return ContentStructure.createChapter(v); });
        var contents = (config.contents || config.CHAPS || []).map(function (v) {
            if (!v) {
                return null;
            }
            if (typeof v === "string") {
                return ContentStructure.createChapter(v);
            }
            else if (v.chapter) {
                return ContentStructure.createChapter(v.chapter);
            }
            else if (v.part) {
                return ContentStructure.createPart(v.part);
            }
            else if (typeof v.file === "string" && v.chapters) {
                return ContentStructure.createPart(v);
            }
            else if (typeof v.file === "string") {
                return ContentStructure.createChapter(v);
            }
            else if (typeof v === "object") {
                return ContentStructure.createPart({
                    file: Object.keys(v)[0],
                    chapters: v[Object.keys(v)[0]].map(function (c) { return ({ file: c }); })
                });
            }
            else {
                return null;
            }
        });
        var appendix = (config.appendix || config.APPENDIX || []).map(function (v) { return ContentStructure.createChapter(v); });
        var postdef = (config.postdef || config.POSTDEF || []).map(function (v) { return ContentStructure.createChapter(v); });
        return new BookStructure(predef, contents, appendix, postdef);
    };
    return BookStructure;
})();
exports.BookStructure = BookStructure;
var ContentStructure = (function () {
    function ContentStructure(part, chapter) {
        this.part = part;
        this.chapter = chapter;
    }
    ContentStructure.createChapter = function (value) {
        if (typeof value === "string") {
            return new ContentStructure(null, { file: value });
        }
        else if (value && typeof value.file === "string") {
            return new ContentStructure(null, value);
        }
        else {
            return null;
        }
    };
    ContentStructure.createPart = function (part) {
        if (!part) {
            return null;
        }
        var p = {
            file: part.file,
            chapters: (part.chapters || []).map(function (c) { return typeof c === "string" ? { file: c } : c; })
        };
        return new ContentStructure(p, null);
    };
    return ContentStructure;
})();
exports.ContentStructure = ContentStructure;

},{}],6:[function(require,module,exports){
"use strict";
var PEG = require("../../resources/grammar");
var compilerModel_1 = require("../model/compilerModel");
var parser_1 = require("../parser/parser");
var config_1 = require("./config");
var configRaw_1 = require("./configRaw");
var parser_2 = require("../parser/parser");
var preprocessor_1 = require("../parser/preprocessor");
var textBuilder_1 = require("../builder/textBuilder");
var htmlBuilder_1 = require("../builder/htmlBuilder");
var walker_1 = require("../parser/walker");
var utils_1 = require("../utils/utils");
var Controller = (function () {
    function Controller(options) {
        if (options === void 0) { options = {}; }
        this.options = options;
        this.builders = { TextBuilder: textBuilder_1.TextBuilder, HtmlBuilder: htmlBuilder_1.HtmlBuilder };
    }
    Controller.prototype.initConfig = function (data) {
        if (utils_1.isNodeJS()) {
            this.config = new config_1.NodeJSConfig(this.options, data);
        }
        else {
            this.config = new config_1.WebBrowserConfig(this.options, data);
        }
    };
    Controller.prototype.process = function () {
        var _this = this;
        return Promise.resolve(new compilerModel_1.Book(this.config))
            .then(function (book) { return _this.acceptableSyntaxes(book); })
            .then(function (book) { return _this.toContentChunk(book); })
            .then(function (book) { return _this.readReVIEWFiles(book); })
            .then(function (book) { return _this.parseContent(book); })
            .then(function (book) { return _this.preprocessContent(book); })
            .then(function (book) { return _this.processContent(book); })
            .then(function (book) { return _this.writeContent(book); })
            .then(function (book) { return _this.compileFinished(book); })
            .catch(function (err) { return _this.handleError(err); });
    };
    Controller.prototype.acceptableSyntaxes = function (book) {
        book.acceptableSyntaxes = book.config.analyzer.getAcceptableSyntaxes();
        if (book.config.listener.onAcceptables(book.acceptableSyntaxes) === false) {
            book.config.listener.onCompileFailed();
            return Promise.reject(null);
        }
        return Promise.resolve(book);
    };
    Controller.prototype.toContentChunk = function (book) {
        var convert = function (c, parent) {
            var chunk;
            if (c.part) {
                chunk = new compilerModel_1.ContentChunk(book, c.part.file);
                c.part.chapters.forEach(function (c) {
                    convert(configRaw_1.ContentStructure.createChapter(c), chunk);
                });
            }
            else if (c.chapter) {
                chunk = new compilerModel_1.ContentChunk(book, parent, c.chapter.file);
            }
            else {
                return null;
            }
            if (parent) {
                parent.nodes.push(chunk);
            }
            return chunk;
        };
        book.predef = this.config.book.predef.map(function (c) { return convert(c); });
        book.contents = this.config.book.contents.map(function (c) { return convert(c); });
        book.appendix = this.config.book.appendix.map(function (c) { return convert(c); });
        book.postdef = this.config.book.postdef.map(function (c) { return convert(c); });
        return book;
    };
    Controller.prototype.readReVIEWFiles = function (book) {
        var promises = [];
        var read = function (chunk) {
            var resolvedPath = book.config.resolvePath(chunk.name);
            promises.push(book.config.read(resolvedPath).then(function (input) { return chunk.input = input; }));
            chunk.nodes.forEach(function (chunk) { return read(chunk); });
        };
        book.predef.forEach(function (chunk) { return read(chunk); });
        book.contents.forEach(function (chunk) { return read(chunk); });
        book.appendix.forEach(function (chunk) { return read(chunk); });
        book.postdef.forEach(function (chunk) { return read(chunk); });
        return Promise.all(promises).then(function () { return book; });
    };
    Controller.prototype.parseContent = function (book) {
        var _parse = function (chunk) {
            try {
                chunk.tree = parser_2.parse(chunk.input);
            }
            catch (e) {
                if (!(e instanceof PEG.SyntaxError)) {
                    throw e;
                }
                var se = e;
                var errorNode = new parser_1.SyntaxTree({
                    syntax: se.name,
                    location: {
                        start: {
                            line: se.line,
                            column: se.column,
                            offset: se.offset
                        },
                        end: null
                    }
                });
                chunk.tree = { ast: errorNode, cst: null };
            }
            chunk.nodes.forEach(function (chunk) { return _parse(chunk); });
        };
        book.predef.forEach(function (chunk) { return _parse(chunk); });
        book.contents.forEach(function (chunk) { return _parse(chunk); });
        book.appendix.forEach(function (chunk) { return _parse(chunk); });
        book.predef.forEach(function (chunk) { return _parse(chunk); });
        return book;
    };
    Controller.prototype.preprocessContent = function (book) {
        var numberingChapter = function (chunk, counter) {
            var chapters = [];
            walker_1.visit(chunk.tree.ast, {
                visitDefaultPre: function (node) {
                },
                visitChapterPre: function (node) {
                    chapters.push(node);
                }
            });
            var max = 0;
            var currentLevel = 1;
            chapters.forEach(function (chapter) {
                var level = chapter.headline.level;
                max = Math.max(max, level);
                var i;
                if (currentLevel > level) {
                    for (i = level + 1; i <= max; i++) {
                        counter[i] = 0;
                    }
                }
                else if (currentLevel < level) {
                    for (i = level; i <= max; i++) {
                        counter[i] = 0;
                    }
                }
                currentLevel = level;
                counter[level] = (counter[level] || 0) + 1;
                chapter.no = counter[level];
            });
            chunk.no = counter[1];
            chunk.nodes.forEach(function (chunk) { return numberingChapter(chunk, counter); });
        };
        var numberingChapters = function (chunks, counter) {
            if (counter === void 0) { counter = {}; }
            chunks.forEach(function (chunk) { return numberingChapter(chunk, counter); });
        };
        numberingChapters(book.predef);
        numberingChapters(book.contents);
        numberingChapters(book.appendix);
        numberingChapters(book.postdef);
        var preprocessor = new preprocessor_1.SyntaxPreprocessor();
        preprocessor.start(book);
        return book;
    };
    Controller.prototype.processContent = function (book) {
        var _this = this;
        book.config.validators.forEach(function (validator) {
            validator.start(book, book.acceptableSyntaxes, _this.config.builders);
        });
        if (book.reports.some(function (report) { return report.level === compilerModel_1.ReportLevel.Error; })) {
            return Promise.resolve(book);
        }
        var symbols = book.allChunks.reduce(function (p, c) { return p.concat(c.process.symbols); }, []);
        if (this.config.listener.onSymbols(symbols) === false) {
            return Promise.resolve(book);
        }
        return Promise.all(this.config.builders.map(function (builder) { return builder.init(book); })).then(function () { return book; });
    };
    Controller.prototype.writeContent = function (book) {
        var _this = this;
        var promises = [];
        var write = function (chunk) {
            chunk.builderProcesses.forEach(function (process) {
                var baseName = chunk.name.substr(0, chunk.name.lastIndexOf(".re"));
                var fileName = baseName + "." + process.builder.extention;
                promises.push(_this.config.write(fileName, process.result));
            });
            chunk.nodes.forEach(function (chunk) { return write(chunk); });
        };
        book.predef.forEach(function (chunk) { return write(chunk); });
        book.contents.forEach(function (chunk) { return write(chunk); });
        book.appendix.forEach(function (chunk) { return write(chunk); });
        book.postdef.forEach(function (chunk) { return write(chunk); });
        return Promise.all(promises).then(function () { return book; });
    };
    Controller.prototype.compileFinished = function (book) {
        book.config.listener.onReports(book.reports);
        if (!book.hasError) {
            book.config.listener.onCompileSuccess(book);
        }
        else {
            book.config.listener.onCompileFailed(book);
        }
        return book;
    };
    Controller.prototype.handleError = function (err) {
        console.error("unexpected error", err);
        if (err && err.stack) {
            console.error(err.stack);
        }
        return Promise.reject(err);
    };
    return Controller;
})();
exports.Controller = Controller;

},{"../../resources/grammar":20,"../builder/htmlBuilder":2,"../builder/textBuilder":3,"../model/compilerModel":12,"../parser/parser":14,"../parser/preprocessor":15,"../parser/walker":17,"../utils/utils":19,"./config":4,"./configRaw":5}],7:[function(require,module,exports){
"use strict";
exports.en = {
    "sample": "Hello!"
};

},{}],8:[function(require,module,exports){
"use strict";
var utils_1 = require("../utils/utils");
var en_1 = require("./en");
var ja_1 = require("./ja");
var i18next;
function setup(lang) {
    "use strict";
    if (lang === void 0) { lang = "ja"; }
    i18next.init({
        lng: lang,
        fallbackLng: "ja",
        resStore: {
            "ja": { translation: ja_1.ja },
            "en": { translation: en_1.en }
        }
    });
}
exports.setup = setup;
function t(str) {
    "use strict";
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return i18next.t(str, { postProcess: "sprintf", sprintf: args });
}
exports.t = t;
if (typeof window !== "undefined" && window.i18n) {
    i18next = window.i18n;
}
else {
    i18next = require("i18next");
}
utils_1.isNodeJS();
setup();

},{"../utils/utils":19,"./en":7,"./ja":9,"i18next":undefined}],9:[function(require,module,exports){
"use strict";
exports.ja = {
    "sample": "こんちゃーす！",
    "description": {
        "headline": "チャプターの始まりを示します。\n\"= 見出し\" という形式で書きます。",
        "column": "コラムの始まりを示します。\n\"===[column] 見出し\" という形式で書きます。\n\"===[/column]\"を使うか、次の見出しが始まるとコラムの終わりになります。",
        "ulist": "番号なし箇条書きを示します。*記号をつなげて書くとさらにインデントした箇条書きにする事ができます。\n * 食料品を買うこと。\n ** 牛乳\n ** にんじん\nという形式で書きます。行頭に必ず半角スペースが必要です。",
        "olist": "数字付き箇条書きを示します。\n 1. はじめに神は天と地とを想像された。\n 2. 地は形なく、むなしく、やみが淵のおもてにあり、神の霊が水のおもてをおおっていた。\nという形式で書きます。行頭に必ず半角スペースが必要です。",
        "dlist": "用語リストを示します。\n: レバガチャ\n  レバーをガチャガチャ動かすこと。熟練者はレバガチャすべき時としない時を明確に使い分け勝利を掴み取る。\nという形式で書きます。本文の行は先頭に半角スペースかタブが必要です。",
        "block_list": "リストを示します。技術書ではプログラムコードの掲載に使います。\n//list[label][caption]{\nalert(\"Hello!\");\n//}\nという形式で書きます。",
        "inline_list": "リストへの参照を示します。\n//list[hoge][caption]{alert(\"Hello!\");\n//}\n を参照する時は @<list>{hoge} と書きます。",
        "block_listnum": "行番号付きのリストを示します。\n//listnum[hello.js][ハローワールド]{\nconsole.log(\"Hello world!\");\n//}\nという形式で書きます。",
        "block_emlist": "非採番のリストを示します。\n//emlist[ハローワールド]{\nconsole.log(\"Hello world\");\n//}\nという形式で書きます。",
        "block_emlistnum": "行番号付きの非採番のリストを示します。\n//emlistnum{\nconsole.log(\"Hello world\");\n//}\nという形式で書きます。",
        "block_image": "図表を示します。\n//image[sample][サンプル][scale=0.3]{\nメモ\n//}\nという形式で書きます。\n章のファイル名がtest.reの場合、images/test/sample.jpgが参照されます。\n画像のサイズを調整したい場合、scaleで倍率が指定できます。\n中に書かれているメモは無視されます。",
        "block_indepimage": "非採番の図表を示します。\n//image[sample][サンプル][scale=0.3]{\nメモ\n//}\nという形式で書きます。詳細は //image と同様です。",
        "block_graph": "グラフを示します。\n//graph[sample][ツール名][サンプル]{\nメモ\n//}\nという形式で書きます。\n文章中から参照する時は@<img>{sample}が利用できます。\n中に書かれているメモは無視されます。",
        "inline_img": "図表への参照を示します。\n//image[sample][サンプル]{\n//}\nを参照するときは @<img>{sample} と書きます。",
        "inline_icon": "文中に表示される図表を示します。\n@<icon>{sample}という形式で書きます。章のファイル名がtest.reの場合、images/test-sample.jpenが参照されます。",
        "block_footnote": "脚注を示します。\n//footnote[sample][サンプルとしてはいささか豪華すぎるかも！]\nという形式で書きます。",
        "inline_fn": "脚注への参照を示します。\n//footnote[sample][サンプルというにはショボすぎる]\nを参照するときは @<fn>{sample} と書きます。",
        "block_lead": "リード分を示します。\n//lead{\n世界を変えたくはないか？\n//}\nという形式で書きます。lead記法中では、全てのインライン構文やブロック構文が利用できます。",
        "block_noindent": "パラグラフを切らずに次の要素を続けることを示します。\n//noindent\nという形式で書きます。",
        "block_source": "ソースコードの引用を示します。\n//source[hello.js]{\nconsole.log(\"Hello world!\");\n//}\nという形式で書きます。",
        "block_cmd": "コマンドラインのキャプチャを示します。\n//cmd{\n$ git clone git@github.com:vvakame/review.js.git\n//}\nという形式で書きます。",
        "block_quote": "引用を示します。\n//quote{\n神は言っている…ここで死ぬ定めではないと…\n//}\nという形式で書きます。",
        "inline_hd": "TODO 後で書く。見出し参照を作成する。",
        "inline_code": "短いプログラムコードを記述します。\n@<code>{alert(\"Hello!\");}\n長いソースコードにはlist記法を使いましょう。",
        "inline_br": "改行を示します。リスト内での改行や、段落を変えずに改行をしたい場合に使います。",
        "inline_u": "下線にします。\n@<u>{この部分が下線になる}",
        "inline_ruby": "読み仮名を振ります。\n@<ruby>{羊,ひつじ}",
        "inline_b": "ボールド(太字)にします。\n@<b>{この部分が太字になる}",
        "inline_href": "リンクを示します。\nURLを書きたい場合に使います。\n@<href>{https://github.com/vvakame/review.js} または @<href>{https://github.com/vvakame/review.js, review.js} という形式で書きます。",
        "block_label": "アンカーを示します。\n@<href>{#anchor}から飛んで来られるようにするためには\n//label[anchor]\nという形式で書きます。",
        "inline_kw": "キーワードを示します。\nそれはおかしいだろう@<kw>{JK, 常識的に考えて}。\nという形式で書きます。",
        "inline_tti": "テレタイプ文字(等幅フォント)のイタリックで出力することを示します。\n@<tti>{keyword}\nという形式で書きます。",
        "inline_ttb": "テレタイプ文字(等幅フォント)のボールドで出力することを示します。\n@<ttb>{class}\nという形式で書きます。",
        "inline_ami": "網掛け有りで出力することを示します。\n@<ami>{重点！}\nという形式で書きます。",
        "inline_bou": "傍点有りで出力することを示します。\n@<bou>{なんだって？}\nという形式で書きます。",
        "inline_i": "イタリックで出力することを示します。\n@<i>{斜体}\nという形式で書きます。",
        "inline_strong": "ボールドで出力することを示します。\n@<strong>{強調！}\nという形式で書きます。",
        "inline_uchar": "指定された値を16進数の値として扱い、Unicode文字として出力することを示します。\n@<uchar>{1F64B}\nという形式で書きます。",
        "inline_tt": "囲まれたテキストを等幅フォントで表示します。",
        "inline_em": "テキストを強調します。\n@<em>{このように強調されます}",
        "block_raw": "生データを表します。\n//raw[|html,text|ほげ]と書くと、出力先がhtmlかtextの時のみ内容がそのまま出力されます。\nRe:VIEWの記法を超えてそのまま出力されるので、構造を壊さぬよう慎重に使ってください。",
        "inline_raw": "生データを表します。\n@<raw>{|html,text|ほげ}と書くと、出力先がhtmlかtextの時のみ内容がそのまま出力されます。\nRe:VIEWの記法を超えてそのまま出力されるので、構造を壊さぬよう慎重に使ってください。",
        "block_comment": "コメントを示します。\n//comment{\nコメントですよー\n//}\nと書くことにより、文書には出力されない文を書くことができます。",
        "inline_comment": "コメントを示します。\n@<comment>{コメントですよー}と書くことにより、文書には出力されない文を書くことができます。",
        "inline_chap": "章番号を示します。\nファイル名の.reの前の部分か =={sample} タイトル の{}部分を参照します。@<chap>{sample} と書きます。",
        "inline_title": "章タイトルを示します。\nファイル名の.reの前の部分か =={sample} タイトル の{}部分を参照します。@<title>{sample} と書きます。",
        "inline_chapref": "章番号+章タイトルを示します。\nファイル名の.reの前の部分か =={sample} タイトル の{}部分を参照します。@<chapref>{sample} と書きます。",
        "block_table": "テーブルを示します。\nTODO 正しく実装した後に書く",
        "inline_table": "テーブルへの参照を示します。\nTODO 正しく実装した後に書く",
        "block_tsize": "テーブルの大きさを指定します。\nTODO 正しく実装した後に書く"
    },
    "compile": {
        "file_not_exists": "ファイル %s が開けません。",
        "block_not_supported": "%s というブロック構文はサポートされていません。",
        "inline_not_supported": "%s というインライン構文はサポートされていません。",
        "part_is_missing": "パート %s が見つかりません。",
        "chapter_is_missing": "チャプター %s が見つかりません。",
        "reference_is_missing": "参照先 %s の %s が見つかりません。",
        "duplicated_label": "ラベルに重複があるようです。 =={a-label} ラベル のように明示的にラベルを指定することを回避することができます。",
        "args_length_mismatch": "引数の数に齟齬があります。 期待値 %s, 実際 %s",
        "body_string_only": "内容は全て文字でなければいけません。",
        "chapter_not_toplevel": "深さ1のチャプターは最上位になければいけません。",
        "chapter_topleve_eq1": "最上位のチャプターは深さ1のものでなければいけません。",
        "deprecated_inline_symbol": "%s というインライン構文は非推奨です。",
        "graph_tool_is_not_recommended": "graph用ツールにはgraphvizをおすすめします。",
        "unknown_graph_tool": "%s というgraph用ツールはサポートされていません。"
    },
    "builder": {
        "image_not_found": "ID: %s にマッチする画像が見つかりませんでした。",
        "chapter": "第%d章",
        "list": "リスト%s.%s",
        "table": "表%s.%s"
    }
};

},{}],10:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var compilerModel_1 = require("./model/compilerModel");
exports.Book = compilerModel_1.Book;
exports.ContentChunk = compilerModel_1.ContentChunk;
exports.ReportLevel = compilerModel_1.ReportLevel;
exports.ProcessReport = compilerModel_1.ProcessReport;
var controller_1 = require("./controller/controller");
var parser_1 = require("./parser/parser");
exports.SyntaxTree = parser_1.SyntaxTree;
__export(require("./parser/parser"));
var analyzer_1 = require("./parser/analyzer");
exports.AcceptableSyntaxes = analyzer_1.AcceptableSyntaxes;
exports.DefaultAnalyzer = analyzer_1.DefaultAnalyzer;
var validator_1 = require("./parser/validator");
exports.DefaultValidator = validator_1.DefaultValidator;
var builder_1 = require("./builder/builder");
exports.DefaultBuilder = builder_1.DefaultBuilder;
var htmlBuilder_1 = require("./builder/htmlBuilder");
exports.HtmlBuilder = htmlBuilder_1.HtmlBuilder;
var textBuilder_1 = require("./builder/textBuilder");
exports.TextBuilder = textBuilder_1.TextBuilder;
var analyzer_2 = require("./parser/analyzer");
exports.SyntaxType = analyzer_2.SyntaxType;
function start(setup, options) {
    "use strict";
    var controller = new controller_1.Controller(options);
    setup(controller);
    return controller.process();
}
exports.start = start;

},{"./builder/builder":1,"./builder/htmlBuilder":2,"./builder/textBuilder":3,"./controller/controller":6,"./model/compilerModel":12,"./parser/analyzer":13,"./parser/parser":14,"./parser/validator":16}],11:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var DummyError = (function () {
    function DummyError(message) {
        this.message = message;
    }
    DummyError = __decorate([
        replace(Error)
    ], DummyError);
    return DummyError;
})();
exports.DummyError = DummyError;
function replace(src) {
    "use strict";
    return function (_) { return src; };
}
var AnalyzerError = (function (_super) {
    __extends(AnalyzerError, _super);
    function AnalyzerError(message) {
        _super.call(this, message);
        this.name = "AnalyzerError";
        this.message = message;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AnalyzerError);
        }
    }
    return AnalyzerError;
})(DummyError);
exports.AnalyzerError = AnalyzerError;

},{}],12:[function(require,module,exports){
// parser/ と builder/ で共用するモデル
"use strict";
var i18n_1 = require("../i18n/i18n");
var walker_1 = require("../parser/walker");
(function (ReportLevel) {
    ReportLevel[ReportLevel["Info"] = 0] = "Info";
    ReportLevel[ReportLevel["Warning"] = 1] = "Warning";
    ReportLevel[ReportLevel["Error"] = 2] = "Error";
})(exports.ReportLevel || (exports.ReportLevel = {}));
var ReportLevel = exports.ReportLevel;
var ProcessReport = (function () {
    function ProcessReport(level, part, chapter, message, nodes) {
        if (nodes === void 0) { nodes = []; }
        this.level = level;
        this.part = part;
        this.chapter = chapter;
        this.message = message;
        this.nodes = nodes;
    }
    return ProcessReport;
})();
exports.ProcessReport = ProcessReport;
var BookProcess = (function () {
    function BookProcess() {
        this.reports = [];
    }
    BookProcess.prototype.info = function (message) {
        this.reports.push(new ProcessReport(ReportLevel.Info, null, null, message));
    };
    BookProcess.prototype.warn = function (message) {
        this.reports.push(new ProcessReport(ReportLevel.Warning, null, null, message));
    };
    BookProcess.prototype.error = function (message) {
        this.reports.push(new ProcessReport(ReportLevel.Error, null, null, message));
    };
    return BookProcess;
})();
exports.BookProcess = BookProcess;
var Process = (function () {
    function Process(part, chapter, input) {
        this.part = part;
        this.chapter = chapter;
        this.input = input;
        this.symbols = [];
        this.indexCounter = {};
        this.afterProcess = [];
        this._reports = [];
    }
    Process.prototype.info = function (message) {
        var nodes = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            nodes[_i - 1] = arguments[_i];
        }
        this._reports.push(new ProcessReport(ReportLevel.Info, this.part, this.chapter, message, nodes));
    };
    Process.prototype.warn = function (message) {
        var nodes = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            nodes[_i - 1] = arguments[_i];
        }
        this._reports.push(new ProcessReport(ReportLevel.Warning, this.part, this.chapter, message, nodes));
    };
    Process.prototype.error = function (message) {
        var nodes = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            nodes[_i - 1] = arguments[_i];
        }
        this._reports.push(new ProcessReport(ReportLevel.Error, this.part, this.chapter, message, nodes));
    };
    Process.prototype.nextIndex = function (kind) {
        var nextIndex = this.indexCounter[kind];
        if (typeof nextIndex === "undefined") {
            nextIndex = 1;
        }
        else {
            nextIndex++;
        }
        this.indexCounter[kind] = nextIndex;
        return nextIndex;
    };
    Object.defineProperty(Process.prototype, "reports", {
        get: function () {
            return this._reports.sort(function (a, b) {
                if (a.nodes.length === 0 && b.nodes.length === 0) {
                    return 0;
                }
                else if (a.nodes.length === 0) {
                    return -1;
                }
                else if (b.nodes.length === 0) {
                    return 1;
                }
                else {
                    return a.nodes[0].location.start.offset - b.nodes[0].location.start.offset;
                }
            });
        },
        enumerable: true,
        configurable: true
    });
    Process.prototype.addSymbol = function (symbol) {
        symbol.part = this.part;
        symbol.chapter = this.chapter;
        this.symbols.push(symbol);
    };
    Object.defineProperty(Process.prototype, "missingSymbols", {
        get: function () {
            var result = [];
            this.symbols.forEach(function (symbol) {
                if (symbol.referenceTo && !symbol.referenceTo.referenceNode) {
                    result.push(symbol);
                }
            });
            return result;
        },
        enumerable: true,
        configurable: true
    });
    Process.prototype.constructReferenceTo = function (node, value, targetSymbol, separator) {
        if (targetSymbol === void 0) { targetSymbol = node.symbol; }
        if (separator === void 0) { separator = "|"; }
        var splitted = value.split(separator);
        if (splitted.length === 3) {
            return {
                partName: splitted[0],
                chapterName: splitted[1],
                targetSymbol: targetSymbol,
                label: splitted[2]
            };
        }
        else if (splitted.length === 2) {
            return {
                part: this.part,
                partName: (this.part || {}).name,
                chapterName: splitted[0],
                targetSymbol: targetSymbol,
                label: splitted[1]
            };
        }
        else if (splitted.length === 1) {
            return {
                part: this.part,
                partName: (this.part || {}).name,
                chapter: this.chapter,
                chapterName: (this.chapter || {}).name,
                targetSymbol: targetSymbol,
                label: splitted[0]
            };
        }
        else {
            var message = i18n_1.t("compile.args_length_mismatch", "1 or 2 or 3", splitted.length);
            this.error(message, node);
            return null;
        }
    };
    Process.prototype.addAfterProcess = function (func) {
        this.afterProcess.push(func);
    };
    Process.prototype.doAfterProcess = function () {
        this.afterProcess.forEach(function (func) { return func(); });
        this.afterProcess = [];
    };
    return Process;
})();
exports.Process = Process;
var BuilderProcess = (function () {
    function BuilderProcess(builder, base) {
        this.builder = builder;
        this.base = base;
        this.result = "";
    }
    Object.defineProperty(BuilderProcess.prototype, "info", {
        get: function () {
            return this.base.info.bind(this.base);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BuilderProcess.prototype, "warn", {
        get: function () {
            return this.base.warn.bind(this.base);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BuilderProcess.prototype, "error", {
        get: function () {
            return this.base.error.bind(this.base);
        },
        enumerable: true,
        configurable: true
    });
    BuilderProcess.prototype.out = function (data) {
        this.result += this.builder.escape(data);
        return this;
    };
    BuilderProcess.prototype.outRaw = function (data) {
        this.result += data;
        return this;
    };
    BuilderProcess.prototype.pushOut = function (data) {
        this.result = data + this.result;
        return this;
    };
    Object.defineProperty(BuilderProcess.prototype, "input", {
        get: function () {
            return this.base.input;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BuilderProcess.prototype, "symbols", {
        get: function () {
            return this.base.symbols;
        },
        enumerable: true,
        configurable: true
    });
    BuilderProcess.prototype.findChapter = function (chapId) {
        var book = this.base.chapter.book;
        var chaps = book.allChunks.filter(function (chunk) {
            var name = chunk.name.substr(0, chunk.name.lastIndexOf(".re"));
            if (name === chapId) {
                return true;
            }
            var chapter;
            walker_1.visit(chunk.tree.ast, {
                visitDefaultPre: function (node, parent) {
                    return !chapter;
                },
                visitChapterPre: function (node, parent) {
                    chapter = node;
                    return false;
                }
            });
            if (chapter.headline.label) {
                return chapter.headline.label.arg === chapId;
            }
            return false;
        });
        return chaps[0];
    };
    BuilderProcess.prototype.findImageFile = function (id) {
        // NOTE: https://github.com/kmuto/review/wiki/ImagePath
        // 4軸マトリクス 画像dir, ビルダ有無, chapId位置, 拡張子
        var _this = this;
        var config = (this.base.part || this.base.chapter).book.config;
        var fileNameList = [];
        (function () {
            var imageDirList = ["images/"];
            var builderList = [_this.builder.extention + "/", ""];
            var chapSeparatorList = ["/", "-"];
            var extList = ["png", "jpg", "jpeg", "gif"];
            var chunkName = (_this.base.chapter || _this.base.part).name;
            chunkName = chunkName.substring(0, chunkName.lastIndexOf("."));
            imageDirList.forEach(function (imageDir) {
                builderList.forEach(function (builder) {
                    chapSeparatorList.forEach(function (chapSeparator) {
                        extList.forEach(function (ext) {
                            fileNameList.push(imageDir + builder + chunkName + chapSeparator + id + "." + ext);
                        });
                    });
                });
            });
        })();
        var promise = new Promise(function (resolve, reject) {
            var checkFileExists = function () {
                if (fileNameList.length === 0) {
                    reject(id);
                    return;
                }
                var fileName = fileNameList.shift();
                config.exists(fileName).then(function (result) {
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
    };
    return BuilderProcess;
})();
exports.BuilderProcess = BuilderProcess;
var Book = (function () {
    function Book(config) {
        this.config = config;
        this.process = new BookProcess();
        this.predef = [];
        this.contents = [];
        this.appendix = [];
        this.postdef = [];
    }
    Object.defineProperty(Book.prototype, "allChunks", {
        get: function () {
            var tmpArray = [];
            var add = function (chunk) {
                tmpArray.push(chunk);
                chunk.nodes.forEach(function (chunk) { return add(chunk); });
            };
            this.predef.forEach(function (chunk) { return add(chunk); });
            this.contents.forEach(function (chunk) { return add(chunk); });
            this.appendix.forEach(function (chunk) { return add(chunk); });
            this.postdef.forEach(function (chunk) { return add(chunk); });
            return tmpArray;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Book.prototype, "reports", {
        get: function () {
            var results = [];
            results = results.concat(this.process.reports);
            var gatherReports = function (chunk) {
                results = results.concat(chunk.process.reports);
                chunk.nodes.forEach(function (chunk) { return gatherReports(chunk); });
            };
            this.predef.forEach(function (chunk) { return gatherReports(chunk); });
            this.contents.forEach(function (chunk) { return gatherReports(chunk); });
            this.appendix.forEach(function (chunk) { return gatherReports(chunk); });
            this.postdef.forEach(function (chunk) { return gatherReports(chunk); });
            return results;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Book.prototype, "hasError", {
        get: function () {
            return this.reports.some(function (report) { return report.level === ReportLevel.Error; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Book.prototype, "hasWarning", {
        get: function () {
            return this.reports.some(function (report) { return report.level === ReportLevel.Warning; });
        },
        enumerable: true,
        configurable: true
    });
    return Book;
})();
exports.Book = Book;
var ContentChunk = (function () {
    function ContentChunk(book, parent, name) {
        this.book = book;
        this.nodes = [];
        this.builderProcesses = [];
        if (parent instanceof ContentChunk) {
            this.parent = parent;
            this.name = name;
        }
        else if (typeof name === "string") {
            this.name = name;
        }
        else {
            this.name = parent;
        }
        var part = parent ? parent : null;
        var chapter = this;
        this.process = new Process(part, chapter, null);
    }
    Object.defineProperty(ContentChunk.prototype, "input", {
        get: function () {
            return this._input;
        },
        set: function (value) {
            this._input = value;
            this.process.input = value;
        },
        enumerable: true,
        configurable: true
    });
    ContentChunk.prototype.createBuilderProcess = function (builder) {
        var builderProcess = new BuilderProcess(builder, this.process);
        this.builderProcesses.push(builderProcess);
        return builderProcess;
    };
    ContentChunk.prototype.findResultByBuilder = function (builder) {
        var founds;
        if (typeof builder === "string") {
            founds = this.builderProcesses.filter(function (process) { return process.builder.name === builder; });
        }
        else {
            founds = this.builderProcesses.filter(function (process) { return process.builder === builder; });
        }
        return founds[0].result;
    };
    return ContentChunk;
})();
exports.ContentChunk = ContentChunk;

},{"../i18n/i18n":8,"../parser/walker":17}],13:[function(require,module,exports){
"use strict";
var i18n_1 = require("../i18n/i18n");
var exception_1 = require("../js/exception");
var parser_1 = require("../parser/parser");
var utils_1 = require("../utils/utils");
(function (SyntaxType) {
    SyntaxType[SyntaxType["Block"] = 0] = "Block";
    SyntaxType[SyntaxType["Inline"] = 1] = "Inline";
    SyntaxType[SyntaxType["Other"] = 2] = "Other";
})(exports.SyntaxType || (exports.SyntaxType = {}));
var SyntaxType = exports.SyntaxType;
var AcceptableSyntaxes = (function () {
    function AcceptableSyntaxes(acceptableSyntaxes) {
        this.acceptableSyntaxes = acceptableSyntaxes;
    }
    AcceptableSyntaxes.prototype.find = function (node) {
        var results;
        if (node instanceof parser_1.InlineElementSyntaxTree) {
            results = this.inlines.filter(function (s) { return s.symbolName === node.symbol; });
        }
        else if (node instanceof parser_1.BlockElementSyntaxTree) {
            results = this.blocks.filter(function (s) { return s.symbolName === node.symbol; });
        }
        else {
            results = this.others.filter(function (s) { return node instanceof s.clazz; });
        }
        return results;
    };
    Object.defineProperty(AcceptableSyntaxes.prototype, "inlines", {
        get: function () {
            return this.acceptableSyntaxes.filter(function (s) { return s.type === SyntaxType.Inline; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AcceptableSyntaxes.prototype, "blocks", {
        get: function () {
            return this.acceptableSyntaxes.filter(function (s) { return s.type === SyntaxType.Block; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AcceptableSyntaxes.prototype, "others", {
        get: function () {
            return this.acceptableSyntaxes.filter(function (s) { return s.type === SyntaxType.Other; });
        },
        enumerable: true,
        configurable: true
    });
    AcceptableSyntaxes.prototype.toJSON = function () {
        return {
            "rev": "1",
            "SyntaxType": SyntaxType,
            "acceptableSyntaxes": this.acceptableSyntaxes
        };
    };
    return AcceptableSyntaxes;
})();
exports.AcceptableSyntaxes = AcceptableSyntaxes;
var AcceptableSyntax = (function () {
    function AcceptableSyntax() {
        this.argsLength = [];
        this.allowInline = true;
        this.allowFullySyntax = false;
    }
    AcceptableSyntax.prototype.toJSON = function () {
        return {
            "type": this.type,
            "class": this.clazz ? this.clazz.name : void 0,
            "symbolName": this.symbolName,
            "argsLength": this.argsLength.length !== 0 ? this.argsLength : (void 0),
            "description": this.description
        };
    };
    return AcceptableSyntax;
})();
exports.AcceptableSyntax = AcceptableSyntax;
var AnalyzeProcess = (function () {
    function AnalyzeProcess() {
        this.acceptableSyntaxes = [];
    }
    AnalyzeProcess.prototype.prepare = function () {
        this.current = new AcceptableSyntax();
    };
    AnalyzeProcess.prototype.build = function (methodName) {
        if (methodName.indexOf("block_") === 0) {
            this.current.type = this.current.type || SyntaxType.Block;
            this.current.symbolName = this.current.symbolName || methodName.substring("block_".length);
        }
        else if (methodName.indexOf("inline_") === 0) {
            this.current.type = this.current.type || SyntaxType.Inline;
            this.current.symbolName = this.current.symbolName || methodName.substring("inline_".length);
        }
        else {
            this.current.type = this.current.type || SyntaxType.Other;
            this.current.symbolName = this.current.symbolName || methodName;
        }
        switch (this.current.type) {
            case SyntaxType.Block:
                if (this.current.argsLength.length === 0) {
                    throw new exception_1.AnalyzerError("must call builder.checkArgsLength(...number[]) in " + methodName);
                }
                break;
            case SyntaxType.Other:
                if (!this.current.clazz) {
                    throw new exception_1.AnalyzerError("must call builder.setClass(class) in " + methodName);
                }
                break;
            case SyntaxType.Inline:
                break;
        }
        if (!this.current.description) {
            throw new exception_1.AnalyzerError("must call builder.setDescription(string) in " + methodName);
        }
        if (!this.current.process) {
            throw new exception_1.AnalyzerError("must call builder.processNode(func) in " + methodName);
        }
        this.acceptableSyntaxes.push(this.current);
    };
    AnalyzeProcess.prototype.setSyntaxType = function (type) {
        this.current.type = type;
    };
    AnalyzeProcess.prototype.setClass = function (clazz) {
        this.current.clazz = clazz;
    };
    AnalyzeProcess.prototype.setSymbol = function (symbolName) {
        this.current.symbolName = symbolName;
    };
    AnalyzeProcess.prototype.setDescription = function (description) {
        this.current.description = description;
    };
    AnalyzeProcess.prototype.checkArgsLength = function () {
        var argsLength = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            argsLength[_i - 0] = arguments[_i];
        }
        this.current.argsLength = argsLength;
    };
    AnalyzeProcess.prototype.setAllowInline = function (enable) {
        this.current.allowInline = enable;
    };
    AnalyzeProcess.prototype.setAllowFullySyntax = function (enable) {
        this.current.allowFullySyntax = enable;
    };
    AnalyzeProcess.prototype.processNode = function (func) {
        this.current.process = func;
    };
    return AnalyzeProcess;
})();
var DefaultAnalyzer = (function () {
    function DefaultAnalyzer() {
    }
    DefaultAnalyzer.prototype.getAcceptableSyntaxes = function () {
        if (!this._acceptableSyntaxes) {
            this._acceptableSyntaxes = this.constructAcceptableSyntaxes();
        }
        return new AcceptableSyntaxes(this._acceptableSyntaxes);
    };
    DefaultAnalyzer.prototype.constructAcceptableSyntaxes = function () {
        var process = new AnalyzeProcess();
        for (var k in this) {
            if (typeof this[k] !== "function") {
                continue;
            }
            var func = null;
            if (k.indexOf("block_") === 0) {
                func = this[k];
            }
            else if (k.indexOf("inline_") === 0) {
                func = this[k];
            }
            else if (k === "headline") {
                func = this[k];
            }
            else if (k === "column") {
                func = this[k];
            }
            else if (k === "ulist") {
                func = this[k];
            }
            else if (k === "olist") {
                func = this[k];
            }
            else if (k === "dlist") {
                func = this[k];
            }
            if (func) {
                process.prepare();
                func.bind(this)(process);
                process.build(k);
            }
        }
        return process.acceptableSyntaxes;
    };
    DefaultAnalyzer.prototype.headline = function (builder) {
        builder.setSyntaxType(SyntaxType.Other);
        builder.setClass(parser_1.HeadlineSyntaxTree);
        builder.setDescription(i18n_1.t("description.headline"));
        builder.processNode(function (process, n) {
            var node = n.toHeadline();
            var label = null;
            if (node.label) {
                label = node.label.arg;
            }
            else if (node.caption.childNodes.length === 1) {
                var textNode = node.caption.childNodes[0].toTextNode();
                label = textNode.text;
            }
            process.addSymbol({
                symbolName: "hd",
                labelName: label,
                node: node
            });
            if (node.level === 1) {
                var label_1 = null;
                if (node.label) {
                    label_1 = node.label.arg;
                }
                else {
                    label_1 = process.chapter.name.substr(0, process.chapter.name.lastIndexOf(".re"));
                }
                process.addSymbol({
                    symbolName: "chapter",
                    labelName: label_1,
                    node: node
                });
            }
        });
    };
    DefaultAnalyzer.prototype.column = function (builder) {
        builder.setSyntaxType(SyntaxType.Other);
        builder.setClass(parser_1.ColumnSyntaxTree);
        builder.setDescription(i18n_1.t("description.column"));
        builder.processNode(function (process, n) {
            var node = n.toColumn();
            node.no = process.nextIndex("column");
            process.addSymbol({
                symbolName: "column",
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.ulist = function (builder) {
        builder.setSyntaxType(SyntaxType.Other);
        builder.setClass(parser_1.UlistElementSyntaxTree);
        builder.setDescription(i18n_1.t("description.ulist"));
        builder.processNode(function (process, n) {
            var node = n.toUlist();
            process.addSymbol({
                symbolName: "ul",
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.olist = function (builder) {
        builder.setSyntaxType(SyntaxType.Other);
        builder.setClass(parser_1.OlistElementSyntaxTree);
        builder.setDescription(i18n_1.t("description.olist"));
        builder.processNode(function (process, n) {
            var node = n.toOlist();
            process.addSymbol({
                symbolName: "ol",
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.dlist = function (builder) {
        builder.setSyntaxType(SyntaxType.Other);
        builder.setClass(parser_1.DlistElementSyntaxTree);
        builder.setDescription(i18n_1.t("description.dlist"));
        builder.processNode(function (process, n) {
            var node = n.toDlist();
            process.addSymbol({
                symbolName: "dl",
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.block_list = function (builder) {
        builder.setSyntaxType(SyntaxType.Block);
        builder.setSymbol("list");
        builder.setDescription(i18n_1.t("description.block_list"));
        builder.checkArgsLength(2, 3);
        builder.processNode(function (process, n) {
            var node = n.toBlockElement();
            node.no = process.nextIndex("list");
            process.addSymbol({
                symbolName: node.symbol,
                labelName: utils_1.nodeContentToString(process, node.args[0]),
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.block_listnum = function (builder) {
        builder.setSyntaxType(SyntaxType.Block);
        builder.setSymbol("listnum");
        builder.setDescription(i18n_1.t("description.block_listnum"));
        builder.checkArgsLength(2, 3);
        builder.processNode(function (process, n) {
            var node = n.toBlockElement();
            node.no = process.nextIndex("list");
            process.addSymbol({
                symbolName: "list",
                labelName: utils_1.nodeContentToString(process, node.args[0]),
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.inline_list = function (builder) {
        builder.setSyntaxType(SyntaxType.Inline);
        builder.setSymbol("list");
        builder.setDescription(i18n_1.t("description.inline_list"));
        builder.processNode(function (process, n) {
            var node = n.toInlineElement();
            process.addSymbol({
                symbolName: node.symbol,
                referenceTo: process.constructReferenceTo(node, utils_1.nodeContentToString(process, node)),
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.block_emlist = function (builder) {
        builder.setSyntaxType(SyntaxType.Block);
        builder.setSymbol("emlist");
        builder.setDescription(i18n_1.t("description.block_emlist"));
        builder.checkArgsLength(0, 1, 2);
        builder.processNode(function (process, n) {
            var node = n.toBlockElement();
            process.addSymbol({
                symbolName: node.symbol,
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.block_emlistnum = function (builder) {
        builder.setSyntaxType(SyntaxType.Block);
        builder.setSymbol("emlistnum");
        builder.setDescription(i18n_1.t("description.block_emlistnum"));
        builder.checkArgsLength(0, 1, 2);
        builder.processNode(function (process, n) {
            var node = n.toBlockElement();
            process.addSymbol({
                symbolName: "emlist",
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.inline_hd = function (builder) {
        builder.setSyntaxType(SyntaxType.Inline);
        builder.setSymbol("hd");
        builder.setDescription(i18n_1.t("description.inline_hd"));
        builder.processNode(function (process, n) {
            var node = n.toInlineElement();
            process.addSymbol({
                symbolName: node.symbol,
                referenceTo: process.constructReferenceTo(node, utils_1.nodeContentToString(process, node)),
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.block_image = function (builder) {
        builder.setSyntaxType(SyntaxType.Block);
        builder.setSymbol("image");
        builder.setDescription(i18n_1.t("description.block_image"));
        builder.checkArgsLength(2, 3);
        builder.processNode(function (process, n) {
            var node = n.toBlockElement();
            node.no = process.nextIndex("image");
            process.addSymbol({
                symbolName: node.symbol,
                labelName: utils_1.nodeContentToString(process, node.args[0]),
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.block_indepimage = function (builder) {
        builder.setSyntaxType(SyntaxType.Block);
        builder.setSymbol("indepimage");
        builder.setDescription(i18n_1.t("description.block_indepimage"));
        builder.checkArgsLength(1, 2, 3);
        builder.processNode(function (process, n) {
            var node = n.toBlockElement();
            process.addSymbol({
                symbolName: node.symbol,
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.block_graph = function (builder) {
        builder.setSyntaxType(SyntaxType.Block);
        builder.setSymbol("graph");
        builder.setDescription(i18n_1.t("description.block_graph"));
        builder.checkArgsLength(2, 3);
        builder.processNode(function (process, n) {
            var node = n.toBlockElement();
            node.no = process.nextIndex("image");
            process.addSymbol({
                symbolName: "image",
                labelName: utils_1.nodeContentToString(process, node.args[0]),
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.inline_img = function (builder) {
        builder.setSyntaxType(SyntaxType.Inline);
        builder.setSymbol("img");
        builder.setDescription(i18n_1.t("description.inline_img"));
        builder.processNode(function (process, n) {
            var node = n.toInlineElement();
            process.addSymbol({
                symbolName: node.symbol,
                referenceTo: process.constructReferenceTo(node, utils_1.nodeContentToString(process, node), "image"),
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.inline_icon = function (builder) {
        builder.setSyntaxType(SyntaxType.Block);
        builder.setSymbol("icon");
        builder.setDescription(i18n_1.t("description.inline_icon"));
        builder.processNode(function (process, n) {
            var node = n.toInlineElement();
            process.addSymbol({
                symbolName: node.symbol,
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.block_footnote = function (builder) {
        builder.setSyntaxType(SyntaxType.Block);
        builder.setSymbol("footnote");
        builder.setDescription(i18n_1.t("description.block_footnote"));
        builder.checkArgsLength(2);
        builder.processNode(function (process, n) {
            var node = n.toBlockElement();
            node.no = process.nextIndex("footnote");
            process.addSymbol({
                symbolName: node.symbol,
                labelName: utils_1.nodeContentToString(process, node.args[0]),
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.inline_fn = function (builder) {
        builder.setSyntaxType(SyntaxType.Inline);
        builder.setSymbol("fn");
        builder.setDescription(i18n_1.t("description.inline_fn"));
        builder.processNode(function (process, n) {
            var node = n.toInlineElement();
            process.addSymbol({
                symbolName: node.symbol,
                referenceTo: process.constructReferenceTo(node, utils_1.nodeContentToString(process, node), "footnote"),
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.blockDecorationSyntax = function (builder, symbol) {
        var argsLength = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            argsLength[_i - 2] = arguments[_i];
        }
        builder.setSyntaxType(SyntaxType.Block);
        builder.setSymbol(symbol);
        builder.setDescription(i18n_1.t("description.block_" + symbol));
        builder.checkArgsLength.apply(builder, argsLength);
        builder.processNode(function (process, n) {
            var node = n.toBlockElement();
            process.addSymbol({
                symbolName: node.symbol,
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.block_lead = function (builder) {
        this.blockDecorationSyntax(builder, "lead", 0);
        builder.setAllowFullySyntax(true);
    };
    DefaultAnalyzer.prototype.block_noindent = function (builder) {
        this.blockDecorationSyntax(builder, "noindent", 0);
    };
    DefaultAnalyzer.prototype.block_source = function (builder) {
        this.blockDecorationSyntax(builder, "source", 1);
    };
    DefaultAnalyzer.prototype.block_cmd = function (builder) {
        this.blockDecorationSyntax(builder, "cmd", 0);
    };
    DefaultAnalyzer.prototype.block_quote = function (builder) {
        this.blockDecorationSyntax(builder, "quote", 0);
    };
    DefaultAnalyzer.prototype.inlineDecorationSyntax = function (builder, symbol) {
        builder.setSyntaxType(SyntaxType.Inline);
        builder.setSymbol(symbol);
        builder.setDescription(i18n_1.t("description.inline_" + symbol));
        builder.processNode(function (process, n) {
            var node = n.toInlineElement();
            process.addSymbol({
                symbolName: node.symbol,
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.inline_br = function (builder) {
        this.inlineDecorationSyntax(builder, "br");
    };
    DefaultAnalyzer.prototype.inline_ruby = function (builder) {
        this.inlineDecorationSyntax(builder, "ruby");
    };
    DefaultAnalyzer.prototype.inline_b = function (builder) {
        this.inlineDecorationSyntax(builder, "b");
    };
    DefaultAnalyzer.prototype.inline_code = function (builder) {
        this.inlineDecorationSyntax(builder, "code");
    };
    DefaultAnalyzer.prototype.inline_tt = function (builder) {
        this.inlineDecorationSyntax(builder, "tt");
    };
    DefaultAnalyzer.prototype.inline_href = function (builder) {
        this.inlineDecorationSyntax(builder, "href");
    };
    DefaultAnalyzer.prototype.block_label = function (builder) {
        builder.setSyntaxType(SyntaxType.Block);
        builder.setSymbol("label");
        builder.setDescription(i18n_1.t("description.block_label"));
        builder.checkArgsLength(1);
        builder.processNode(function (process, n) {
            var node = n.toBlockElement();
            node.no = process.nextIndex("label");
            process.addSymbol({
                symbolName: node.symbol,
                labelName: utils_1.nodeContentToString(process, node.args[0]),
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.inline_u = function (builder) {
        this.inlineDecorationSyntax(builder, "u");
    };
    DefaultAnalyzer.prototype.inline_kw = function (builder) {
        this.inlineDecorationSyntax(builder, "kw");
    };
    DefaultAnalyzer.prototype.inline_em = function (builder) {
        this.inlineDecorationSyntax(builder, "em");
    };
    DefaultAnalyzer.prototype.inline_tti = function (builder) {
        this.inlineDecorationSyntax(builder, "tti");
    };
    DefaultAnalyzer.prototype.inline_ttb = function (builder) {
        this.inlineDecorationSyntax(builder, "ttb");
    };
    DefaultAnalyzer.prototype.inline_ami = function (builder) {
        this.inlineDecorationSyntax(builder, "ami");
    };
    DefaultAnalyzer.prototype.inline_bou = function (builder) {
        this.inlineDecorationSyntax(builder, "bou");
    };
    DefaultAnalyzer.prototype.inline_i = function (builder) {
        this.inlineDecorationSyntax(builder, "i");
    };
    DefaultAnalyzer.prototype.inline_strong = function (builder) {
        this.inlineDecorationSyntax(builder, "strong");
    };
    DefaultAnalyzer.prototype.inline_uchar = function (builder) {
        this.inlineDecorationSyntax(builder, "uchar");
    };
    DefaultAnalyzer.prototype.block_table = function (builder) {
        builder.setSyntaxType(SyntaxType.Block);
        builder.setSymbol("table");
        builder.setDescription(i18n_1.t("description.block_table"));
        builder.checkArgsLength(2);
        builder.processNode(function (process, n) {
            var node = n.toBlockElement();
            node.no = process.nextIndex("table");
            process.addSymbol({
                symbolName: node.symbol,
                labelName: utils_1.nodeContentToString(process, node.args[0]),
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.inline_table = function (builder) {
        builder.setSyntaxType(SyntaxType.Inline);
        builder.setSymbol("table");
        builder.setDescription(i18n_1.t("description.inline_table"));
        builder.processNode(function (process, n) {
            var node = n.toInlineElement();
            process.addSymbol({
                symbolName: node.symbol,
                referenceTo: process.constructReferenceTo(node, utils_1.nodeContentToString(process, node)),
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.block_tsize = function (builder) {
        builder.setSyntaxType(SyntaxType.Block);
        builder.setDescription(i18n_1.t("description.block_tsize"));
        builder.checkArgsLength(1);
        builder.processNode(function (process, n) {
            var node = n.toBlockElement();
            process.addSymbol({
                symbolName: node.symbol,
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.block_raw = function (builder) {
        builder.setSyntaxType(SyntaxType.Block);
        builder.setSymbol("raw");
        builder.setDescription(i18n_1.t("description.block_raw"));
        builder.checkArgsLength(1);
        builder.processNode(function (process, n) {
            var node = n.toBlockElement();
            process.addSymbol({
                symbolName: node.symbol,
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.inline_raw = function (builder) {
        builder.setSyntaxType(SyntaxType.Inline);
        builder.setSymbol("raw");
        builder.setDescription(i18n_1.t("description.inline_raw"));
        builder.processNode(function (process, n) {
            var node = n.toInlineElement();
            process.addSymbol({
                symbolName: node.symbol,
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.block_comment = function (builder) {
        builder.setSyntaxType(SyntaxType.Block);
        builder.setSymbol("comment");
        builder.setDescription(i18n_1.t("description.block_comment"));
        builder.checkArgsLength(0);
        builder.processNode(function (process, n) {
            var node = n.toBlockElement();
            process.addSymbol({
                symbolName: node.symbol,
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.inline_comment = function (builder) {
        builder.setSyntaxType(SyntaxType.Inline);
        builder.setSymbol("comment");
        builder.setDescription(i18n_1.t("description.inline_comment"));
        builder.processNode(function (process, n) {
            var node = n.toInlineElement();
            process.addSymbol({
                symbolName: node.symbol,
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.inline_chap = function (builder) {
        builder.setSyntaxType(SyntaxType.Inline);
        builder.setSymbol("chap");
        builder.setDescription(i18n_1.t("description.inline_chap"));
        builder.processNode(function (process, n) {
            var node = n.toInlineElement();
            process.addSymbol({
                symbolName: node.symbol,
                referenceTo: process.constructReferenceTo(node, utils_1.nodeContentToString(process, node), "chapter"),
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.inline_title = function (builder) {
        builder.setSyntaxType(SyntaxType.Inline);
        builder.setSymbol("title");
        builder.setDescription(i18n_1.t("description.inline_title"));
        builder.processNode(function (process, n) {
            var node = n.toInlineElement();
            process.addSymbol({
                symbolName: node.symbol,
                referenceTo: process.constructReferenceTo(node, utils_1.nodeContentToString(process, node), "chapter"),
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.inline_chapref = function (builder) {
        builder.setSyntaxType(SyntaxType.Inline);
        builder.setSymbol("chapref");
        builder.setDescription(i18n_1.t("description.inline_chapref"));
        builder.processNode(function (process, n) {
            var node = n.toInlineElement();
            process.addSymbol({
                symbolName: node.symbol,
                referenceTo: process.constructReferenceTo(node, utils_1.nodeContentToString(process, node), "chapter"),
                node: node
            });
        });
    };
    return DefaultAnalyzer;
})();
exports.DefaultAnalyzer = DefaultAnalyzer;

},{"../i18n/i18n":8,"../js/exception":11,"../parser/parser":14,"../utils/utils":19}],14:[function(require,module,exports){
/**
 * 構文解析用途のモジュール。
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PEG = require("../../resources/grammar");
var walker_1 = require("./walker");
function parse(input) {
    "use strict";
    var rawResult = PEG.parse(input);
    var root = transform(rawResult).toNode();
    walker_1.visit(root, {
        visitDefaultPre: function (ast) {
        },
        visitParagraphPre: function (ast) {
            var subs = ast.childNodes[0].toNode();
            ast.childNodes = subs.childNodes;
        }
    });
    if (root.childNodes.length !== 0) {
        reconstruct(root.childNodes[0].toNode(), function (chapter) { return chapter.headline.level; });
    }
    var ulistSet = [];
    walker_1.visit(root, {
        visitDefaultPre: function (ast) {
            if (ast.ruleName === RuleName.Ulist) {
                ulistSet.push(ast.toNode());
            }
        }
    });
    ulistSet.forEach(function (ulist) {
        reconstruct(ulist, function (ulistElement) { return ulistElement.level; });
    });
    walker_1.visit(root, {
        visitDefaultPre: function (ast, parent) {
            ast.parentNode = parent;
        }
    });
    walker_1.visit(root, {
        visitDefaultPre: function (ast, parent) {
        },
        visitChapterPre: function (ast) {
            ast.text.forEach(function (node, i, nodes) {
                node.prev = nodes[i - 1];
                node.next = nodes[i + 1];
            });
        },
        visitNodePre: function (ast) {
            ast.childNodes.forEach(function (node, i, nodes) {
                node.prev = nodes[i - 1];
                node.next = nodes[i + 1];
            });
        }
    });
    return {
        ast: root,
        cst: rawResult
    };
}
exports.parse = parse;
function transform(rawResult) {
    "use strict";
    if (!rawResult) {
        return null;
    }
    var rule = RuleName[rawResult.syntax];
    if (typeof rule === "undefined") {
        throw new ParseError(rawResult, "unknown rule: " + rawResult.syntax);
    }
    switch (rule) {
        case RuleName.Chapter:
            return new ChapterSyntaxTree(rawResult);
        case RuleName.BlockElement:
            return new BlockElementSyntaxTree(rawResult);
        case RuleName.Headline:
            return new HeadlineSyntaxTree(rawResult);
        case RuleName.InlineElement:
            return new InlineElementSyntaxTree(rawResult);
        case RuleName.Column:
            return new ColumnSyntaxTree(rawResult);
        case RuleName.ColumnHeadline:
            return new ColumnHeadlineSyntaxTree(rawResult);
        case RuleName.BraceArg:
            return new ArgumentSyntaxTree(rawResult);
        case RuleName.UlistElement:
            return new UlistElementSyntaxTree(rawResult);
        case RuleName.OlistElement:
            return new OlistElementSyntaxTree(rawResult);
        case RuleName.DlistElement:
            return new DlistElementSyntaxTree(rawResult);
        case RuleName.ContentText:
        case RuleName.BracketArgText:
        case RuleName.BlockElementContentText:
        case RuleName.InlineElementContentText:
        case RuleName.ContentInlineText:
            return new TextNodeSyntaxTree(rawResult);
        case RuleName.SinglelineComment:
            return new SingleLineCommentSyntaxTree(rawResult);
        case RuleName.Chapters:
        case RuleName.Contents:
        case RuleName.ParagraphSubs:
        case RuleName.BracketArgSubs:
        case RuleName.BlockElementContents:
        case RuleName.BlockElementParagraphSubs:
        case RuleName.InlineElementContents:
        case RuleName.ColumnContents:
        case RuleName.ContentInlines:
        case RuleName.Ulist:
        case RuleName.Olist:
        case RuleName.Dlist:
        case RuleName.DlistElementContents:
            return new NodeSyntaxTree(rawResult);
        case RuleName.Start:
        case RuleName.Paragraph:
        case RuleName.BracketArg:
        case RuleName.BlockElementParagraph:
        case RuleName.BlockElementParagraphSub:
        case RuleName.DlistElementContent:
            return new NodeSyntaxTree(rawResult);
        case RuleName.Content:
        case RuleName.ParagraphSub:
        case RuleName.BracketArgSub:
        case RuleName.BlockElementContent:
        case RuleName.InlineElementContent:
        case RuleName.ColumnContent:
        case RuleName.SinglelineContent:
        case RuleName.ContentInline:
            return transform(rawResult.content);
        default:
            return new SyntaxTree(rawResult);
    }
}
exports.transform = transform;
function reconstruct(node, pickLevel) {
    "use strict";
    var originalChildNodes = node.childNodes;
    var nodeSets = [];
    var currentSet = {
        parent: null,
        children: []
    };
    originalChildNodes.forEach(function (child) {
        if (child.ruleName === RuleName.SinglelineComment) {
            currentSet.children.push(child);
        }
        else if (!currentSet.parent) {
            currentSet.parent = child;
        }
        else if (pickLevel(currentSet.parent) < pickLevel(child)) {
            currentSet.children.push(child);
        }
        else {
            nodeSets.push(currentSet);
            currentSet = {
                parent: child,
                children: []
            };
        }
    });
    if (currentSet.parent) {
        nodeSets.push(currentSet);
    }
    node.childNodes = [];
    nodeSets.forEach(function (nodes) {
        var parent = nodes.parent;
        node.childNodes.push(parent);
        nodes.children.forEach(function (child) {
            parent.childNodes.push(child);
        });
        reconstruct(parent, pickLevel);
    });
}
var ParseError = (function () {
    function ParseError(syntax, message) {
        this.syntax = syntax;
        this.message = message;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ParseError);
        }
        this.name = "ParseError";
    }
    return ParseError;
})();
exports.ParseError = ParseError;
(function (RuleName) {
    RuleName[RuleName["SyntaxError"] = 0] = "SyntaxError";
    RuleName[RuleName["Start"] = 1] = "Start";
    RuleName[RuleName["Chapters"] = 2] = "Chapters";
    RuleName[RuleName["Chapter"] = 3] = "Chapter";
    RuleName[RuleName["Headline"] = 4] = "Headline";
    RuleName[RuleName["Contents"] = 5] = "Contents";
    RuleName[RuleName["Content"] = 6] = "Content";
    RuleName[RuleName["Paragraph"] = 7] = "Paragraph";
    RuleName[RuleName["ParagraphSubs"] = 8] = "ParagraphSubs";
    RuleName[RuleName["ParagraphSub"] = 9] = "ParagraphSub";
    RuleName[RuleName["ContentText"] = 10] = "ContentText";
    RuleName[RuleName["BlockElement"] = 11] = "BlockElement";
    RuleName[RuleName["InlineElement"] = 12] = "InlineElement";
    RuleName[RuleName["BracketArg"] = 13] = "BracketArg";
    RuleName[RuleName["BracketArgSubs"] = 14] = "BracketArgSubs";
    RuleName[RuleName["BracketArgSub"] = 15] = "BracketArgSub";
    RuleName[RuleName["BracketArgText"] = 16] = "BracketArgText";
    RuleName[RuleName["BraceArg"] = 17] = "BraceArg";
    RuleName[RuleName["BlockElementContents"] = 18] = "BlockElementContents";
    RuleName[RuleName["BlockElementContent"] = 19] = "BlockElementContent";
    RuleName[RuleName["BlockElementParagraph"] = 20] = "BlockElementParagraph";
    RuleName[RuleName["BlockElementParagraphSubs"] = 21] = "BlockElementParagraphSubs";
    RuleName[RuleName["BlockElementParagraphSub"] = 22] = "BlockElementParagraphSub";
    RuleName[RuleName["BlockElementContentText"] = 23] = "BlockElementContentText";
    RuleName[RuleName["InlineElementContents"] = 24] = "InlineElementContents";
    RuleName[RuleName["InlineElementContent"] = 25] = "InlineElementContent";
    RuleName[RuleName["InlineElementContentText"] = 26] = "InlineElementContentText";
    RuleName[RuleName["SinglelineContent"] = 27] = "SinglelineContent";
    RuleName[RuleName["ContentInlines"] = 28] = "ContentInlines";
    RuleName[RuleName["ContentInline"] = 29] = "ContentInline";
    RuleName[RuleName["ContentInlineText"] = 30] = "ContentInlineText";
    RuleName[RuleName["Ulist"] = 31] = "Ulist";
    RuleName[RuleName["UlistElement"] = 32] = "UlistElement";
    RuleName[RuleName["Olist"] = 33] = "Olist";
    RuleName[RuleName["OlistElement"] = 34] = "OlistElement";
    RuleName[RuleName["Dlist"] = 35] = "Dlist";
    RuleName[RuleName["DlistElement"] = 36] = "DlistElement";
    RuleName[RuleName["DlistElementContents"] = 37] = "DlistElementContents";
    RuleName[RuleName["DlistElementContent"] = 38] = "DlistElementContent";
    RuleName[RuleName["Column"] = 39] = "Column";
    RuleName[RuleName["ColumnHeadline"] = 40] = "ColumnHeadline";
    RuleName[RuleName["ColumnContents"] = 41] = "ColumnContents";
    RuleName[RuleName["ColumnContent"] = 42] = "ColumnContent";
    RuleName[RuleName["ColumnTerminator"] = 43] = "ColumnTerminator";
    RuleName[RuleName["SinglelineComment"] = 44] = "SinglelineComment";
})(exports.RuleName || (exports.RuleName = {}));
var RuleName = exports.RuleName;
var SyntaxTree = (function () {
    function SyntaxTree(data) {
        this.ruleName = RuleName[data.syntax];
        if (typeof this.ruleName === "undefined") {
            throw new ParseError(data, "unknown rule: " + data.syntax);
        }
        this.location = {
            start: {
                line: data.location.start.line,
                column: data.location.start.column,
                offset: data.location.start.offset
            },
            end: {
                line: data.location.end.line,
                column: data.location.end.column,
                offset: data.location.end.offset
            }
        };
    }
    SyntaxTree.prototype.toJSON = function () {
        var _this = this;
        var result = {};
        var lowPriorities = [];
        for (var k in this) {
            if (k === "ruleName") {
                result[k] = RuleName[this.ruleName];
            }
            else if (k === "prev" || k === "next" || k === "parentNode") {
            }
            else if (k === "childNodes") {
                lowPriorities.push((function (k) {
                    return function () {
                        result[k] = _this[k];
                    };
                })(k));
            }
            else if (k === "fqn") {
            }
            else if (typeof this[k] !== "function") {
                result[k] = this[k];
            }
        }
        lowPriorities.forEach(function (fn) { return fn(); });
        return result;
    };
    SyntaxTree.prototype.toString = function (indentLevel) {
        if (indentLevel === void 0) { indentLevel = 0; }
        var result = this.makeIndent(indentLevel) + "SyntaxTree:[\n";
        result += this.makeIndent(indentLevel + 1) + "offset = " + this.location.start.offset + ",\n";
        result += this.makeIndent(indentLevel + 1) + "line=" + this.location.start.line + ",\n";
        result += this.makeIndent(indentLevel + 1) + "column=" + this.location.start.column + ",\n";
        result += this.makeIndent(indentLevel + 1) + "name=" + RuleName[this.ruleName] + ",\n";
        this.toStringHook(indentLevel, result);
        result += this.makeIndent(indentLevel) + "]";
        return result;
    };
    SyntaxTree.prototype.makeIndent = function (indentLevel) {
        var indent = "";
        for (var i = 0; i < indentLevel; i++) {
            indent += "  ";
        }
        return indent;
    };
    SyntaxTree.prototype.toStringHook = function (indentLevel, result) {
    };
    SyntaxTree.prototype.checkNumber = function (value) {
        if (typeof value !== "number") {
            throw new Error("number required. actual:" + (typeof value) + ":" + value);
        }
        else {
            return value;
        }
    };
    SyntaxTree.prototype.checkString = function (value) {
        if (typeof value !== "string") {
            throw new Error("string required. actual:" + (typeof value) + ":" + value);
        }
        else {
            return value;
        }
    };
    SyntaxTree.prototype.checkObject = function (value) {
        if (typeof value !== "object") {
            throw new Error("object required. actual:" + (typeof value) + ":" + value);
        }
        else {
            return value;
        }
    };
    SyntaxTree.prototype.checkArray = function (value) {
        if (!Array.isArray(value)) {
            throw new Error("array required. actual:" + (typeof value) + ":" + value);
        }
        else {
            return value;
        }
    };
    SyntaxTree.prototype.checkSyntaxType = function (clazz) {
        return this instanceof clazz;
    };
    SyntaxTree.prototype.isNode = function () {
        return this.checkSyntaxType(NodeSyntaxTree);
    };
    SyntaxTree.prototype.isBlockElement = function () {
        return this.checkSyntaxType(BlockElementSyntaxTree);
    };
    SyntaxTree.prototype.isInlineElement = function () {
        return this.checkSyntaxType(InlineElementSyntaxTree);
    };
    SyntaxTree.prototype.isArgument = function () {
        return this.checkSyntaxType(ArgumentSyntaxTree);
    };
    SyntaxTree.prototype.isChapter = function () {
        return this.checkSyntaxType(ChapterSyntaxTree);
    };
    SyntaxTree.prototype.isHeadline = function () {
        return this.checkSyntaxType(HeadlineSyntaxTree);
    };
    SyntaxTree.prototype.isUlist = function () {
        return this.checkSyntaxType(UlistElementSyntaxTree);
    };
    SyntaxTree.prototype.isOlist = function () {
        return this.checkSyntaxType(OlistElementSyntaxTree);
    };
    SyntaxTree.prototype.isDlist = function () {
        return this.checkSyntaxType(DlistElementSyntaxTree);
    };
    SyntaxTree.prototype.isTextNode = function () {
        return this.checkSyntaxType(TextNodeSyntaxTree);
    };
    SyntaxTree.prototype.isSingleLineComment = function () {
        return this.checkSyntaxType(SingleLineCommentSyntaxTree);
    };
    SyntaxTree.prototype.toOtherNode = function (clazz) {
        if (this instanceof clazz) {
            return this;
        }
        else {
            throw new Error("this node is not " + clazz.name + ", actual " + this.constructor.name);
        }
    };
    SyntaxTree.prototype.toNode = function () {
        return this.toOtherNode(NodeSyntaxTree);
    };
    SyntaxTree.prototype.toBlockElement = function () {
        return this.toOtherNode(BlockElementSyntaxTree);
    };
    SyntaxTree.prototype.toInlineElement = function () {
        return this.toOtherNode(InlineElementSyntaxTree);
    };
    SyntaxTree.prototype.toArgument = function () {
        return this.toOtherNode(ArgumentSyntaxTree);
    };
    SyntaxTree.prototype.toChapter = function () {
        return this.toOtherNode(ChapterSyntaxTree);
    };
    SyntaxTree.prototype.toColumn = function () {
        return this.toOtherNode(ColumnSyntaxTree);
    };
    SyntaxTree.prototype.toHeadline = function () {
        return this.toOtherNode(HeadlineSyntaxTree);
    };
    SyntaxTree.prototype.toColumnHeadline = function () {
        return this.toOtherNode(ColumnHeadlineSyntaxTree);
    };
    SyntaxTree.prototype.toUlist = function () {
        return this.toOtherNode(UlistElementSyntaxTree);
    };
    SyntaxTree.prototype.toOlist = function () {
        return this.toOtherNode(OlistElementSyntaxTree);
    };
    SyntaxTree.prototype.toDlist = function () {
        return this.toOtherNode(DlistElementSyntaxTree);
    };
    SyntaxTree.prototype.toTextNode = function () {
        return this.toOtherNode(TextNodeSyntaxTree);
    };
    SyntaxTree.prototype.toSingleLineCommentNode = function () {
        return this.toOtherNode(SingleLineCommentSyntaxTree);
    };
    return SyntaxTree;
})();
exports.SyntaxTree = SyntaxTree;
var NodeSyntaxTree = (function (_super) {
    __extends(NodeSyntaxTree, _super);
    function NodeSyntaxTree(data) {
        _super.call(this, data);
        this.childNodes = [];
        this.processChildNodes(data.content);
    }
    NodeSyntaxTree.prototype.processChildNodes = function (content) {
        var _this = this;
        if (Array.isArray(content)) {
            content.forEach(function (rawResult) {
                var tree = transform(rawResult);
                if (tree) {
                    _this.childNodes.push(tree);
                }
            });
        }
        else if (content !== "" && content) {
            (function (rawResult) {
                var tree = transform(rawResult);
                if (tree) {
                    _this.childNodes.push(tree);
                }
            })(content);
        }
    };
    NodeSyntaxTree.prototype.toStringHook = function (indentLevel, result) {
        if (this.childNodes.length !== 0) {
            result += this.makeIndent(indentLevel + 1) + "childNodes[" + this.childNodes.length + "]=[\n";
            this.childNodes.forEach(function (node) {
                result += node.toString(indentLevel + 2);
                result += "\n";
            });
            result += this.makeIndent(indentLevel + 1) + "]\n";
        }
    };
    return NodeSyntaxTree;
})(SyntaxTree);
exports.NodeSyntaxTree = NodeSyntaxTree;
var ChapterSyntaxTree = (function (_super) {
    __extends(ChapterSyntaxTree, _super);
    function ChapterSyntaxTree(data) {
        _super.call(this, data);
        this.headline = transform(this.checkObject(data.headline)).toHeadline();
        if (typeof data.text === "string" || data.text === null) {
            this.text = [];
            return;
        }
        this.text = this.checkArray(data.text.content).map(function (data) {
            return transform(data);
        });
        delete this.childNodes;
        this.childNodes = [];
    }
    Object.defineProperty(ChapterSyntaxTree.prototype, "level", {
        get: function () {
            return this.headline.level;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChapterSyntaxTree.prototype, "fqn", {
        get: function () {
            var chapters = [];
            walker_1.walk(this, function (node) {
                if (node instanceof ChapterSyntaxTree) {
                    chapters.unshift(node);
                }
                return node.parentNode;
            });
            var result = chapters.map(function (chapter) {
                return chapter.no;
            }).join(".");
            return result;
        },
        enumerable: true,
        configurable: true
    });
    return ChapterSyntaxTree;
})(NodeSyntaxTree);
exports.ChapterSyntaxTree = ChapterSyntaxTree;
var HeadlineSyntaxTree = (function (_super) {
    __extends(HeadlineSyntaxTree, _super);
    function HeadlineSyntaxTree(data) {
        _super.call(this, data);
        this.level = this.checkNumber(data.level);
        if (data.label) {
            this.label = transform(this.checkObject(data.label)).toArgument();
        }
        this.caption = transform(this.checkObject(data.caption)).toNode();
    }
    return HeadlineSyntaxTree;
})(SyntaxTree);
exports.HeadlineSyntaxTree = HeadlineSyntaxTree;
var BlockElementSyntaxTree = (function (_super) {
    __extends(BlockElementSyntaxTree, _super);
    function BlockElementSyntaxTree(data) {
        _super.call(this, data);
        this.symbol = this.checkString(data.symbol);
        this.args = this.checkArray(data.args).map(function (data) {
            return transform(data).toNode();
        });
    }
    return BlockElementSyntaxTree;
})(NodeSyntaxTree);
exports.BlockElementSyntaxTree = BlockElementSyntaxTree;
var InlineElementSyntaxTree = (function (_super) {
    __extends(InlineElementSyntaxTree, _super);
    function InlineElementSyntaxTree(data) {
        _super.call(this, data);
        this.symbol = this.checkString(data.symbol);
    }
    return InlineElementSyntaxTree;
})(NodeSyntaxTree);
exports.InlineElementSyntaxTree = InlineElementSyntaxTree;
var ColumnSyntaxTree = (function (_super) {
    __extends(ColumnSyntaxTree, _super);
    function ColumnSyntaxTree(data) {
        _super.call(this, data);
        this.headline = transform(this.checkObject(data.headline)).toColumnHeadline();
        if (typeof data.text === "string" || data.text === null) {
            this.text = [];
            return;
        }
        this.text = this.checkArray(data.text.content).map(function (data) {
            return transform(data);
        });
        delete this.childNodes;
        this.childNodes = [];
    }
    Object.defineProperty(ColumnSyntaxTree.prototype, "level", {
        get: function () {
            return this.headline.level;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ColumnSyntaxTree.prototype, "fqn", {
        get: function () {
            var chapters = [];
            walker_1.walk(this, function (node) {
                if (node instanceof ChapterSyntaxTree) {
                    chapters.unshift(node);
                }
                return node.parentNode;
            });
            var result = chapters.map(function (chapter) {
                return chapter.no;
            }).join(".");
            return result;
        },
        enumerable: true,
        configurable: true
    });
    return ColumnSyntaxTree;
})(NodeSyntaxTree);
exports.ColumnSyntaxTree = ColumnSyntaxTree;
var ColumnHeadlineSyntaxTree = (function (_super) {
    __extends(ColumnHeadlineSyntaxTree, _super);
    function ColumnHeadlineSyntaxTree(data) {
        _super.call(this, data);
        this.level = this.checkNumber(data.level);
        this.caption = transform(this.checkObject(data.caption)).toNode();
    }
    return ColumnHeadlineSyntaxTree;
})(SyntaxTree);
exports.ColumnHeadlineSyntaxTree = ColumnHeadlineSyntaxTree;
var ArgumentSyntaxTree = (function (_super) {
    __extends(ArgumentSyntaxTree, _super);
    function ArgumentSyntaxTree(data) {
        _super.call(this, data);
        this.arg = this.checkString(data.arg);
    }
    return ArgumentSyntaxTree;
})(SyntaxTree);
exports.ArgumentSyntaxTree = ArgumentSyntaxTree;
var UlistElementSyntaxTree = (function (_super) {
    __extends(UlistElementSyntaxTree, _super);
    function UlistElementSyntaxTree(data) {
        _super.call(this, data);
        this.level = this.checkNumber(data.level);
        this.text = transform(this.checkObject(data.text));
        delete this.childNodes;
        this.childNodes = [];
    }
    return UlistElementSyntaxTree;
})(NodeSyntaxTree);
exports.UlistElementSyntaxTree = UlistElementSyntaxTree;
var OlistElementSyntaxTree = (function (_super) {
    __extends(OlistElementSyntaxTree, _super);
    function OlistElementSyntaxTree(data) {
        _super.call(this, data);
        this.no = this.checkNumber(data.no);
        this.text = transform(this.checkObject(data.text));
    }
    return OlistElementSyntaxTree;
})(SyntaxTree);
exports.OlistElementSyntaxTree = OlistElementSyntaxTree;
var DlistElementSyntaxTree = (function (_super) {
    __extends(DlistElementSyntaxTree, _super);
    function DlistElementSyntaxTree(data) {
        _super.call(this, data);
        this.text = transform(this.checkObject(data.text));
        this.content = transform(this.checkObject(data.content));
    }
    return DlistElementSyntaxTree;
})(SyntaxTree);
exports.DlistElementSyntaxTree = DlistElementSyntaxTree;
var TextNodeSyntaxTree = (function (_super) {
    __extends(TextNodeSyntaxTree, _super);
    function TextNodeSyntaxTree(data) {
        _super.call(this, data);
        this.text = this.checkString(data.text).replace(/\n+$/, "");
    }
    return TextNodeSyntaxTree;
})(SyntaxTree);
exports.TextNodeSyntaxTree = TextNodeSyntaxTree;
var SingleLineCommentSyntaxTree = (function (_super) {
    __extends(SingleLineCommentSyntaxTree, _super);
    function SingleLineCommentSyntaxTree(data) {
        _super.call(this, data);
        this.text = this.checkString(data.text).replace(/^#@/, "").replace(/\n+$/, "");
    }
    return SingleLineCommentSyntaxTree;
})(SyntaxTree);
exports.SingleLineCommentSyntaxTree = SingleLineCommentSyntaxTree;

},{"../../resources/grammar":20,"./walker":17}],15:[function(require,module,exports){
"use strict";
var parser_1 = require("./parser");
var walker_1 = require("./walker");
var utils_1 = require("../utils/utils");
var SyntaxPreprocessor = (function () {
    function SyntaxPreprocessor() {
    }
    SyntaxPreprocessor.prototype.start = function (book) {
        var _this = this;
        this.acceptableSyntaxes = book.acceptableSyntaxes;
        book.predef.forEach(function (chunk) { return _this.preprocessChunk(chunk); });
        book.contents.forEach(function (chunk) { return _this.preprocessChunk(chunk); });
        book.appendix.forEach(function (chunk) { return _this.preprocessChunk(chunk); });
        book.postdef.forEach(function (chunk) { return _this.preprocessChunk(chunk); });
    };
    SyntaxPreprocessor.prototype.preprocessChunk = function (chunk) {
        var _this = this;
        walker_1.visit(chunk.tree.ast, {
            visitDefaultPre: function (node) {
            },
            visitColumnPre: function (node) {
                _this.preprocessColumnSyntax(chunk, node);
            },
            visitBlockElementPre: function (node) {
                _this.preprocessBlockSyntax(chunk, node);
            }
        });
        chunk.nodes.forEach(function (chunk) { return _this.preprocessChunk(chunk); });
    };
    SyntaxPreprocessor.prototype.preprocessColumnSyntax = function (chunk, column) {
        function reconstruct(parent, target, to) {
            if (to === void 0) { to = column.parentNode.toChapter(); }
            if (target.level <= to.level) {
                reconstruct(parent.parentNode.toNode(), target, to.parentNode.toChapter());
                return;
            }
            to.childNodes.splice(to.childNodes.indexOf(parent) + 1, 0, target);
            column.text.splice(column.text.indexOf(target), 1);
        }
        walker_1.visit(column, {
            visitDefaultPre: function (node) {
            },
            visitColumnPre: function (node) {
            },
            visitChapterPre: function (node) {
                if (column.level < node.headline.level) {
                    return;
                }
                reconstruct(column, node);
            }
        });
        walker_1.visit(chunk.tree.ast, {
            visitDefaultPre: function (ast, parent) {
                ast.parentNode = parent;
            }
        });
        walker_1.visit(chunk.tree.ast, {
            visitDefaultPre: function (ast, parent) {
            },
            visitChapterPre: function (ast) {
                ast.text.forEach(function (node, i, nodes) {
                    node.prev = nodes[i - 1];
                    node.next = nodes[i + 1];
                });
            },
            visitNodePre: function (ast) {
                ast.childNodes.forEach(function (node, i, nodes) {
                    node.prev = nodes[i - 1];
                    node.next = nodes[i + 1];
                });
            }
        });
    };
    SyntaxPreprocessor.prototype.preprocessBlockSyntax = function (chunk, node) {
        if (node.childNodes.length === 0) {
            return;
        }
        var syntaxes = this.acceptableSyntaxes.find(node);
        if (syntaxes.length !== 1) {
            return;
        }
        var syntax = syntaxes[0];
        if (syntax.allowFullySyntax) {
            return;
        }
        else if (syntax.allowInline) {
            var info;
            var resultNodes = [];
            var lastNode;
            walker_1.visit(node.childNodes[0], {
                visitDefaultPre: function (node) {
                    if (!info) {
                        info = {
                            offset: node.location.start.offset,
                            line: node.location.start.line,
                            column: node.location.start.column
                        };
                    }
                    lastNode = node;
                },
                visitInlineElementPre: function (node) {
                    var textNode = new parser_1.TextNodeSyntaxTree({
                        syntax: "BlockElementContentText",
                        location: {
                            start: {
                                offset: info.offset,
                                line: info.line,
                                column: info.column
                            },
                            end: {
                                offset: node.location.start.offset - 1,
                                line: null,
                                column: null
                            }
                        },
                        text: chunk.process.input.substring(info.offset, node.location.start.offset - 1)
                    });
                    if (textNode.text) {
                        resultNodes.push(textNode);
                    }
                    resultNodes.push(textNode);
                    resultNodes.push(node);
                    info = null;
                    lastNode = node;
                },
                visitSingleLineCommentPre: function (node) {
                    if (!info) {
                        lastNode = node;
                        return;
                    }
                    var textNode = new parser_1.TextNodeSyntaxTree({
                        syntax: "BlockElementContentText",
                        location: {
                            start: {
                                offset: info.offset,
                                line: info.line,
                                column: info.column
                            },
                            end: {
                                offset: node.location.start.offset - 1,
                                line: null,
                                column: null
                            }
                        },
                        text: chunk.process.input.substring(info.offset, node.location.start.offset - 1)
                    });
                    if (textNode.text) {
                        resultNodes.push(textNode);
                    }
                    info = null;
                    lastNode = node;
                }
            });
            if (info) {
                var textNode = new parser_1.TextNodeSyntaxTree({
                    syntax: "BlockElementContentText",
                    location: {
                        start: {
                            offset: info.offset,
                            line: info.line,
                            column: info.column
                        },
                        end: {
                            offset: node.location.start.offset - 1,
                            line: null,
                            column: null
                        }
                    },
                    text: chunk.process.input.substring(info.offset, lastNode.location.end.offset)
                });
                if (textNode.text) {
                    resultNodes.push(textNode);
                }
            }
            node.childNodes = resultNodes;
        }
        else {
            var first = node.childNodes[0];
            var last = node.childNodes[node.childNodes.length - 1];
            var textNode = new parser_1.TextNodeSyntaxTree({
                syntax: "BlockElementContentText",
                location: {
                    start: {
                        offset: first.location.start.offset,
                        line: first.location.start.line,
                        column: first.location.start.column
                    },
                    end: {
                        offset: last.location.start.offset - 1,
                        line: null,
                        column: null
                    }
                },
                text: utils_1.nodeContentToString(chunk.process, node)
            });
            node.childNodes = [textNode];
        }
    };
    return SyntaxPreprocessor;
})();
exports.SyntaxPreprocessor = SyntaxPreprocessor;

},{"../utils/utils":19,"./parser":14,"./walker":17}],16:[function(require,module,exports){
"use strict";
var i18n_1 = require("../i18n/i18n");
var analyzer_1 = require("./analyzer");
var walker_1 = require("./walker");
var utils_1 = require("../utils/utils");
var DefaultValidator = (function () {
    function DefaultValidator() {
    }
    DefaultValidator.prototype.start = function (book, acceptableSyntaxes, builders) {
        this.acceptableSyntaxes = acceptableSyntaxes;
        this.builders = builders;
        this.checkBuilder(book, acceptableSyntaxes, builders);
        this.checkBook(book);
        this.resolveSymbolAndReference(book);
    };
    DefaultValidator.prototype.checkBuilder = function (book, acceptableSyntaxes, builders) {
        if (builders === void 0) { builders = []; }
        acceptableSyntaxes.acceptableSyntaxes.forEach(function (syntax) {
            var prefix;
            switch (syntax.type) {
                case analyzer_1.SyntaxType.Other:
                    return;
                case analyzer_1.SyntaxType.Block:
                    prefix = "block_";
                    break;
                case analyzer_1.SyntaxType.Inline:
                    prefix = "inline_";
                    break;
            }
            var funcName1 = prefix + syntax.symbolName;
            var funcName2 = prefix + syntax.symbolName + "_pre";
            builders.forEach(function (builder) {
                var func = builder[funcName1] || builder[funcName2];
                if (!func) {
                    book.process.error(analyzer_1.SyntaxType[syntax.type] + " " + syntax.symbolName + " is not supported in " + builder.name);
                }
            });
        });
    };
    DefaultValidator.prototype.checkBook = function (book) {
        var _this = this;
        book.predef.forEach(function (chunk) { return _this.checkChunk(chunk); });
        book.contents.forEach(function (chunk) { return _this.checkChunk(chunk); });
        book.appendix.forEach(function (chunk) { return _this.checkChunk(chunk); });
        book.postdef.forEach(function (chunk) { return _this.checkChunk(chunk); });
    };
    DefaultValidator.prototype.checkChunk = function (chunk) {
        var _this = this;
        walker_1.visit(chunk.tree.ast, {
            visitDefaultPre: function (node) {
            },
            visitHeadlinePre: function (node) {
                var results = _this.acceptableSyntaxes.find(node);
                if (results.length !== 1) {
                    chunk.process.error(i18n_1.t("compile.syntax_definietion_error"), node);
                    return;
                }
                return results[0].process(chunk.process, node);
            },
            visitColumnPre: function (node) {
                var results = _this.acceptableSyntaxes.find(node);
                if (results.length !== 1) {
                    chunk.process.error(i18n_1.t("compile.syntax_definietion_error"), node);
                    return;
                }
                return results[0].process(chunk.process, node);
            },
            visitBlockElementPre: function (node) {
                var results = _this.acceptableSyntaxes.find(node);
                if (results.length !== 1) {
                    chunk.process.error(i18n_1.t("compile.block_not_supported", node.symbol), node);
                    return;
                }
                var expects = results[0].argsLength;
                var arg = node.args || [];
                if (expects.indexOf(arg.length) === -1) {
                    var expected = expects.map(function (n) { return Number(n).toString(); }).join(" or ");
                    var message = i18n_1.t("compile.args_length_mismatch", expected, arg.length);
                    chunk.process.error(message, node);
                    return;
                }
                return results[0].process(chunk.process, node);
            },
            visitInlineElementPre: function (node) {
                var results = _this.acceptableSyntaxes.find(node);
                if (results.length !== 1) {
                    chunk.process.error(i18n_1.t("compile.inline_not_supported", node.symbol), node);
                    return;
                }
                return results[0].process(chunk.process, node);
            }
        });
        walker_1.visit(chunk.tree.ast, {
            visitDefaultPre: function (node) {
            },
            visitChapterPre: function (node) {
                if (node.level === 1) {
                    if (!utils_1.findChapter(node)) {
                        chunk.process.error(i18n_1.t("compile.chapter_not_toplevel"), node);
                    }
                }
                else {
                    var parent_1 = utils_1.findChapter(node.parentNode);
                    if (!parent_1) {
                        chunk.process.error(i18n_1.t("compile.chapter_topleve_eq1"), node);
                    }
                }
            }
        });
        this.chechBlockGraphTool(chunk);
    };
    DefaultValidator.prototype.chechBlockGraphTool = function (chunk) {
        walker_1.visit(chunk.tree.ast, {
            visitDefaultPre: function (node) {
            },
            visitBlockElementPre: function (node) {
                if (node.symbol !== "graph") {
                    return;
                }
                var toolNameNode = node.args[1];
                if (!toolNameNode) {
                    return;
                }
                var toolName = utils_1.nodeContentToString(chunk.process, toolNameNode);
                switch (toolName) {
                    case "graphviz":
                        break;
                    case "gnuplot":
                    case "blockdiag":
                    case "aafigure":
                        chunk.process.info(i18n_1.t("compile.graph_tool_is_not_recommended"), toolNameNode);
                        break;
                    default:
                        chunk.process.error(i18n_1.t("compile.unknown_graph_tool", toolName), toolNameNode);
                }
            }
        });
    };
    DefaultValidator.prototype.resolveSymbolAndReference = function (book) {
        var symbols = book.allChunks.reduce(function (p, c) { return p.concat(c.process.symbols); }, []);
        symbols.forEach(function (symbol) {
            var referenceTo = symbol.referenceTo;
            if (!referenceTo) {
                return;
            }
            if (!referenceTo.part && referenceTo.partName) {
                book.allChunks.forEach(function (chunk) {
                    if (referenceTo.partName === chunk.name) {
                        referenceTo.part = chunk;
                    }
                });
            }
            if (!referenceTo.chapter && referenceTo.chapterName) {
                referenceTo.part.nodes.forEach(function (chunk) {
                    if (referenceTo.chapterName === chunk.name) {
                        referenceTo.chapter = chunk;
                    }
                });
            }
        });
        symbols.forEach(function (symbol) {
            if (symbol.referenceTo && !symbol.referenceTo.referenceNode) {
                var reference = symbol.referenceTo;
                symbols.forEach(function (symbol) {
                    if (reference.part === symbol.part && reference.chapter === symbol.chapter && reference.targetSymbol === symbol.symbolName && reference.label === symbol.labelName) {
                        reference.referenceNode = symbol.node;
                    }
                });
                if (!reference.referenceNode) {
                    symbol.chapter.process.error(i18n_1.t("compile.reference_is_missing", reference.targetSymbol, reference.label), symbol.node);
                    return;
                }
            }
        });
        symbols.forEach(function (symbol1) {
            symbols.forEach(function (symbol2) {
                if (symbol1 === symbol2) {
                    return;
                }
                if (symbol1.chapter === symbol2.chapter && symbol1.symbolName === symbol2.symbolName) {
                    if (symbol1.labelName && symbol2.labelName && symbol1.labelName === symbol2.labelName) {
                        symbol1.chapter.process.error(i18n_1.t("compile.duplicated_label"), symbol1.node, symbol2.node);
                        return;
                    }
                }
            });
        });
    };
    return DefaultValidator;
})();
exports.DefaultValidator = DefaultValidator;

},{"../i18n/i18n":8,"../utils/utils":19,"./analyzer":13,"./walker":17}],17:[function(require,module,exports){
"use strict";
var parser_1 = require("./parser");
function walk(ast, actor) {
    "use strict";
    if (!ast) {
        return;
    }
    var next = actor(ast);
    if (next) {
        walk(next, actor);
    }
}
exports.walk = walk;
function visit(ast, v) {
    "use strict";
    _visit(function () { return new SyncTaskPool(); }, ast, v);
}
exports.visit = visit;
function visitAsync(ast, v) {
    "use strict";
    return Promise.resolve(_visit(function () { return new AsyncTaskPool(); }, ast, v));
}
exports.visitAsync = visitAsync;
function _visit(poolGenerator, ast, v) {
    "use strict";
    var newV = {
        visitDefaultPre: v.visitDefaultPre,
        visitDefaultPost: v.visitDefaultPost || (function () {
        }),
        visitBlockElementPre: v.visitBlockElementPre || v.visitNodePre || v.visitDefaultPre,
        visitBlockElementPost: v.visitBlockElementPost || v.visitNodePost || v.visitDefaultPost || (function () {
        }),
        visitInlineElementPre: v.visitInlineElementPre || v.visitNodePre || v.visitDefaultPre,
        visitInlineElementPost: v.visitInlineElementPost || v.visitNodePost || v.visitDefaultPost || (function () {
        }),
        visitNodePre: v.visitNodePre || v.visitDefaultPre,
        visitNodePost: v.visitNodePost || v.visitDefaultPost || (function () {
        }),
        visitArgumentPre: v.visitArgumentPre || v.visitDefaultPre,
        visitArgumentPost: v.visitArgumentPost || v.visitDefaultPost || (function () {
        }),
        visitChapterPre: v.visitChapterPre || v.visitNodePre || v.visitDefaultPre,
        visitChapterPost: v.visitChapterPost || v.visitNodePost || v.visitDefaultPost || (function () {
        }),
        visitParagraphPre: v.visitParagraphPre || v.visitNodePre || v.visitDefaultPre,
        visitParagraphPost: v.visitParagraphPost || v.visitNodePost || (function () {
        }),
        visitHeadlinePre: v.visitHeadlinePre || v.visitDefaultPre,
        visitHeadlinePost: v.visitHeadlinePost || v.visitDefaultPost || (function () {
        }),
        visitUlistPre: v.visitUlistPre || v.visitNodePre || v.visitDefaultPre,
        visitUlistPost: v.visitUlistPost || v.visitNodePost || v.visitDefaultPost || (function () {
        }),
        visitOlistPre: v.visitOlistPre || v.visitDefaultPre,
        visitOlistPost: v.visitOlistPost || v.visitDefaultPost || (function () {
        }),
        visitDlistPre: v.visitDlistPre || v.visitDefaultPre,
        visitDlistPost: v.visitDlistPost || v.visitDefaultPost || (function () {
        }),
        visitColumnPre: v.visitColumnPre || v.visitNodePre || v.visitDefaultPre,
        visitColumnPost: v.visitColumnPost || v.visitNodePost || v.visitDefaultPost || (function () {
        }),
        visitColumnHeadlinePre: v.visitColumnHeadlinePre || v.visitDefaultPre,
        visitColumnHeadlinePost: v.visitColumnHeadlinePost || v.visitDefaultPost || (function () {
        }),
        visitTextPre: v.visitTextPre || v.visitDefaultPre,
        visitTextPost: v.visitTextPost || v.visitDefaultPost || (function () {
        }),
        visitSingleLineCommentPre: v.visitSingleLineCommentPre || v.visitDefaultPre,
        visitSingleLineCommentPost: v.visitSingleLineCommentPost || v.visitDefaultPost || (function () {
        })
    };
    newV.visitDefaultPre = newV.visitDefaultPre.bind(v);
    newV.visitDefaultPost = newV.visitDefaultPost.bind(v);
    newV.visitBlockElementPre = newV.visitBlockElementPre.bind(v);
    newV.visitBlockElementPost = newV.visitBlockElementPost.bind(v);
    newV.visitInlineElementPre = newV.visitInlineElementPre.bind(v);
    newV.visitInlineElementPost = newV.visitInlineElementPost.bind(v);
    newV.visitNodePre = newV.visitNodePre.bind(v);
    newV.visitNodePost = newV.visitNodePost.bind(v);
    newV.visitArgumentPre = newV.visitArgumentPre.bind(v);
    newV.visitArgumentPost = newV.visitArgumentPost.bind(v);
    newV.visitChapterPre = newV.visitChapterPre.bind(v);
    newV.visitChapterPost = newV.visitChapterPost.bind(v);
    newV.visitHeadlinePre = newV.visitHeadlinePre.bind(v);
    newV.visitHeadlinePost = newV.visitHeadlinePost.bind(v);
    newV.visitUlistPre = newV.visitUlistPre.bind(v);
    newV.visitUlistPost = newV.visitUlistPost.bind(v);
    newV.visitOlistPre = newV.visitOlistPre.bind(v);
    newV.visitOlistPost = newV.visitOlistPost.bind(v);
    newV.visitDlistPre = newV.visitDlistPre.bind(v);
    newV.visitDlistPost = newV.visitDlistPost.bind(v);
    newV.visitColumnPre = newV.visitColumnPre.bind(v);
    newV.visitColumnPost = newV.visitColumnPost.bind(v);
    newV.visitColumnHeadlinePre = newV.visitColumnHeadlinePre.bind(v);
    newV.visitColumnHeadlinePost = newV.visitColumnHeadlinePost.bind(v);
    newV.visitTextPre = newV.visitTextPre.bind(v);
    newV.visitTextPost = newV.visitTextPost.bind(v);
    newV.visitSingleLineCommentPre = newV.visitSingleLineCommentPre.bind(v);
    newV.visitSingleLineCommentPost = newV.visitSingleLineCommentPost.bind(v);
    return _visitSub(poolGenerator, null, ast, newV);
}
function _visitSub(poolGenerator, parent, ast, v) {
    "use strict";
    if (ast instanceof parser_1.BlockElementSyntaxTree) {
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitBlockElementPre(ast, parent);
            pool.handle(ret, {
                next: function () {
                    ast.args.forEach(function (next) {
                        pool.add(function () { return _visitSub(poolGenerator, ast, next, v); });
                    });
                    ast.childNodes.forEach(function (next) {
                        pool.add(function () { return _visitSub(poolGenerator, ast, next, v); });
                    });
                },
                func: function () {
                    ret(v);
                }
            });
            pool.add(function () { return v.visitBlockElementPost(ast, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.InlineElementSyntaxTree) {
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitInlineElementPre(ast, parent);
            pool.handle(ret, {
                next: function () {
                    ast.childNodes.forEach(function (next) {
                        pool.add(function () { return _visitSub(poolGenerator, ast, next, v); });
                    });
                },
                func: function () {
                    ret(v);
                }
            });
            pool.add(function () { return v.visitInlineElementPost(ast, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.ArgumentSyntaxTree) {
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitArgumentPre(ast, parent);
            pool.handle(ret, {
                next: function () {
                },
                func: function () {
                    ret(v);
                }
            });
            pool.add(function () { return v.visitArgumentPost(ast, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.ChapterSyntaxTree) {
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitChapterPre(ast, parent);
            pool.handle(ret, {
                next: function () {
                    pool.add(function () { return _visitSub(poolGenerator, ast, ast.headline, v); });
                    if (ast.text) {
                        ast.text.forEach(function (next) {
                            pool.add(function () { return _visitSub(poolGenerator, ast, next, v); });
                        });
                    }
                    ast.childNodes.forEach(function (next) {
                        pool.add(function () { return _visitSub(poolGenerator, ast, next, v); });
                    });
                },
                func: function () {
                    ret(v);
                }
            });
            pool.add(function () { return v.visitChapterPost(ast, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.HeadlineSyntaxTree) {
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitHeadlinePre(ast, parent);
            pool.handle(ret, {
                next: function () {
                    pool.add(function () { return _visitSub(poolGenerator, ast, ast.label, v); });
                    pool.add(function () { return _visitSub(poolGenerator, ast, ast.caption, v); });
                },
                func: function () {
                    ret(v);
                }
            });
            pool.add(function () { return v.visitHeadlinePost(ast, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.ColumnSyntaxTree) {
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitColumnPre(ast, parent);
            pool.handle(ret, {
                next: function () {
                    pool.add(function () { return _visitSub(poolGenerator, ast, ast.headline, v); });
                    if (ast.text) {
                        ast.text.forEach(function (next) {
                            pool.add(function () { return _visitSub(poolGenerator, ast, next, v); });
                        });
                    }
                },
                func: function () {
                    ret(v);
                }
            });
            pool.add(function () { return v.visitColumnPost(ast, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.ColumnHeadlineSyntaxTree) {
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitColumnHeadlinePre(ast, parent);
            pool.handle(ret, {
                next: function () {
                    pool.add(function () { return _visitSub(poolGenerator, ast, ast.caption, v); });
                },
                func: function () {
                    ret(v);
                }
            });
            pool.add(function () { return v.visitColumnHeadlinePost(ast, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.UlistElementSyntaxTree) {
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitUlistPre(ast, parent);
            pool.handle(ret, {
                next: function () {
                    pool.add(function () { return _visitSub(poolGenerator, ast, ast.text, v); });
                    ast.childNodes.forEach(function (next) {
                        pool.add(function () { return _visitSub(poolGenerator, ast, next, v); });
                    });
                },
                func: function () {
                    ret(v);
                }
            });
            pool.add(function () { return v.visitUlistPost(ast, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.OlistElementSyntaxTree) {
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitOlistPre(ast, parent);
            pool.handle(ret, {
                next: function () {
                    pool.add(function () { return _visitSub(poolGenerator, ast, ast.text, v); });
                },
                func: function () {
                    ret(v);
                }
            });
            pool.add(function () { return v.visitOlistPost(ast, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.DlistElementSyntaxTree) {
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitDlistPre(ast, parent);
            pool.handle(ret, {
                next: function () {
                    pool.add(function () { return _visitSub(poolGenerator, ast, ast.text, v); });
                    pool.add(function () { return _visitSub(poolGenerator, ast, ast.content, v); });
                },
                func: function () {
                    ret(v);
                }
            });
            pool.add(function () { return v.visitDlistPost(ast, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.NodeSyntaxTree && (ast.ruleName === parser_1.RuleName.Paragraph || ast.ruleName === parser_1.RuleName.BlockElementParagraph)) {
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitParagraphPre(ast, parent);
            pool.handle(ret, {
                next: function () {
                    ast.childNodes.forEach(function (next) {
                        pool.add(function () { return _visitSub(poolGenerator, ast, next, v); });
                    });
                },
                func: function () {
                    ret(v);
                }
            });
            pool.add(function () { return v.visitParagraphPost(ast, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.NodeSyntaxTree) {
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitNodePre(ast, parent);
            pool.handle(ret, {
                next: function () {
                    ast.childNodes.forEach(function (next) {
                        pool.add(function () { return _visitSub(poolGenerator, ast, next, v); });
                    });
                },
                func: function () {
                    ret(v);
                }
            });
            pool.add(function () { return v.visitNodePost(ast, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.TextNodeSyntaxTree) {
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitTextPre(ast, parent);
            pool.handle(ret, {
                next: function () {
                },
                func: function () {
                    ret(v);
                }
            });
            pool.add(function () { return v.visitTextPost(ast, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.SingleLineCommentSyntaxTree) {
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitSingleLineCommentPre(ast, parent);
            pool.handle(ret, {
                next: function () {
                },
                func: function () {
                    ret(v);
                }
            });
            pool.add(function () { return v.visitSingleLineCommentPost(ast, parent); });
            return pool.consume();
        })();
    }
    else if (ast) {
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitDefaultPre(parent, ast);
            pool.handle(ret, {
                next: function () {
                },
                func: function () {
                    ret(v);
                }
            });
            pool.add(function () { return v.visitDefaultPost(parent, ast); });
            return pool.consume();
        })();
    }
    else {
        return (function () {
            var pool = poolGenerator();
            return pool.consume();
        })();
    }
}
var SyncTaskPool = (function () {
    function SyncTaskPool() {
        this.tasks = [];
    }
    SyncTaskPool.prototype.add = function (value) {
        this.tasks.push(value);
    };
    SyncTaskPool.prototype.handle = function (value, statements) {
        if (typeof value === "undefined" || (typeof value === "boolean" && value)) {
            statements.next();
        }
        else if (typeof value === "function") {
            statements.func();
        }
    };
    SyncTaskPool.prototype.consume = function () {
        return this.tasks.map(function (task) { return task(); });
    };
    return SyncTaskPool;
})();
var AsyncTaskPool = (function () {
    function AsyncTaskPool() {
        this.tasks = [];
    }
    AsyncTaskPool.prototype.add = function (value) {
        this.tasks.push(function () { return Promise.resolve(value()); });
    };
    AsyncTaskPool.prototype.handle = function (value, statements) {
        if (typeof value === "undefined" || (typeof value === "boolean" && value)) {
            statements.next();
        }
        else if (value && typeof value.then === "function") {
            this.tasks.push(function () { return Promise.resolve(value); });
        }
        else if (typeof value === "function") {
            statements.func();
        }
    };
    AsyncTaskPool.prototype.consume = function () {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var result = [];
            var next = function () {
                var func = _this.tasks.shift();
                if (!func) {
                    resolve(result);
                    return;
                }
                func().then(function (value) {
                    result.push(value);
                    next();
                });
            };
            next();
        });
        return promise;
    };
    return AsyncTaskPool;
})();

},{"./parser":14}],18:[function(require,module,exports){
"use strict";
var parser_1 = require("../parser/parser");
var env;
function checkRuleName(ruleName) {
    "use strict";
    if (!parser_1.RuleName[ruleName]) {
        throw new Error("unknown rule: " + ruleName);
    }
    return ruleName;
}
function setup(_env) {
    "use strict";
    env = _env;
}
exports.setup = setup;
function content(ruleName, c) {
    "use strict";
    return {
        syntax: checkRuleName(ruleName),
        location: env.location(),
        content: c
    };
}
exports.content = content;
function contents(ruleName, c, cc) {
    "use strict";
    var processed = [c];
    if (cc) {
        if (Array.isArray(cc.content)) {
            cc.content.forEach(function (c) { return processed.push(c); });
        }
        else {
            processed.push(cc.content);
        }
    }
    return {
        syntax: checkRuleName(ruleName),
        location: env.location(),
        content: processed
    };
}
exports.contents = contents;
function text(ruleName, text) {
    "use strict";
    return {
        syntax: checkRuleName(ruleName),
        location: env.location(),
        text: text
    };
}
exports.text = text;
function chapter(headline, text) {
    "use strict";
    return {
        syntax: checkRuleName("Chapter"),
        location: env.location(),
        headline: headline,
        text: text
    };
}
exports.chapter = chapter;
function headline(level, label, caption) {
    "use strict";
    return {
        syntax: checkRuleName("Headline"),
        location: env.location(),
        level: level.length,
        label: label,
        caption: caption
    };
}
exports.headline = headline;
function blockElement(symbol, args, contents) {
    "use strict";
    if (contents === void 0) { contents = []; }
    return {
        syntax: checkRuleName("BlockElement"),
        location: env.location(),
        symbol: symbol,
        args: args,
        content: contents
    };
}
exports.blockElement = blockElement;
function inlineElement(symbol, contents) {
    "use strict";
    if (contents === void 0) { contents = []; }
    return {
        syntax: checkRuleName("InlineElement"),
        location: env.location(),
        symbol: symbol,
        content: contents
    };
}
exports.inlineElement = inlineElement;
function column(headline, text) {
    "use strict";
    return {
        syntax: checkRuleName("Column"),
        location: env.location(),
        headline: headline,
        text: text
    };
}
exports.column = column;
function columnHeadline(level, caption) {
    "use strict";
    return {
        syntax: checkRuleName("ColumnHeadline"),
        location: env.location(),
        level: level.length,
        caption: caption
    };
}
exports.columnHeadline = columnHeadline;
function columnTerminator(level) {
    "use strict";
    return {
        syntax: checkRuleName("ColumnTerminator"),
        location: env.location(),
        level: level.length
    };
}
exports.columnTerminator = columnTerminator;
function braceArg(arg) {
    "use strict";
    return {
        syntax: checkRuleName("BraceArg"),
        location: env.location(),
        arg: arg
    };
}
exports.braceArg = braceArg;
function ulistElement(level, text) {
    "use strict";
    return {
        syntax: checkRuleName("UlistElement"),
        location: env.location(),
        level: level.length,
        text: text
    };
}
exports.ulistElement = ulistElement;
function olistElement(n, text) {
    "use strict";
    return {
        syntax: checkRuleName("OlistElement"),
        location: env.location(),
        no: parseInt(n, 10),
        text: text
    };
}
exports.olistElement = olistElement;
function dlistElement(text, content) {
    "use strict";
    return {
        syntax: checkRuleName("DlistElement"),
        location: env.location(),
        text: text,
        content: content
    };
}
exports.dlistElement = dlistElement;

},{"../parser/parser":14}],19:[function(require,module,exports){
"use strict";
var compilerModel_1 = require("../model/compilerModel");
var parser_1 = require("../parser/parser");
var textBuilder_1 = require("../builder/textBuilder");
var htmlBuilder_1 = require("../builder/htmlBuilder");
var analyzer_1 = require("../parser/analyzer");
var validator_1 = require("../parser/validator");
var walker_1 = require("../parser/walker");
var index_1 = require("../index");
false && compilerModel_1.Book;
function isBrowser() {
    "use strict";
    return typeof window !== "undefined";
}
exports.isBrowser = isBrowser;
function isNodeJS() {
    "use strict";
    if (typeof atom !== "undefined") {
        return true;
    }
    return !isBrowser() && !isAMD() && typeof exports === "object";
}
exports.isNodeJS = isNodeJS;
function isAMD() {
    "use strict";
    return typeof define === "function" && define.amd;
}
exports.isAMD = isAMD;
function flatten(data) {
    "use strict";
    if (data.some(function (d) { return Array.isArray(d); })) {
        return flatten(data.reduce(function (p, c) { return p.concat(c); }, []));
    }
    else {
        return data;
    }
}
exports.flatten = flatten;
function nodeToString(process, node) {
    "use strict";
    return process.input.substring(node.location.start.offset, node.location.end.offset);
}
exports.nodeToString = nodeToString;
function nodeContentToString(process, node) {
    "use strict";
    var minPos = Number.MAX_VALUE;
    var maxPos = -1;
    var childVisitor = {
        visitDefaultPre: function (node) {
            minPos = Math.min(minPos, node.location.start.offset);
            maxPos = Math.max(maxPos, node.location.end.offset);
        }
    };
    walker_1.visit(node, {
        visitDefaultPre: function (node) {
        },
        visitNodePre: function (node) {
            node.childNodes.forEach(function (child) { return walker_1.visit(child, childVisitor); });
            return false;
        },
        visitHeadlinePre: function (node) {
            walker_1.visit(node.caption, childVisitor);
            return false;
        },
        visitUlistPre: function (node) {
            walker_1.visit(node.text, childVisitor);
            return false;
        },
        visitDlistPre: function (node) {
            walker_1.visit(node.text, childVisitor);
            walker_1.visit(node.content, childVisitor);
            return false;
        },
        visitOlistPre: function (node) {
            walker_1.visit(node.text, childVisitor);
            return false;
        },
        visitTextPre: function (text) {
            walker_1.visit(node, childVisitor);
            return false;
        }
    });
    if (maxPos < 0) {
        return "";
    }
    else {
        return process.input.substring(minPos, maxPos);
    }
}
exports.nodeContentToString = nodeContentToString;
function findUp(node, predicate) {
    "use strict";
    var result = null;
    walker_1.walk(node, function (node) {
        if (predicate(node)) {
            result = node;
            return null;
        }
        return node.parentNode;
    });
    return result;
}
exports.findUp = findUp;
function findChapter(node, level) {
    "use strict";
    var chapter = null;
    walker_1.walk(node, function (node) {
        if (node instanceof parser_1.ChapterSyntaxTree) {
            chapter = node;
            if (typeof level === "undefined" || node.level === level) {
                return null;
            }
        }
        return node.parentNode;
    });
    return chapter;
}
exports.findChapter = findChapter;
function findChapterOrColumn(node, level) {
    "use strict";
    var chapter = null;
    var column = null;
    walker_1.walk(node, function (node) {
        if (node instanceof parser_1.ChapterSyntaxTree) {
            chapter = node;
            if (typeof level === "undefined" || node.level === level) {
                return null;
            }
        }
        else if (node instanceof parser_1.ColumnSyntaxTree) {
            column = node;
            if (typeof level === "undefined" || node.level === level) {
                return null;
            }
        }
        return node.parentNode;
    });
    return chapter || column;
}
exports.findChapterOrColumn = findChapterOrColumn;
function target2builder(target) {
    "use strict";
    var builderName = target.charAt(0).toUpperCase() + target.substring(1) + "Builder";
    if (builderName === "TextBuilder") {
        return new textBuilder_1.TextBuilder();
    }
    if (builderName === "HtmlBuilder") {
        return new htmlBuilder_1.HtmlBuilder();
    }
    return null;
}
exports.target2builder = target2builder;
var IO;
(function (IO) {
    "use strict";
    function read(path) {
        var fs = require("fs");
        return new Promise(function (resolve, reject) {
            fs.readFile(path, { encoding: "utf8" }, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    IO.read = read;
    function write(path, content) {
        var fs = require("fs");
        return new Promise(function (resolve, reject) {
            fs.writeFile(path, content, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(null);
                }
            });
        });
    }
    IO.write = write;
})(IO = exports.IO || (exports.IO = {}));
function linesToFigure(lines) {
    "use strict";
    return String(lines).length;
}
exports.linesToFigure = linesToFigure;
function padLeft(str, pad, maxLength) {
    "use strict";
    if (maxLength <= str.length) {
        return str;
    }
    return stringRepeat(maxLength - str.length, pad) + str;
}
exports.padLeft = padLeft;
function stringRepeat(times, src) {
    "use strict";
    return new Array(times + 1).join(src);
}
exports.stringRepeat = stringRepeat;
var Exec;
(function (Exec) {
    "use strict";
    function singleCompile(input, fileName, target, tmpConfig) {
        "use strict";
        var config = tmpConfig || {};
        config.read = config.read || (function () { return Promise.resolve(input); });
        config.analyzer = config.analyzer || new analyzer_1.DefaultAnalyzer();
        config.validators = config.validators || [new validator_1.DefaultValidator()];
        if (target && target2builder(target) == null) {
            console.error(target + " is not exists in builder");
            process.exit(1);
        }
        config.builders = config.builders || target ? [target2builder(target)] : [new textBuilder_1.TextBuilder()];
        config.book = config.book || {
            contents: [
                { file: fileName }
            ]
        };
        config.book.contents = config.book.contents || [
            { file: fileName }
        ];
        var results = {};
        config.write = config.write || (function (path, content) { return results[path] = content; });
        config.listener = config.listener || {
            onReports: function () {
            },
            onCompileSuccess: function () {
            },
            onCompileFailed: function () {
            }
        };
        config.listener.onReports = config.listener.onReports || (function () {
        });
        config.listener.onCompileSuccess = config.listener.onCompileSuccess || (function () {
        });
        config.listener.onCompileFailed = config.listener.onCompileFailed || (function () {
        });
        var success;
        var originalCompileSuccess = config.listener.onCompileSuccess;
        config.listener.onCompileSuccess = function (book) {
            success = true;
            originalCompileSuccess(book);
        };
        var originalCompileFailed = config.listener.onCompileFailed;
        config.listener.onCompileFailed = function (book) {
            success = false;
            originalCompileFailed(book);
        };
        return index_1.start(function (review) {
            review.initConfig(config);
        })
            .then(function (book) {
            return {
                book: book,
                results: results
            };
        });
    }
    Exec.singleCompile = singleCompile;
})(Exec = exports.Exec || (exports.Exec = {}));

},{"../builder/htmlBuilder":2,"../builder/textBuilder":3,"../index":10,"../model/compilerModel":12,"../parser/analyzer":13,"../parser/parser":14,"../parser/validator":16,"../parser/walker":17,"fs":undefined}],20:[function(require,module,exports){
module.exports = (function() {
  "use strict";

  /*
   * Generated by PEG.js 0.9.0.
   *
   * http://pegjs.org/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function peg$SyntaxError(message, expected, found, location) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.location = location;
    this.name     = "SyntaxError";

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, peg$SyntaxError);
    }
  }

  peg$subclass(peg$SyntaxError, Error);

  function peg$parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},
        parser  = this,

        peg$FAILED = {},

        peg$startRuleFunctions = { Start: peg$parseStart },
        peg$startRuleFunction  = peg$parseStart,

        peg$c0 = { type: "other", description: "start" },
        peg$c1 = function(c) { return b.content("Start", c); },
        peg$c2 = { type: "other", description: "chapters" },
        peg$c3 = function(c, cc) { return b.contents("Chapters", c, cc); },
        peg$c4 = { type: "other", description: "chapter" },
        peg$c5 = function(headline, text) { return b.chapter(headline, text); },
        peg$c6 = { type: "other", description: "headline" },
        peg$c7 = "=",
        peg$c8 = { type: "literal", value: "=", description: "\"=\"" },
        peg$c9 = function(level, label, caption) { return b.headline(level, label, caption); },
        peg$c10 = { type: "other", description: "contents" },
        peg$c11 = { type: "any", description: "any character" },
        peg$c12 = function(c, cc) { return b.contents("Contents", c, cc); },
        peg$c13 = { type: "other", description: "content" },
        peg$c14 = function(c) { return b.content("Content", c); },
        peg$c15 = { type: "other", description: "paragraph" },
        peg$c16 = function(c) { return b.content("Paragraph", c); },
        peg$c17 = { type: "other", description: "paragraph subs" },
        peg$c18 = function(c, cc) { return b.contents("ParagraphSubs", c, cc); },
        peg$c19 = { type: "other", description: "paragraph sub" },
        peg$c20 = function(c) { return b.content("ParagraphSub", c); },
        peg$c21 = { type: "other", description: "text of content" },
        peg$c22 = /^[^\r\n]/,
        peg$c23 = { type: "class", value: "[^\\r\\n]", description: "[^\\r\\n]" },
        peg$c24 = function(text) { return b.text("ContentText", text); },
        peg$c25 = { type: "other", description: "block element" },
        peg$c26 = "//",
        peg$c27 = { type: "literal", value: "//", description: "\"//\"" },
        peg$c28 = "{",
        peg$c29 = { type: "literal", value: "{", description: "\"{\"" },
        peg$c30 = "//}",
        peg$c31 = { type: "literal", value: "//}", description: "\"//}\"" },
        peg$c32 = function(symbol, args, contents) { return b.blockElement(symbol, args, contents); },
        peg$c33 = function(symbol, args) { return b.blockElement(symbol, args); },
        peg$c34 = { type: "other", description: "inline element" },
        peg$c35 = "@<",
        peg$c36 = { type: "literal", value: "@<", description: "\"@<\"" },
        peg$c37 = /^[^>\r\n]/,
        peg$c38 = { type: "class", value: "[^>\\r\\n]", description: "[^>\\r\\n]" },
        peg$c39 = ">",
        peg$c40 = { type: "literal", value: ">", description: "\">\"" },
        peg$c41 = "}",
        peg$c42 = { type: "literal", value: "}", description: "\"}\"" },
        peg$c43 = function(symbol, contents) { return b.inlineElement(symbol, contents); },
        peg$c44 = { type: "other", description: "column" },
        peg$c45 = function(headline, text) { return b.column(headline, text); },
        peg$c46 = { type: "other", description: "column headline" },
        peg$c47 = "[column]",
        peg$c48 = { type: "literal", value: "[column]", description: "\"[column]\"" },
        peg$c49 = function(level, caption) { return b.columnHeadline(level, caption); },
        peg$c50 = { type: "other", description: "column contents" },
        peg$c51 = function(c, cc) { return b.contents("ColumnContents", c, cc); },
        peg$c52 = { type: "other", description: "column content" },
        peg$c53 = function(c) { return b.content("ColumnContent", c); },
        peg$c54 = { type: "other", description: "column terminator" },
        peg$c55 = "[/column]",
        peg$c56 = { type: "literal", value: "[/column]", description: "\"[/column]\"" },
        peg$c57 = function(level) { return b.columnTerminator(level); },
        peg$c58 = { type: "other", description: "bracket argument" },
        peg$c59 = "[",
        peg$c60 = { type: "literal", value: "[", description: "\"[\"" },
        peg$c61 = "]",
        peg$c62 = { type: "literal", value: "]", description: "\"]\"" },
        peg$c63 = function(c) { return b.content("BracketArg", c); },
        peg$c64 = { type: "other", description: "bracket arg subs" },
        peg$c65 = function(c, cc) { return b.contents("BracketArgSubs", c, cc); },
        peg$c66 = { type: "other", description: "bracket arg sub" },
        peg$c67 = function(c) { return b.content("BracketArgSub", c); },
        peg$c68 = { type: "other", description: "text of bracket arg" },
        peg$c69 = "\\\\",
        peg$c70 = { type: "literal", value: "\\\\", description: "\"\\\\\\\\\"" },
        peg$c71 = "\\]",
        peg$c72 = { type: "literal", value: "\\]", description: "\"\\\\]\"" },
        peg$c73 = "\\",
        peg$c74 = { type: "literal", value: "\\", description: "\"\\\\\"" },
        peg$c75 = function(text) { return b.text("BracketArgText", text); },
        peg$c76 = { type: "other", description: "brace argument" },
        peg$c77 = /^[^\r\n}\\]/,
        peg$c78 = { type: "class", value: "[^\\r\\n\\}\\\\]", description: "[^\\r\\n\\}\\\\]" },
        peg$c79 = "\\}",
        peg$c80 = { type: "literal", value: "\\}", description: "\"\\\\}\"" },
        peg$c81 = function(arg) { return b.braceArg(arg); },
        peg$c82 = { type: "other", description: "contents of block element" },
        peg$c83 = function(c, cc) { return b.contents("BlockElementContents", c, cc); },
        peg$c84 = { type: "other", description: "content of block element" },
        peg$c85 = function(c) { return b.content("BlockElementContent", c); },
        peg$c86 = { type: "other", description: "paragraph in block" },
        peg$c87 = { type: "other", description: "paragraph subs in block" },
        peg$c88 = { type: "other", description: "paragraph sub in block" },
        peg$c89 = { type: "other", description: "text of content in block" },
        peg$c90 = { type: "other", description: "contents of inline element" },
        peg$c91 = function(c, cc) { return b.contents("InlineElementContents", c, cc); },
        peg$c92 = { type: "other", description: "content of inline element" },
        peg$c93 = function(c) { return b.content("InlineElementContent", c); },
        peg$c94 = { type: "other", description: "text of inline element" },
        peg$c95 = /^[^\r\n}]/,
        peg$c96 = { type: "class", value: "[^\\r\\n}]", description: "[^\\r\\n}]" },
        peg$c97 = function(text) { return b.text("InlineElementContentText", text); },
        peg$c98 = { type: "other", description: "inline content" },
        peg$c99 = function(c) { return b.content("SinglelineContent", c); },
        peg$c100 = { type: "other", description: "children of inline content" },
        peg$c101 = function(c, cc) { return b.contents("ContentInlines", c, cc); },
        peg$c102 = { type: "other", description: "child of inline content" },
        peg$c103 = function(c) { return b.content("ContentInline", c); },
        peg$c104 = { type: "other", description: "text of child of inline content" },
        peg$c105 = function(text) { return b.text("ContentInlineText", text); },
        peg$c106 = { type: "other", description: "ulist" },
        peg$c107 = function(c, cc) { return b.contents("Ulist", c, cc); },
        peg$c108 = { type: "other", description: "ulist element" },
        peg$c109 = " ",
        peg$c110 = { type: "literal", value: " ", description: "\" \"" },
        peg$c111 = "*",
        peg$c112 = { type: "literal", value: "*", description: "\"*\"" },
        peg$c113 = function(level, text) { return b.ulistElement(level, text); },
        peg$c114 = { type: "other", description: "olist" },
        peg$c115 = function(c, cc) { return b.contents("Olist", c, cc); },
        peg$c116 = { type: "other", description: "olist element" },
        peg$c117 = ".",
        peg$c118 = { type: "literal", value: ".", description: "\".\"" },
        peg$c119 = function(n, text) { return b.olistElement(n, text); },
        peg$c120 = { type: "other", description: "dlist" },
        peg$c121 = function(c, cc) { return b.contents("Dlist", c, cc); },
        peg$c122 = { type: "other", description: "dlist element" },
        peg$c123 = ":",
        peg$c124 = { type: "literal", value: ":", description: "\":\"" },
        peg$c125 = function(text, content) { return b.dlistElement(text, content); },
        peg$c126 = { type: "other", description: "contents of dlist element" },
        peg$c127 = function(c, cc) { return b.contents("DlistElementContents", c, cc); },
        peg$c128 = { type: "other", description: "content of dlist element" },
        peg$c129 = /^[ \t]/,
        peg$c130 = { type: "class", value: "[ \\t]", description: "[ \\t]" },
        peg$c131 = function(c) { return b.content("DlistElementContent", c); },
        peg$c132 = { type: "other", description: "signle line comment" },
        peg$c133 = "#@",
        peg$c134 = { type: "literal", value: "#@", description: "\"#@\"" },
        peg$c135 = function(text) { return b.text("SinglelineComment", text); },
        peg$c136 = { type: "other", description: "digits" },
        peg$c137 = { type: "other", description: "digit" },
        peg$c138 = /^[0-9]/,
        peg$c139 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c140 = { type: "other", description: "lower alphabet" },
        peg$c141 = /^[a-z]/,
        peg$c142 = { type: "class", value: "[a-z]", description: "[a-z]" },
        peg$c143 = { type: "other", description: "newline" },
        peg$c144 = "\r\n",
        peg$c145 = { type: "literal", value: "\r\n", description: "\"\\r\\n\"" },
        peg$c146 = "\n",
        peg$c147 = { type: "literal", value: "\n", description: "\"\\n\"" },
        peg$c148 = { type: "other", description: "blank lines" },
        peg$c149 = { type: "other", description: "spacer" },
        peg$c150 = /^[ \t\r\n]/,
        peg$c151 = { type: "class", value: "[ \\t\\r\\n]", description: "[ \\t\\r\\n]" },
        peg$c152 = { type: "other", description: "space" },
        peg$c153 = /^[ \u3000\t]/,
        peg$c154 = { type: "class", value: "[ \u3000\\t]", description: "[ \u3000\\t]" },
        peg$c155 = { type: "other", description: "end of file" },

        peg$currPos          = 0,
        peg$savedPos         = 0,
        peg$posDetailsCache  = [{ line: 1, column: 1, seenCR: false }],
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$savedPos, peg$currPos);
    }

    function location() {
      return peg$computeLocation(peg$savedPos, peg$currPos);
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        input.substring(peg$savedPos, peg$currPos),
        peg$computeLocation(peg$savedPos, peg$currPos)
      );
    }

    function error(message) {
      throw peg$buildException(
        message,
        null,
        input.substring(peg$savedPos, peg$currPos),
        peg$computeLocation(peg$savedPos, peg$currPos)
      );
    }

    function peg$computePosDetails(pos) {
      var details = peg$posDetailsCache[pos],
          p, ch;

      if (details) {
        return details;
      } else {
        p = pos - 1;
        while (!peg$posDetailsCache[p]) {
          p--;
        }

        details = peg$posDetailsCache[p];
        details = {
          line:   details.line,
          column: details.column,
          seenCR: details.seenCR
        };

        while (p < pos) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }

          p++;
        }

        peg$posDetailsCache[pos] = details;
        return details;
      }
    }

    function peg$computeLocation(startPos, endPos) {
      var startPosDetails = peg$computePosDetails(startPos),
          endPosDetails   = peg$computePosDetails(endPos);

      return {
        start: {
          offset: startPos,
          line:   startPosDetails.line,
          column: startPosDetails.column
        },
        end: {
          offset: endPos,
          line:   endPosDetails.line,
          column: endPosDetails.column
        }
      };
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, found, location) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0100-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1000-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new peg$SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        location
      );
    }

    function peg$parseStart() {
      var s0, s1, s2, s3;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseChapters();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c1(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c0); }
      }

      return s0;
    }

    function peg$parseChapters() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseChapter();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseChapters();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c3(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c2); }
      }

      return s0;
    }

    function peg$parseChapter() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseHeadline();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseContents();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c5(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c4); }
      }

      return s0;
    }

    function peg$parseHeadline() {
      var s0, s1, s2, s3, s4, s5;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      if (input.charCodeAt(peg$currPos) === 61) {
        s2 = peg$c7;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c8); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (input.charCodeAt(peg$currPos) === 61) {
            s2 = peg$c7;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c8); }
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseBraceArg();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseSpace();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseSpace();
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parseSinglelineContent();
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_l();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c9(s1, s2, s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c6); }
      }

      return s0;
    }

    function peg$parseContents() {
      var s0, s1, s2, s3, s4;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      if (input.length > peg$currPos) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c11); }
      }
      peg$silentFails--;
      if (s2 !== peg$FAILED) {
        peg$currPos = s1;
        s1 = void 0;
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseContent();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseContents();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_l();
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c12(s2, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c10); }
      }

      return s0;
    }

    function peg$parseContent() {
      var s0, s1;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseSinglelineComment();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c14(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseBlockElement();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c14(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseUlist();
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c14(s1);
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseOlist();
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c14(s1);
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parseDlist();
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c14(s1);
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parseParagraph();
                if (s1 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c14(s1);
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  s1 = peg$parseColumn();
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c14(s1);
                  }
                  s0 = s1;
                }
              }
            }
          }
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c13); }
      }

      return s0;
    }

    function peg$parseParagraph() {
      var s0, s1, s2, s3;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 61) {
        s2 = peg$c7;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c8); }
      }
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = void 0;
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseParagraphSubs();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_l();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c16(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c15); }
      }

      return s0;
    }

    function peg$parseParagraphSubs() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseParagraphSub();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseParagraphSubs();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c18(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c17); }
      }

      return s0;
    }

    function peg$parseParagraphSub() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseInlineElement();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseNewline();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c20(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseContentText();
        if (s1 !== peg$FAILED) {
          s2 = peg$parseNewline();
          if (s2 === peg$FAILED) {
            s2 = null;
          }
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c20(s1);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c19); }
      }

      return s0;
    }

    function peg$parseContentText() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$currPos;
      s3 = peg$currPos;
      peg$silentFails++;
      s4 = peg$parseNewline();
      peg$silentFails--;
      if (s4 === peg$FAILED) {
        s3 = void 0;
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$currPos;
        peg$silentFails++;
        s5 = peg$parseHeadline();
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = void 0;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$currPos;
          peg$silentFails++;
          s6 = peg$parseSinglelineComment();
          peg$silentFails--;
          if (s6 === peg$FAILED) {
            s5 = void 0;
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$currPos;
            peg$silentFails++;
            s7 = peg$parseBlockElement();
            peg$silentFails--;
            if (s7 === peg$FAILED) {
              s6 = void 0;
            } else {
              peg$currPos = s6;
              s6 = peg$FAILED;
            }
            if (s6 !== peg$FAILED) {
              s7 = peg$currPos;
              peg$silentFails++;
              s8 = peg$parseUlist();
              peg$silentFails--;
              if (s8 === peg$FAILED) {
                s7 = void 0;
              } else {
                peg$currPos = s7;
                s7 = peg$FAILED;
              }
              if (s7 !== peg$FAILED) {
                s8 = peg$currPos;
                peg$silentFails++;
                s9 = peg$parseOlist();
                peg$silentFails--;
                if (s9 === peg$FAILED) {
                  s8 = void 0;
                } else {
                  peg$currPos = s8;
                  s8 = peg$FAILED;
                }
                if (s8 !== peg$FAILED) {
                  s9 = peg$currPos;
                  peg$silentFails++;
                  s10 = peg$parseDlist();
                  peg$silentFails--;
                  if (s10 === peg$FAILED) {
                    s9 = void 0;
                  } else {
                    peg$currPos = s9;
                    s9 = peg$FAILED;
                  }
                  if (s9 !== peg$FAILED) {
                    s10 = [];
                    s11 = peg$currPos;
                    s12 = peg$currPos;
                    peg$silentFails++;
                    s13 = peg$parseInlineElement();
                    peg$silentFails--;
                    if (s13 === peg$FAILED) {
                      s12 = void 0;
                    } else {
                      peg$currPos = s12;
                      s12 = peg$FAILED;
                    }
                    if (s12 !== peg$FAILED) {
                      if (peg$c22.test(input.charAt(peg$currPos))) {
                        s13 = input.charAt(peg$currPos);
                        peg$currPos++;
                      } else {
                        s13 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c23); }
                      }
                      if (s13 !== peg$FAILED) {
                        s12 = [s12, s13];
                        s11 = s12;
                      } else {
                        peg$currPos = s11;
                        s11 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s11;
                      s11 = peg$FAILED;
                    }
                    if (s11 !== peg$FAILED) {
                      while (s11 !== peg$FAILED) {
                        s10.push(s11);
                        s11 = peg$currPos;
                        s12 = peg$currPos;
                        peg$silentFails++;
                        s13 = peg$parseInlineElement();
                        peg$silentFails--;
                        if (s13 === peg$FAILED) {
                          s12 = void 0;
                        } else {
                          peg$currPos = s12;
                          s12 = peg$FAILED;
                        }
                        if (s12 !== peg$FAILED) {
                          if (peg$c22.test(input.charAt(peg$currPos))) {
                            s13 = input.charAt(peg$currPos);
                            peg$currPos++;
                          } else {
                            s13 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c23); }
                          }
                          if (s13 !== peg$FAILED) {
                            s12 = [s12, s13];
                            s11 = s12;
                          } else {
                            peg$currPos = s11;
                            s11 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s11;
                          s11 = peg$FAILED;
                        }
                      }
                    } else {
                      s10 = peg$FAILED;
                    }
                    if (s10 !== peg$FAILED) {
                      s3 = [s3, s4, s5, s6, s7, s8, s9, s10];
                      s2 = s3;
                    } else {
                      peg$currPos = s2;
                      s2 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s2;
                  s2 = peg$FAILED;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = input.substring(s1, peg$currPos);
      } else {
        s1 = s2;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c24(s1);
      }
      s0 = s1;
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c21); }
      }

      return s0;
    }

    function peg$parseBlockElement() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      peg$silentFails++;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c26) {
        s1 = peg$c26;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c27); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = [];
        s4 = peg$parseAZ();
        if (s4 !== peg$FAILED) {
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseAZ();
          }
        } else {
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          s2 = input.substring(s2, peg$currPos);
        } else {
          s2 = s3;
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseBracketArg();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseBracketArg();
          }
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 123) {
              s4 = peg$c28;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c29); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_l();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseBlockElementContents();
                if (s6 === peg$FAILED) {
                  s6 = null;
                }
                if (s6 !== peg$FAILED) {
                  if (input.substr(peg$currPos, 3) === peg$c30) {
                    s7 = peg$c30;
                    peg$currPos += 3;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c31); }
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parse_l();
                    if (s8 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c32(s2, s3, s6);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c26) {
          s1 = peg$c26;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c27); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$currPos;
          s3 = [];
          s4 = peg$parseAZ();
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseAZ();
            }
          } else {
            s3 = peg$FAILED;
          }
          if (s3 !== peg$FAILED) {
            s2 = input.substring(s2, peg$currPos);
          } else {
            s2 = s3;
          }
          if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$parseBracketArg();
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseBracketArg();
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parse_l();
              if (s4 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c33(s2, s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c25); }
      }

      return s0;
    }

    function peg$parseInlineElement() {
      var s0, s1, s2, s3, s4, s5, s6;

      peg$silentFails++;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c35) {
        s1 = peg$c35;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c36); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = [];
        if (peg$c37.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c38); }
        }
        if (s4 !== peg$FAILED) {
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            if (peg$c37.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c38); }
            }
          }
        } else {
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          s2 = input.substring(s2, peg$currPos);
        } else {
          s2 = s3;
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 62) {
            s3 = peg$c39;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c40); }
          }
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 123) {
              s4 = peg$c28;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c29); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseInlineElementContents();
              if (s5 === peg$FAILED) {
                s5 = null;
              }
              if (s5 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 125) {
                  s6 = peg$c41;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c42); }
                }
                if (s6 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c43(s2, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c34); }
      }

      return s0;
    }

    function peg$parseColumn() {
      var s0, s1, s2, s3;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseColumnHeadline();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseColumnContents();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseColumnTerminator();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c45(s1, s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c44); }
      }

      return s0;
    }

    function peg$parseColumnHeadline() {
      var s0, s1, s2, s3, s4, s5;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      if (input.charCodeAt(peg$currPos) === 61) {
        s2 = peg$c7;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c8); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (input.charCodeAt(peg$currPos) === 61) {
            s2 = peg$c7;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c8); }
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 8) === peg$c47) {
          s2 = peg$c47;
          peg$currPos += 8;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c48); }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseSpace();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseSpace();
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parseSinglelineContent();
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_l();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c49(s1, s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c46); }
      }

      return s0;
    }

    function peg$parseColumnContents() {
      var s0, s1, s2, s3, s4;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      if (input.length > peg$currPos) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c11); }
      }
      peg$silentFails--;
      if (s2 !== peg$FAILED) {
        peg$currPos = s1;
        s1 = void 0;
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseColumnContent();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseColumnContents();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_l();
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c51(s2, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c50); }
      }

      return s0;
    }

    function peg$parseColumnContent() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      s2 = peg$parseColumnTerminator();
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = void 0;
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseSinglelineComment();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c53(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;
        s2 = peg$parseColumnTerminator();
        peg$silentFails--;
        if (s2 === peg$FAILED) {
          s1 = void 0;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parseBlockElement();
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c53(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$currPos;
          peg$silentFails++;
          s2 = peg$parseColumnTerminator();
          peg$silentFails--;
          if (s2 === peg$FAILED) {
            s1 = void 0;
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parseUlist();
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c53(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$currPos;
            peg$silentFails++;
            s2 = peg$parseColumnTerminator();
            peg$silentFails--;
            if (s2 === peg$FAILED) {
              s1 = void 0;
            } else {
              peg$currPos = s1;
              s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parseOlist();
              if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c53(s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$currPos;
              peg$silentFails++;
              s2 = peg$parseColumnTerminator();
              peg$silentFails--;
              if (s2 === peg$FAILED) {
                s1 = void 0;
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parseDlist();
                if (s2 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c53(s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$currPos;
                peg$silentFails++;
                s2 = peg$parseColumnTerminator();
                peg$silentFails--;
                if (s2 === peg$FAILED) {
                  s1 = void 0;
                } else {
                  peg$currPos = s1;
                  s1 = peg$FAILED;
                }
                if (s1 !== peg$FAILED) {
                  s2 = peg$parseParagraph();
                  if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c53(s2);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  s1 = peg$currPos;
                  peg$silentFails++;
                  s2 = peg$parseColumnTerminator();
                  peg$silentFails--;
                  if (s2 === peg$FAILED) {
                    s1 = void 0;
                  } else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                  }
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parseChapter();
                    if (s2 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c53(s2);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                }
              }
            }
          }
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c52); }
      }

      return s0;
    }

    function peg$parseColumnTerminator() {
      var s0, s1, s2, s3, s4;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      if (input.charCodeAt(peg$currPos) === 61) {
        s2 = peg$c7;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c8); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (input.charCodeAt(peg$currPos) === 61) {
            s2 = peg$c7;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c8); }
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 9) === peg$c55) {
          s2 = peg$c55;
          peg$currPos += 9;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c56); }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseSpace();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseSpace();
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_l();
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c57(s1);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c54); }
      }

      return s0;
    }

    function peg$parseBracketArg() {
      var s0, s1, s2, s3;

      peg$silentFails++;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 91) {
        s1 = peg$c59;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c60); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseBracketArgSubs();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 93) {
            s3 = peg$c61;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c62); }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c63(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c58); }
      }

      return s0;
    }

    function peg$parseBracketArgSubs() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseBracketArgSub();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseBracketArgSubs();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c65(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c64); }
      }

      return s0;
    }

    function peg$parseBracketArgSub() {
      var s0, s1;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseInlineElement();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c67(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseBracketArgText();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c67(s1);
        }
        s0 = s1;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c66); }
      }

      return s0;
    }

    function peg$parseBracketArgText() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      s5 = peg$parseNewline();
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = void 0;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$currPos;
        peg$silentFails++;
        s6 = peg$parseInlineElement();
        peg$silentFails--;
        if (s6 === peg$FAILED) {
          s5 = void 0;
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
        if (s5 !== peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c69) {
            s6 = peg$c69;
            peg$currPos += 2;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c70); }
          }
          if (s6 === peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c71) {
              s6 = peg$c71;
              peg$currPos += 2;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c72); }
            }
            if (s6 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 92) {
                s6 = peg$c73;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c74); }
              }
              if (s6 === peg$FAILED) {
                s6 = peg$currPos;
                s7 = peg$currPos;
                peg$silentFails++;
                if (input.charCodeAt(peg$currPos) === 93) {
                  s8 = peg$c61;
                  peg$currPos++;
                } else {
                  s8 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c62); }
                }
                peg$silentFails--;
                if (s8 === peg$FAILED) {
                  s7 = void 0;
                } else {
                  peg$currPos = s7;
                  s7 = peg$FAILED;
                }
                if (s7 !== peg$FAILED) {
                  if (input.length > peg$currPos) {
                    s8 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s8 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c11); }
                  }
                  if (s8 !== peg$FAILED) {
                    s7 = [s7, s8];
                    s6 = s7;
                  } else {
                    peg$currPos = s6;
                    s6 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s6;
                  s6 = peg$FAILED;
                }
              }
            }
          }
          if (s6 !== peg$FAILED) {
            s4 = [s4, s5, s6];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$currPos;
          peg$silentFails++;
          s5 = peg$parseNewline();
          peg$silentFails--;
          if (s5 === peg$FAILED) {
            s4 = void 0;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$currPos;
            peg$silentFails++;
            s6 = peg$parseInlineElement();
            peg$silentFails--;
            if (s6 === peg$FAILED) {
              s5 = void 0;
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
            if (s5 !== peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c69) {
                s6 = peg$c69;
                peg$currPos += 2;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c70); }
              }
              if (s6 === peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c71) {
                  s6 = peg$c71;
                  peg$currPos += 2;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c72); }
                }
                if (s6 === peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 92) {
                    s6 = peg$c73;
                    peg$currPos++;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c74); }
                  }
                  if (s6 === peg$FAILED) {
                    s6 = peg$currPos;
                    s7 = peg$currPos;
                    peg$silentFails++;
                    if (input.charCodeAt(peg$currPos) === 93) {
                      s8 = peg$c61;
                      peg$currPos++;
                    } else {
                      s8 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c62); }
                    }
                    peg$silentFails--;
                    if (s8 === peg$FAILED) {
                      s7 = void 0;
                    } else {
                      peg$currPos = s7;
                      s7 = peg$FAILED;
                    }
                    if (s7 !== peg$FAILED) {
                      if (input.length > peg$currPos) {
                        s8 = input.charAt(peg$currPos);
                        peg$currPos++;
                      } else {
                        s8 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c11); }
                      }
                      if (s8 !== peg$FAILED) {
                        s7 = [s7, s8];
                        s6 = s7;
                      } else {
                        peg$currPos = s6;
                        s6 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s6;
                      s6 = peg$FAILED;
                    }
                  }
                }
              }
              if (s6 !== peg$FAILED) {
                s4 = [s4, s5, s6];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = input.substring(s1, peg$currPos);
      } else {
        s1 = s2;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c75(s1);
      }
      s0 = s1;
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c68); }
      }

      return s0;
    }

    function peg$parseBraceArg() {
      var s0, s1, s2, s3, s4, s5, s6;

      peg$silentFails++;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 123) {
        s1 = peg$c28;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c29); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = [];
        s4 = peg$currPos;
        s5 = [];
        if (peg$c77.test(input.charAt(peg$currPos))) {
          s6 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c78); }
        }
        if (s6 !== peg$FAILED) {
          while (s6 !== peg$FAILED) {
            s5.push(s6);
            if (peg$c77.test(input.charAt(peg$currPos))) {
              s6 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c78); }
            }
          }
        } else {
          s5 = peg$FAILED;
        }
        if (s5 !== peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c69) {
            s6 = peg$c69;
            peg$currPos += 2;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c70); }
          }
          if (s6 === peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c79) {
              s6 = peg$c79;
              peg$currPos += 2;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c80); }
            }
            if (s6 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 92) {
                s6 = peg$c73;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c74); }
              }
            }
          }
          if (s6 === peg$FAILED) {
            s6 = null;
          }
          if (s6 !== peg$FAILED) {
            s5 = [s5, s6];
            s4 = s5;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$currPos;
          s5 = [];
          if (peg$c77.test(input.charAt(peg$currPos))) {
            s6 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c78); }
          }
          if (s6 !== peg$FAILED) {
            while (s6 !== peg$FAILED) {
              s5.push(s6);
              if (peg$c77.test(input.charAt(peg$currPos))) {
                s6 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c78); }
              }
            }
          } else {
            s5 = peg$FAILED;
          }
          if (s5 !== peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c69) {
              s6 = peg$c69;
              peg$currPos += 2;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c70); }
            }
            if (s6 === peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c79) {
                s6 = peg$c79;
                peg$currPos += 2;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c80); }
              }
              if (s6 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 92) {
                  s6 = peg$c73;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c74); }
                }
              }
            }
            if (s6 === peg$FAILED) {
              s6 = null;
            }
            if (s6 !== peg$FAILED) {
              s5 = [s5, s6];
              s4 = s5;
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
        }
        if (s3 !== peg$FAILED) {
          s2 = input.substring(s2, peg$currPos);
        } else {
          s2 = s3;
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 125) {
            s3 = peg$c41;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c42); }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c81(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c76); }
      }

      return s0;
    }

    function peg$parseBlockElementContents() {
      var s0, s1, s2, s3;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseBlockElementContent();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseBlockElementContents();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_l();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c83(s1, s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c82); }
      }

      return s0;
    }

    function peg$parseBlockElementContent() {
      var s0, s1;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseSinglelineComment();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c85(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseBlockElement();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c85(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseUlist();
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c85(s1);
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseOlist();
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c85(s1);
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parseDlist();
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c85(s1);
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parseBlockElementParagraph();
                if (s1 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c85(s1);
                }
                s0 = s1;
              }
            }
          }
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c84); }
      }

      return s0;
    }

    function peg$parseBlockElementParagraph() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseBlockElementParagraphSubs();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_l();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c16(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c86); }
      }

      return s0;
    }

    function peg$parseBlockElementParagraphSubs() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseBlockElementParagraphSub();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseBlockElementParagraphSubs();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c18(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c87); }
      }

      return s0;
    }

    function peg$parseBlockElementParagraphSub() {
      var s0, s1;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseInlineElement();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c20(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseBlockElementContentText();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c20(s1);
        }
        s0 = s1;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c88); }
      }

      return s0;
    }

    function peg$parseBlockElementContentText() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      if (input.length > peg$currPos) {
        s5 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s5 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c11); }
      }
      peg$silentFails--;
      if (s5 !== peg$FAILED) {
        peg$currPos = s4;
        s4 = void 0;
      } else {
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$currPos;
        peg$silentFails++;
        if (input.substr(peg$currPos, 3) === peg$c30) {
          s6 = peg$c30;
          peg$currPos += 3;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c31); }
        }
        peg$silentFails--;
        if (s6 === peg$FAILED) {
          s5 = void 0;
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$currPos;
          peg$silentFails++;
          s7 = peg$parseSinglelineComment();
          peg$silentFails--;
          if (s7 === peg$FAILED) {
            s6 = void 0;
          } else {
            peg$currPos = s6;
            s6 = peg$FAILED;
          }
          if (s6 !== peg$FAILED) {
            s7 = peg$currPos;
            peg$silentFails++;
            s8 = peg$parseBlockElement();
            peg$silentFails--;
            if (s8 === peg$FAILED) {
              s7 = void 0;
            } else {
              peg$currPos = s7;
              s7 = peg$FAILED;
            }
            if (s7 !== peg$FAILED) {
              s8 = peg$currPos;
              peg$silentFails++;
              s9 = peg$parseUlist();
              peg$silentFails--;
              if (s9 === peg$FAILED) {
                s8 = void 0;
              } else {
                peg$currPos = s8;
                s8 = peg$FAILED;
              }
              if (s8 !== peg$FAILED) {
                s9 = peg$currPos;
                peg$silentFails++;
                s10 = peg$parseOlist();
                peg$silentFails--;
                if (s10 === peg$FAILED) {
                  s9 = void 0;
                } else {
                  peg$currPos = s9;
                  s9 = peg$FAILED;
                }
                if (s9 !== peg$FAILED) {
                  s10 = peg$currPos;
                  peg$silentFails++;
                  s11 = peg$parseDlist();
                  peg$silentFails--;
                  if (s11 === peg$FAILED) {
                    s10 = void 0;
                  } else {
                    peg$currPos = s10;
                    s10 = peg$FAILED;
                  }
                  if (s10 !== peg$FAILED) {
                    s11 = [];
                    s12 = peg$currPos;
                    s13 = peg$currPos;
                    peg$silentFails++;
                    s14 = peg$parseInlineElement();
                    peg$silentFails--;
                    if (s14 === peg$FAILED) {
                      s13 = void 0;
                    } else {
                      peg$currPos = s13;
                      s13 = peg$FAILED;
                    }
                    if (s13 !== peg$FAILED) {
                      if (peg$c22.test(input.charAt(peg$currPos))) {
                        s14 = input.charAt(peg$currPos);
                        peg$currPos++;
                      } else {
                        s14 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c23); }
                      }
                      if (s14 !== peg$FAILED) {
                        s13 = [s13, s14];
                        s12 = s13;
                      } else {
                        peg$currPos = s12;
                        s12 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s12;
                      s12 = peg$FAILED;
                    }
                    if (s12 !== peg$FAILED) {
                      while (s12 !== peg$FAILED) {
                        s11.push(s12);
                        s12 = peg$currPos;
                        s13 = peg$currPos;
                        peg$silentFails++;
                        s14 = peg$parseInlineElement();
                        peg$silentFails--;
                        if (s14 === peg$FAILED) {
                          s13 = void 0;
                        } else {
                          peg$currPos = s13;
                          s13 = peg$FAILED;
                        }
                        if (s13 !== peg$FAILED) {
                          if (peg$c22.test(input.charAt(peg$currPos))) {
                            s14 = input.charAt(peg$currPos);
                            peg$currPos++;
                          } else {
                            s14 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c23); }
                          }
                          if (s14 !== peg$FAILED) {
                            s13 = [s13, s14];
                            s12 = s13;
                          } else {
                            peg$currPos = s12;
                            s12 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s12;
                          s12 = peg$FAILED;
                        }
                      }
                    } else {
                      s11 = peg$FAILED;
                    }
                    if (s11 !== peg$FAILED) {
                      s12 = peg$parseNewline();
                      if (s12 === peg$FAILED) {
                        s12 = null;
                      }
                      if (s12 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7, s8, s9, s10, s11, s12];
                        s3 = s4;
                      } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$currPos;
          peg$silentFails++;
          if (input.length > peg$currPos) {
            s5 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c11); }
          }
          peg$silentFails--;
          if (s5 !== peg$FAILED) {
            peg$currPos = s4;
            s4 = void 0;
          } else {
            s4 = peg$FAILED;
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$currPos;
            peg$silentFails++;
            if (input.substr(peg$currPos, 3) === peg$c30) {
              s6 = peg$c30;
              peg$currPos += 3;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c31); }
            }
            peg$silentFails--;
            if (s6 === peg$FAILED) {
              s5 = void 0;
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$currPos;
              peg$silentFails++;
              s7 = peg$parseSinglelineComment();
              peg$silentFails--;
              if (s7 === peg$FAILED) {
                s6 = void 0;
              } else {
                peg$currPos = s6;
                s6 = peg$FAILED;
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$currPos;
                peg$silentFails++;
                s8 = peg$parseBlockElement();
                peg$silentFails--;
                if (s8 === peg$FAILED) {
                  s7 = void 0;
                } else {
                  peg$currPos = s7;
                  s7 = peg$FAILED;
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$currPos;
                  peg$silentFails++;
                  s9 = peg$parseUlist();
                  peg$silentFails--;
                  if (s9 === peg$FAILED) {
                    s8 = void 0;
                  } else {
                    peg$currPos = s8;
                    s8 = peg$FAILED;
                  }
                  if (s8 !== peg$FAILED) {
                    s9 = peg$currPos;
                    peg$silentFails++;
                    s10 = peg$parseOlist();
                    peg$silentFails--;
                    if (s10 === peg$FAILED) {
                      s9 = void 0;
                    } else {
                      peg$currPos = s9;
                      s9 = peg$FAILED;
                    }
                    if (s9 !== peg$FAILED) {
                      s10 = peg$currPos;
                      peg$silentFails++;
                      s11 = peg$parseDlist();
                      peg$silentFails--;
                      if (s11 === peg$FAILED) {
                        s10 = void 0;
                      } else {
                        peg$currPos = s10;
                        s10 = peg$FAILED;
                      }
                      if (s10 !== peg$FAILED) {
                        s11 = [];
                        s12 = peg$currPos;
                        s13 = peg$currPos;
                        peg$silentFails++;
                        s14 = peg$parseInlineElement();
                        peg$silentFails--;
                        if (s14 === peg$FAILED) {
                          s13 = void 0;
                        } else {
                          peg$currPos = s13;
                          s13 = peg$FAILED;
                        }
                        if (s13 !== peg$FAILED) {
                          if (peg$c22.test(input.charAt(peg$currPos))) {
                            s14 = input.charAt(peg$currPos);
                            peg$currPos++;
                          } else {
                            s14 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c23); }
                          }
                          if (s14 !== peg$FAILED) {
                            s13 = [s13, s14];
                            s12 = s13;
                          } else {
                            peg$currPos = s12;
                            s12 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s12;
                          s12 = peg$FAILED;
                        }
                        if (s12 !== peg$FAILED) {
                          while (s12 !== peg$FAILED) {
                            s11.push(s12);
                            s12 = peg$currPos;
                            s13 = peg$currPos;
                            peg$silentFails++;
                            s14 = peg$parseInlineElement();
                            peg$silentFails--;
                            if (s14 === peg$FAILED) {
                              s13 = void 0;
                            } else {
                              peg$currPos = s13;
                              s13 = peg$FAILED;
                            }
                            if (s13 !== peg$FAILED) {
                              if (peg$c22.test(input.charAt(peg$currPos))) {
                                s14 = input.charAt(peg$currPos);
                                peg$currPos++;
                              } else {
                                s14 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$c23); }
                              }
                              if (s14 !== peg$FAILED) {
                                s13 = [s13, s14];
                                s12 = s13;
                              } else {
                                peg$currPos = s12;
                                s12 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s12;
                              s12 = peg$FAILED;
                            }
                          }
                        } else {
                          s11 = peg$FAILED;
                        }
                        if (s11 !== peg$FAILED) {
                          s12 = peg$parseNewline();
                          if (s12 === peg$FAILED) {
                            s12 = null;
                          }
                          if (s12 !== peg$FAILED) {
                            s4 = [s4, s5, s6, s7, s8, s9, s10, s11, s12];
                            s3 = s4;
                          } else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s3;
                          s3 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = input.substring(s1, peg$currPos);
      } else {
        s1 = s2;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c24(s1);
      }
      s0 = s1;
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c89); }
      }

      return s0;
    }

    function peg$parseInlineElementContents() {
      var s0, s1, s2, s3;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 125) {
        s2 = peg$c41;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c42); }
      }
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = void 0;
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseInlineElementContent();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseInlineElementContents();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c91(s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c90); }
      }

      return s0;
    }

    function peg$parseInlineElementContent() {
      var s0, s1;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseInlineElement();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c93(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseInlineElementContentText();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c93(s1);
        }
        s0 = s1;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c92); }
      }

      return s0;
    }

    function peg$parseInlineElementContentText() {
      var s0, s1, s2, s3, s4, s5;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      s5 = peg$parseInlineElement();
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = void 0;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        if (peg$c95.test(input.charAt(peg$currPos))) {
          s5 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c96); }
        }
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$currPos;
          peg$silentFails++;
          s5 = peg$parseInlineElement();
          peg$silentFails--;
          if (s5 === peg$FAILED) {
            s4 = void 0;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
          if (s4 !== peg$FAILED) {
            if (peg$c95.test(input.charAt(peg$currPos))) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c96); }
            }
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = input.substring(s1, peg$currPos);
      } else {
        s1 = s2;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c97(s1);
      }
      s0 = s1;
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c94); }
      }

      return s0;
    }

    function peg$parseSinglelineContent() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseContentInlines();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseNewline();
        if (s2 === peg$FAILED) {
          s2 = peg$parseEOF();
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c99(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c98); }
      }

      return s0;
    }

    function peg$parseContentInlines() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseContentInline();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseContentInlines();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c101(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c100); }
      }

      return s0;
    }

    function peg$parseContentInline() {
      var s0, s1;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseInlineElement();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c103(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseContentInlineText();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c103(s1);
        }
        s0 = s1;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c102); }
      }

      return s0;
    }

    function peg$parseContentInlineText() {
      var s0, s1, s2, s3, s4, s5;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      s5 = peg$parseInlineElement();
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = void 0;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        if (peg$c22.test(input.charAt(peg$currPos))) {
          s5 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c23); }
        }
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$currPos;
          peg$silentFails++;
          s5 = peg$parseInlineElement();
          peg$silentFails--;
          if (s5 === peg$FAILED) {
            s4 = void 0;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
          if (s4 !== peg$FAILED) {
            if (peg$c22.test(input.charAt(peg$currPos))) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c23); }
            }
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = input.substring(s1, peg$currPos);
      } else {
        s1 = s2;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c105(s1);
      }
      s0 = s1;
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c104); }
      }

      return s0;
    }

    function peg$parseUlist() {
      var s0, s1, s2, s3;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseUlistElement();
      if (s1 === peg$FAILED) {
        s1 = peg$parseSinglelineComment();
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseUlist();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_l();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c107(s1, s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c106); }
      }

      return s0;
    }

    function peg$parseUlistElement() {
      var s0, s1, s2, s3, s4;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      if (input.charCodeAt(peg$currPos) === 32) {
        s2 = peg$c109;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c110); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (input.charCodeAt(peg$currPos) === 32) {
            s2 = peg$c109;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c110); }
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (input.charCodeAt(peg$currPos) === 42) {
          s3 = peg$c111;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c112); }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (input.charCodeAt(peg$currPos) === 42) {
              s3 = peg$c111;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c112); }
            }
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseSpace();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseSpace();
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parseSinglelineContent();
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c113(s2, s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c108); }
      }

      return s0;
    }

    function peg$parseOlist() {
      var s0, s1, s2, s3;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseOlistElement();
      if (s1 === peg$FAILED) {
        s1 = peg$parseSinglelineComment();
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseOlist();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_l();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c115(s1, s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c114); }
      }

      return s0;
    }

    function peg$parseOlistElement() {
      var s0, s1, s2, s3, s4, s5;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      if (input.charCodeAt(peg$currPos) === 32) {
        s2 = peg$c109;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c110); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (input.charCodeAt(peg$currPos) === 32) {
            s2 = peg$c109;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c110); }
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseDigits();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 46) {
            s3 = peg$c117;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c118); }
          }
          if (s3 !== peg$FAILED) {
            s4 = [];
            s5 = peg$parseSpace();
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = peg$parseSpace();
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseSinglelineContent();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c119(s2, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c116); }
      }

      return s0;
    }

    function peg$parseDlist() {
      var s0, s1, s2, s3;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseDlistElement();
      if (s1 === peg$FAILED) {
        s1 = peg$parseSinglelineComment();
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseDlist();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_l();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c121(s1, s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c120); }
      }

      return s0;
    }

    function peg$parseDlistElement() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      if (input.charCodeAt(peg$currPos) === 32) {
        s2 = peg$c109;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c110); }
      }
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        if (input.charCodeAt(peg$currPos) === 32) {
          s2 = peg$c109;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c110); }
        }
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 58) {
          s2 = peg$c123;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c124); }
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 32) {
            s3 = peg$c109;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c110); }
          }
          if (s3 !== peg$FAILED) {
            s4 = [];
            s5 = peg$parseSpace();
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = peg$parseSpace();
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseSinglelineContent();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseDlistElementContents();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse_l();
                  if (s7 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c125(s5, s6);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c122); }
      }

      return s0;
    }

    function peg$parseDlistElementContents() {
      var s0, s1, s2, s3;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseDlistElementContent();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseDlistElementContents();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_l();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c127(s1, s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c126); }
      }

      return s0;
    }

    function peg$parseDlistElementContent() {
      var s0, s1, s2, s3;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      if (peg$c129.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c130); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c129.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c130); }
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseSinglelineContent();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseNewline();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c131(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c128); }
      }

      return s0;
    }

    function peg$parseSinglelineComment() {
      var s0, s1, s2, s3, s4, s5, s6;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c133) {
        s3 = peg$c133;
        peg$currPos += 2;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c134); }
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$currPos;
        s5 = [];
        if (peg$c22.test(input.charAt(peg$currPos))) {
          s6 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c23); }
        }
        while (s6 !== peg$FAILED) {
          s5.push(s6);
          if (peg$c22.test(input.charAt(peg$currPos))) {
            s6 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c23); }
          }
        }
        if (s5 !== peg$FAILED) {
          s4 = input.substring(s4, peg$currPos);
        } else {
          s4 = s5;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseNewline();
          if (s5 === peg$FAILED) {
            s5 = null;
          }
          if (s5 !== peg$FAILED) {
            s3 = [s3, s4, s5];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = input.substring(s1, peg$currPos);
      } else {
        s1 = s2;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_l();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c135(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c132); }
      }

      return s0;
    }

    function peg$parseDigits() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseDigit();
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parseDigit();
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s0 = input.substring(s0, peg$currPos);
      } else {
        s0 = s1;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c136); }
      }

      return s0;
    }

    function peg$parseDigit() {
      var s0, s1;

      peg$silentFails++;
      if (peg$c138.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c139); }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c137); }
      }

      return s0;
    }

    function peg$parseAZ() {
      var s0, s1;

      peg$silentFails++;
      if (peg$c141.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c142); }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c140); }
      }

      return s0;
    }

    function peg$parseNewline() {
      var s0, s1;

      peg$silentFails++;
      if (input.substr(peg$currPos, 2) === peg$c144) {
        s0 = peg$c144;
        peg$currPos += 2;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c145); }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 10) {
          s0 = peg$c146;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c147); }
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c143); }
      }

      return s0;
    }

    function peg$parse_l() {
      var s0, s1, s2, s3, s4;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      s2 = peg$currPos;
      s3 = [];
      if (peg$c129.test(input.charAt(peg$currPos))) {
        s4 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c130); }
      }
      while (s4 !== peg$FAILED) {
        s3.push(s4);
        if (peg$c129.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c130); }
        }
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$parseNewline();
        if (s4 !== peg$FAILED) {
          s3 = [s3, s4];
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$currPos;
        s3 = [];
        if (peg$c129.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c130); }
        }
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          if (peg$c129.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c130); }
          }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parseNewline();
          if (s4 !== peg$FAILED) {
            s3 = [s3, s4];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      }
      if (s1 !== peg$FAILED) {
        s0 = input.substring(s0, peg$currPos);
      } else {
        s0 = s1;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c148); }
      }

      return s0;
    }

    function peg$parse_() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      if (peg$c150.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c151); }
      }
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        if (peg$c150.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c151); }
        }
      }
      if (s1 !== peg$FAILED) {
        s0 = input.substring(s0, peg$currPos);
      } else {
        s0 = s1;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c149); }
      }

      return s0;
    }

    function peg$parseSpace() {
      var s0, s1;

      peg$silentFails++;
      if (peg$c153.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c154); }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c152); }
      }

      return s0;
    }

    function peg$parseEOF() {
      var s0, s1;

      peg$silentFails++;
      s0 = peg$currPos;
      peg$silentFails++;
      if (input.length > peg$currPos) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c11); }
      }
      peg$silentFails--;
      if (s1 === peg$FAILED) {
        s0 = void 0;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c155); }
      }

      return s0;
    }


        var b = require("../lib/peg/action");
        b.setup({
            text: text,
            location: location
        });


    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(
        null,
        peg$maxFailExpected,
        peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
        peg$maxFailPos < input.length
          ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
          : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
      );
    }
  }

  return {
    SyntaxError: peg$SyntaxError,
    parse:       peg$parse
  };
})();

},{"../lib/peg/action":18}]},{},[10])(10)
});