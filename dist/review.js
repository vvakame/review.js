(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ReVIEW = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultBuilder = void 0;
var i18n_1 = require("../i18n/i18n");
var exception_1 = require("../js/exception");
var parser_1 = require("../parser/parser");
var walker_1 = require("../parser/walker");
var utils_1 = require("../utils/utils");
/**
 * デフォルトのビルダ。
 * Re:VIEWのASTから何らかのテキストに変換する時はこのクラスを拡張し作成する。
 */
var DefaultBuilder = /** @class */ (function () {
    function DefaultBuilder() {
        this.extention = "bug";
    }
    Object.defineProperty(DefaultBuilder.prototype, "name", {
        get: function () {
            return this.constructor.name;
        },
        enumerable: false,
        configurable: true
    });
    DefaultBuilder.prototype.init = function (book) {
        var _this = this;
        this.book = book;
        return Promise.all(book.allChunks.map(function (chunk) { return _this.processAst(chunk); })).then(function () { return null; });
    };
    DefaultBuilder.prototype.getDefaultVisitorArg = function (process) {
        var _this = this;
        return {
            visitDefaultPre: function (_node) {
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
        };
    };
    DefaultBuilder.prototype.processAst = function (chunk) {
        var _this = this;
        var process = chunk.createBuilderProcess(this);
        return walker_1.visitAsync(chunk.tree.ast, this.getDefaultVisitorArg(process))
            .then(function () {
            _this.processPost(process, chunk);
            return Promise.all(chunk.nodes.map(function (chunk) { return _this.processAst(chunk); })).then(function () { return null; });
        });
    };
    DefaultBuilder.prototype.escape = function (_data) {
        throw new Error("please override this method");
    };
    DefaultBuilder.prototype.getChapterTitle = function (process, chapter) {
        var chapterNode = null;
        walker_1.visit(chapter.tree.ast, {
            visitDefaultPre: function (_node, _parent) {
                return !chapterNode;
            },
            visitChapterPre: function (node, _parent) {
                chapterNode = node;
                return false;
            }
        });
        if (!chapterNode) {
            return null;
        }
        return utils_1.nodeContentToString(process, chapterNode.headline);
    };
    DefaultBuilder.prototype.processPost = function (_process, _chunk) {
    };
    DefaultBuilder.prototype.chapterPre = function (_process, _node) {
    };
    DefaultBuilder.prototype.chapterPost = function (_process, _node) {
    };
    DefaultBuilder.prototype.headlinePre = function (_process, _name, _node) {
    };
    DefaultBuilder.prototype.headlinePost = function (_process, _name, _node) {
    };
    DefaultBuilder.prototype.columnPre = function (_process, _node) {
    };
    DefaultBuilder.prototype.columnPost = function (_process, _node) {
    };
    DefaultBuilder.prototype.columnHeadlinePre = function (_process, _node) {
    };
    DefaultBuilder.prototype.columnHeadlinePost = function (_process, _node) {
    };
    DefaultBuilder.prototype.paragraphPre = function (_process, _name, _node) {
    };
    DefaultBuilder.prototype.paragraphPost = function (_process, _name, _node) {
    };
    DefaultBuilder.prototype.ulistPre = function (_process, _name, _node) {
    };
    DefaultBuilder.prototype.ulistPost = function (_process, _name, _node) {
    };
    DefaultBuilder.prototype.olistPre = function (_process, _name, _node) {
    };
    DefaultBuilder.prototype.olistPost = function (_process, _name, _node) {
    };
    DefaultBuilder.prototype.dlistPre = function (_process, _name, _node) {
    };
    DefaultBuilder.prototype.dlistPost = function (_process, _name, _node) {
    };
    DefaultBuilder.prototype.text = function (process, node) {
        // TODO in paragraph だったら note.text.replace("\n", "") したほうが良い…
        process.out(node.text);
    };
    DefaultBuilder.prototype.blockPre = function (process, name, node) {
        var func;
        func = this["block_" + name];
        if (typeof func === "function") {
            return func.call(this, process, node);
        }
        func = this["block_" + name + "_pre"];
        if (typeof func !== "function") {
            throw new exception_1.AnalyzerError("block_" + name + "_pre or block_" + name + " is not Function");
        }
        return func.call(this, process, node);
    };
    DefaultBuilder.prototype.blockPost = function (process, name, node) {
        var func;
        func = this["block_" + name];
        if (typeof func === "function") {
            return;
        }
        func = this["block_" + name + "_post"];
        if (typeof func !== "function") {
            throw new exception_1.AnalyzerError("block_" + name + "_post is not Function");
        }
        return func.call(this, process, node);
    };
    DefaultBuilder.prototype.inlinePre = function (process, name, node) {
        var func;
        func = this["inline_" + name];
        if (typeof func === "function") {
            return func.call(this, process, node);
        }
        func = this["inline_" + name + "_pre"];
        if (typeof func !== "function") {
            throw new exception_1.AnalyzerError("inline_" + name + "_pre or inline_" + name + " is not Function");
        }
        return func.call(this, process, node);
    };
    DefaultBuilder.prototype.inlinePost = function (process, name, node) {
        var func;
        func = this["inline_" + name];
        if (typeof func === "function") {
            return;
        }
        func = this["inline_" + name + "_post"];
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
    DefaultBuilder.prototype.inline_hd_pre = function (process, node) {
        var _a, _b;
        process.out("「");
        var chapter = (_b = (_a = this.findReference(process, node).referenceTo) === null || _a === void 0 ? void 0 : _a.referenceNode) === null || _b === void 0 ? void 0 : _b.parentNode.toChapter();
        if (!chapter) {
            process.error(i18n_1.t("builder.chapter_not_found", 1), node);
            return false;
        }
        if (chapter.level === 1) {
            process.out(chapter.fqn).out("章 ");
        }
        else {
            process.out(chapter.fqn).out(" ");
        }
        // 再帰的に呼び出す（ラベルを使用した参照の場合、キャプションはインライン要素を含む可能性がある）
        walker_1.visit(chapter.headline.caption, this.getDefaultVisitorArg(process));
        return false;
    };
    DefaultBuilder.prototype.inline_hd_post = function (process, _node) {
        process.out("」");
    };
    DefaultBuilder.prototype.block_raw = function (process, node) {
        var _this = this;
        // TODO Ruby版との出力差が結構あるのでテスト含め直す
        var content = utils_1.nodeContentToString(process, node.args[0]);
        var matches = content.match(/\|(.+)\|/);
        if (matches && matches[1]) {
            var target = matches[1].split(",").some(function (name) { return _this.name.toLowerCase() === name + "builder"; });
            if (target) {
                // "|hoge,fuga| piyo" の場合 matches[1] === "hoge,fuga"
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
                // "|hoge,fuga| piyo" の場合 matches[1] === "hoge,fuga"
                process.outRaw(content.substring(matches[0].length));
            }
        }
        else {
            process.outRaw(content);
        }
        return false;
    };
    DefaultBuilder.prototype.singleLineComment = function (_process, _node) {
        // 特に何もしない
    };
    DefaultBuilder.prototype.parseTable = function (tableContents) {
        var rows = [];
        var currentRow = [];
        var currentCell = [];
        var headerRowCount = 0;
        tableContents.forEach(function (node) {
            if (node.isInlineElement()) {
                currentCell.push(node);
                return;
            }
            // 行成分に分解する。
            var lines = node.toTextNode().text.split(/\r?\n/g);
            var totalOffsetOrRowHead = 0;
            var _loop_1 = function (r) {
                if (r > 0) {
                    // 改行処理
                    if (currentCell.length > 0) {
                        currentRow.push({ nodes: currentCell });
                        currentCell = [];
                    }
                    if (currentRow.length > 0) {
                        rows.push(currentRow);
                        currentRow = [];
                    }
                }
                // Ruby実装との互換性のためトリム
                var line = lines[r].trim();
                if (line.match(/^(-{12,}|={12,})$/g) != null) {
                    if (headerRowCount === 0) {
                        headerRowCount = r;
                    }
                    return "continue";
                }
                var cells = line.split(/\t/g);
                var columnOffset = 0;
                cells.forEach(function (cell) {
                    if (!cell.length) {
                        // 空の列はスキップ
                        return;
                    }
                    var text;
                    if (cell === ".") {
                        text = "";
                    }
                    else {
                        text = cell.startsWith("..") ? cell.substr(1) : cell;
                    }
                    currentCell.push(new parser_1.TextNodeSyntaxTree({
                        syntax: "InlineElementContentText",
                        location: {
                            start: {
                                line: node.location.start.line + r,
                                column: columnOffset,
                                offset: node.location.start.offset + totalOffsetOrRowHead + columnOffset,
                            },
                            end: {
                                line: node.location.start.line + r,
                                column: columnOffset + cell.length,
                                offset: node.location.start.offset + totalOffsetOrRowHead + columnOffset + cell.length
                            }
                        },
                        text: text
                    }));
                    // 次の列へ。
                    if (currentCell.length > 0) {
                        currentRow.push({ nodes: currentCell });
                        currentCell = [];
                    }
                    // タブ文字分オフセットを増やす
                    columnOffset++;
                });
                totalOffsetOrRowHead += columnOffset;
            };
            for (var r = 0; r < lines.length; r++) {
                _loop_1(r);
            } // row
        });
        // 最終行の改行処理
        if (currentCell.length > 0) {
            currentRow.push({ nodes: currentCell });
        }
        if (currentRow.length > 0) {
            rows.push(currentRow);
        }
        // 列の補完
        var maxColumns = 0;
        for (var _i = 0, _a = rows.map(function (cells) { return cells.length; }); _i < _a.length; _i++) {
            var columns = _a[_i];
            if (columns > maxColumns) {
                maxColumns = columns;
            }
        }
        // 空文字列セルを作って埋める。
        rows.forEach(function (row) {
            var _a, _b, _c;
            var cell = row[row.length - 1];
            var location = cell.nodes[cell.nodes.length - 1].location;
            for (var c = row.length; c < maxColumns; c++) {
                row.push({
                    nodes: [
                        new parser_1.TextNodeSyntaxTree({
                            syntax: "InlineElementContentText",
                            location: {
                                start: {
                                    line: location.start.line,
                                    column: location.start.column,
                                    offset: location.start.offset,
                                },
                                end: {
                                    line: (_a = location.end) === null || _a === void 0 ? void 0 : _a.line,
                                    column: (_b = location.end) === null || _b === void 0 ? void 0 : _b.column,
                                    offset: (_c = location.end) === null || _c === void 0 ? void 0 : _c.offset
                                }
                            },
                            text: ""
                        })
                    ]
                });
            }
        });
        return { cells: rows, headerRowCount: headerRowCount };
    };
    return DefaultBuilder;
}());
exports.DefaultBuilder = DefaultBuilder;

},{"../i18n/i18n":8,"../js/exception":12,"../parser/parser":15,"../parser/walker":18,"../utils/utils":20}],2:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlBuilder = void 0;
var i18n_1 = require("../i18n/i18n");
var builder_1 = require("./builder");
var parser_1 = require("../parser/parser");
var walker_1 = require("../parser/walker");
var utils_1 = require("../utils/utils");
var HtmlBuilder = /** @class */ (function (_super) {
    __extends(HtmlBuilder, _super);
    function HtmlBuilder(standalone) {
        if (standalone === void 0) { standalone = true; }
        var _this = _super.call(this) || this;
        _this.standalone = standalone;
        _this.extention = "html";
        _this.escapeMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
        };
        return _this;
    }
    HtmlBuilder.prototype.escape = function (data) {
        var _this = this;
        var regexp = new RegExp("[" + Object.keys(this.escapeMap).join("") + "]", "g");
        return String(data).replace(regexp, function (c) { return _this.escapeMap[c]; });
    };
    HtmlBuilder.prototype.normalizeId = function (label) {
        if (label.match(/^[a-z][a-z0-9_/-]*$/i)) {
            return label;
        }
        else if (label.match(/^[0-9_.-][a-z0-9_.-]*$/i)) {
            return "id_" + label;
        }
        else {
            return "id_" + encodeURIComponent(label.replace(/_/g, "__").replace(/ /g, "-")).replace(/%/g, "_").replace(/\+/g, "-");
        }
    };
    HtmlBuilder.prototype.processPost = function (process, chunk) {
        if (this.standalone) {
            var pre = "";
            pre += "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + "\n";
            pre += "<!DOCTYPE html>" + "\n";
            pre += "<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:epub=\"http://www.idpf.org/2007/ops\" xmlns:ops=\"http://www.idpf.org/2007/ops\" xml:lang=\"ja\">" + "\n";
            pre += "<head>" + "\n";
            pre += "  <meta charset=\"UTF-8\" />" + "\n";
            pre += "  <link rel=\"stylesheet\" type=\"text/css\" href=\"stylesheet.css\" />" + "\n";
            pre += "  <meta name=\"generator\" content=\"Re:VIEW\" />" + "\n";
            var name_1 = null;
            walker_1.visit(chunk.tree.ast, {
                visitDefaultPre: function () {
                },
                visitChapterPre: function (node) {
                    if (node.headline.level === 1) {
                        name_1 = utils_1.nodeContentToString(process, node.headline.caption, /* textOnly */ true);
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
    HtmlBuilder.prototype.headlinePre = function (process, _name, node) {
        process.outRaw("<h").out(node.level);
        if (node.label) {
            process.outRaw(" id=\"").out(this.normalizeId(node.label.arg)).outRaw("\"");
        }
        process.outRaw(">");
        process.outRaw("<a id=\"h").out(utils_1.getHeadlineLevels(node).join("-")).outRaw("\"></a>");
        if (node.level === 1) {
            var text = i18n_1.t("builder.chapter", node.parentNode.no);
            process.outRaw("<span class=\"secno\">");
            process.out(text).out("　");
            process.outRaw("</span>");
        }
        else if (node.level < 4) {
            process.out(utils_1.getHeadlineLevels(node).join(".")).out("　");
        }
    };
    HtmlBuilder.prototype.headlinePost = function (process, _name, node) {
        process.outRaw("</h").out(node.level).outRaw(">\n");
    };
    HtmlBuilder.prototype.columnPre = function (process, _node) {
        process.outRaw("<div class=\"column\">\n\n");
    };
    HtmlBuilder.prototype.columnPost = function (process, _node) {
        process.outRaw("</div>\n");
    };
    HtmlBuilder.prototype.columnHeadlinePre = function (process, node) {
        process.outRaw("<h").out(node.level);
        if (node.label) {
            process.outRaw(" id=\"").out(this.normalizeId(node.label.arg)).outRaw("\"");
        }
        process.outRaw(">");
        process.outRaw("<a id=\"column-").out(node.parentNode.no).outRaw("\"></a>");
        return function (v) {
            walker_1.visit(node.caption, v);
        };
    };
    HtmlBuilder.prototype.columnHeadlinePost = function (process, node) {
        process.outRaw("</h").out(node.level).outRaw(">\n");
    };
    HtmlBuilder.prototype.paragraphPre = function (process, _name, node) {
        if (node.prev && node.prev.isBlockElement() && node.prev.toBlockElement().symbol === "noindent") {
            process.outRaw("<p class=\"noindent\">");
        }
        else {
            process.outRaw("<p>");
        }
    };
    HtmlBuilder.prototype.paragraphPost = function (process, _name, _node) {
        process.outRaw("</p>\n");
    };
    HtmlBuilder.prototype.ulistPre = function (process, _name, node) {
        this.ulistParentHelper(process, node, function () {
            process.outRaw("<ul>\n<li>");
        });
        // TODO <p> で囲まれないようにする
        if (node.prev instanceof parser_1.UlistElementSyntaxTree === false) {
            process.outRaw("<ul>\n");
        }
        process.outRaw("<li>");
    };
    HtmlBuilder.prototype.ulistPost = function (process, _name, node) {
        process.outRaw("</li>\n");
        if (node.next instanceof parser_1.UlistElementSyntaxTree === false) {
            process.outRaw("</ul>\n");
        }
        this.ulistParentHelper(process, node, function () {
            process.outRaw("</li>\n</ul>\n");
        });
    };
    HtmlBuilder.prototype.olistPre = function (process, _name, node) {
        if (node.prev instanceof parser_1.OlistElementSyntaxTree === false) {
            process.outRaw("<ol>\n");
        }
        process.outRaw("<li>");
    };
    HtmlBuilder.prototype.olistPost = function (process, _name, node) {
        process.outRaw("</li>\n");
        if (node.next instanceof parser_1.OlistElementSyntaxTree === false) {
            process.outRaw("</ol>\n");
        }
    };
    HtmlBuilder.prototype.dlistPre = function (process, _name, node) {
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
    HtmlBuilder.prototype.dlistPost = function (process, _name, node) {
        if (node.next instanceof parser_1.DlistElementSyntaxTree === false) {
            process.outRaw("</dl>\n");
        }
    };
    HtmlBuilder.prototype.block_list_pre = function (process, node) {
        process.outRaw("<div class=\"caption-code\">\n");
        var chapter = utils_1.findChapter(node, 1);
        if (!chapter) {
            process.error(i18n_1.t("builder.chapter_not_found", 1), node);
            return false;
        }
        var text = i18n_1.t("builder.list", chapter.fqn, node.no);
        process.outRaw("<p class=\"caption\">").out(text).outRaw(": ");
        return function (v) {
            // name はパスしたい, langもパスしたい
            walker_1.visit(node.args[1], v);
            process.outRaw("</p>\n");
            process.outRaw("<pre class=\"list\">");
            var nodeCount = node.childNodes.length;
            var nodeIndex = 0;
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
                // <pre>の中では入力の改行が保持されるべきだが、ASTのパースで消えてしまうため補完。
                // なお、\rは保持されるので、元ファイルの改行コードが\r\nの場合の考慮は不要。
                nodeIndex++;
                if (nodeIndex < nodeCount) {
                    process.out("\n");
                }
            });
        };
    };
    HtmlBuilder.prototype.block_list_post = function (process, _node) {
        process.outRaw("\n</pre>\n").outRaw("</div>\n");
    };
    HtmlBuilder.prototype.block_listnum_pre = function (process, node) {
        process.outRaw("<div class=\"code\">\n");
        var chapter = utils_1.findChapter(node, 1);
        if (!chapter) {
            process.error(i18n_1.t("builder.chapter_not_found", 1), node);
            return false;
        }
        var text = i18n_1.t("builder.list", chapter.fqn, node.no);
        process.outRaw("<p class=\"caption\">").out(text).out(": ");
        var lineCount = 1;
        return function (v) {
            // name はパスしたい, langもパスしたい
            walker_1.visit(node.args[1], v);
            process.outRaw("</p>\n");
            process.outRaw("<pre class=\"list\">");
            var lineCountMax = 0;
            node.childNodes.forEach(function (node) {
                if (node.isTextNode()) {
                    lineCountMax += node.toTextNode().text.split("\n").length;
                }
            });
            var lineDigit = Math.max(utils_1.linesToFigure(lineCountMax), 2);
            var nodeCount = node.childNodes.length;
            var nodeIndex = 0;
            node.childNodes.forEach(function (node, index, childNodes) {
                if (node.isTextNode()) {
                    // 改行する可能性があるのはTextNodeだけ…のはず
                    var hasNext_1 = !!childNodes[index + 1];
                    var textNode = node.toTextNode();
                    var lines_1 = textNode.text.split("\n");
                    lines_1.forEach(function (line, index) {
                        process.out(utils_1.padLeft(String(lineCount), " ", lineDigit)).out(": ");
                        process.out(line);
                        if (!hasNext_1 || lines_1.length - 1 !== index) {
                            lineCount++;
                        }
                        if (lines_1.length - 1 !== index) {
                            process.out("\n");
                        }
                    });
                }
                else {
                    walker_1.visit(node, v);
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
    };
    HtmlBuilder.prototype.block_listnum_post = function (process, _node) {
        process.outRaw("\n</pre>\n").outRaw("</div>\n");
    };
    HtmlBuilder.prototype.inline_list = function (process, node) {
        var chapter = utils_1.findChapter(node, 1);
        if (!chapter) {
            process.error(i18n_1.t("builder.chapter_not_found", 1), node);
            return false;
        }
        var listNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
        var text = i18n_1.t("builder.list", chapter.fqn, listNode.no);
        process.out(text);
        return false;
    };
    HtmlBuilder.prototype.block_emlist_pre = function (process, node) {
        process.outRaw("<div class=\"emlist-code\">\n");
        return function (v) {
            // name はパスしたい
            if (node.args[0]) {
                process.outRaw("<p class=\"caption\">");
                walker_1.visit(node.args[0], v);
                process.outRaw("</p>\n");
            }
            process.outRaw("<pre class=\"emlist\">");
            var nodeCount = node.childNodes.length;
            var nodeIndex = 0;
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
                // <pre>の中では入力の改行が保持されるべきだが、ASTのパースで消えてしまうため補完。
                // なお、\rは保持されるので、元ファイルの改行コードが\r\nの場合の考慮は不要。
                nodeIndex++;
                if (nodeIndex < nodeCount) {
                    process.out("\n");
                }
            });
        };
    };
    HtmlBuilder.prototype.block_emlist_post = function (process, _node) {
        process.outRaw("\n</pre>\n").outRaw("</div>\n");
    };
    HtmlBuilder.prototype.block_emlistnum_pre = function (process, node) {
        process.outRaw("<div class=\"emlistnum-code\">\n");
        process.outRaw("<pre class=\"emlist\">");
        var lineCount = 1;
        return function (v) {
            // name, args はパスしたい
            var lineCountMax = 0;
            node.childNodes.forEach(function (node) {
                if (node.isTextNode()) {
                    lineCountMax += node.toTextNode().text.split("\n").length;
                }
            });
            var lineDigit = Math.max(utils_1.linesToFigure(lineCountMax), 2);
            var nodeCount = node.childNodes.length;
            var nodeIndex = 0;
            node.childNodes.forEach(function (node, index, childNodes) {
                if (node.isTextNode()) {
                    // 改行する可能性があるのはTextNodeだけ…のはず
                    var hasNext_2 = !!childNodes[index + 1];
                    var textNode = node.toTextNode();
                    var lines_2 = textNode.text.split("\n");
                    lines_2.forEach(function (line, index) {
                        process.out(utils_1.padLeft(String(lineCount), " ", lineDigit)).out(": ");
                        process.out(line);
                        if (!hasNext_2 || lines_2.length - 1 !== index) {
                            lineCount++;
                        }
                        if (lines_2.length - 1 !== index) {
                            process.out("\n");
                        }
                    });
                }
                else {
                    walker_1.visit(node, v);
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
    };
    HtmlBuilder.prototype.block_emlistnum_post = function (process, _node) {
        process.outRaw("\n</pre>\n").outRaw("</div>\n");
    };
    HtmlBuilder.prototype.inline_br = function (process, _node) {
        process.outRaw("<br />");
    };
    HtmlBuilder.prototype.inline_b_pre = function (process, _node) {
        process.outRaw("<b>");
    };
    HtmlBuilder.prototype.inline_b_post = function (process, _node) {
        process.outRaw("</b>");
    };
    HtmlBuilder.prototype.inline_code_pre = function (process, _node) {
        process.outRaw("<code class=\"inline-code tt\">");
    };
    HtmlBuilder.prototype.inline_code_post = function (process, _node) {
        process.outRaw("</code>");
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
    HtmlBuilder.prototype.inline_tt_pre = function (process, _node) {
        process.outRaw("<code class=\"tt\">"); // TODO RubyReviewではContentに改行が含まれている奴の挙動がサポートされていない。
    };
    HtmlBuilder.prototype.inline_tt_post = function (process, _node) {
        process.outRaw("</code>");
    };
    HtmlBuilder.prototype.inline_ruby_pre = function (process, node) {
        process.outRaw("<ruby>");
        return function (_v) {
            // name, args はパス
            node.childNodes.forEach(function (node) {
                var contentString = utils_1.nodeContentToString(process, node);
                var keywordData = contentString.split(",");
                process.out(keywordData[0]);
                process.outRaw("<rp>（</rp>");
                process.outRaw("<rt>").out(keywordData[1]).outRaw("</rt>");
                process.outRaw("<rp>）</rp>");
            });
        };
    };
    HtmlBuilder.prototype.inline_ruby_post = function (process, _node) {
        process.outRaw("</ruby>");
    };
    HtmlBuilder.prototype.inline_u_pre = function (process, _node) {
        process.outRaw("<u>");
    };
    HtmlBuilder.prototype.inline_u_post = function (process, _node) {
        process.outRaw("</u>");
    };
    HtmlBuilder.prototype.inline_kw_pre = function (process, node) {
        process.outRaw("<b class=\"kw\">");
        return function (_v) {
            // name, args はパス
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
    HtmlBuilder.prototype.inline_em_pre = function (process, _node) {
        process.outRaw("<em>");
    };
    HtmlBuilder.prototype.inline_em_post = function (process, _node) {
        process.outRaw("</em>");
    };
    HtmlBuilder.prototype.block_image = function (process, node) {
        var label = utils_1.nodeContentToString(process, node.args[0]);
        return process.findImageFile(label)
            .then(function (imagePath) {
            var caption = utils_1.nodeContentToString(process, node.args[1]); // TODO vistでinlineの処理をきっちりするべき
            var scale = 1;
            if (node.args[2]) {
                // let arg3 = node.args[2].arg;
                var regexp = new RegExp("scale=(\\d+(?:\\.\\d+))");
                var result = regexp.exec(utils_1.nodeContentToString(process, node.args[2]));
                if (result) {
                    scale = parseFloat(result[1]);
                }
            }
            process.outRaw("<div id=\"").out(label).outRaw("\" class=\"image\">" + "\n");
            // imagePathは変数作成時点でユーザ入力部分をescapeしている
            if (scale !== 1) {
                var scaleClass = "000" + scale * 100;
                scaleClass = scaleClass.substr(scaleClass.length - 3);
                // TODO 各class設定にあわせたcssを同梱しないと…
                process.outRaw("<img src=\"" + imagePath + "\" alt=\"").out(caption).outRaw("\" class=\"width-").out(scaleClass).outRaw("per\" />\n");
            }
            else {
                process.outRaw("<img src=\"" + imagePath + "\" alt=\"").out(caption).outRaw("\" />" + "\n");
            }
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
                // let arg3 = node.args[2].arg;
                var regexp = new RegExp("scale=(\\d+(?:\\.\\d+))");
                var result = regexp.exec(utils_1.nodeContentToString(process, node.args[2]));
                if (result) {
                    scale = parseFloat(result[1]);
                }
            }
            process.outRaw("<div class=\"image\">\n");
            // imagePathは変数作成時点でユーザ入力部分をescapeしている
            if (scale !== 1) {
                var scaleClass = "000" + scale * 100;
                scaleClass = scaleClass.substr(scaleClass.length - 3);
                // TODO 各class設定にあわせたcssを同梱しないと…
                process.outRaw("<img src=\"" + imagePath + "\" alt=\"").out(caption).outRaw("\" class=\"width-").out(scaleClass).outRaw("per\" />\n");
            }
            else {
                process.outRaw("<img src=\"" + imagePath + "\" alt=\"").out(caption).outRaw("\" />" + "\n");
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
        // TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
        process.outRaw("<div>\n");
        var toolName = utils_1.nodeContentToString(process, node.args[1]);
        process.outRaw("<p>graph: ").out(toolName).outRaw("</p>\n");
        process.outRaw("<pre>");
        return function (v) {
            // name, args はパスしたい
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    HtmlBuilder.prototype.block_graph_post = function (process, _node) {
        // TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
        process.outRaw("\n</pre>\n").outRaw("</div>\n");
    };
    HtmlBuilder.prototype.inline_img = function (process, node) {
        var imgNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
        process.out("図").out(process.base.chapter.no).out(".").out(imgNode.no);
        return false;
    };
    HtmlBuilder.prototype.inline_icon = function (process, node) {
        // TODO ファイル名探索ロジックをもっと頑張る(jpgとかsvgとか)
        var chapterFileName = process.base.chapter.name;
        var chapterName = chapterFileName.substring(0, chapterFileName.length - 3);
        var imageName = utils_1.nodeContentToString(process, node);
        var imagePath = "images/" + this.escape(chapterName) + "-" + this.escape(imageName) + ".png";
        process.outRaw("<img src=\"" + imagePath + "\" alt=\"[").out(imageName).outRaw("]\" />");
        return false;
    };
    HtmlBuilder.prototype.block_footnote = function (process, node) {
        var label = utils_1.nodeContentToString(process, node.args[0]);
        process.outRaw("<div class=\"footnote\" epub:type=\"footnote\" id=\"fn-").outRaw(label).outRaw("\"><p class=\"footnote\">");
        process.outRaw("[*").out(node.no).outRaw("] ");
        return function (v) {
            walker_1.visit(node.args[1], v);
            process.outRaw("</p></div>\n");
        };
    };
    HtmlBuilder.prototype.inline_fn = function (process, node) {
        var footnoteNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
        var label = utils_1.nodeContentToString(process, footnoteNode.args[0]);
        process.outRaw("<a id=\"fnb-").out(label).outRaw("\" href=\"#fn-").out(label).outRaw("\" class=\"noteref\" epub:type=\"noteref\">*").out(footnoteNode.no).outRaw("</a>");
        return false;
    };
    HtmlBuilder.prototype.block_lead_pre = function (process, _node) {
        process.outRaw("<div class=\"lead\">\n");
    };
    HtmlBuilder.prototype.block_lead_post = function (process, _node) {
        process.outRaw("</div>\n");
    };
    HtmlBuilder.prototype.inline_tti_pre = function (process, _node) {
        process.outRaw("<code class=\"tt\"><i>");
    };
    HtmlBuilder.prototype.inline_tti_post = function (process, _node) {
        process.outRaw("</i></code>");
    };
    HtmlBuilder.prototype.inline_ttb_pre = function (process, _node) {
        process.outRaw("<code class=\"tt\"><b>");
    };
    HtmlBuilder.prototype.inline_ttb_post = function (process, _node) {
        process.outRaw("</b></code>");
    };
    HtmlBuilder.prototype.block_noindent = function (_process, _node) {
        // paragraphPre 中で処理
        return false;
    };
    HtmlBuilder.prototype.block_source_pre = function (process, node) {
        process.outRaw("<div class=\"source-code\">\n");
        process.outRaw("<p class=\"caption\">").out(utils_1.nodeContentToString(process, node.args[0])).outRaw("</p>\n");
        process.outRaw("<pre class=\"source\">");
        return function (v) {
            // name, args はパスしたい
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    HtmlBuilder.prototype.block_source_post = function (process, _node) {
        process.outRaw("\n</pre>\n").outRaw("</div>\n");
    };
    HtmlBuilder.prototype.block_cmd_pre = function (process, node) {
        process.outRaw("<div class=\"cmd-code\">\n");
        process.outRaw("<pre class=\"cmd\">");
        return function (v) {
            // name, args はパスしたい
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    HtmlBuilder.prototype.block_cmd_post = function (process, _node) {
        process.outRaw("\n</pre>\n").outRaw("</div>\n");
    };
    HtmlBuilder.prototype.block_quote_pre = function (process, node) {
        process.outRaw("<blockquote><p>");
        return function (v) {
            // name, args はパスしたい
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    HtmlBuilder.prototype.block_quote_post = function (process, _node) {
        process.outRaw("</p></blockquote>\n");
    };
    HtmlBuilder.prototype.inline_ami_pre = function (process, _node) {
        process.outRaw("<span class=\"ami\">");
    };
    HtmlBuilder.prototype.inline_ami_post = function (process, _node) {
        process.outRaw("</span>");
    };
    HtmlBuilder.prototype.inline_bou_pre = function (process, _node) {
        process.outRaw("<span class=\"bou\">");
    };
    HtmlBuilder.prototype.inline_bou_post = function (process, _node) {
        process.outRaw("</span>");
    };
    HtmlBuilder.prototype.inline_i_pre = function (process, _node) {
        process.outRaw("<i>");
    };
    HtmlBuilder.prototype.inline_i_post = function (process, _node) {
        process.outRaw("</i>");
    };
    HtmlBuilder.prototype.inline_m_pre = function (process, _node) {
        // TODO MathMLかなんかで…
        process.outRaw("<span>TODO: ");
    };
    HtmlBuilder.prototype.inline_m_post = function (process, _node) {
        process.outRaw("</span>");
    };
    HtmlBuilder.prototype.inline_strong_pre = function (process, _node) {
        process.outRaw("<strong>");
    };
    HtmlBuilder.prototype.inline_strong_post = function (process, _node) {
        process.outRaw("</strong>");
    };
    HtmlBuilder.prototype.inline_uchar_pre = function (process, _node) {
        process.outRaw("&#x");
    };
    HtmlBuilder.prototype.inline_uchar_post = function (process, _node) {
        process.outRaw(";");
    };
    HtmlBuilder.prototype.block_table_pre = function (process, node) {
        var chapter = utils_1.findChapter(node, 1);
        if (!chapter) {
            process.error(i18n_1.t("builder.chapter_not_found", 1), node);
            return false;
        }
        var text = i18n_1.t("builder.table", chapter.fqn, node.no);
        process.outRaw("<div");
        if (node.args[0] != null) {
            // BracketArgs -> BracketArgSubs -> BracketArgText
            process.outRaw(" id=\"").out(this.normalizeId(node.args[0].childNodes[0].toNode().childNodes[0].toTextNode().text)).outRaw("\"");
        }
        process.outRaw(" class=\"table\">\n");
        process.outRaw("<p class=\"caption\">").out(text).out(": ").out(utils_1.nodeContentToString(process, node.args[1])).outRaw("</p>\n");
        process.outRaw("<table>\n");
        var table = this.parseTable(node.childNodes);
        return function (v) {
            if (table.headerRowCount === 0) {
                // 1列目がヘッダー
                table.cells.forEach(function (columns) {
                    if (columns.length === 0) {
                        return;
                    }
                    process.outRaw("<tr>");
                    // ヘッダー列
                    process.outRaw("<th>");
                    columns[0].nodes.forEach(function (node) {
                        walker_1.visit(node, v);
                    });
                    process.outRaw("</th>");
                    // 残りの列
                    for (var c = 1; c < columns.length; c++) {
                        process.outRaw("<td>");
                        columns[c].nodes.forEach(function (node) {
                            walker_1.visit(node, v);
                        });
                        process.outRaw("</td>");
                    }
                    process.outRaw("</tr>\n");
                });
            }
            else {
                // ヘッダー行
                var r = 0;
                for (; r < table.headerRowCount; r++) {
                    process.outRaw("<tr>");
                    table.cells[r].forEach(function (columns) {
                        process.outRaw("<th>");
                        columns.nodes.forEach(function (node) {
                            walker_1.visit(node, v);
                        });
                        process.outRaw("</th>");
                    });
                    process.outRaw("</tr>\n");
                }
                // ボディ
                for (; r < table.cells.length; r++) {
                    process.outRaw("<tr>");
                    table.cells[r].forEach(function (columns) {
                        process.outRaw("<td>");
                        columns.nodes.forEach(function (node) {
                            walker_1.visit(node, v);
                        });
                        process.outRaw("</td>");
                    });
                    process.outRaw("</tr>\n");
                }
            }
        };
    };
    HtmlBuilder.prototype.block_table_post = function (process, _node) {
        process.outRaw("</table>\n").outRaw("</div>\n");
    };
    HtmlBuilder.prototype.inline_table = function (process, node) {
        var chapter = utils_1.findChapter(node, 1);
        if (!chapter) {
            process.error(i18n_1.t("builder.chapter_not_found", 1), node);
            return false;
        }
        var listNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
        var text = i18n_1.t("builder.table", chapter.fqn, listNode.no);
        process.outRaw("<span class=\"tableref\">").out(text).outRaw("</span>");
        return false;
    };
    HtmlBuilder.prototype.block_tsize = function (_process, _node) {
        // TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
        return false;
    };
    HtmlBuilder.prototype.block_comment_pre = function (process, node) {
        if (!this.book.config.isDraft) {
            // 中断
            return false;
        }
        process.outRaw("<div class=\"draft-comment\">");
        return function (v) {
            // name, args はパスしたい
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    HtmlBuilder.prototype.block_comment_post = function (process, _node) {
        if (!this.book.config.isDraft) {
            return;
        }
        process.outRaw("</div>\n");
    };
    HtmlBuilder.prototype.inline_comment_pre = function (process, _node) {
        if (!this.book.config.isDraft) {
            // 中断
            return false;
        }
        process.outRaw("<span class=\"draft-comment\">");
        return true;
    };
    HtmlBuilder.prototype.inline_comment_post = function (process, _node) {
        if (!this.book.config.isDraft) {
            return;
        }
        process.outRaw("</span>");
    };
    HtmlBuilder.prototype.inline_chap = function (process, node) {
        var chapName = utils_1.nodeContentToString(process, node);
        var chapter = process.findChapter(chapName);
        process.out(i18n_1.t("builder.chapter", chapter.no));
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
        process.out(i18n_1.t("builder.chapter_ref", chapter.no, title));
        return false;
    };
    HtmlBuilder.prototype.inline_idx = function (process, node) {
        var text = utils_1.nodeContentToString(process, node);
        process.out(text).outRaw("<!-- IDX:").out(text).outRaw(" -->");
        return false;
    };
    HtmlBuilder.prototype.inline_hidx = function (process, node) {
        var text = utils_1.nodeContentToString(process, node);
        process.outRaw("<!-- IDX:").out(text).outRaw(" -->");
        return false;
    };
    HtmlBuilder.prototype.block_flushright_pre = function (process, node) {
        process.outRaw("<p class=\"flushright\">");
        return function (v) {
            // name, args はパスしたい
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    HtmlBuilder.prototype.block_flushright_post = function (process, _node) {
        process.outRaw("</p>\n");
    };
    HtmlBuilder.prototype.block_captionblock_pre = function (typename, process, node) {
        process.outRaw("<div class=\"" + typename + "\">\n");
        if (node.args[0]) {
            var label = utils_1.nodeContentToString(process, node.args[0]);
            process.outRaw("<p class=\"caption\">").out(label).outRaw("</p>\n");
        }
    };
    HtmlBuilder.prototype.block_captionblock_post = function (_typename, process, _node) {
        process.outRaw("</div>\n");
    };
    HtmlBuilder.prototype.block_info_pre = function (process, node) {
        this.block_captionblock_pre("info", process, node);
    };
    HtmlBuilder.prototype.block_info_post = function (process, node) {
        this.block_captionblock_post("info", process, node);
    };
    HtmlBuilder.prototype.block_note_pre = function (process, node) {
        this.block_captionblock_pre("note", process, node);
    };
    HtmlBuilder.prototype.block_note_post = function (process, node) {
        this.block_captionblock_post("note", process, node);
    };
    HtmlBuilder.prototype.block_memo_pre = function (process, node) {
        this.block_captionblock_pre("memo", process, node);
    };
    HtmlBuilder.prototype.block_memo_post = function (process, node) {
        this.block_captionblock_post("memo", process, node);
    };
    HtmlBuilder.prototype.block_tip_pre = function (process, node) {
        this.block_captionblock_pre("tip", process, node);
    };
    HtmlBuilder.prototype.block_tip_post = function (process, node) {
        this.block_captionblock_post("tip", process, node);
    };
    HtmlBuilder.prototype.block_warning_pre = function (process, node) {
        this.block_captionblock_pre("warning", process, node);
    };
    HtmlBuilder.prototype.block_warning_post = function (process, node) {
        this.block_captionblock_post("warning", process, node);
    };
    HtmlBuilder.prototype.block_important_pre = function (process, node) {
        this.block_captionblock_pre("important", process, node);
    };
    HtmlBuilder.prototype.block_important_post = function (process, node) {
        this.block_captionblock_post("important", process, node);
    };
    HtmlBuilder.prototype.block_caution_pre = function (process, node) {
        this.block_captionblock_pre("caution", process, node);
    };
    HtmlBuilder.prototype.block_caution_post = function (process, node) {
        this.block_captionblock_post("caution", process, node);
    };
    HtmlBuilder.prototype.block_notice_pre = function (process, node) {
        this.block_captionblock_pre("notice", process, node);
    };
    HtmlBuilder.prototype.block_notice_post = function (process, node) {
        this.block_captionblock_post("notice", process, node);
    };
    return HtmlBuilder;
}(builder_1.DefaultBuilder));
exports.HtmlBuilder = HtmlBuilder;

},{"../i18n/i18n":8,"../parser/parser":15,"../parser/walker":18,"../utils/utils":20,"./builder":1}],3:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextBuilder = void 0;
var builder_1 = require("./builder");
var i18n_1 = require("../i18n/i18n");
var parser_1 = require("../parser/parser");
var walker_1 = require("../parser/walker");
var utils_1 = require("../utils/utils");
var TextBuilder = /** @class */ (function (_super) {
    __extends(TextBuilder, _super);
    function TextBuilder() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.extention = "txt";
        return _this;
    }
    TextBuilder.prototype.escape = function (data) {
        return data;
    };
    TextBuilder.prototype.headlinePre = function (process, _name, node) {
        process.out("■H").out(node.level).out("■");
        if (node.level === 1) {
            var text = i18n_1.t("builder.chapter", node.parentNode.no);
            process.out(text).out("　");
        }
        else if (node.level < 4) {
            process.out(utils_1.getHeadlineLevels(node).join(".")).out("　");
        }
    };
    TextBuilder.prototype.headlinePost = function (process, _name, _node) {
        process.out("\n\n");
    };
    TextBuilder.prototype.columnHeadlinePre = function (process, node) {
        process.out("\n◆→開始:コラム←◆\n");
        process.out("■");
        return function (v) {
            walker_1.visit(node.caption, v);
        };
    };
    TextBuilder.prototype.columnHeadlinePost = function (process, _node) {
        process.out("\n");
    };
    TextBuilder.prototype.columnPost = function (process, _node) {
        process.out("◆→終了:コラム←◆\n\n");
    };
    TextBuilder.prototype.paragraphPost = function (process, _name, _node) {
        process.out("\n");
    };
    TextBuilder.prototype.ulistPre = function (process, _name, node) {
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
    TextBuilder.prototype.ulistPost = function (process, _name, _node) {
        process.out("\n");
    };
    TextBuilder.prototype.olistPre = function (process, _name, node) {
        process.out(node.no).out("\t");
    };
    TextBuilder.prototype.olistPost = function (process, _name, _node) {
        process.out("\n");
    };
    TextBuilder.prototype.dlistPre = function (process, _name, node) {
        return function (v) {
            process.out("★");
            walker_1.visit(node.text, v);
            process.out("☆\n");
            process.out("\t");
            walker_1.visit(node.content, v);
            process.out("\n");
        };
    };
    TextBuilder.prototype.dlistPost = function (process, _name, _node) {
        process.out("\n");
    };
    TextBuilder.prototype.block_list_pre = function (process, node) {
        process.out("◆→開始:リスト←◆\n");
        var chapter = utils_1.findChapter(node, 1);
        if (!chapter) {
            process.error(i18n_1.t("builder.chapter_not_found", 1), node);
            return false;
        }
        var text = i18n_1.t("builder.list", chapter.fqn, node.no);
        process.out(text).out("　");
        return function (v) {
            // name はパスしたい, langもパスしたい
            walker_1.visit(node.args[1], v);
            process.outRaw("\n\n");
            var nodeCount = node.childNodes.length;
            var nodeIndex = 0;
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
                // 入力の改行が保持されるべきだが、ASTのパースで消えてしまうため補完。
                // なお、\rは保持されるので、元ファイルの改行コードが\r\nの場合の考慮は不要。
                nodeIndex++;
                if (nodeIndex < nodeCount) {
                    process.out("\n");
                }
            });
        };
    };
    TextBuilder.prototype.block_list_post = function (process, _node) {
        process.out("\n◆→終了:リスト←◆\n");
    };
    TextBuilder.prototype.block_listnum_pre = function (process, node) {
        process.out("◆→開始:リスト←◆\n");
        var chapter = utils_1.findChapter(node, 1);
        if (!chapter) {
            process.error(i18n_1.t("builder.chapter_not_found", 1), node);
            return false;
        }
        var text = i18n_1.t("builder.list", chapter.fqn, node.no);
        process.out(text).out("　");
        var lineCount = 1;
        return function (v) {
            // name はパスしたい, langもパスしたい
            walker_1.visit(node.args[1], v);
            var lineCountMax = 0;
            node.childNodes.forEach(function (node, _index, _childNodes) {
                if (node.isTextNode()) {
                    lineCountMax += node.toTextNode().text.split("\n").length;
                }
            });
            var lineDigit = Math.max(utils_1.linesToFigure(lineCountMax), 2);
            process.outRaw("\n\n");
            node.childNodes.forEach(function (node, index, childNodes) {
                if (node.isTextNode()) {
                    // 改行する可能性があるのはTextNodeだけ…のはず
                    var hasNext_1 = !!childNodes[index + 1];
                    var textNode = node.toTextNode();
                    var lines_1 = textNode.text.split("\n");
                    lines_1.forEach(function (line, index) {
                        process.out(utils_1.padLeft(String(lineCount), " ", lineDigit)).out(": ");
                        process.out(line);
                        if (!hasNext_1 || lines_1.length - 1 !== index) {
                            lineCount++;
                        }
                        process.out("\n");
                    });
                }
                else {
                    walker_1.visit(node, v);
                }
                lineCount++;
            });
        };
    };
    TextBuilder.prototype.block_listnum_post = function (process, _node) {
        process.out("◆→終了:リスト←◆\n");
    };
    TextBuilder.prototype.inline_list = function (process, node) {
        var chapter = utils_1.findChapter(node, 1);
        if (!chapter) {
            process.error(i18n_1.t("builder.chapter_not_found", 1), node);
            return false;
        }
        var listNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
        var text = i18n_1.t("builder.list", chapter.fqn, listNode.no);
        process.out(text);
        return false;
    };
    TextBuilder.prototype.block_emlist_pre = function (process, node) {
        process.out("◆→開始:インラインリスト←◆\n");
        return function (v) {
            // name はパスしたい
            if (node.args[0]) {
                process.out("■");
                walker_1.visit(node.args[0], v);
                process.out("\n");
            }
            var nodeCount = node.childNodes.length;
            var nodeIndex = 0;
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
                // 入力の改行が保持されるべきだが、ASTのパースで消えてしまうため補完。
                // なお、\rは保持されるので、元ファイルの改行コードが\r\nの場合の考慮は不要。
                nodeIndex++;
                if (nodeIndex < nodeCount) {
                    process.out("\n");
                }
            });
        };
    };
    TextBuilder.prototype.block_emlist_post = function (process, _node) {
        process.out("\n◆→終了:インラインリスト←◆\n");
    };
    TextBuilder.prototype.block_emlistnum_pre = function (process, node) {
        process.out("◆→開始:インラインリスト←◆\n");
        var lineCount = 1;
        return function (v) {
            // name はパスしたい
            if (node.args[0]) {
                process.out("■");
                walker_1.visit(node.args[0], v);
                process.out("\n");
            }
            var lineCountMax = 0;
            node.childNodes.forEach(function (node, _index, _childNodes) {
                if (node.isTextNode()) {
                    lineCountMax += node.toTextNode().text.split("\n").length;
                }
            });
            var lineDigit = Math.max(utils_1.linesToFigure(lineCountMax), 2);
            node.childNodes.forEach(function (node, index, childNodes) {
                if (node.isTextNode()) {
                    // 改行する可能性があるのはTextNodeだけ…のはず
                    var hasNext_2 = !!childNodes[index + 1];
                    var textNode = node.toTextNode();
                    var lines_2 = textNode.text.split("\n");
                    lines_2.forEach(function (line, index) {
                        process.out(utils_1.padLeft(String(lineCount), " ", lineDigit)).out(": ");
                        process.out(line);
                        if (!hasNext_2 || lines_2.length - 1 !== index) {
                            lineCount++;
                        }
                        process.out("\n");
                    });
                }
                else {
                    walker_1.visit(node, v);
                }
                lineCount++;
            });
        };
    };
    TextBuilder.prototype.block_emlistnum_post = function (process, _node) {
        process.out("◆→終了:インラインリスト←◆\n");
    };
    TextBuilder.prototype.inline_br = function (process, _node) {
        process.out("\n");
    };
    TextBuilder.prototype.inline_b_pre = function (process, _node) {
        process.out("★");
    };
    TextBuilder.prototype.inline_b_post = function (process, _node) {
        process.out("☆");
    };
    TextBuilder.prototype.inline_code_pre = function (process, _node) {
        process.out("△");
    };
    TextBuilder.prototype.inline_code_post = function (process, _node) {
        process.out("☆");
    };
    TextBuilder.prototype.inline_href_pre = function (process, _node) {
        process.out("△");
    };
    TextBuilder.prototype.inline_href_post = function (process, _node) {
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
    TextBuilder.prototype.block_label = function (_process, _node) {
        return false;
    };
    TextBuilder.prototype.inline_ruby = function (process, node) {
        var contentString = utils_1.nodeContentToString(process, node);
        var keywordData = contentString.split(",");
        process.out(keywordData[0]);
        return function (_v) {
            // name, args はパス
            node.childNodes.forEach(function (_node) {
                process.out("◆→DTP連絡:「").out(keywordData[0]);
                process.out("」に「 ").out(keywordData[1].trim()).out("」とルビ←◆");
            });
        };
    };
    TextBuilder.prototype.inline_u_pre = function (process, _node) {
        process.out("＠");
    };
    TextBuilder.prototype.inline_u_post = function (process, _node) {
        process.out("＠◆→＠〜＠部分に下線←◆");
    };
    TextBuilder.prototype.inline_kw = function (process, node) {
        process.out("★");
        return function (_v) {
            // name, args はパス
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
    TextBuilder.prototype.inline_tt_pre = function (process, _node) {
        process.out("△");
    };
    TextBuilder.prototype.inline_tt_post = function (process, _node) {
        process.out("☆");
    };
    TextBuilder.prototype.inline_em_pre = function (process, node) {
        process.warn(i18n_1.t("compile.deprecated_inline_symbol", "em"), node);
        process.out("@<em>{");
    };
    TextBuilder.prototype.inline_em_post = function (process, _node) {
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
        // TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
        process.outRaw("◆→開始:図←◆\n");
        var toolName = utils_1.nodeContentToString(process, node.args[1]);
        process.outRaw("graph: ").out(toolName).outRaw("</p>\n");
        return function (v) {
            // name, args はパスしたい
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    TextBuilder.prototype.block_graph_post = function (process, _node) {
        // TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
        process.outRaw("◆→終了:図←◆\n");
    };
    TextBuilder.prototype.inline_img = function (process, node) {
        var imgNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
        process.out("図").out(process.base.chapter.no).out(".").out(imgNode.no).out("\n");
        return false;
    };
    TextBuilder.prototype.inline_icon = function (process, node) {
        // TODO ファイル名探索ロジックをもっと頑張る(jpgとかsvgとか)
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
    TextBuilder.prototype.block_lead_pre = function (process, _node) {
        process.out("◆→開始:リード←◆\n");
    };
    TextBuilder.prototype.block_lead_post = function (process, _node) {
        process.out("◆→終了:リード←◆\n");
    };
    TextBuilder.prototype.inline_tti_pre = function (process, _node) {
        process.out("▲");
    };
    TextBuilder.prototype.inline_tti_post = function (process, _node) {
        process.out("☆◆→等幅フォントイタ←◆");
    };
    TextBuilder.prototype.inline_ttb_pre = function (process, _node) {
        process.out("★");
    };
    TextBuilder.prototype.inline_ttb_post = function (process, _node) {
        process.out("☆◆→等幅フォント太字←◆");
    };
    TextBuilder.prototype.block_noindent = function (process, _node) {
        process.out("◆→DTP連絡:次の1行インデントなし←◆\n");
        return false;
    };
    TextBuilder.prototype.block_source_pre = function (process, node) {
        process.out("◆→開始:ソースコードリスト←◆\n");
        process.out("■").out(utils_1.nodeContentToString(process, node.args[0])).out("\n");
        return function (v) {
            // name, args はパスしたい
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    TextBuilder.prototype.block_source_post = function (process, _node) {
        process.out("\n◆→終了:ソースコードリスト←◆\n");
    };
    TextBuilder.prototype.block_cmd_pre = function (process, node) {
        process.out("◆→開始:コマンド←◆\n");
        return function (v) {
            // name, args はパスしたい
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    TextBuilder.prototype.block_cmd_post = function (process, _node) {
        process.out("\n◆→終了:コマンド←◆\n");
    };
    TextBuilder.prototype.block_quote_pre = function (process, node) {
        process.out("◆→開始:引用←◆\n");
        return function (v) {
            // name, args はパスしたい
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    TextBuilder.prototype.block_quote_post = function (process, _node) {
        process.out("\n◆→終了:引用←◆\n");
    };
    TextBuilder.prototype.inline_ami_pre = function (_process, _node) {
    };
    TextBuilder.prototype.inline_ami_post = function (process, node) {
        // TODO 入れ子になっている場合オペレータさんにイミフな出力になっちゃう
        process.out("◆→DTP連絡:「").out(utils_1.nodeContentToString(process, node)).out("」に網カケ←◆");
    };
    TextBuilder.prototype.inline_bou_pre = function (_process, _node) {
    };
    TextBuilder.prototype.inline_bou_post = function (process, node) {
        // TODO 入れ子になっている場合オペレータさんにイミフな出力になっちゃう
        process.out("◆→DTP連絡:「").out(utils_1.nodeContentToString(process, node)).out("」に傍点←◆");
    };
    TextBuilder.prototype.inline_i_pre = function (process, _node) {
        process.out("▲");
    };
    TextBuilder.prototype.inline_i_post = function (process, _node) {
        process.out("☆");
    };
    TextBuilder.prototype.inline_m_pre = function (process, _node) {
        // TODO
        process.outRaw("TODO: ");
    };
    TextBuilder.prototype.inline_m_post = function (process, _node) {
        process.outRaw("");
    };
    TextBuilder.prototype.inline_strong_pre = function (process, _node) {
        process.out("★");
    };
    TextBuilder.prototype.inline_strong_post = function (process, _node) {
        process.out("☆");
    };
    TextBuilder.prototype.inline_uchar = function (process, node) {
        var hexString = utils_1.nodeContentToString(process, node);
        var code = parseInt(hexString, 16);
        var result = "";
        /* tslint:disable:no-bitwise */
        while (code !== 0) {
            result = String.fromCharCode(code & 0xFFFF) + result;
            code >>>= 16;
        }
        /* tslint:enable:no-bitwise */
        process.out(result);
        return false;
    };
    TextBuilder.prototype.block_table_pre = function (process, node) {
        process.out("\n◆→開始:表←◆\n");
        var chapter = utils_1.findChapter(node, 1);
        if (!chapter) {
            process.error(i18n_1.t("builder.chapter_not_found", 1), node);
            return false;
        }
        var text = i18n_1.t("builder.table", chapter.fqn, node.no);
        process.out(text).out("　").out(utils_1.nodeContentToString(process, node.args[1])).out("\n\n");
        var table = this.parseTable(node.childNodes);
        return function (v) {
            if (table.headerRowCount === 0) {
                // 1列目がヘッダー
                table.cells.forEach(function (columns) {
                    if (columns.length === 0) {
                        return;
                    }
                    // ヘッダー列
                    process.out("★");
                    columns[0].nodes.forEach(function (node) {
                        walker_1.visit(node, v);
                    });
                    process.out("☆");
                    // 残りの列
                    for (var c = 1; c < columns.length; c++) {
                        process.outRaw("\t");
                        columns[c].nodes.forEach(function (node) {
                            walker_1.visit(node, v);
                        });
                    }
                    process.outRaw("\n");
                });
            }
            else {
                // ヘッダー行
                var r = 0;
                var _loop_1 = function () {
                    var columns = table.cells[r];
                    columns.forEach(function (cell, index) {
                        // TODO: ヘッダーにインラインがある場合は？
                        process.out("★");
                        cell.nodes.forEach(function (node) {
                            walker_1.visit(node, v);
                        });
                        process.out("☆");
                        if (index < columns.length - 1) {
                            process.outRaw("\t");
                        }
                        else {
                            process.outRaw("\n");
                        }
                    });
                };
                for (; r < table.headerRowCount; r++) {
                    _loop_1();
                }
                var _loop_2 = function () {
                    var columns = table.cells[r];
                    columns.forEach(function (cell, index) {
                        cell.nodes.forEach(function (node) {
                            walker_1.visit(node, v);
                        });
                        if (index < columns.length - 1) {
                            process.outRaw("\t");
                        }
                        else {
                            process.outRaw("\n");
                        }
                    });
                };
                // ボディ
                for (; r < table.cells.length; r++) {
                    _loop_2();
                }
            }
        };
    };
    TextBuilder.prototype.block_table_post = function (process, _node) {
        process.out("◆→終了:表←◆\n\n");
    };
    TextBuilder.prototype.inline_table = function (process, node) {
        var chapter = utils_1.findChapter(node, 1);
        if (!chapter) {
            process.error(i18n_1.t("builder.chapter_not_found", 1), node);
            return false;
        }
        var listNode = this.findReference(process, node).referenceTo.referenceNode.toBlockElement();
        var text = i18n_1.t("builder.table", chapter.fqn, listNode.no);
        process.out(text);
        return false;
    };
    TextBuilder.prototype.block_tsize = function (_process, _node) {
        // TODO 以下はとりあえず正規のRe:VIEW文書が食えるようにするための仮実装
        return false;
    };
    TextBuilder.prototype.block_comment_pre = function (process, node) {
        if (!this.book.config.isDraft) {
            // 中断
            return false;
        }
        process.out("◆→");
        return function (v) {
            // name, args はパスしたい
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    TextBuilder.prototype.block_comment_post = function (process, _node) {
        if (!this.book.config.isDraft) {
            return;
        }
        process.out("←◆\n");
    };
    TextBuilder.prototype.inline_comment_pre = function (process, _node) {
        if (!this.book.config.isDraft) {
            // 中断
            return false;
        }
        process.out("◆→");
        return true;
    };
    TextBuilder.prototype.inline_comment_post = function (process, _node) {
        if (!this.book.config.isDraft) {
            return;
        }
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
    TextBuilder.prototype.inline_idx = function (process, node) {
        var text = utils_1.nodeContentToString(process, node);
        process.out(text + "\u25C6\u2192\u7D22\u5F15\u9805\u76EE:" + text + "\u2190\u25C6");
        return false;
    };
    TextBuilder.prototype.inline_hidx = function (process, node) {
        var text = utils_1.nodeContentToString(process, node);
        process.out("\u25C6\u2192\u7D22\u5F15\u9805\u76EE:" + text + "\u2190\u25C6");
        return false;
    };
    TextBuilder.prototype.block_flushright_pre = function (process, node) {
        process.out("◆→開始:右寄せ←◆\n");
        return function (v) {
            node.childNodes.forEach(function (node) {
                walker_1.visit(node, v);
            });
        };
    };
    TextBuilder.prototype.block_flushright_post = function (process, _node) {
        process.out("\n◆→終了:右寄せ←◆\n");
    };
    TextBuilder.prototype.block_captionblock_pre = function (typename, process, node) {
        process.out("\u25C6\u2192\u958B\u59CB:" + typename + "\u2190\u25C6\n");
        if (node.args[0]) {
            var caption = utils_1.nodeContentToString(process, node.args[0]);
            process.out("\u25A0" + caption + "\n");
        }
    };
    TextBuilder.prototype.block_captionblock_post = function (typename, process, _node) {
        process.out("\u25C6\u2192\u7D42\u4E86:" + typename + "\u2190\u25C6\n");
    };
    TextBuilder.prototype.block_info_pre = function (process, node) {
        this.block_captionblock_pre("情報", process, node);
    };
    TextBuilder.prototype.block_info_post = function (process, node) {
        this.block_captionblock_post("情報", process, node);
    };
    TextBuilder.prototype.block_note_pre = function (process, node) {
        this.block_captionblock_pre("ノート", process, node);
    };
    TextBuilder.prototype.block_note_post = function (process, node) {
        this.block_captionblock_post("ノート", process, node);
    };
    TextBuilder.prototype.block_memo_pre = function (process, node) {
        this.block_captionblock_pre("メモ", process, node);
    };
    TextBuilder.prototype.block_memo_post = function (process, node) {
        this.block_captionblock_post("メモ", process, node);
    };
    TextBuilder.prototype.block_tip_pre = function (process, node) {
        this.block_captionblock_pre("TIP", process, node);
    };
    TextBuilder.prototype.block_tip_post = function (process, node) {
        this.block_captionblock_post("TIP", process, node);
    };
    TextBuilder.prototype.block_warning_pre = function (process, node) {
        this.block_captionblock_pre("危険", process, node);
    };
    TextBuilder.prototype.block_warning_post = function (process, node) {
        this.block_captionblock_post("危険", process, node);
    };
    TextBuilder.prototype.block_important_pre = function (process, node) {
        this.block_captionblock_pre("重要", process, node);
    };
    TextBuilder.prototype.block_important_post = function (process, node) {
        this.block_captionblock_post("重要", process, node);
    };
    TextBuilder.prototype.block_caution_pre = function (process, node) {
        this.block_captionblock_pre("警告", process, node);
    };
    TextBuilder.prototype.block_caution_post = function (process, node) {
        this.block_captionblock_post("警告", process, node);
    };
    TextBuilder.prototype.block_notice_pre = function (process, node) {
        this.block_captionblock_pre("注意", process, node);
    };
    TextBuilder.prototype.block_notice_post = function (process, node) {
        this.block_captionblock_post("注意", process, node);
    };
    return TextBuilder;
}(builder_1.DefaultBuilder));
exports.TextBuilder = TextBuilder;

},{"../i18n/i18n":8,"../parser/parser":15,"../parser/walker":18,"../utils/utils":20,"./builder":1}],4:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebBrowserConfig = exports.NodeJSConfig = exports.Config = void 0;
var builder_1 = require("../builder/builder");
var configRaw_1 = require("./configRaw");
var compilerModel_1 = require("../model/compilerModel");
var analyzer_1 = require("../parser/analyzer");
var validator_1 = require("../parser/validator");
var utils_1 = require("../utils/utils");
var Config = /** @class */ (function () {
    function Config(original) {
        this.original = original;
    }
    Object.defineProperty(Config.prototype, "isDraft", {
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "read", {
        get: function () {
            throw new Error("please implements this method");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "write", {
        get: function () {
            throw new Error("please implements this method");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "exists", {
        get: function () {
            throw new Error("please implements this method");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "analyzer", {
        get: function () {
            return this.original.analyzer || new analyzer_1.DefaultAnalyzer();
        },
        enumerable: false,
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
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "builders", {
        get: function () {
            if (this._builders) {
                return this._builders;
            }
            var config = this.original;
            if (!config.builders || config.builders.length === 0) {
                // TODO DefaultBuilder は微妙感
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
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "listener", {
        get: function () {
            throw new Error("please implements this method");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "book", {
        get: function () {
            if (!this._bookStructure) {
                this._bookStructure = configRaw_1.BookStructure.createBook(this.original.book);
            }
            return this._bookStructure;
        },
        enumerable: false,
        configurable: true
    });
    Config.prototype.resolvePath = function (_path) {
        throw new Error("please implements this method");
    };
    return Config;
}());
exports.Config = Config;
var NodeJSConfig = /** @class */ (function (_super) {
    __extends(NodeJSConfig, _super);
    function NodeJSConfig(options, original) {
        var _this = _super.call(this, original) || this;
        _this.options = options;
        _this.original = original;
        return _this;
    }
    Object.defineProperty(NodeJSConfig.prototype, "isDraft", {
        get: function () {
            var _a;
            return (_a = this.options.draft) !== null && _a !== void 0 ? _a : false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NodeJSConfig.prototype, "read", {
        get: function () {
            return this.original.read || utils_1.IO.read;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NodeJSConfig.prototype, "write", {
        get: function () {
            return this.original.write || utils_1.IO.write;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NodeJSConfig.prototype, "exists", {
        get: function () {
            var _this = this;
            return function (path) {
                /* tslint:disable:no-require-imports */
                var fs = require("fs");
                var _path = require("path");
                /* tslint:enable:no-require-imports */
                var basePath = _this.original.basePath || __dirname;
                var promise = new Promise(function (resolve) {
                    fs.exists(_path.resolve(basePath, path), function (result) {
                        resolve({ path: path, result: result });
                    });
                });
                return promise;
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NodeJSConfig.prototype, "listener", {
        get: function () {
            var _this = this;
            if (this._listener) {
                return this._listener;
            }
            var listener = this.original.listener || {};
            listener.onAcceptables = listener.onAcceptables || (function () {
            });
            listener.onSymbols = listener.onSymbols || (function () {
            });
            listener.onReports = listener.onReports || (function (b) { return _this.onReports(b); });
            listener.onCompileSuccess = listener.onCompileSuccess || (function (b) { return _this.onCompileSuccess(b); });
            listener.onCompileFailed = listener.onCompileFailed || (function () { return _this.onCompileFailed(); });
            this._listener = listener;
            return this._listener;
        },
        enumerable: false,
        configurable: true
    });
    NodeJSConfig.prototype.onReports = function (reports) {
        /* tslint:disable:no-require-imports */
        var colors = require("colors");
        /* tslint:enable:no-require-imports */
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
    NodeJSConfig.prototype.onCompileSuccess = function (_book) {
        var _a;
        if (!((_a = this.options) === null || _a === void 0 ? void 0 : _a.inproc)) {
            process.exit(0);
        }
    };
    NodeJSConfig.prototype.onCompileFailed = function () {
        var _a;
        if (!((_a = this.options) === null || _a === void 0 ? void 0 : _a.inproc)) {
            process.exit(1);
        }
    };
    NodeJSConfig.prototype.resolvePath = function (path) {
        /* tslint:disable:no-require-imports */
        var p = require("path");
        /* tslint:enable:no-require-imports */
        var base = this.options.base || "./";
        return p.join(base, path);
    };
    return NodeJSConfig;
}(Config));
exports.NodeJSConfig = NodeJSConfig;
var WebBrowserConfig = /** @class */ (function (_super) {
    __extends(WebBrowserConfig, _super);
    function WebBrowserConfig(options, original) {
        var _this = _super.call(this, original) || this;
        _this.options = options;
        _this.original = original;
        return _this;
    }
    Object.defineProperty(WebBrowserConfig.prototype, "isDraft", {
        get: function () {
            var _a;
            return (_a = this.options.draft) !== null && _a !== void 0 ? _a : false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebBrowserConfig.prototype, "read", {
        get: function () {
            return this.original.read || (function () {
                throw new Error("please implement config.read method");
            });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebBrowserConfig.prototype, "write", {
        get: function () {
            return this.original.write || (function () {
                throw new Error("please implement config.write method");
            });
        },
        enumerable: false,
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
        enumerable: false,
        configurable: true
    });
    WebBrowserConfig.prototype._existsFileScheme = function (_path) {
        var promise = new Promise(function (resolve) {
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
        var promise = new Promise(function (resolve) {
            try {
                var xhr_1 = new XMLHttpRequest();
                xhr_1.onreadystatechange = function () {
                    if (xhr_1.readyState === 4) {
                        if (xhr_1.status === 200 || xhr_1.status === 304) {
                            resolve({ path: path, result: true });
                        }
                        else {
                            resolve({ path: path, result: false });
                        }
                    }
                };
                xhr_1.open("GET", path);
                // If-Modified-Since をDate.now()で送って304返して貰ったほうが効率が良いのでは という発想
                xhr_1.setRequestHeader("If-Modified-Since", new Date().toUTCString());
                xhr_1.send();
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
        enumerable: false,
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
    WebBrowserConfig.prototype.onCompileSuccess = function (_book) {
    };
    WebBrowserConfig.prototype.onCompileFailed = function (_book) {
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
}(Config));
exports.WebBrowserConfig = WebBrowserConfig;

},{"../builder/builder":1,"../model/compilerModel":13,"../parser/analyzer":14,"../parser/validator":17,"../utils/utils":20,"./configRaw":5,"colors":undefined,"fs":undefined,"path":undefined}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentStructure = exports.BookStructure = void 0;
/**
 * 生の設定ファイルでの本の構成情報を画一的なフォーマットに変換し保持するためのクラス。
 */
var BookStructure = /** @class */ (function () {
    // TODO コンストラクタ隠したい
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
            return new BookStructure([], [], [], []);
        }
        var predef = (config.predef || config.PREDEF || []).map(function (v /* IConfigChapter */) { return ContentStructure.createChapter(v); });
        var contents = (config.contents || config.CHAPS || []).map(function (v) {
            // value は string(YAML由来) か IConfigPartOrChapter
            if (!v) {
                return null;
            }
            if (typeof v === "string") {
                // YAML由来
                return ContentStructure.createChapter(v);
            }
            else if (v.chapter) {
                // IConfigPartOrChapter 由来
                return ContentStructure.createChapter(v.chapter);
            }
            else if (v.part) {
                // IConfigPartOrChapter 由来
                return ContentStructure.createPart(v.part);
            }
            else if (typeof v.file === "string" && v.chapters) {
                return ContentStructure.createPart(v);
            }
            else if (typeof v.file === "string") {
                // IConfigPartOrChapter 由来
                return ContentStructure.createChapter(v);
            }
            else if (typeof v === "object") {
                // YAML由来
                return ContentStructure.createPart({
                    file: Object.keys(v)[0],
                    chapters: v[Object.keys(v)[0]].map(function (c) { return ({ file: c }); })
                });
            }
            else {
                return null;
            }
        });
        var appendix = (config.appendix || config.APPENDIX || []).map(function (v /* IConfigChapter */) { return ContentStructure.createChapter(v); });
        var postdef = (config.postdef || config.POSTDEF || []).map(function (v /* IConfigChapter */) { return ContentStructure.createChapter(v); });
        return new BookStructure(predef, contents, appendix, postdef);
    };
    return BookStructure;
}());
exports.BookStructure = BookStructure;
/**
 * 生の設定ファイルでの本の構成情報を画一的なフォーマットに変換し保持するためのクラス。
 */
var ContentStructure = /** @class */ (function () {
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
}());
exports.ContentStructure = ContentStructure;

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
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
/**
 * ReVIEW文書を処理するためのコントローラ。
 * 処理の起点。
 */
var Controller = /** @class */ (function () {
    function Controller(options) {
        if (options === void 0) { options = {}; }
        this.options = options;
        this.builders = { TextBuilder: textBuilder_1.TextBuilder, HtmlBuilder: htmlBuilder_1.HtmlBuilder };
    }
    /**
     * 設定の初期化を行う。
     * 通常、 ReVIEW.start 経由で呼び出される。
     * @param data
     */
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
            // false が帰ってきたら処理を中断する (undefined でも継続)
            book.config.listener.onCompileFailed();
            return Promise.reject(null);
        }
        return Promise.resolve(book);
    };
    Controller.prototype.toContentChunk = function (book) {
        var convert = function (c, parent) {
            var chunk = null;
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
                        end: void 0,
                    }
                });
                chunk.tree = { ast: errorNode, cst: null }; // TODO null! をやめる
                // TODO エラー表示が必要 process.error 的なやつ
            }
            chunk.nodes.forEach(function (chunk) { return _parse(chunk); });
        };
        book.predef.forEach(function (chunk) { return _parse(chunk); });
        book.contents.forEach(function (chunk) { return _parse(chunk); });
        book.appendix.forEach(function (chunk) { return _parse(chunk); });
        book.postdef.forEach(function (chunk) { return _parse(chunk); });
        return book;
    };
    Controller.prototype.preprocessContent = function (book) {
        // Chapterに採番を行う
        var numberingChapter = function (chunk, counter) {
            // TODO partにも分け隔てなく採番してるけど間違ってるっしょ
            var chapters = [];
            walker_1.visit(chunk.tree.ast, {
                visitDefaultPre: function (_node) {
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
            // エラーがあったら処理中断
            return Promise.resolve(book);
        }
        var symbols = book.allChunks.reduce(function (p, c) { return p.concat(c.process.symbols); }, []);
        if (this.config.listener.onSymbols(symbols) === false) {
            // false が帰ってきたら処理を中断する (undefined でも継続)
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
        // TODO 指定された .re が存在しない場合ここにくる…
        console.error("unexpected error", err);
        if (err && err.stack) {
            console.error(err.stack);
        }
        return Promise.reject(err);
    };
    return Controller;
}());
exports.Controller = Controller;

},{"../../resources/grammar":21,"../builder/htmlBuilder":2,"../builder/textBuilder":3,"../model/compilerModel":13,"../parser/parser":15,"../parser/preprocessor":16,"../parser/walker":18,"../utils/utils":20,"./config":4,"./configRaw":5}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.en = void 0;
exports.en = {
    "sample": "Hello!"
};

},{}],8:[function(require,module,exports){
"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.t = exports.setup = void 0;
var utils_1 = require("./utils");
var utils_2 = require("../utils/utils");
var en_1 = require("./en");
var ja_1 = require("./ja");
var langs = {
    ja: ja_1.ja,
    en: en_1.en,
};
var resource = utils_1.deepAssign({}, langs.en, langs.ja);
function setup(lang) {
    "use strict";
    if (lang === void 0) { lang = "ja"; }
    resource = utils_1.deepAssign({}, langs.en, langs.ja, langs[lang]);
}
exports.setup = setup;
var sprintf;
if (typeof window !== "undefined" && window.sprintf) {
    sprintf = window.sprintf;
}
else {
    sprintf = require("sprintf-js").sprintf;
}
if (utils_2.isNodeJS != null) {
    utils_2.isNodeJS(); // TODO utilsをi18n.ts内で使わないと実行時エラーになる
}
function t(str) {
    "use strict";
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var parts = str.split(".");
    var base = resource;
    parts.forEach(function (part) {
        base = base[part];
    });
    if (typeof base !== "string") {
        throw new Error("unknown key: " + str);
    }
    return sprintf.apply(void 0, __spreadArrays([base], args));
}
exports.t = t;
setup();

},{"../utils/utils":20,"./en":7,"./ja":9,"./utils":10,"sprintf-js":undefined}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ja = void 0;
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
        "inline_m": "TeXの式を挿入することを示します。\n@<m>{TeX式}\nという形式で書きます。",
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
        "inline_idx": "文字列を出力するとともに、索引として登録します。\n`親索引文字列<<>>子索引文字列`のように親子関係にある索引も定義できます。\n@<idx>{sample} と書きます。",
        "inline_hidx": "索引として登録します (idx と異なり、紙面内に出力はしません)。\n`親索引文字列<<>>子索引文字列`のように親子関係にある索引も定義できます。\n@<hidx>{sample} と書きます。",
        "block_flushright": "右寄せを示します。\n//flushright{\n神は言っている…ここで左へ行く定めではないと…\n//}\nという形式で書きます。",
        "block_memo": "ちょっとしたメモを示します。\n//memo[キャプション]{\nより詳しい情報はURL:XXXXを参照ください。\n//}\nという形式で書きます。ブロック中では、全てのインライン構文が利用できます。",
        "block_info": "ちょっとした参考情報を示します。\n//info[キャプション]{\nより詳しい情報はURL:XXXXを参照ください。\n//}\nという形式で書きます。ブロック中では、全てのインライン構文が利用できます。",
        "block_tip": "ちょっとしたTipsを示します。\n//tip[キャプション]{\nより詳しい情報はURL:XXXXを参照ください。\n//}\nという形式で書きます。ブロック中では、全てのインライン構文が利用できます。",
        "block_note": "ちょっとしたノートを示します。\n//note[キャプション]{\nより詳しい情報はURL:XXXXを参照ください。\n//}\nという形式で書きます。ブロック中では、全てのインライン構文が利用できます。",
        "block_warning": "ちょっとした警告情報を示します。\n//warning[キャプション]{\n先ほどの例とは出力結果が異なります。\n//}\nという形式で書きます。ブロック中では、全てのインライン構文が利用できます。",
        "block_important": "ちょっとした重要情報を示します。\n//important[キャプション]{\n一定期間操作しない場合、キャッシュは削除されることがあります。\n//}\nという形式で書きます。ブロック中では、全てのインライン構文が利用できます。",
        "block_caution": "ちょっとした警告情報を示します。\n//caution[キャプション]{\n一度実行すると修正はできません。\n//}\nという形式で書きます。ブロック中では、全てのインライン構文が利用できます。",
        "block_notice": "ちょっとした注意情報を示します。\n//notice[キャプション]{\nエラーがなければ特に何も出力されません。\n//}\nという形式で書きます。ブロック中では、全てのインライン構文が利用できます。",
        // TODO 以下は今後書き直す
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
        "duplicated_label": "ラベルに重複があるようです。",
        "duplicated_label_headline": "ラベルに重複があるようです。 =={a-label} ラベル のように明示的にラベルを指定することを回避することができます。",
        // TODO できれば 引数 という言葉を避けたい…
        "args_length_mismatch": "引数の数に齟齬があります。 期待値 %s, 実際 %s",
        "args_hd_path_not_implemented": "キャプションによる参照はまだ実装されていません。{ラベル}か{章ID|ラベル}の形式を使用してください。指定された要素は %s でした。",
        "body_string_only": "内容は全て文字でなければいけません。",
        "chapter_not_toplevel": "深さ1のチャプターは最上位になければいけません。",
        "chapter_topleve_eq1": "最上位のチャプターは深さ1のものでなければいけません。",
        "deprecated_inline_symbol": "%s というインライン構文は非推奨です。",
        "graph_tool_is_not_recommended": "graph用ツールにはgraphvizをおすすめします。",
        "unknown_graph_tool": "%s というgraph用ツールはサポートされていません。"
    },
    "builder": {
        "chapter_not_found": "深さ %d にマッチするチャプターが見つかりませんでした。",
        "image_not_found": "ID: %s にマッチする画像が見つかりませんでした。",
        "chapter": "第%d章",
        "chapter_ref": "第%d章「%s」",
        "list": "リスト%s.%s",
        "table": "表%s.%s"
    }
};

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepAssign = void 0;
function deepAssign(target) {
    "use strict";
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    args.forEach(function (arg) {
        Object.keys(arg).forEach(function (key) {
            if (typeof arg[key] !== "object") {
                target[key] = arg[key];
            }
            else {
                target[key] = deepAssign(target[key] || {}, arg[key]);
            }
        });
    });
    return target;
}
exports.deepAssign = deepAssign;

},{}],11:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = exports.SyntaxType = exports.TextBuilder = exports.HtmlBuilder = exports.DefaultBuilder = exports.DefaultValidator = exports.DefaultAnalyzer = exports.AcceptableSyntaxes = exports.SyntaxTree = exports.ProcessReport = exports.ReportLevel = exports.ContentChunk = exports.Book = void 0;
var compilerModel_1 = require("./model/compilerModel");
Object.defineProperty(exports, "Book", { enumerable: true, get: function () { return compilerModel_1.Book; } });
Object.defineProperty(exports, "ContentChunk", { enumerable: true, get: function () { return compilerModel_1.ContentChunk; } });
Object.defineProperty(exports, "ReportLevel", { enumerable: true, get: function () { return compilerModel_1.ReportLevel; } });
Object.defineProperty(exports, "ProcessReport", { enumerable: true, get: function () { return compilerModel_1.ProcessReport; } });
var controller_1 = require("./controller/controller");
var parser_1 = require("./parser/parser");
Object.defineProperty(exports, "SyntaxTree", { enumerable: true, get: function () { return parser_1.SyntaxTree; } });
__exportStar(require("./parser/parser"), exports);
var analyzer_1 = require("./parser/analyzer");
Object.defineProperty(exports, "AcceptableSyntaxes", { enumerable: true, get: function () { return analyzer_1.AcceptableSyntaxes; } });
Object.defineProperty(exports, "DefaultAnalyzer", { enumerable: true, get: function () { return analyzer_1.DefaultAnalyzer; } });
var validator_1 = require("./parser/validator");
Object.defineProperty(exports, "DefaultValidator", { enumerable: true, get: function () { return validator_1.DefaultValidator; } });
var builder_1 = require("./builder/builder");
Object.defineProperty(exports, "DefaultBuilder", { enumerable: true, get: function () { return builder_1.DefaultBuilder; } });
var htmlBuilder_1 = require("./builder/htmlBuilder");
Object.defineProperty(exports, "HtmlBuilder", { enumerable: true, get: function () { return htmlBuilder_1.HtmlBuilder; } });
var textBuilder_1 = require("./builder/textBuilder");
Object.defineProperty(exports, "TextBuilder", { enumerable: true, get: function () { return textBuilder_1.TextBuilder; } });
var analyzer_2 = require("./parser/analyzer");
Object.defineProperty(exports, "SyntaxType", { enumerable: true, get: function () { return analyzer_2.SyntaxType; } });
/**
 * ReVIEW文書のコンパイルを開始する。
 * @param setup
 * @param options
 * @returns {Book}
 */
function start(setup, options) {
    "use strict";
    var controller = new controller_1.Controller(options);
    // setup 中で initConfig が呼び出される
    setup(controller);
    return controller.process();
}
exports.start = start;

},{"./builder/builder":1,"./builder/htmlBuilder":2,"./builder/textBuilder":3,"./controller/controller":6,"./model/compilerModel":13,"./parser/analyzer":14,"./parser/parser":15,"./parser/validator":17}],12:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyzerError = exports.DummyError = void 0;
var DummyError = /** @class */ (function () {
    function DummyError(message) {
        this.message = message;
    }
    DummyError = __decorate([
        replace(Error)
    ], DummyError);
    return DummyError;
}());
exports.DummyError = DummyError;
function replace(src) {
    "use strict";
    return function (_) { return src; };
}
var AnalyzerError = /** @class */ (function (_super) {
    __extends(AnalyzerError, _super);
    function AnalyzerError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "AnalyzerError";
        _this.message = message;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(_this, AnalyzerError);
        }
        return _this;
    }
    return AnalyzerError;
}(DummyError));
exports.AnalyzerError = AnalyzerError;

},{}],13:[function(require,module,exports){
// parser/ と builder/ で共用するモデル
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentChunk = exports.Book = exports.BuilderProcess = exports.Process = exports.BookProcess = exports.ProcessReport = exports.ReportLevel = void 0;
var i18n_1 = require("../i18n/i18n");
var walker_1 = require("../parser/walker");
/**
 * 処理時に発生したレポートのレベル。
 */
var ReportLevel;
(function (ReportLevel) {
    ReportLevel[ReportLevel["Info"] = 0] = "Info";
    ReportLevel[ReportLevel["Warning"] = 1] = "Warning";
    ReportLevel[ReportLevel["Error"] = 2] = "Error";
})(ReportLevel = exports.ReportLevel || (exports.ReportLevel = {}));
/**
 * 処理時に発生したレポート。
 */
var ProcessReport = /** @class */ (function () {
    function ProcessReport(level, part, chapter, message, nodes) {
        if (nodes === void 0) { nodes = []; }
        this.level = level;
        this.part = part;
        this.chapter = chapter;
        this.message = message;
        this.nodes = nodes;
    }
    return ProcessReport;
}());
exports.ProcessReport = ProcessReport;
/**
 * コンパイル処理時の出力ハンドリング。
 */
var BookProcess = /** @class */ (function () {
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
}());
exports.BookProcess = BookProcess;
/**
 * コンパイル処理時の出力ハンドリング。
 */
var Process = /** @class */ (function () {
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
        enumerable: false,
        configurable: true
    });
    Process.prototype.addSymbol = function (symbol) {
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
        enumerable: false,
        configurable: true
    });
    Process.prototype.constructReferenceTo = function (node, value, targetSymbol, separator) {
        var _a, _b, _c;
        if (targetSymbol === void 0) { targetSymbol = node.symbol; }
        if (separator === void 0) { separator = "|"; }
        var splitted = value.split(separator);
        if (targetSymbol === "chapter") {
            // 常に {章ID} でなければならない
            if (splitted.length !== 1) {
                var message = i18n_1.t("compile.args_length_mismatch", "1", splitted.length);
                this.error(message, node);
                return null;
            }
            return {
                chapterName: splitted[0],
                targetSymbol: targetSymbol
            };
        }
        if (targetSymbol === "fn") {
            // 常に {ラベル} でなければならない
            if (splitted.length !== 1) {
                var message = i18n_1.t("compile.args_length_mismatch", "1", splitted.length);
                this.error(message, node);
                return null;
            }
            return {
                chapter: this.chapter,
                chapterName: (_a = this.chapter) === null || _a === void 0 ? void 0 : _a.name,
                targetSymbol: targetSymbol,
                label: splitted[0]
            };
        }
        if (targetSymbol !== "hd") {
            // {ラベル} か {章ID|ラベル}
            if (splitted.length === 2) {
                return {
                    chapterName: splitted[0],
                    targetSymbol: targetSymbol,
                    label: splitted[1]
                };
            }
            else if (splitted.length === 1) {
                return {
                    chapter: this.chapter,
                    chapterName: (_b = this.chapter) === null || _b === void 0 ? void 0 : _b.name,
                    targetSymbol: targetSymbol,
                    label: splitted[0]
                };
            }
            else {
                var message = i18n_1.t("compile.args_length_mismatch", "1 or 2", splitted.length);
                this.error(message, node);
                return null;
            }
        }
        else {
            // {章ID|パス} か {パス}
            // FIXME: | 区切りのパスサポートと重複したキャプションのサポート
            if (splitted.length === 2) {
                return {
                    chapterName: splitted[0],
                    targetSymbol: targetSymbol,
                    label: splitted[1]
                };
            }
            else if (splitted.length === 1) {
                return {
                    chapter: this.chapter,
                    chapterName: (_c = this.chapter) === null || _c === void 0 ? void 0 : _c.name,
                    targetSymbol: targetSymbol,
                    label: splitted[0]
                };
            }
            else {
                var message = i18n_1.t("compile.args_hd_path_not_implemented", splitted.length);
                this.error(message, node);
                return null;
            }
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
}());
exports.Process = Process;
var BuilderProcess = /** @class */ (function () {
    function BuilderProcess(builder, base) {
        this.builder = builder;
        this.base = base;
        this.result = "";
    }
    Object.defineProperty(BuilderProcess.prototype, "info", {
        get: function () {
            return this.base.info.bind(this.base);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BuilderProcess.prototype, "warn", {
        get: function () {
            return this.base.warn.bind(this.base);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BuilderProcess.prototype, "error", {
        get: function () {
            return this.base.error.bind(this.base);
        },
        enumerable: false,
        configurable: true
    });
    BuilderProcess.prototype.out = function (data) {
        // 最近のブラウザだと単純結合がアホみたいに早いらしいので
        this.result += this.builder.escape(data);
        return this;
    };
    BuilderProcess.prototype.outRaw = function (data) {
        // 最近のブラウザだと単純結合がアホみたいに早いらしいので
        this.result += data;
        return this;
    };
    // TODO pushOut いみふ感高いのでやめよう 削除だ！
    BuilderProcess.prototype.pushOut = function (data) {
        this.result = data + this.result;
        return this;
    };
    Object.defineProperty(BuilderProcess.prototype, "input", {
        get: function () {
            return this.base.input;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BuilderProcess.prototype, "symbols", {
        get: function () {
            return this.base.symbols;
        },
        enumerable: false,
        configurable: true
    });
    BuilderProcess.prototype.findChapter = function (chapId) {
        var book = this.base.chapter.book;
        var chaps = book.allChunks.filter(function (chunk) {
            var name = chunk.name.substr(0, chunk.name.lastIndexOf(".re"));
            if (name === chapId) {
                return true;
            }
            var chapter = null;
            walker_1.visit(chunk.tree.ast, {
                visitDefaultPre: function (_node, _parent) {
                    return !chapter;
                },
                visitChapterPre: function (node, _parent) {
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
    };
    /**
     * 指定されたidの画像を探す。
     * 解決ルールは https://github.com/kmuto/review/wiki/ImagePath の通り。
     * Config側で絶対パス化やリソースの差し替えを行う可能性があるため、このメソッドの返り値は無加工で使うこと。
     * @param id
     * @returns {Promise<string>}
     */
    BuilderProcess.prototype.findImageFile = function (id) {
        // NOTE: https://github.com/kmuto/review/wiki/ImagePath
        // 4軸マトリクス 画像dir, ビルダ有無, chapId位置, 拡張子
        var _this = this;
        var config = (this.base.part || this.base.chapter).book.config;
        var fileNameList = [];
        (function () {
            var imageDirList = ["images/"];
            var builderList = [_this.builder.extention + "/", ""];
            var chapSwitchList = [true, false];
            var chunkName = (_this.base.chapter || _this.base.part).name; // TODO もっと頭良い感じに
            chunkName = chunkName.substring(0, chunkName.lastIndexOf("."));
            var chapSeparatorList = ["/", "-"];
            var extList = ["png", "jpg", "jpeg", "gif"];
            imageDirList.forEach(function (imageDir) {
                builderList.forEach(function (builder) {
                    chapSwitchList.forEach(function (chapSwitch) {
                        chapSeparatorList.forEach(function (chapSeparator) {
                            extList.forEach(function (ext) {
                                var fileName = "";
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
}());
exports.BuilderProcess = BuilderProcess;
/**
 * 本全体を表す。
 */
var Book = /** @class */ (function () {
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
        enumerable: false,
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
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Book.prototype, "hasError", {
        get: function () {
            return this.reports.some(function (report) { return report.level === ReportLevel.Error; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Book.prototype, "hasWarning", {
        get: function () {
            return this.reports.some(function (report) { return report.level === ReportLevel.Warning; });
        },
        enumerable: false,
        configurable: true
    });
    return Book;
}());
exports.Book = Book;
var ContentChunk = /** @class */ (function () {
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
        var chapter = this; // TODO thisがpartでchapterが無しの場合もあるよ…！！
        this.process = new Process(part, chapter, null);
    }
    Object.defineProperty(ContentChunk.prototype, "input", {
        get: function () {
            return this._input;
        },
        set: function (value) {
            // TODO やめる
            this._input = value;
            this.process.input = value;
        },
        enumerable: false,
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
        // TODO 何かエラー投げたほうがいい気もするなー
        return founds[0].result;
    };
    return ContentChunk;
}());
exports.ContentChunk = ContentChunk;

},{"../i18n/i18n":8,"../parser/walker":18}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultAnalyzer = exports.AcceptableSyntax = exports.AcceptableSyntaxes = exports.SyntaxType = void 0;
var i18n_1 = require("../i18n/i18n");
var exception_1 = require("../js/exception");
var parser_1 = require("../parser/parser");
var utils_1 = require("../utils/utils");
/**
 * 構文のタイプ。
 */
var SyntaxType;
(function (SyntaxType) {
    SyntaxType[SyntaxType["Block"] = 0] = "Block";
    SyntaxType[SyntaxType["Inline"] = 1] = "Inline";
    SyntaxType[SyntaxType["Other"] = 2] = "Other";
})(SyntaxType = exports.SyntaxType || (exports.SyntaxType = {}));
/**
 * ReVIEW文書として受理可能な要素群。
 * JSON.stringify でJSON化した時、エディタ上での入力補完に活用できるデータが得られる。
 */
var AcceptableSyntaxes = /** @class */ (function () {
    function AcceptableSyntaxes(acceptableSyntaxes) {
        this.acceptableSyntaxes = acceptableSyntaxes;
    }
    /**
     * 指定されたノードに当てはまる AcceptableSyntax を探して返す。
     * 長さが1じゃないとおかしい。(呼び出し元でチェックする)
     * @param node
     * @returns {AcceptableSyntax[]}
     */
    AcceptableSyntaxes.prototype.find = function (node) {
        var results;
        if (node instanceof parser_1.InlineElementSyntaxTree) {
            var n_1 = node;
            results = this.inlines.filter(function (s) { return s.symbolName === n_1.symbol; });
        }
        else if (node instanceof parser_1.BlockElementSyntaxTree) {
            var n_2 = node;
            results = this.blocks.filter(function (s) { return s.symbolName === n_2.symbol; });
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
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AcceptableSyntaxes.prototype, "blocks", {
        get: function () {
            return this.acceptableSyntaxes.filter(function (s) { return s.type === SyntaxType.Block; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AcceptableSyntaxes.prototype, "others", {
        get: function () {
            return this.acceptableSyntaxes.filter(function (s) { return s.type === SyntaxType.Other; });
        },
        enumerable: false,
        configurable: true
    });
    AcceptableSyntaxes.prototype.toJSON = function () {
        // そのままJSON化するとAcceptableSyntax.typeの扱いに難儀すると思うので文字列に複合可能なデータを抱き合わせにする
        return {
            "rev": "1",
            "SyntaxType": SyntaxType,
            "acceptableSyntaxes": this.acceptableSyntaxes
        };
    };
    return AcceptableSyntaxes;
}());
exports.AcceptableSyntaxes = AcceptableSyntaxes;
/**
 * ReVIEW文書として受理可能な要素。
 */
var AcceptableSyntax = /** @class */ (function () {
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
}());
exports.AcceptableSyntax = AcceptableSyntax;
var AnalyzeProcess = /** @class */ (function () {
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
            argsLength[_i] = arguments[_i];
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
}());
var DefaultAnalyzer = /** @class */ (function () {
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
            else {
                label = utils_1.nodeContentToString(process, node.caption);
            }
            process.addSymbol({
                symbolName: "hd",
                labelName: label,
                node: node
            });
            // chap, title, chapref 用
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
    DefaultAnalyzer.prototype.inline_idx = function (builder) {
        builder.setSyntaxType(SyntaxType.Inline);
        builder.setSymbol("idx");
        builder.setDescription(i18n_1.t("description.inline_idx"));
        builder.processNode(function (process, n) {
            var node = n.toInlineElement();
            process.addSymbol({
                symbolName: node.symbol,
                node: node
            });
        });
    };
    DefaultAnalyzer.prototype.inline_hidx = function (builder) {
        builder.setSyntaxType(SyntaxType.Inline);
        builder.setSymbol("hidx");
        builder.setDescription(i18n_1.t("description.inline_hidx"));
        builder.processNode(function (process, n) {
            var node = n.toInlineElement();
            process.addSymbol({
                symbolName: node.symbol,
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
    DefaultAnalyzer.prototype.inline_m = function (builder) {
        this.inlineDecorationSyntax(builder, "m");
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
    DefaultAnalyzer.prototype.block_flushright = function (builder) {
        this.blockDecorationSyntax(builder, "flushright", 0);
    };
    DefaultAnalyzer.prototype.blockBoxedContentSyntax = function (builder, symbol) {
        this.blockDecorationSyntax(builder, symbol, 0);
        // 囲み記事は段落もサポート。
        builder.setAllowFullySyntax(true);
    };
    DefaultAnalyzer.prototype.block_note = function (builder) {
        this.blockBoxedContentSyntax(builder, "note");
    };
    DefaultAnalyzer.prototype.block_memo = function (builder) {
        this.blockBoxedContentSyntax(builder, "memo");
    };
    DefaultAnalyzer.prototype.block_tip = function (builder) {
        this.blockBoxedContentSyntax(builder, "tip");
    };
    DefaultAnalyzer.prototype.block_info = function (builder) {
        this.blockBoxedContentSyntax(builder, "info");
    };
    DefaultAnalyzer.prototype.block_warning = function (builder) {
        this.blockBoxedContentSyntax(builder, "warning");
    };
    DefaultAnalyzer.prototype.block_important = function (builder) {
        this.blockBoxedContentSyntax(builder, "important");
    };
    DefaultAnalyzer.prototype.block_caution = function (builder) {
        this.blockBoxedContentSyntax(builder, "caution");
    };
    DefaultAnalyzer.prototype.block_notice = function (builder) {
        this.blockBoxedContentSyntax(builder, "notice");
    };
    return DefaultAnalyzer;
}());
exports.DefaultAnalyzer = DefaultAnalyzer;

},{"../i18n/i18n":8,"../js/exception":12,"../parser/parser":15,"../utils/utils":20}],15:[function(require,module,exports){
/**
 * 構文解析用途のモジュール。
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleLineCommentSyntaxTree = exports.TextNodeSyntaxTree = exports.DlistElementSyntaxTree = exports.OlistElementSyntaxTree = exports.UlistElementSyntaxTree = exports.ArgumentSyntaxTree = exports.ColumnHeadlineSyntaxTree = exports.ColumnSyntaxTree = exports.InlineElementSyntaxTree = exports.BlockElementSyntaxTree = exports.HeadlineSyntaxTree = exports.ChapterSyntaxTree = exports.NodeSyntaxTree = exports.SyntaxTree = exports.RuleName = exports.ParseError = exports.transform = exports.parse = void 0;
var PEG = require("../../resources/grammar");
var walker_1 = require("./walker");
/**
 * 文字列をReVIEW文書として解釈し構文木を返す。
 * 解釈に失敗した場合、PEG.SyntaxError または ReVIEW.ParseError が投げられる。
 * @param input
 * @returns {{ast: NodeSyntaxTree, cst: *}}
 */
function parse(input) {
    "use strict";
    var rawResult = PEG.parse(input);
    var root = transform(rawResult).toNode();
    // ParagraphSubs は構文上の都合であるだけのものなので潰す
    walker_1.visit(root, {
        visitDefaultPre: function (_ast) {
        },
        visitParagraphPre: function (ast) {
            var subs = ast.childNodes[0].toNode();
            ast.childNodes = subs.childNodes;
        }
    });
    // Chapter を Headline の level に応じて構造を組み替える
    //   level 2 は level 1 の下に来るようにしたい
    if (root.childNodes.length !== 0) {
        reconstruct(root.childNodes[0].toNode(), function (chapter) { return chapter.headline.level; });
    }
    // Ulist もChapter 同様の level 構造があるので同じように処理したい
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
    // parentNode を設定
    walker_1.visit(root, {
        visitDefaultPre: function (ast, parent) {
            ast.parentNode = parent;
        }
    });
    // prev, next を設定
    walker_1.visit(root, {
        visitDefaultPre: function (_ast, _parent) {
        },
        visitChapterPre: function (ast) {
            ast.text.forEach(function (node, i, nodes) {
                node.prev = nodes[i - 1];
                node.next = nodes[i + 1];
            });
        },
        visitColumnPre: function (ast) {
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
/**
 * 具象構文木を抽象構文木に変換します。
 * @param rawResult
 * @returns {*}
 */
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
        // c, cc パターン
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
        case RuleName.SinglelineComments:
            return new NodeSyntaxTree(rawResult);
        // c パターン
        case RuleName.Start:
        case RuleName.Paragraph:
        case RuleName.BracketArg:
        case RuleName.BlockElementParagraph:
        case RuleName.BlockElementParagraphSub:
        case RuleName.DlistElementContent:
            return new NodeSyntaxTree(rawResult);
        // パースした内容は直接役にたたない c / c / c 系
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
/**
 * 構文木の組替えを行う。
 * 主に兄弟ノードを親子ノードに組み替えるために使う。
 * @param node
 * @param pickLevel
 */
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
        if (parent) {
            node.childNodes.push(parent);
            nodes.children.forEach(function (child) {
                parent.childNodes.push(child);
            });
            reconstruct(parent, pickLevel);
        }
    });
}
/**
 * 構文解析時に発生したエラー。
 */
var ParseError = /** @class */ (function () {
    function ParseError(syntax, message) {
        this.syntax = syntax;
        this.message = message;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ParseError);
        }
        this.name = "ParseError";
    }
    return ParseError;
}());
exports.ParseError = ParseError;
/**
 * 構文解析時のルール名。
 */
var RuleName;
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
    RuleName[RuleName["SinglelineComments"] = 44] = "SinglelineComments";
    RuleName[RuleName["SinglelineComment"] = 45] = "SinglelineComment";
})(RuleName = exports.RuleName || (exports.RuleName = {}));
/**
 * 構文解析後の少し加工したデータ。
 */
var SyntaxTree = /** @class */ (function () {
    function SyntaxTree(data) {
        this.ruleName = RuleName[data.syntax];
        if (typeof this.ruleName === "undefined") {
            throw new ParseError(data, "unknown rule: " + data.syntax);
        }
        var end = data.location.end || data.location.start; // SyntaxErrorの時
        this.location = {
            start: {
                line: data.location.start.line,
                column: data.location.start.column,
                offset: data.location.start.offset
            },
            end: {
                line: end.line,
                column: end.column,
                offset: end.offset
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
                // 無視する
            }
            else if (k === "childNodes") {
                // childNodesが先に来ると見づらいので
                lowPriorities.push((function (k) {
                    return function () {
                        result[k] = _this[k];
                    };
                })(k));
            }
            else if (k === "fqn") {
                // TODO あとでちゃんと出るようにする
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
    SyntaxTree.prototype.toStringHook = function (_indentLevel, _result) {
    };
    /**
     * 引数が数字かどうかチェックして違うならば例外を投げる。
     * @param value
     * @returns {*=}
     */
    SyntaxTree.prototype.checkNumber = function (value) {
        if (typeof value !== "number") {
            throw new Error("number required. actual:" + (typeof value) + ":" + value);
        }
        else {
            return value;
        }
    };
    /**
     * 引数が文字列かどうかチェックして違うならば例外を投げる。
     * @param value
     * @returns {*=}
     */
    SyntaxTree.prototype.checkString = function (value) {
        if (typeof value !== "string") {
            throw new Error("string required. actual:" + (typeof value) + ":" + value);
        }
        else {
            return value;
        }
    };
    /**
     * 引数がオブジェクトかどうかチェックして違うならば例外を投げる。
     * @param value
     * @returns {*=}
     */
    SyntaxTree.prototype.checkObject = function (value) {
        if (typeof value !== "object") {
            throw new Error("object required. actual:" + (typeof value) + ":" + value);
        }
        else {
            return value;
        }
    };
    /**
     * 引数がArrayかどうかチェックして違うならば例外を投げる。
     * @param value
     * @returns {*=}
     */
    SyntaxTree.prototype.checkArray = function (value) {
        if (!Array.isArray(value)) {
            console.log(JSON.stringify(value, null, 2));
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
    /**
     * thisをNodeSyntaxTreeにcast可能か調べ、可能ならcastして返し、そうでなければ例外を投げる。
     */
    SyntaxTree.prototype.toNode = function () {
        return this.toOtherNode(NodeSyntaxTree);
    };
    /**
     * thisをBlockElementSyntaxTreeにcast可能か調べ、可能ならcastして返し、そうでなければ例外を投げる。
     */
    SyntaxTree.prototype.toBlockElement = function () {
        return this.toOtherNode(BlockElementSyntaxTree);
    };
    /**
     * thisをInlineElementSyntaxTreeにcast可能か調べ、可能ならcastして返し、そうでなければ例外を投げる。
     */
    SyntaxTree.prototype.toInlineElement = function () {
        return this.toOtherNode(InlineElementSyntaxTree);
    };
    /**
     * thisをArgumentSyntaxTreeにcast可能か調べ、可能ならcastして返し、そうでなければ例外を投げる。
     */
    SyntaxTree.prototype.toArgument = function () {
        return this.toOtherNode(ArgumentSyntaxTree);
    };
    /**
     * thisをChapterSyntaxTreeにcast可能か調べ、可能ならcastして返し、そうでなければ例外を投げる。
     */
    SyntaxTree.prototype.toChapter = function () {
        return this.toOtherNode(ChapterSyntaxTree);
    };
    /**
     * thisをColumnSyntaxTreeにcast可能か調べ、可能ならcastして返し、そうでなければ例外を投げる。
     */
    SyntaxTree.prototype.toColumn = function () {
        return this.toOtherNode(ColumnSyntaxTree);
    };
    /**
     * thisをHeadlineSyntaxTreeにcast可能か調べ、可能ならcastして返し、そうでなければ例外を投げる。
     */
    SyntaxTree.prototype.toHeadline = function () {
        return this.toOtherNode(HeadlineSyntaxTree);
    };
    /**
     * thisをColumnHeadlineSyntaxTreeにcast可能か調べ、可能ならcastして返し、そうでなければ例外を投げる。
     */
    SyntaxTree.prototype.toColumnHeadline = function () {
        return this.toOtherNode(ColumnHeadlineSyntaxTree);
    };
    /**
     * thisをUlistElementSyntaxTreeにcast可能か調べ、可能ならcastして返し、そうでなければ例外を投げる。
     */
    SyntaxTree.prototype.toUlist = function () {
        return this.toOtherNode(UlistElementSyntaxTree);
    };
    /**
     * thisをOlistElementSyntaxTreeにcast可能か調べ、可能ならcastして返し、そうでなければ例外を投げる。
     */
    SyntaxTree.prototype.toOlist = function () {
        return this.toOtherNode(OlistElementSyntaxTree);
    };
    /**
     * thisをDlistElementSyntaxTreeにcast可能か調べ、可能ならcastして返し、そうでなければ例外を投げる。
     */
    SyntaxTree.prototype.toDlist = function () {
        return this.toOtherNode(DlistElementSyntaxTree);
    };
    /**
     * thisをTextNodeSyntaxTreeにcast可能か調べ、可能ならcastして返し、そうでなければ例外を投げる。
     */
    SyntaxTree.prototype.toTextNode = function () {
        return this.toOtherNode(TextNodeSyntaxTree);
    };
    /**
     * thisをSingleLineCommentSyntaxTreeにcast可能か調べ、可能ならcastして返し、そうでなければ例外を投げる。
     */
    SyntaxTree.prototype.toSingleLineCommentNode = function () {
        return this.toOtherNode(SingleLineCommentSyntaxTree);
    };
    return SyntaxTree;
}());
exports.SyntaxTree = SyntaxTree;
var NodeSyntaxTree = /** @class */ (function (_super) {
    __extends(NodeSyntaxTree, _super);
    function NodeSyntaxTree(data) {
        var _this = _super.call(this, data) || this;
        _this.childNodes = [];
        _this.processChildNodes(data.content);
        return _this;
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
    // @ts-ignore: error TS6133: 'result' is declared but its value is never read.
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
}(SyntaxTree));
exports.NodeSyntaxTree = NodeSyntaxTree;
// TODO SyntaxTree と指定されている所についてもっと細かく書けるはず…
var ChapterSyntaxTree = /** @class */ (function (_super) {
    __extends(ChapterSyntaxTree, _super);
    function ChapterSyntaxTree(data) {
        var _this = _super.call(this, data) || this;
        if (data.comments && data.comments.content) {
            _this.comments = _this.checkArray(data.comments.content).map(function (data) {
                return transform(data).toSingleLineCommentNode();
            });
        }
        else {
            _this.comments = [];
        }
        _this.headline = transform(_this.checkObject(data.headline)).toHeadline();
        if (typeof data.text === "string" || data.text === null) {
            _this.text = [];
            return _this;
        }
        _this.text = _this.checkArray(data.text.content).map(function (data) {
            return transform(data);
        });
        delete _this.childNodes; // JSON化した時の属性順制御のため…
        _this.childNodes = [];
        return _this;
    }
    Object.defineProperty(ChapterSyntaxTree.prototype, "level", {
        get: function () {
            return this.headline.level;
        },
        enumerable: false,
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
        enumerable: false,
        configurable: true
    });
    return ChapterSyntaxTree;
}(NodeSyntaxTree));
exports.ChapterSyntaxTree = ChapterSyntaxTree;
var HeadlineSyntaxTree = /** @class */ (function (_super) {
    __extends(HeadlineSyntaxTree, _super);
    function HeadlineSyntaxTree(data) {
        var _this = _super.call(this, data) || this;
        _this.level = _this.checkNumber(data.level);
        if (data.label) {
            _this.label = transform(_this.checkObject(data.label)).toArgument();
        }
        _this.caption = transform(_this.checkObject(data.caption)).toNode();
        return _this;
    }
    return HeadlineSyntaxTree;
}(SyntaxTree));
exports.HeadlineSyntaxTree = HeadlineSyntaxTree;
var BlockElementSyntaxTree = /** @class */ (function (_super) {
    __extends(BlockElementSyntaxTree, _super);
    function BlockElementSyntaxTree(data) {
        var _this = _super.call(this, data) || this;
        _this.symbol = _this.checkString(data.symbol);
        _this.args = _this.checkArray(data.args).map(function (data) {
            return transform(data).toNode();
        });
        return _this;
    }
    return BlockElementSyntaxTree;
}(NodeSyntaxTree));
exports.BlockElementSyntaxTree = BlockElementSyntaxTree;
var InlineElementSyntaxTree = /** @class */ (function (_super) {
    __extends(InlineElementSyntaxTree, _super);
    function InlineElementSyntaxTree(data) {
        var _this = _super.call(this, data) || this;
        _this.symbol = _this.checkString(data.symbol);
        return _this;
    }
    return InlineElementSyntaxTree;
}(NodeSyntaxTree));
exports.InlineElementSyntaxTree = InlineElementSyntaxTree;
var ColumnSyntaxTree = /** @class */ (function (_super) {
    __extends(ColumnSyntaxTree, _super);
    function ColumnSyntaxTree(data) {
        var _this = _super.call(this, data) || this;
        _this.headline = transform(_this.checkObject(data.headline)).toColumnHeadline();
        if (typeof data.text === "string" || data.text === null) {
            _this.text = [];
            return _this;
        }
        _this.text = _this.checkArray(data.text.content).map(function (data) {
            return transform(data);
        });
        delete _this.childNodes; // JSON化した時の属性順制御のため…
        _this.childNodes = [];
        return _this;
    }
    Object.defineProperty(ColumnSyntaxTree.prototype, "level", {
        get: function () {
            return this.headline.level;
        },
        enumerable: false,
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
        enumerable: false,
        configurable: true
    });
    return ColumnSyntaxTree;
}(NodeSyntaxTree));
exports.ColumnSyntaxTree = ColumnSyntaxTree;
var ColumnHeadlineSyntaxTree = /** @class */ (function (_super) {
    __extends(ColumnHeadlineSyntaxTree, _super);
    function ColumnHeadlineSyntaxTree(data) {
        var _this = _super.call(this, data) || this;
        _this.level = _this.checkNumber(data.level);
        if (data.label) {
            _this.label = transform(_this.checkObject(data.label)).toArgument();
        }
        _this.caption = transform(_this.checkObject(data.caption)).toNode();
        return _this;
    }
    return ColumnHeadlineSyntaxTree;
}(SyntaxTree));
exports.ColumnHeadlineSyntaxTree = ColumnHeadlineSyntaxTree;
var ArgumentSyntaxTree = /** @class */ (function (_super) {
    __extends(ArgumentSyntaxTree, _super);
    function ArgumentSyntaxTree(data) {
        var _this = _super.call(this, data) || this;
        _this.arg = _this.checkString(data.arg);
        return _this;
    }
    return ArgumentSyntaxTree;
}(SyntaxTree));
exports.ArgumentSyntaxTree = ArgumentSyntaxTree;
var UlistElementSyntaxTree = /** @class */ (function (_super) {
    __extends(UlistElementSyntaxTree, _super);
    function UlistElementSyntaxTree(data) {
        var _this = _super.call(this, data) || this;
        _this.level = _this.checkNumber(data.level);
        _this.text = transform(_this.checkObject(data.text));
        delete _this.childNodes; // JSON化した時の属性順制御のため…
        _this.childNodes = [];
        return _this;
    }
    return UlistElementSyntaxTree;
}(NodeSyntaxTree));
exports.UlistElementSyntaxTree = UlistElementSyntaxTree;
var OlistElementSyntaxTree = /** @class */ (function (_super) {
    __extends(OlistElementSyntaxTree, _super);
    function OlistElementSyntaxTree(data) {
        var _this = _super.call(this, data) || this;
        _this.no = _this.checkNumber(data.no);
        _this.text = transform(_this.checkObject(data.text));
        return _this;
    }
    return OlistElementSyntaxTree;
}(SyntaxTree));
exports.OlistElementSyntaxTree = OlistElementSyntaxTree;
var DlistElementSyntaxTree = /** @class */ (function (_super) {
    __extends(DlistElementSyntaxTree, _super);
    function DlistElementSyntaxTree(data) {
        var _this = _super.call(this, data) || this;
        _this.text = transform(_this.checkObject(data.text));
        _this.content = transform(_this.checkObject(data.content));
        return _this;
    }
    return DlistElementSyntaxTree;
}(SyntaxTree));
exports.DlistElementSyntaxTree = DlistElementSyntaxTree;
var TextNodeSyntaxTree = /** @class */ (function (_super) {
    __extends(TextNodeSyntaxTree, _super);
    function TextNodeSyntaxTree(data) {
        var _this = _super.call(this, data) || this;
        _this.text = _this.checkString(data.text).replace(/\n+$/, "");
        return _this;
    }
    return TextNodeSyntaxTree;
}(SyntaxTree));
exports.TextNodeSyntaxTree = TextNodeSyntaxTree;
var SingleLineCommentSyntaxTree = /** @class */ (function (_super) {
    __extends(SingleLineCommentSyntaxTree, _super);
    function SingleLineCommentSyntaxTree(data) {
        var _this = _super.call(this, data) || this;
        _this.text = _this.checkString(data.text).replace(/^#@/, "").replace(/\n+$/, "");
        return _this;
    }
    return SingleLineCommentSyntaxTree;
}(SyntaxTree));
exports.SingleLineCommentSyntaxTree = SingleLineCommentSyntaxTree;

},{"../../resources/grammar":21,"./walker":18}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyntaxPreprocessor = void 0;
var parser_1 = require("./parser");
var walker_1 = require("./walker");
var utils_1 = require("../utils/utils");
/**
 * インライン構文やブロック構文中で利用可能な構造について制限をかけ、構文木を組み替える。
 * 種類は主に3種類。
 * 1. テキストをベースとしてインライン構文のみ許可する(デフォルト
 * 2. 全て許可せずテキストとして扱う
 * 3. 全てを許可する(なにもしない
 * AcceptableSyntaxes にしたがって処理する。
 */
var SyntaxPreprocessor = /** @class */ (function () {
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
            visitDefaultPre: function (_node) {
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
    /**
     * コラム記法を組み替える。
     * コラムの中ではHeadlineが使えるが、コラム自体の見出しレベルより深いレベルのHeadlineしか許可されない。
     * そのため、コラム自体より浅いレベルの見出しレベルを見つけたらコラム内から脱出させる。
     * @param chunk
     * @param column
     */
    SyntaxPreprocessor.prototype.preprocessColumnSyntax = function (chunk, column) {
        function reconstruct(parent, target, to) {
            if (to === void 0) { to = column.parentNode.toChapter(); }
            if (target.level <= to.level) {
                reconstruct(parent.parentNode.toNode(), target, to.parentNode.toChapter());
                return;
            }
            // コラムより大きなChapterを見つけた場合、それ以下のノードは全て引き上げる
            to.childNodes.splice(to.childNodes.indexOf(parent) + 1, 0, target);
            column.text.splice(column.text.indexOf(target), 1);
        }
        // 組み換え
        walker_1.visit(column, {
            visitDefaultPre: function (_node) {
            },
            visitColumnPre: function (_node) {
                // TODO ここに来たらエラーにするべき
            },
            visitChapterPre: function (node) {
                if (column.level < node.headline.level) {
                    return;
                }
                reconstruct(column, node);
            }
        });
        // Parser.ts からのコピペなので共通ロジックとしてリファクタリングする
        // parentNode を設定
        walker_1.visit(chunk.tree.ast, {
            visitDefaultPre: function (ast, parent) {
                ast.parentNode = parent;
            }
        });
        // prev, next を設定
        walker_1.visit(chunk.tree.ast, {
            visitDefaultPre: function (_ast, _parent) {
            },
            visitChapterPre: function (ast) {
                ast.text.forEach(function (node, i, nodes) {
                    node.prev = nodes[i - 1];
                    node.next = nodes[i + 1];
                });
            },
            visitColumnPre: function (ast) {
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
    /**
     * ブロック記法の中身を組み替える。
     * ブロック記法は 1. 全ての記法を許可 2. インライン記法のみ許可 3. 全てを許可しない の3パターンの組み換えがある。
     * @param chapter
     * @param node
     */
    SyntaxPreprocessor.prototype.preprocessBlockSyntax = function (chunk, node) {
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
        }
        else if (syntax.allowInline) {
            // inline構文のみ許可(Paragraphは殺す
            // inline以外の構文は叩き潰してTextにmergeする
            var info_1 = null;
            var resultNodes_1 = [];
            var lastNode_1 = null;
            walker_1.visit(node.childNodes[0], {
                visitDefaultPre: function (node) {
                    if (node.ruleName === parser_1.RuleName.InlineElementContents ||
                        node.ruleName === parser_1.RuleName.InlineElementContent ||
                        node.ruleName === parser_1.RuleName.InlineElementContentText) {
                        // インラインコンテンツ二重出力を防ぐために無視。
                        return;
                    }
                    if (!info_1) {
                        info_1 = {
                            offset: node.location.start.offset,
                            line: node.location.start.line,
                            column: node.location.start.column
                        };
                    }
                    lastNode_1 = node;
                },
                visitInlineElementPre: function (node) {
                    var _a, _b, _c;
                    var textNode = new parser_1.TextNodeSyntaxTree({
                        syntax: "BlockElementContentText",
                        location: {
                            start: {
                                offset: (_a = info_1 === null || info_1 === void 0 ? void 0 : info_1.offset) !== null && _a !== void 0 ? _a : node.location.start.offset,
                                line: (_b = info_1 === null || info_1 === void 0 ? void 0 : info_1.line) !== null && _b !== void 0 ? _b : node.location.start.line,
                                column: (_c = info_1 === null || info_1 === void 0 ? void 0 : info_1.column) !== null && _c !== void 0 ? _c : node.location.start.column
                            },
                            end: {
                                offset: node.location.start.offset - 1,
                                line: void 0,
                                column: void 0,
                            }
                        },
                        // @<br>{} などは info がない
                        text: (info_1 === null || info_1 === void 0 ? void 0 : info_1.offset) == null ? "" : chunk.process.input.substring(info_1.offset, node.location.start.offset - 1)
                    });
                    if (textNode.text) {
                        resultNodes_1.push(textNode);
                    }
                    resultNodes_1.push(node);
                    info_1 = null;
                    lastNode_1 = node;
                },
                visitSingleLineCommentPre: function (node) {
                    if (!info_1) {
                        lastNode_1 = node;
                        return;
                    }
                    var textNode = new parser_1.TextNodeSyntaxTree({
                        syntax: "BlockElementContentText",
                        location: {
                            start: {
                                offset: info_1.offset,
                                line: info_1.line,
                                column: info_1.column
                            },
                            end: {
                                offset: node.location.start.offset - 1,
                                line: void 0,
                                column: void 0,
                            }
                        },
                        text: chunk.process.input.substring(info_1.offset, node.location.start.offset - 1)
                    });
                    if (textNode.text) {
                        resultNodes_1.push(textNode);
                    }
                    info_1 = null;
                    lastNode_1 = node;
                }
            });
            if (info_1) {
                var textNode = new parser_1.TextNodeSyntaxTree({
                    syntax: "BlockElementContentText",
                    location: {
                        start: {
                            offset: info_1.offset,
                            line: info_1.line,
                            column: info_1.column,
                        },
                        end: {
                            offset: node.location.start.offset - 1,
                            line: void 0,
                            column: void 0,
                        }
                    },
                    text: chunk.process.input.substring(info_1.offset, lastNode_1.location.end.offset)
                });
                if (textNode.text) {
                    resultNodes_1.push(textNode);
                }
            }
            node.childNodes = resultNodes_1;
        }
        else {
            // 全て不許可(テキスト化
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
                        line: void 0,
                        column: void 0,
                    }
                },
                text: utils_1.nodeContentToString(chunk.process, node)
            });
            node.childNodes = [textNode];
        }
    };
    return SyntaxPreprocessor;
}());
exports.SyntaxPreprocessor = SyntaxPreprocessor;

},{"../utils/utils":20,"./parser":15,"./walker":18}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultValidator = void 0;
var i18n_1 = require("../i18n/i18n");
var analyzer_1 = require("./analyzer");
var walker_1 = require("./walker");
var utils_1 = require("../utils/utils");
var DefaultValidator = /** @class */ (function () {
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
            var prefix = "";
            switch (syntax.type) {
                case analyzer_1.SyntaxType.Other:
                    // Other系は実装をチェックする必要はない…。(ということにしておく
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
        // Analyzer 内で生成した構文規則に基づき処理
        walker_1.visit(chunk.tree.ast, {
            visitDefaultPre: function (_node) {
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
        // 最初は必ず Level 1
        walker_1.visit(chunk.tree.ast, {
            visitDefaultPre: function (_node) {
            },
            visitChapterPre: function (node) {
                if (node.level === 1) {
                    if (!utils_1.findChapter(node)) {
                        // ここに来るのは実装のバグのはず
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
        // graph記法の外部ツール利用について内容が正しいかチェックする
        walker_1.visit(chunk.tree.ast, {
            visitDefaultPre: function (_node) {
            },
            visitBlockElementPre: function (node) {
                if (node.symbol !== "graph") {
                    return;
                }
                var toolNameNode = node.args[1];
                if (!toolNameNode) {
                    // ここのNodeがないのは別でチェックするので気にしない
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
        // symbols の解決
        // Arrayにflatten がなくて悲しい reduce だと長い…
        var symbols = book.allChunks.reduce(function (p, c) { return p.concat(c.process.symbols); }, []);
        symbols.forEach(function (symbol) {
            // referenceToのpartやchapterの解決
            var referenceTo = symbol.referenceTo;
            if (!referenceTo) {
                return;
            }
            if (!referenceTo.chapter && referenceTo.chapterName) {
                // 各章の名前は拡張子付きで入っているので、比較の為にファイル名にする
                var chapterFileName_1 = referenceTo.chapterName + ".re";
                book.allChunks.forEach(function (chunk) {
                    if (chapterFileName_1 === chunk.name) {
                        referenceTo.chapter = chunk;
                    }
                });
            }
        });
        // referenceTo.node の解決
        symbols.forEach(function (symbol) {
            var _a;
            if (symbol.referenceTo && !symbol.referenceTo.referenceNode) {
                var reference_1 = symbol.referenceTo;
                symbols.forEach(function (symbol) {
                    if (reference_1.chapter === symbol.chapter &&
                        reference_1.targetSymbol === symbol.symbolName &&
                        (reference_1.label == null || reference_1.label === symbol.labelName)) {
                        reference_1.referenceNode = symbol.node;
                    }
                });
                if (!reference_1.referenceNode) {
                    symbol.chapter.process.error(i18n_1.t("compile.reference_is_missing", reference_1.targetSymbol, (_a = reference_1.label) !== null && _a !== void 0 ? _a : reference_1.chapterName), symbol.node);
                    return;
                }
            }
        });
        // 同一チャプター内に同一シンボル(listとか)で同一labelの要素がないかチェック
        symbols.forEach(function (symbol1) {
            symbols.forEach(function (symbol2) {
                if (symbol1 === symbol2) {
                    return;
                }
                if (symbol1.chapter === symbol2.chapter && symbol1.symbolName === symbol2.symbolName) {
                    if (symbol1.labelName && symbol2.labelName && symbol1.labelName === symbol2.labelName) {
                        if (symbol1.symbolName === "hd") {
                            symbol1.chapter.process.error(i18n_1.t("compile.duplicated_label_headline"), symbol1.node, symbol2.node);
                        }
                        else {
                            symbol1.chapter.process.error(i18n_1.t("compile.duplicated_label"), symbol1.node, symbol2.node);
                        }
                        return;
                    }
                }
            });
        });
    };
    return DefaultValidator;
}());
exports.DefaultValidator = DefaultValidator;

},{"../i18n/i18n":8,"../utils/utils":20,"./analyzer":14,"./walker":18}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitAsync = exports.visit = exports.walk = void 0;
var parser_1 = require("./parser");
/**
 * 指定された構文木を歩きまわる。
 * 次にどちらへ歩くかは渡した関数によって決まる。
 * null が返ってくると歩くのを中断する。
 * @param ast
 * @param actor
 */
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
/**
 * 指定された構文木の全てのノード・リーフを同期的に探索する。
 * 親子であれば親のほうが先に探索され、兄弟であれば兄のほうが先に探索される。
 * つまり、葉に着目すると文章に登場する順番に探索される。
 * @param ast
 * @param v
 */
function visit(ast, v) {
    "use strict";
    _visit(function () { return new SyncTaskPool(); }, ast, v);
}
exports.visit = visit;
/**
 * 指定された構文木の全てのノード・リーフを非同期に探索する。
 * 親子であれば親のほうが先に探索され、兄弟であれば兄のほうが先に探索される。
 * つまり、葉に着目すると文章に登場する順番に探索される。
 * @param ast
 * @param v
 */
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
        var _ast_1 = ast;
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitBlockElementPre(ast, parent);
            pool.handle(ret, {
                next: function () {
                    _ast_1.args.forEach(function (next) {
                        pool.add(function () { return _visitSub(poolGenerator, ast, next, v); });
                    });
                    _ast_1.childNodes.forEach(function (next) {
                        pool.add(function () { return _visitSub(poolGenerator, ast, next, v); });
                    });
                },
                func: function () {
                    typeof ret === "function" && ret(v);
                }
            });
            pool.add(function () { return v.visitBlockElementPost(_ast_1, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.InlineElementSyntaxTree) {
        var _ast_2 = ast;
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitInlineElementPre(ast, parent);
            pool.handle(ret, {
                next: function () {
                    _ast_2.childNodes.forEach(function (next) {
                        pool.add(function () { return _visitSub(poolGenerator, ast, next, v); });
                    });
                },
                func: function () {
                    typeof ret === "function" && ret(v);
                }
            });
            pool.add(function () { return v.visitInlineElementPost(_ast_2, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.ArgumentSyntaxTree) {
        var _ast_3 = ast;
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitArgumentPre(_ast_3, parent);
            pool.handle(ret, {
                next: function () {
                },
                func: function () {
                    typeof ret === "function" && ret(v);
                }
            });
            pool.add(function () { return v.visitArgumentPost(_ast_3, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.ChapterSyntaxTree) {
        var _ast_4 = ast;
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitChapterPre(_ast_4, parent);
            pool.handle(ret, {
                next: function () {
                    if (_ast_4.comments) {
                        _ast_4.comments.forEach(function (next) {
                            pool.add(function () { return _visitSub(poolGenerator, ast, next, v); });
                        });
                    }
                    pool.add(function () { return _visitSub(poolGenerator, _ast_4, _ast_4.headline, v); });
                    if (_ast_4.text) {
                        _ast_4.text.forEach(function (next) {
                            pool.add(function () { return _visitSub(poolGenerator, ast, next, v); });
                        });
                    }
                    _ast_4.childNodes.forEach(function (next) {
                        pool.add(function () { return _visitSub(poolGenerator, ast, next, v); });
                    });
                },
                func: function () {
                    typeof ret === "function" && ret(v);
                }
            });
            pool.add(function () { return v.visitChapterPost(_ast_4, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.HeadlineSyntaxTree) {
        var _ast_5 = ast;
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitHeadlinePre(ast, parent);
            pool.handle(ret, {
                next: function () {
                    pool.add(function () { return _visitSub(poolGenerator, _ast_5, _ast_5.label, v); });
                    pool.add(function () { return _visitSub(poolGenerator, _ast_5, _ast_5.caption, v); });
                },
                func: function () {
                    typeof ret === "function" && ret(v);
                }
            });
            pool.add(function () { return v.visitHeadlinePost(_ast_5, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.ColumnSyntaxTree) {
        var _ast_6 = ast;
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitColumnPre(_ast_6, parent);
            pool.handle(ret, {
                next: function () {
                    pool.add(function () { return _visitSub(poolGenerator, _ast_6, _ast_6.headline, v); });
                    if (_ast_6.text) {
                        _ast_6.text.forEach(function (next) {
                            pool.add(function () { return _visitSub(poolGenerator, ast, next, v); });
                        });
                    }
                },
                func: function () {
                    typeof ret === "function" && ret(v);
                }
            });
            pool.add(function () { return v.visitColumnPost(_ast_6, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.ColumnHeadlineSyntaxTree) {
        var _ast_7 = ast;
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitColumnHeadlinePre(_ast_7, parent);
            pool.handle(ret, {
                next: function () {
                    pool.add(function () { return _visitSub(poolGenerator, _ast_7, _ast_7.caption, v); });
                },
                func: function () {
                    typeof ret === "function" && ret(v);
                }
            });
            pool.add(function () { return v.visitColumnHeadlinePost(_ast_7, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.UlistElementSyntaxTree) {
        var _ast_8 = ast;
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitUlistPre(ast, parent);
            pool.handle(ret, {
                next: function () {
                    pool.add(function () { return _visitSub(poolGenerator, _ast_8, _ast_8.text, v); });
                    _ast_8.childNodes.forEach(function (next) {
                        pool.add(function () { return _visitSub(poolGenerator, ast, next, v); });
                    });
                },
                func: function () {
                    typeof ret === "function" && ret(v);
                }
            });
            pool.add(function () { return v.visitUlistPost(_ast_8, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.OlistElementSyntaxTree) {
        var _ast_9 = ast;
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitOlistPre(ast, parent);
            pool.handle(ret, {
                next: function () {
                    pool.add(function () { return _visitSub(poolGenerator, _ast_9, _ast_9.text, v); });
                },
                func: function () {
                    typeof ret === "function" && ret(v);
                }
            });
            pool.add(function () { return v.visitOlistPost(_ast_9, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.DlistElementSyntaxTree) {
        var _ast_10 = ast;
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitDlistPre(ast, parent);
            pool.handle(ret, {
                next: function () {
                    pool.add(function () { return _visitSub(poolGenerator, _ast_10, _ast_10.text, v); });
                    pool.add(function () { return _visitSub(poolGenerator, _ast_10, _ast_10.content, v); });
                },
                func: function () {
                    typeof ret === "function" && ret(v);
                }
            });
            pool.add(function () { return v.visitDlistPost(_ast_10, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.NodeSyntaxTree && (ast.ruleName === parser_1.RuleName.Paragraph || ast.ruleName === parser_1.RuleName.BlockElementParagraph)) {
        var _ast_11 = ast;
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitParagraphPre(_ast_11, parent);
            pool.handle(ret, {
                next: function () {
                    _ast_11.childNodes.forEach(function (next) {
                        pool.add(function () { return _visitSub(poolGenerator, _ast_11, next, v); });
                    });
                },
                func: function () {
                    typeof ret === "function" && ret(v);
                }
            });
            pool.add(function () { return v.visitParagraphPost(_ast_11, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.NodeSyntaxTree) {
        var _ast_12 = ast;
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitNodePre(_ast_12, parent);
            pool.handle(ret, {
                next: function () {
                    _ast_12.childNodes.forEach(function (next) {
                        pool.add(function () { return _visitSub(poolGenerator, _ast_12, next, v); });
                    });
                },
                func: function () {
                    typeof ret === "function" && ret(v);
                }
            });
            pool.add(function () { return v.visitNodePost(_ast_12, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.TextNodeSyntaxTree) {
        var _ast_13 = ast;
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitTextPre(_ast_13, parent);
            pool.handle(ret, {
                next: function () {
                },
                func: function () {
                    typeof ret === "function" && ret(v);
                }
            });
            pool.add(function () { return v.visitTextPost(_ast_13, parent); });
            return pool.consume();
        })();
    }
    else if (ast instanceof parser_1.SingleLineCommentSyntaxTree) {
        var _ast_14 = ast;
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitSingleLineCommentPre(_ast_14, parent);
            pool.handle(ret, {
                next: function () {
                },
                func: function () {
                    typeof ret === "function" && ret(v);
                }
            });
            pool.add(function () { return v.visitSingleLineCommentPost(_ast_14, parent); });
            return pool.consume();
        })();
    }
    else if (ast) {
        return (function () {
            var pool = poolGenerator();
            var ret = v.visitDefaultPre(ast, parent);
            pool.handle(ret, {
                next: function () {
                },
                func: function () {
                    typeof ret === "function" && ret(v);
                }
            });
            pool.add(function () { return v.visitDefaultPost(ast, parent); });
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
/**
 * 同期化処理をそのまま同期処理として扱うためのヘルパクラス。
 */
var SyncTaskPool = /** @class */ (function () {
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
}());
/**
 * 同期化処理を非同期化するためのヘルパクラス。
 * array.forEach(value => process(value)); を以下のように書き換えて使う。
 * let pool = new AsyncTaskPool<any>();
 * array.forEach(value => pool.add(()=> process(value));
 * pool.consume().then(()=> ...);
 */
var AsyncTaskPool = /** @class */ (function () {
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
        var promise = new Promise(function (resolve) {
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
}());

},{"./parser":15}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dlistElement = exports.olistElement = exports.ulistElement = exports.braceArg = exports.columnTerminator = exports.columnHeadline = exports.column = exports.inlineElement = exports.blockElement = exports.headline = exports.chapter = exports.text = exports.contents = exports.content = exports.setup = void 0;
var parser_1 = require("../parser/parser");
var env;
function checkRuleName(ruleName) {
    "use strict";
    // undefined or index 0 is invalid name
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
function chapter(comments, headline, text) {
    "use strict";
    return {
        syntax: checkRuleName("Chapter"),
        location: env.location(),
        comments: comments,
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
function columnHeadline(level, label, caption) {
    "use strict";
    return {
        syntax: checkRuleName("ColumnHeadline"),
        location: env.location(),
        level: level.length,
        label: label,
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

},{"../parser/parser":15}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exec = exports.stringRepeat = exports.padLeft = exports.linesToFigure = exports.IO = exports.target2builder = exports.getHeadlineLevels = exports.findChapterOrColumn = exports.findChapter = exports.findUp = exports.nodeContentToString = exports.nodeToString = exports.flatten = exports.isAMD = exports.isNodeJS = exports.isBrowser = void 0;
var compilerModel_1 = require("../model/compilerModel");
var parser_1 = require("../parser/parser");
var textBuilder_1 = require("../builder/textBuilder");
var htmlBuilder_1 = require("../builder/htmlBuilder");
var analyzer_1 = require("../parser/analyzer");
var validator_1 = require("../parser/validator");
var walker_1 = require("../parser/walker");
var index_1 = require("../index");
false && compilerModel_1.Book; // tslint消し
/**
 * ブラウザ上での実行かどうかを判別する。
 * @returns {boolean}
 */
function isBrowser() {
    "use strict";
    return typeof window !== "undefined";
}
exports.isBrowser = isBrowser;
/**
 * Node.js上での実行かどうかを判別する。
 * @returns {boolean}
 */
function isNodeJS() {
    "use strict";
    if (typeof atom !== "undefined") {
        // atomはNode.jsと判定したいけどwindowあるしbrowserify環境下と区別するために特別扱いする
        return true;
    }
    return !isBrowser() && !isAMD() && typeof exports === "object";
}
exports.isNodeJS = isNodeJS;
/**
 * AMD環境下での実行かどうかを判別する。
 * @returns {boolean|any}
 */
function isAMD() {
    "use strict";
    return typeof define === "function" && define.amd;
}
exports.isAMD = isAMD;
/**
 * ネストしたArrayを潰して平らにする。
 * Arrayかどうかの判定は Array.isArray を利用。
 * @param data
 * @returns {*[]}
 */
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
function nodeContentToString(process, node, textOnly) {
    "use strict";
    var minPos = Number.MAX_VALUE;
    var maxPos = -1;
    // child
    var childVisitor = {
        visitDefaultPre: function (node) {
            minPos = Math.min(minPos, node.location.start.offset);
            maxPos = Math.max(maxPos, node.location.end.offset);
        }
    };
    var visitor = null;
    visitor = {
        visitDefaultPre: function (_node) {
        },
        visitNodePre: function (node) {
            // Chapter, Inline, Block もここに来る
            node.childNodes.forEach(function (child) { return walker_1.visit(child, textOnly ? visitor : childVisitor); });
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
            walker_1.visit(textOnly ? text : node, childVisitor);
            return false;
        }
    };
    // root (子要素だけ抽出したい)
    walker_1.visit(node, visitor);
    if (maxPos < 0) {
        return "";
    }
    else {
        return process.input.substring(minPos, maxPos);
    }
}
exports.nodeContentToString = nodeContentToString;
/**
 * 渡した要素から一番近いマッチする要素を探して返す。
 * 見つからなかった場合 null を返す。
 * @param node
 * @param predicate
 * @returns {SyntaxTree}
 */
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
/**
 * 渡した要素から直近のChapterを探して返す。
 * 見つからなかった場合 null を返す。
 * もし、渡した要素自身がChapterだった場合、自身を返すのでnode.parentNode を渡すこと。
 * @param node
 * @param level 探すChapterのlevel
 * @returns {ReVIEW.Parse.ChapterSyntaxTree}
 */
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
function getHeadlineLevels(node) {
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
    return result;
}
exports.getHeadlineLevels = getHeadlineLevels;
function target2builder(target) {
    "use strict";
    // TODO 適当になおす…
    var builderName = target.charAt(0).toUpperCase() + target.substring(1) + "Builder";
    if (builderName === "TextBuilder") {
        return new textBuilder_1.TextBuilder();
    }
    if (builderName === "HtmlBuilder") {
        return new htmlBuilder_1.HtmlBuilder();
    }
    /*
    for (let name in ReVIEW.Build) {
        if (name === builderName) {
            let ctor = (<any>ReVIEW.Build)[name];
            return new ctor();
        }
    }
     */
    return null;
}
exports.target2builder = target2builder;
/**
 * Node.jsでのIOをざっくり行うためのモジュール。
 */
var IO;
(function (IO) {
    "use strict";
    /**
     * 指定されたファイルを読み文字列として返す。
     * @param path
     * @returns {*}
     */
    function read(path) {
        /* tslint:disable:no-require-imports */
        var fs = require("fs");
        /* tslint:enable:no-require-imports */
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
    /**
     * 指定されたファイルへ文字列を書く。
     * @param path
     * @param content
     */
    function write(path, content) {
        /* tslint:disable:no-require-imports */
        var fs = require("fs");
        /* tslint:enable:no-require-imports */
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
/**
 * 行数から桁数の変換 100行 -> 3桁
 */
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
/**
 * 実行するためのヘルパクラス群
 */
var Exec;
(function (Exec) {
    "use strict";
    function singleCompile(input, fileName, target, tmpConfig /* ReVIEW.IConfig */) {
        "use strict";
        var config = tmpConfig || {};
        config.read = config.read || (function () { return Promise.resolve(input); });
        config.analyzer = config.analyzer || new analyzer_1.DefaultAnalyzer();
        config.validators = config.validators || [new validator_1.DefaultValidator()];
        if (target && target2builder(target) == null) {
            console.error(target + " is not exists in builder");
            process.exit(1);
        }
        config.builders = config.builders;
        if (!config.builders) {
            if (target) {
                var builder = target2builder(target);
                if (!builder) {
                    return Promise.reject("unknown target: " + target);
                }
                config.builders = [builder];
            }
            else {
                config.builders = [new textBuilder_1.TextBuilder()];
            }
        }
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
        var originalCompileSuccess = config.listener.onCompileSuccess;
        config.listener.onCompileSuccess = function (book) {
            originalCompileSuccess(book);
        };
        var originalCompileFailed = config.listener.onCompileFailed;
        config.listener.onCompileFailed = function (book) {
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

},{"../builder/htmlBuilder":2,"../builder/textBuilder":3,"../index":11,"../model/compilerModel":13,"../parser/analyzer":14,"../parser/parser":15,"../parser/validator":17,"../parser/walker":18,"fs":undefined}],21:[function(require,module,exports){
/*
 * Generated by PEG.js 0.10.0.
 *
 * http://pegjs.org/
 */

"use strict";

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

peg$SyntaxError.buildMessage = function(expected, found) {
  var DESCRIBE_EXPECTATION_FNS = {
        literal: function(expectation) {
          return "\"" + literalEscape(expectation.text) + "\"";
        },

        "class": function(expectation) {
          var escapedParts = "",
              i;

          for (i = 0; i < expectation.parts.length; i++) {
            escapedParts += expectation.parts[i] instanceof Array
              ? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1])
              : classEscape(expectation.parts[i]);
          }

          return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
        },

        any: function(expectation) {
          return "any character";
        },

        end: function(expectation) {
          return "end of input";
        },

        other: function(expectation) {
          return expectation.description;
        }
      };

  function hex(ch) {
    return ch.charCodeAt(0).toString(16).toUpperCase();
  }

  function literalEscape(s) {
    return s
      .replace(/\\/g, '\\\\')
      .replace(/"/g,  '\\"')
      .replace(/\0/g, '\\0')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
  }

  function classEscape(s) {
    return s
      .replace(/\\/g, '\\\\')
      .replace(/\]/g, '\\]')
      .replace(/\^/g, '\\^')
      .replace(/-/g,  '\\-')
      .replace(/\0/g, '\\0')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
  }

  function describeExpectation(expectation) {
    return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
  }

  function describeExpected(expected) {
    var descriptions = new Array(expected.length),
        i, j;

    for (i = 0; i < expected.length; i++) {
      descriptions[i] = describeExpectation(expected[i]);
    }

    descriptions.sort();

    if (descriptions.length > 0) {
      for (i = 1, j = 1; i < descriptions.length; i++) {
        if (descriptions[i - 1] !== descriptions[i]) {
          descriptions[j] = descriptions[i];
          j++;
        }
      }
      descriptions.length = j;
    }

    switch (descriptions.length) {
      case 1:
        return descriptions[0];

      case 2:
        return descriptions[0] + " or " + descriptions[1];

      default:
        return descriptions.slice(0, -1).join(", ")
          + ", or "
          + descriptions[descriptions.length - 1];
    }
  }

  function describeFound(found) {
    return found ? "\"" + literalEscape(found) + "\"" : "end of input";
  }

  return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
};

function peg$parse(input, options) {
  options = options !== void 0 ? options : {};

  var peg$FAILED = {},

      peg$startRuleFunctions = { Start: peg$parseStart },
      peg$startRuleFunction  = peg$parseStart,

      peg$c0 = peg$otherExpectation("start"),
      peg$c1 = function(c) { return b.content("Start", c); },
      peg$c2 = peg$otherExpectation("chapters"),
      peg$c3 = function(c, cc) { return b.contents("Chapters", c, cc); },
      peg$c4 = peg$otherExpectation("chapter"),
      peg$c5 = function(comments, headline, text) { return b.chapter(comments, headline, text); },
      peg$c6 = peg$otherExpectation("headline"),
      peg$c7 = "=",
      peg$c8 = peg$literalExpectation("=", false),
      peg$c9 = function(level, label, caption) { return b.headline(level, label, caption); },
      peg$c10 = peg$otherExpectation("contents"),
      peg$c11 = peg$anyExpectation(),
      peg$c12 = function(c, cc) { return b.contents("Contents", c, cc); },
      peg$c13 = peg$otherExpectation("content"),
      peg$c14 = function(c) { return b.content("Content", c); },
      peg$c15 = peg$otherExpectation("paragraph"),
      peg$c16 = function(c) { return b.content("Paragraph", c); },
      peg$c17 = peg$otherExpectation("paragraph subs"),
      peg$c18 = function(c, cc) { return b.contents("ParagraphSubs", c, cc); },
      peg$c19 = peg$otherExpectation("paragraph sub"),
      peg$c20 = function(c) { return b.content("ParagraphSub", c); },
      peg$c21 = peg$otherExpectation("text of content"),
      peg$c22 = /^[^\r\n]/,
      peg$c23 = peg$classExpectation(["\r", "\n"], true, false),
      peg$c24 = function(text) { return b.text("ContentText", text); },
      peg$c25 = peg$otherExpectation("block element"),
      peg$c26 = "//",
      peg$c27 = peg$literalExpectation("//", false),
      peg$c28 = "{",
      peg$c29 = peg$literalExpectation("{", false),
      peg$c30 = "//}",
      peg$c31 = peg$literalExpectation("//}", false),
      peg$c32 = function(symbol, args, contents) { return b.blockElement(symbol, args, contents); },
      peg$c33 = function(symbol, args) { return b.blockElement(symbol, args); },
      peg$c34 = peg$otherExpectation("inline element"),
      peg$c35 = "@<",
      peg$c36 = peg$literalExpectation("@<", false),
      peg$c37 = /^[^>\r\n]/,
      peg$c38 = peg$classExpectation([">", "\r", "\n"], true, false),
      peg$c39 = ">",
      peg$c40 = peg$literalExpectation(">", false),
      peg$c41 = "}",
      peg$c42 = peg$literalExpectation("}", false),
      peg$c43 = function(symbol, contents) { return b.inlineElement(symbol, contents); },
      peg$c44 = "|",
      peg$c45 = peg$literalExpectation("|", false),
      peg$c46 = "$",
      peg$c47 = peg$literalExpectation("$", false),
      peg$c48 = peg$otherExpectation("column"),
      peg$c49 = function(headline, text) { return b.column(headline, text); },
      peg$c50 = peg$otherExpectation("column headline"),
      peg$c51 = "[column]",
      peg$c52 = peg$literalExpectation("[column]", false),
      peg$c53 = function(level, label, caption) { return b.columnHeadline(level, label, caption); },
      peg$c54 = peg$otherExpectation("column contents"),
      peg$c55 = function(c, cc) { return b.contents("ColumnContents", c, cc); },
      peg$c56 = peg$otherExpectation("column content"),
      peg$c57 = function(c) { return b.content("ColumnContent", c); },
      peg$c58 = peg$otherExpectation("column terminator"),
      peg$c59 = "[/column]",
      peg$c60 = peg$literalExpectation("[/column]", false),
      peg$c61 = function(level) { return b.columnTerminator(level); },
      peg$c62 = peg$otherExpectation("bracket argument"),
      peg$c63 = "[",
      peg$c64 = peg$literalExpectation("[", false),
      peg$c65 = "]",
      peg$c66 = peg$literalExpectation("]", false),
      peg$c67 = function(c) { return b.content("BracketArg", c); },
      peg$c68 = peg$otherExpectation("bracket arg subs"),
      peg$c69 = function(c, cc) { return b.contents("BracketArgSubs", c, cc); },
      peg$c70 = peg$otherExpectation("bracket arg sub"),
      peg$c71 = function(c) { return b.content("BracketArgSub", c); },
      peg$c72 = peg$otherExpectation("text of bracket arg"),
      peg$c73 = "\\\\",
      peg$c74 = peg$literalExpectation("\\\\", false),
      peg$c75 = "\\]",
      peg$c76 = peg$literalExpectation("\\]", false),
      peg$c77 = "\\",
      peg$c78 = peg$literalExpectation("\\", false),
      peg$c79 = function(text) { return b.text("BracketArgText", text); },
      peg$c80 = peg$otherExpectation("brace argument"),
      peg$c81 = /^[^\r\n}\\]/,
      peg$c82 = peg$classExpectation(["\r", "\n", "}", "\\"], true, false),
      peg$c83 = "\\}",
      peg$c84 = peg$literalExpectation("\\}", false),
      peg$c85 = function(arg) { return b.braceArg(arg); },
      peg$c86 = peg$otherExpectation("contents of block element"),
      peg$c87 = function(c, cc) { return b.contents("BlockElementContents", c, cc); },
      peg$c88 = peg$otherExpectation("content of block element"),
      peg$c89 = function(c) { return b.content("BlockElementContent", c); },
      peg$c90 = peg$otherExpectation("paragraph in block"),
      peg$c91 = peg$otherExpectation("paragraph subs in block"),
      peg$c92 = peg$otherExpectation("paragraph sub in block"),
      peg$c93 = peg$otherExpectation("text of content in block"),
      peg$c94 = peg$otherExpectation("contents of inline element"),
      peg$c95 = function(c, cc) { return b.contents("InlineElementContents", c, cc); },
      peg$c96 = peg$otherExpectation("content of inline element"),
      peg$c97 = function(c) { error("Inlines cannot not contain other inlines."); },
      peg$c98 = function(c) { return b.content("InlineElementContent", c); },
      peg$c99 = peg$otherExpectation("text of inline element"),
      peg$c100 = function(text) { return b.text("InlineElementContentText", text.map(function(x) { return x.filter(function(y) { return y != null; }).join(""); }).join("")); },
      peg$c101 = peg$otherExpectation("char of inline element content"),
      peg$c102 = "\r\n",
      peg$c103 = peg$literalExpectation("\r\n", false),
      peg$c104 = "\n",
      peg$c105 = peg$literalExpectation("\n", false),
      peg$c106 = function(char) { return char; },
      peg$c107 = function() { return "\\"; },
      peg$c108 = function() { return "\u007D"; },
      peg$c109 = "\\|",
      peg$c110 = peg$literalExpectation("\\|", false),
      peg$c111 = function() { return "|"; },
      peg$c112 = "\\$",
      peg$c113 = peg$literalExpectation("\\$", false),
      peg$c114 = function() { return "$"; },
      peg$c115 = peg$otherExpectation("inline content"),
      peg$c116 = function(c) { return b.content("SinglelineContent", c); },
      peg$c117 = peg$otherExpectation("children of inline content"),
      peg$c118 = function(c, cc) { return b.contents("ContentInlines", c, cc); },
      peg$c119 = peg$otherExpectation("child of inline content"),
      peg$c120 = function(c) { return b.content("ContentInline", c); },
      peg$c121 = peg$otherExpectation("text of child of inline content"),
      peg$c122 = function(text) { return b.text("ContentInlineText", text); },
      peg$c123 = peg$otherExpectation("ulist"),
      peg$c124 = function(c, cc) { return b.contents("Ulist", c, cc); },
      peg$c125 = peg$otherExpectation("ulist element"),
      peg$c126 = " ",
      peg$c127 = peg$literalExpectation(" ", false),
      peg$c128 = "*",
      peg$c129 = peg$literalExpectation("*", false),
      peg$c130 = function(level, text) { return b.ulistElement(level, text); },
      peg$c131 = peg$otherExpectation("olist"),
      peg$c132 = function(c, cc) { return b.contents("Olist", c, cc); },
      peg$c133 = peg$otherExpectation("olist element"),
      peg$c134 = ".",
      peg$c135 = peg$literalExpectation(".", false),
      peg$c136 = function(n, text) { return b.olistElement(n, text); },
      peg$c137 = peg$otherExpectation("dlist"),
      peg$c138 = function(c, cc) { return b.contents("Dlist", c, cc); },
      peg$c139 = peg$otherExpectation("dlist element"),
      peg$c140 = ":",
      peg$c141 = peg$literalExpectation(":", false),
      peg$c142 = function(text, content) { return b.dlistElement(text, content); },
      peg$c143 = peg$otherExpectation("contents of dlist element"),
      peg$c144 = function(c, cc) { return b.contents("DlistElementContents", c, cc); },
      peg$c145 = peg$otherExpectation("content of dlist element"),
      peg$c146 = /^[ \t]/,
      peg$c147 = peg$classExpectation([" ", "\t"], false, false),
      peg$c148 = function(c) { return b.content("DlistElementContent", c); },
      peg$c149 = peg$otherExpectation("signle line comments"),
      peg$c150 = function(c, cc) { return b.contents("SinglelineComments", c, cc); },
      peg$c151 = peg$otherExpectation("signle line comment"),
      peg$c152 = "#@",
      peg$c153 = peg$literalExpectation("#@", false),
      peg$c154 = function(text) { return b.text("SinglelineComment", text); },
      peg$c155 = peg$otherExpectation("digits"),
      peg$c156 = peg$otherExpectation("digit"),
      peg$c157 = /^[0-9]/,
      peg$c158 = peg$classExpectation([["0", "9"]], false, false),
      peg$c159 = peg$otherExpectation("lower alphabet"),
      peg$c160 = /^[a-z]/,
      peg$c161 = peg$classExpectation([["a", "z"]], false, false),
      peg$c162 = peg$otherExpectation("newline"),
      peg$c163 = peg$otherExpectation("blank lines"),
      peg$c164 = peg$otherExpectation("spacer"),
      peg$c165 = /^[ \t\r\n]/,
      peg$c166 = peg$classExpectation([" ", "\t", "\r", "\n"], false, false),
      peg$c167 = peg$otherExpectation("space"),
      peg$c168 = /^[ \u3000\t]/,
      peg$c169 = peg$classExpectation([" ", "\u3000", "\t"], false, false),
      peg$c170 = peg$otherExpectation("end of file"),

      peg$currPos          = 0,
      peg$savedPos         = 0,
      peg$posDetailsCache  = [{ line: 1, column: 1 }],
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

  function expected(description, location) {
    location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)

    throw peg$buildStructuredError(
      [peg$otherExpectation(description)],
      input.substring(peg$savedPos, peg$currPos),
      location
    );
  }

  function error(message, location) {
    location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)

    throw peg$buildSimpleError(message, location);
  }

  function peg$literalExpectation(text, ignoreCase) {
    return { type: "literal", text: text, ignoreCase: ignoreCase };
  }

  function peg$classExpectation(parts, inverted, ignoreCase) {
    return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
  }

  function peg$anyExpectation() {
    return { type: "any" };
  }

  function peg$endExpectation() {
    return { type: "end" };
  }

  function peg$otherExpectation(description) {
    return { type: "other", description: description };
  }

  function peg$computePosDetails(pos) {
    var details = peg$posDetailsCache[pos], p;

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
        column: details.column
      };

      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++;
          details.column = 1;
        } else {
          details.column++;
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

  function peg$buildSimpleError(message, location) {
    return new peg$SyntaxError(message, null, null, location);
  }

  function peg$buildStructuredError(expected, found, location) {
    return new peg$SyntaxError(
      peg$SyntaxError.buildMessage(expected, found),
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
    var s0, s1, s2, s3;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$parseSinglelineComments();
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseHeadline();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseContents();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c5(s1, s2, s3);
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
            s5 = peg$parseBraceInlineElementContents();
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
    if (s0 === peg$FAILED) {
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
            if (input.charCodeAt(peg$currPos) === 124) {
              s4 = peg$c44;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c45); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsePipeInlineElementContents();
              if (s5 === peg$FAILED) {
                s5 = null;
              }
              if (s5 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 124) {
                  s6 = peg$c44;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c45); }
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
      if (s0 === peg$FAILED) {
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
              if (input.charCodeAt(peg$currPos) === 36) {
                s4 = peg$c46;
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c47); }
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parseDollarInlineElementContents();
                if (s5 === peg$FAILED) {
                  s5 = null;
                }
                if (s5 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 36) {
                    s6 = peg$c46;
                    peg$currPos++;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c47); }
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
      }
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
          s1 = peg$c49(s1, s2);
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
      if (peg$silentFails === 0) { peg$fail(peg$c48); }
    }

    return s0;
  }

  function peg$parseColumnHeadline() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

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
      if (input.substr(peg$currPos, 8) === peg$c51) {
        s2 = peg$c51;
        peg$currPos += 8;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c52); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parseBraceArg();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = [];
          s5 = peg$parseSpace();
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            s5 = peg$parseSpace();
          }
          if (s4 !== peg$FAILED) {
            s5 = [];
            s6 = peg$parseSpace();
            while (s6 !== peg$FAILED) {
              s5.push(s6);
              s6 = peg$parseSpace();
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parseSinglelineContent();
              if (s6 !== peg$FAILED) {
                s7 = peg$parse_l();
                if (s7 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c53(s1, s3, s6);
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
      if (peg$silentFails === 0) { peg$fail(peg$c50); }
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
            s1 = peg$c55(s2, s3);
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
        s1 = peg$c57(s2);
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
          s1 = peg$c57(s2);
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
            s1 = peg$c57(s2);
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
              s1 = peg$c57(s2);
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
                s1 = peg$c57(s2);
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
                  s1 = peg$c57(s2);
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
                    s1 = peg$c57(s2);
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
      if (peg$silentFails === 0) { peg$fail(peg$c56); }
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
      if (input.substr(peg$currPos, 9) === peg$c59) {
        s2 = peg$c59;
        peg$currPos += 9;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c60); }
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
            s1 = peg$c61(s1);
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
      if (peg$silentFails === 0) { peg$fail(peg$c58); }
    }

    return s0;
  }

  function peg$parseBracketArg() {
    var s0, s1, s2, s3;

    peg$silentFails++;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 91) {
      s1 = peg$c63;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c64); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseBracketArgSubs();
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 93) {
          s3 = peg$c65;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c66); }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c67(s2);
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
      if (peg$silentFails === 0) { peg$fail(peg$c62); }
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
        s1 = peg$c69(s1, s2);
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
      if (peg$silentFails === 0) { peg$fail(peg$c68); }
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
      s1 = peg$c71(s1);
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseBracketArgText();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c71(s1);
      }
      s0 = s1;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c70); }
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
        if (input.substr(peg$currPos, 2) === peg$c73) {
          s6 = peg$c73;
          peg$currPos += 2;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c74); }
        }
        if (s6 === peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c75) {
            s6 = peg$c75;
            peg$currPos += 2;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c76); }
          }
          if (s6 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 92) {
              s6 = peg$c77;
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c78); }
            }
            if (s6 === peg$FAILED) {
              s6 = peg$currPos;
              s7 = peg$currPos;
              peg$silentFails++;
              if (input.charCodeAt(peg$currPos) === 93) {
                s8 = peg$c65;
                peg$currPos++;
              } else {
                s8 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c66); }
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
            if (input.substr(peg$currPos, 2) === peg$c73) {
              s6 = peg$c73;
              peg$currPos += 2;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c74); }
            }
            if (s6 === peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c75) {
                s6 = peg$c75;
                peg$currPos += 2;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c76); }
              }
              if (s6 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 92) {
                  s6 = peg$c77;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c78); }
                }
                if (s6 === peg$FAILED) {
                  s6 = peg$currPos;
                  s7 = peg$currPos;
                  peg$silentFails++;
                  if (input.charCodeAt(peg$currPos) === 93) {
                    s8 = peg$c65;
                    peg$currPos++;
                  } else {
                    s8 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c66); }
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
      s1 = peg$c79(s1);
    }
    s0 = s1;
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c72); }
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
      if (peg$c81.test(input.charAt(peg$currPos))) {
        s6 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s6 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c82); }
      }
      if (s6 !== peg$FAILED) {
        while (s6 !== peg$FAILED) {
          s5.push(s6);
          if (peg$c81.test(input.charAt(peg$currPos))) {
            s6 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c82); }
          }
        }
      } else {
        s5 = peg$FAILED;
      }
      if (s5 !== peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c73) {
          s6 = peg$c73;
          peg$currPos += 2;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c74); }
        }
        if (s6 === peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c83) {
            s6 = peg$c83;
            peg$currPos += 2;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c84); }
          }
          if (s6 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 92) {
              s6 = peg$c77;
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c78); }
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
        if (peg$c81.test(input.charAt(peg$currPos))) {
          s6 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c82); }
        }
        if (s6 !== peg$FAILED) {
          while (s6 !== peg$FAILED) {
            s5.push(s6);
            if (peg$c81.test(input.charAt(peg$currPos))) {
              s6 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c82); }
            }
          }
        } else {
          s5 = peg$FAILED;
        }
        if (s5 !== peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c73) {
            s6 = peg$c73;
            peg$currPos += 2;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c74); }
          }
          if (s6 === peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c83) {
              s6 = peg$c83;
              peg$currPos += 2;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c84); }
            }
            if (s6 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 92) {
                s6 = peg$c77;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c78); }
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
          s1 = peg$c85(s2);
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
      if (peg$silentFails === 0) { peg$fail(peg$c80); }
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
          s1 = peg$c87(s1, s2);
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
      if (peg$silentFails === 0) { peg$fail(peg$c86); }
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
      s1 = peg$c89(s1);
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseBlockElement();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c89(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseUlist();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c89(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseOlist();
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c89(s1);
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseDlist();
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c89(s1);
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parseBlockElementParagraph();
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c89(s1);
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
      if (peg$silentFails === 0) { peg$fail(peg$c88); }
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
      if (peg$silentFails === 0) { peg$fail(peg$c90); }
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
      if (peg$silentFails === 0) { peg$fail(peg$c91); }
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
      if (peg$silentFails === 0) { peg$fail(peg$c92); }
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
    if (input.substr(peg$currPos, 3) === peg$c30) {
      s5 = peg$c30;
      peg$currPos += 3;
    } else {
      s5 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c31); }
    }
    if (s5 === peg$FAILED) {
      s5 = peg$currPos;
      s6 = peg$parseNewline();
      if (s6 !== peg$FAILED) {
        if (input.substr(peg$currPos, 3) === peg$c30) {
          s7 = peg$c30;
          peg$currPos += 3;
        } else {
          s7 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c31); }
        }
        if (s7 !== peg$FAILED) {
          s6 = [s6, s7];
          s5 = s6;
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
      } else {
        peg$currPos = s5;
        s5 = peg$FAILED;
      }
    }
    peg$silentFails--;
    if (s5 === peg$FAILED) {
      s4 = void 0;
    } else {
      peg$currPos = s4;
      s4 = peg$FAILED;
    }
    if (s4 !== peg$FAILED) {
      s5 = peg$parseNewline();
      if (s5 === peg$FAILED) {
        s5 = null;
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
        if (input.substr(peg$currPos, 3) === peg$c30) {
          s5 = peg$c30;
          peg$currPos += 3;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c31); }
        }
        if (s5 === peg$FAILED) {
          s5 = peg$currPos;
          s6 = peg$parseNewline();
          if (s6 !== peg$FAILED) {
            if (input.substr(peg$currPos, 3) === peg$c30) {
              s7 = peg$c30;
              peg$currPos += 3;
            } else {
              s7 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c31); }
            }
            if (s7 !== peg$FAILED) {
              s6 = [s6, s7];
              s5 = s6;
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
        }
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = void 0;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseNewline();
          if (s5 === peg$FAILED) {
            s5 = null;
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
      if (peg$silentFails === 0) { peg$fail(peg$c93); }
    }

    return s0;
  }

  function peg$parseBraceInlineElementContents() {
    var s0, s1, s2;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$parseBraceInlineElementContent();
    if (s1 !== peg$FAILED) {
      s2 = peg$parseBraceInlineElementContents();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c95(s1, s2);
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
      if (peg$silentFails === 0) { peg$fail(peg$c94); }
    }

    return s0;
  }

  function peg$parsePipeInlineElementContents() {
    var s0, s1, s2;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$parsePipeInlineElementContent();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsePipeInlineElementContents();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c95(s1, s2);
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
      if (peg$silentFails === 0) { peg$fail(peg$c94); }
    }

    return s0;
  }

  function peg$parseDollarInlineElementContents() {
    var s0, s1, s2;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$parseDollarInlineElementContent();
    if (s1 !== peg$FAILED) {
      s2 = peg$parseDollarInlineElementContents();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c95(s1, s2);
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
      if (peg$silentFails === 0) { peg$fail(peg$c94); }
    }

    return s0;
  }

  function peg$parseBraceInlineElementContent() {
    var s0, s1;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$parseInlineElement();
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c97(s1);
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseBraceInlineElementContentText();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c98(s1);
      }
      s0 = s1;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c96); }
    }

    return s0;
  }

  function peg$parsePipeInlineElementContent() {
    var s0, s1;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$parseInlineElement();
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c97(s1);
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parsePipeInlineElementContentText();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c98(s1);
      }
      s0 = s1;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c96); }
    }

    return s0;
  }

  function peg$parseDollarInlineElementContent() {
    var s0, s1;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$parseInlineElement();
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c97(s1);
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseDollarInlineElementContentText();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c98(s1);
      }
      s0 = s1;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c96); }
    }

    return s0;
  }

  function peg$parseBraceInlineElementContentText() {
    var s0, s1, s2, s3, s4;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = [];
    s2 = peg$currPos;
    s3 = peg$currPos;
    peg$silentFails++;
    s4 = peg$parseInlineElement();
    peg$silentFails--;
    if (s4 === peg$FAILED) {
      s3 = void 0;
    } else {
      peg$currPos = s3;
      s3 = peg$FAILED;
    }
    if (s3 !== peg$FAILED) {
      s4 = peg$parseBraceInlineElementContentChar();
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
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$currPos;
        s3 = peg$currPos;
        peg$silentFails++;
        s4 = peg$parseInlineElement();
        peg$silentFails--;
        if (s4 === peg$FAILED) {
          s3 = void 0;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parseBraceInlineElementContentChar();
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
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c100(s1);
    }
    s0 = s1;
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c99); }
    }

    return s0;
  }

  function peg$parsePipeInlineElementContentText() {
    var s0, s1, s2, s3, s4;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = [];
    s2 = peg$currPos;
    s3 = peg$currPos;
    peg$silentFails++;
    s4 = peg$parseInlineElement();
    peg$silentFails--;
    if (s4 === peg$FAILED) {
      s3 = void 0;
    } else {
      peg$currPos = s3;
      s3 = peg$FAILED;
    }
    if (s3 !== peg$FAILED) {
      s4 = peg$parsePipeInlineElementContentChar();
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
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$currPos;
        s3 = peg$currPos;
        peg$silentFails++;
        s4 = peg$parseInlineElement();
        peg$silentFails--;
        if (s4 === peg$FAILED) {
          s3 = void 0;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parsePipeInlineElementContentChar();
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
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c100(s1);
    }
    s0 = s1;
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c99); }
    }

    return s0;
  }

  function peg$parseDollarInlineElementContentText() {
    var s0, s1, s2, s3, s4;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = [];
    s2 = peg$currPos;
    s3 = peg$currPos;
    peg$silentFails++;
    s4 = peg$parseInlineElement();
    peg$silentFails--;
    if (s4 === peg$FAILED) {
      s3 = void 0;
    } else {
      peg$currPos = s3;
      s3 = peg$FAILED;
    }
    if (s3 !== peg$FAILED) {
      s4 = peg$parseDollarInlineElementContentChar();
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
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$currPos;
        s3 = peg$currPos;
        peg$silentFails++;
        s4 = peg$parseInlineElement();
        peg$silentFails--;
        if (s4 === peg$FAILED) {
          s3 = void 0;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parseDollarInlineElementContentChar();
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
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c100(s1);
    }
    s0 = s1;
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c99); }
    }

    return s0;
  }

  function peg$parseBraceInlineElementContentChar() {
    var s0, s1, s2;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$currPos;
    peg$silentFails++;
    if (input.charCodeAt(peg$currPos) === 92) {
      s2 = peg$c77;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c78); }
    }
    if (s2 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 125) {
        s2 = peg$c41;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c42); }
      }
      if (s2 === peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c102) {
          s2 = peg$c102;
          peg$currPos += 2;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c103); }
        }
        if (s2 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 10) {
            s2 = peg$c104;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c105); }
          }
        }
      }
    }
    peg$silentFails--;
    if (s2 === peg$FAILED) {
      s1 = void 0;
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      if (input.length > peg$currPos) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c11); }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c106(s2);
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
      if (input.substr(peg$currPos, 2) === peg$c73) {
        s1 = peg$c73;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c74); }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c107();
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c83) {
          s1 = peg$c83;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c84); }
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c108();
        }
        s0 = s1;
      }
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c101); }
    }

    return s0;
  }

  function peg$parsePipeInlineElementContentChar() {
    var s0, s1, s2;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$currPos;
    peg$silentFails++;
    if (input.charCodeAt(peg$currPos) === 92) {
      s2 = peg$c77;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c78); }
    }
    if (s2 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 124) {
        s2 = peg$c44;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c45); }
      }
      if (s2 === peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c102) {
          s2 = peg$c102;
          peg$currPos += 2;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c103); }
        }
        if (s2 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 10) {
            s2 = peg$c104;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c105); }
          }
        }
      }
    }
    peg$silentFails--;
    if (s2 === peg$FAILED) {
      s1 = void 0;
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      if (input.length > peg$currPos) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c11); }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c106(s2);
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
      if (input.substr(peg$currPos, 2) === peg$c73) {
        s1 = peg$c73;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c74); }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c107();
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c109) {
          s1 = peg$c109;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c110); }
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c111();
        }
        s0 = s1;
      }
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c101); }
    }

    return s0;
  }

  function peg$parseDollarInlineElementContentChar() {
    var s0, s1, s2;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$currPos;
    peg$silentFails++;
    if (input.charCodeAt(peg$currPos) === 92) {
      s2 = peg$c77;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c78); }
    }
    if (s2 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 36) {
        s2 = peg$c46;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c47); }
      }
      if (s2 === peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c102) {
          s2 = peg$c102;
          peg$currPos += 2;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c103); }
        }
        if (s2 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 10) {
            s2 = peg$c104;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c105); }
          }
        }
      }
    }
    peg$silentFails--;
    if (s2 === peg$FAILED) {
      s1 = void 0;
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      if (input.length > peg$currPos) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c11); }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c106(s2);
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
      if (input.substr(peg$currPos, 2) === peg$c73) {
        s1 = peg$c73;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c74); }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c107();
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c112) {
          s1 = peg$c112;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c113); }
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c114();
        }
        s0 = s1;
      }
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c101); }
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
        s1 = peg$c116(s1);
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
      if (peg$silentFails === 0) { peg$fail(peg$c115); }
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
        s1 = peg$c118(s1, s2);
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
      if (peg$silentFails === 0) { peg$fail(peg$c117); }
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
      s1 = peg$c120(s1);
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseContentInlineText();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c120(s1);
      }
      s0 = s1;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c119); }
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
      s1 = peg$c122(s1);
    }
    s0 = s1;
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c121); }
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
          s1 = peg$c124(s1, s2);
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
      if (peg$silentFails === 0) { peg$fail(peg$c123); }
    }

    return s0;
  }

  function peg$parseUlistElement() {
    var s0, s1, s2, s3, s4;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = [];
    if (input.charCodeAt(peg$currPos) === 32) {
      s2 = peg$c126;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c127); }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        if (input.charCodeAt(peg$currPos) === 32) {
          s2 = peg$c126;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c127); }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      if (input.charCodeAt(peg$currPos) === 42) {
        s3 = peg$c128;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c129); }
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (input.charCodeAt(peg$currPos) === 42) {
            s3 = peg$c128;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c129); }
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
            s1 = peg$c130(s2, s4);
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
      if (peg$silentFails === 0) { peg$fail(peg$c125); }
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
          s1 = peg$c132(s1, s2);
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
      if (peg$silentFails === 0) { peg$fail(peg$c131); }
    }

    return s0;
  }

  function peg$parseOlistElement() {
    var s0, s1, s2, s3, s4, s5;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = [];
    if (input.charCodeAt(peg$currPos) === 32) {
      s2 = peg$c126;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c127); }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        if (input.charCodeAt(peg$currPos) === 32) {
          s2 = peg$c126;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c127); }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseDigits();
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 46) {
          s3 = peg$c134;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c135); }
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
              s1 = peg$c136(s2, s5);
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
      if (peg$silentFails === 0) { peg$fail(peg$c133); }
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
          s1 = peg$c138(s1, s2);
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
      if (peg$silentFails === 0) { peg$fail(peg$c137); }
    }

    return s0;
  }

  function peg$parseDlistElement() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = [];
    if (input.charCodeAt(peg$currPos) === 32) {
      s2 = peg$c126;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c127); }
    }
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      if (input.charCodeAt(peg$currPos) === 32) {
        s2 = peg$c126;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c127); }
      }
    }
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 58) {
        s2 = peg$c140;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c141); }
      }
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 32) {
          s3 = peg$c126;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c127); }
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
                  s1 = peg$c142(s5, s6);
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
      if (peg$silentFails === 0) { peg$fail(peg$c139); }
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
          s1 = peg$c144(s1, s2);
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
      if (peg$silentFails === 0) { peg$fail(peg$c143); }
    }

    return s0;
  }

  function peg$parseDlistElementContent() {
    var s0, s1, s2, s3;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = [];
    if (peg$c146.test(input.charAt(peg$currPos))) {
      s2 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c147); }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        if (peg$c146.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c147); }
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
          s1 = peg$c148(s2);
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
      if (peg$silentFails === 0) { peg$fail(peg$c145); }
    }

    return s0;
  }

  function peg$parseSinglelineComments() {
    var s0, s1, s2;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$parseSinglelineComment();
    if (s1 !== peg$FAILED) {
      s2 = peg$parseSinglelineComments();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c150(s1, s2);
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
      if (peg$silentFails === 0) { peg$fail(peg$c149); }
    }

    return s0;
  }

  function peg$parseSinglelineComment() {
    var s0, s1, s2, s3, s4, s5, s6;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c152) {
      s3 = peg$c152;
      peg$currPos += 2;
    } else {
      s3 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c153); }
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
        s1 = peg$c154(s1);
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
      if (peg$silentFails === 0) { peg$fail(peg$c151); }
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
      if (peg$silentFails === 0) { peg$fail(peg$c155); }
    }

    return s0;
  }

  function peg$parseDigit() {
    var s0, s1;

    peg$silentFails++;
    if (peg$c157.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c158); }
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c156); }
    }

    return s0;
  }

  function peg$parseAZ() {
    var s0, s1;

    peg$silentFails++;
    if (peg$c160.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c161); }
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c159); }
    }

    return s0;
  }

  function peg$parseNewline() {
    var s0, s1;

    peg$silentFails++;
    if (input.substr(peg$currPos, 2) === peg$c102) {
      s0 = peg$c102;
      peg$currPos += 2;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c103); }
    }
    if (s0 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 10) {
        s0 = peg$c104;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c105); }
      }
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c162); }
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
    if (peg$c146.test(input.charAt(peg$currPos))) {
      s4 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s4 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c147); }
    }
    while (s4 !== peg$FAILED) {
      s3.push(s4);
      if (peg$c146.test(input.charAt(peg$currPos))) {
        s4 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c147); }
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
      if (peg$c146.test(input.charAt(peg$currPos))) {
        s4 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c147); }
      }
      while (s4 !== peg$FAILED) {
        s3.push(s4);
        if (peg$c146.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c147); }
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
      if (peg$silentFails === 0) { peg$fail(peg$c163); }
    }

    return s0;
  }

  function peg$parse_() {
    var s0, s1, s2;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = [];
    if (peg$c165.test(input.charAt(peg$currPos))) {
      s2 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c166); }
    }
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      if (peg$c165.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c166); }
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
      if (peg$silentFails === 0) { peg$fail(peg$c164); }
    }

    return s0;
  }

  function peg$parseSpace() {
    var s0, s1;

    peg$silentFails++;
    if (peg$c168.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c169); }
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c167); }
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
      if (peg$silentFails === 0) { peg$fail(peg$c170); }
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
      peg$fail(peg$endExpectation());
    }

    throw peg$buildStructuredError(
      peg$maxFailExpected,
      peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
      peg$maxFailPos < input.length
        ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
        : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
    );
  }
}

module.exports = {
  SyntaxError: peg$SyntaxError,
  parse:       peg$parse
};

},{"../lib/peg/action":19}]},{},[11])(11)
});
