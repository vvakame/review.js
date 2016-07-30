"use strict";

import {RuleName, SyntaxTree, BlockElementSyntaxTree, InlineElementSyntaxTree, ArgumentSyntaxTree, ChapterSyntaxTree, HeadlineSyntaxTree, UlistElementSyntaxTree, OlistElementSyntaxTree, DlistElementSyntaxTree, ColumnSyntaxTree, ColumnHeadlineSyntaxTree, NodeSyntaxTree, TextNodeSyntaxTree, SingleLineCommentSyntaxTree} from "./parser";

/**
 * 指定された構文木を歩きまわる。
 * 次にどちらへ歩くかは渡した関数によって決まる。
 * null が返ってくると歩くのを中断する。
 * @param ast
 * @param actor
 */
export function walk(ast: SyntaxTree, actor: (ast: SyntaxTree) => SyntaxTree) {
    "use strict";

    if (!ast) {
        return;
    }

    let next = actor(ast);
    if (next) {
        walk(next, actor);
    }
}

/**
 * 指定された構文木の全てのノード・リーフを同期的に探索する。
 * 親子であれば親のほうが先に探索され、兄弟であれば兄のほうが先に探索される。
 * つまり、葉に着目すると文章に登場する順番に探索される。
 * @param ast
 * @param v
 */
export function visit(ast: SyntaxTree, v: TreeVisitor): void {
    "use strict";

    _visit(() => new SyncTaskPool<void>(), ast, v);
}

/**
 * 指定された構文木の全てのノード・リーフを非同期に探索する。
 * 親子であれば親のほうが先に探索され、兄弟であれば兄のほうが先に探索される。
 * つまり、葉に着目すると文章に登場する順番に探索される。
 * @param ast
 * @param v
 */
export function visitAsync(ast: SyntaxTree, v: TreeVisitor): Promise<void> {
    "use strict";

    return Promise.resolve(_visit(() => new AsyncTaskPool<void>(), ast, v));
}

function _visit(poolGenerator: () => TaskPool<void>, ast: SyntaxTree, v: TreeVisitor): any {
    "use strict";

    let newV: TreeVisitor = {
        visitDefaultPre: v.visitDefaultPre,
        visitDefaultPost: v.visitDefaultPost || (() => {
        }),
        visitBlockElementPre: v.visitBlockElementPre || v.visitNodePre || v.visitDefaultPre,
        visitBlockElementPost: v.visitBlockElementPost || v.visitNodePost || v.visitDefaultPost || (() => {
        }),
        visitInlineElementPre: v.visitInlineElementPre || v.visitNodePre || v.visitDefaultPre,
        visitInlineElementPost: v.visitInlineElementPost || v.visitNodePost || v.visitDefaultPost || (() => {
        }),
        visitNodePre: v.visitNodePre || v.visitDefaultPre,
        visitNodePost: v.visitNodePost || v.visitDefaultPost || (() => {
        }),
        visitArgumentPre: v.visitArgumentPre || v.visitDefaultPre,
        visitArgumentPost: v.visitArgumentPost || v.visitDefaultPost || (() => {
        }),
        visitChapterPre: v.visitChapterPre || v.visitNodePre || v.visitDefaultPre,
        visitChapterPost: v.visitChapterPost || v.visitNodePost || v.visitDefaultPost || (() => {
        }),
        visitParagraphPre: v.visitParagraphPre || v.visitNodePre || v.visitDefaultPre,
        visitParagraphPost: v.visitParagraphPost || v.visitNodePost || (() => {
        }),
        visitHeadlinePre: v.visitHeadlinePre || v.visitDefaultPre,
        visitHeadlinePost: v.visitHeadlinePost || v.visitDefaultPost || (() => {
        }),
        visitUlistPre: v.visitUlistPre || v.visitNodePre || v.visitDefaultPre,
        visitUlistPost: v.visitUlistPost || v.visitNodePost || v.visitDefaultPost || (() => {
        }),
        visitOlistPre: v.visitOlistPre || v.visitDefaultPre,
        visitOlistPost: v.visitOlistPost || v.visitDefaultPost || (() => {
        }),
        visitDlistPre: v.visitDlistPre || v.visitDefaultPre,
        visitDlistPost: v.visitDlistPost || v.visitDefaultPost || (() => {
        }),
        visitColumnPre: v.visitColumnPre || v.visitNodePre || v.visitDefaultPre,
        visitColumnPost: v.visitColumnPost || v.visitNodePost || v.visitDefaultPost || (() => {
        }),
        visitColumnHeadlinePre: v.visitColumnHeadlinePre || v.visitDefaultPre,
        visitColumnHeadlinePost: v.visitColumnHeadlinePost || v.visitDefaultPost || (() => {
        }),
        visitTextPre: v.visitTextPre || v.visitDefaultPre,
        visitTextPost: v.visitTextPost || v.visitDefaultPost || (() => {
        }),
        visitSingleLineCommentPre: v.visitSingleLineCommentPre || v.visitDefaultPre,
        visitSingleLineCommentPost: v.visitSingleLineCommentPost || v.visitDefaultPost || (() => {
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

function _visitSub(poolGenerator: () => TaskPool<void>, parent: SyntaxTree, ast: SyntaxTree, v: TreeVisitor): any {
    "use strict";

    if (ast instanceof BlockElementSyntaxTree) {
        let _ast = ast;
        return (() => {
            let pool = poolGenerator();
            let ret = v.visitBlockElementPre(ast, parent);
            pool.handle(ret, {
                next: () => {
                    _ast.args.forEach((next) => {
                        pool.add(() => _visitSub(poolGenerator, ast, next, v));
                    });
                    _ast.childNodes.forEach((next) => {
                        pool.add(() => _visitSub(poolGenerator, ast, next, v));
                    });
                },
                func: () => {
                    ret(v);
                }
            });
            pool.add(() => v.visitBlockElementPost(_ast, parent));
            return pool.consume();
        })();
    } else if (ast instanceof InlineElementSyntaxTree) {
        let _ast = ast;
        return (() => {
            let pool = poolGenerator();
            let ret = v.visitInlineElementPre(ast, parent);
            pool.handle(ret, {
                next: () => {
                    _ast.childNodes.forEach((next) => {
                        pool.add(() => _visitSub(poolGenerator, ast, next, v));
                    });
                },
                func: () => {
                    ret(v);
                }
            });
            pool.add(() => v.visitInlineElementPost(_ast, parent));
            return pool.consume();
        })();
    } else if (ast instanceof ArgumentSyntaxTree) {
        let _ast = ast;
        return (() => {
            let pool = poolGenerator();
            let ret = v.visitArgumentPre(_ast, parent);
            pool.handle(ret, {
                next: () => {
                },
                func: () => {
                    ret(v);
                }
            });
            pool.add(() => v.visitArgumentPost(_ast, parent));
            return pool.consume();
        })();
    } else if (ast instanceof ChapterSyntaxTree) {
        let _ast = ast;
        return (() => {
            let pool = poolGenerator();
            let ret = v.visitChapterPre(_ast, parent);
            pool.handle(ret, {
                next: () => {
                    pool.add(() => _visitSub(poolGenerator, _ast, _ast.headline, v));
                    if (_ast.text) {
                        _ast.text.forEach((next) => {
                            pool.add(() => _visitSub(poolGenerator, ast, next, v));
                        });
                    }
                    _ast.childNodes.forEach((next) => {
                        pool.add(() => _visitSub(poolGenerator, ast, next, v));
                    });
                },
                func: () => {
                    ret(v);
                }
            });
            pool.add(() => v.visitChapterPost(_ast, parent));
            return pool.consume();
        })();
    } else if (ast instanceof HeadlineSyntaxTree) {
        let _ast = ast;
        return (() => {
            let pool = poolGenerator();
            let ret = v.visitHeadlinePre(ast, parent);
            pool.handle(ret, {
                next: () => {
                    pool.add(() => _visitSub(poolGenerator, _ast, _ast.label, v));
                    pool.add(() => _visitSub(poolGenerator, _ast, _ast.caption, v));
                },
                func: () => {
                    ret(v);
                }
            });
            pool.add(() => v.visitHeadlinePost(_ast, parent));
            return pool.consume();
        })();
    } else if (ast instanceof ColumnSyntaxTree) {
        let _ast = ast;
        return (() => {
            let pool = poolGenerator();
            let ret = v.visitColumnPre(_ast, parent);
            pool.handle(ret, {
                next: () => {
                    pool.add(() => _visitSub(poolGenerator, _ast, _ast.headline, v));
                    if (_ast.text) {
                        _ast.text.forEach((next) => {
                            pool.add(() => _visitSub(poolGenerator, ast, next, v));
                        });
                    }
                },
                func: () => {
                    ret(v);
                }
            });
            pool.add(() => v.visitColumnPost(_ast, parent));
            return pool.consume();
        })();
    } else if (ast instanceof ColumnHeadlineSyntaxTree) {
        let _ast = ast;
        return (() => {
            let pool = poolGenerator();
            let ret = v.visitColumnHeadlinePre(_ast, parent);
            pool.handle(ret, {
                next: () => {
                    pool.add(() => _visitSub(poolGenerator, _ast, _ast.caption, v));
                },
                func: () => {
                    ret(v);
                }
            });
            pool.add(() => v.visitColumnHeadlinePost(_ast, parent));
            return pool.consume();
        })();
    } else if (ast instanceof UlistElementSyntaxTree) {
        let _ast = ast;
        return (() => {
            let pool = poolGenerator();
            let ret = v.visitUlistPre(ast, parent);
            pool.handle(ret, {
                next: () => {
                    pool.add(() => _visitSub(poolGenerator, _ast, _ast.text, v));
                    _ast.childNodes.forEach((next) => {
                        pool.add(() => _visitSub(poolGenerator, ast, next, v));
                    });
                },
                func: () => {
                    ret(v);
                }
            });
            pool.add(() => v.visitUlistPost(_ast, parent));
            return pool.consume();
        })();
    } else if (ast instanceof OlistElementSyntaxTree) {
        let _ast = ast;
        return (() => {
            let pool = poolGenerator();
            let ret = v.visitOlistPre(ast, parent);
            pool.handle(ret, {
                next: () => {
                    pool.add(() => _visitSub(poolGenerator, _ast, _ast.text, v));
                },
                func: () => {
                    ret(v);
                }
            });
            pool.add(() => v.visitOlistPost(_ast, parent));
            return pool.consume();
        })();
    } else if (ast instanceof DlistElementSyntaxTree) {
        let _ast = ast;
        return (() => {
            let pool = poolGenerator();
            let ret = v.visitDlistPre(ast, parent);
            pool.handle(ret, {
                next: () => {
                    pool.add(() => _visitSub(poolGenerator, _ast, _ast.text, v));
                    pool.add(() => _visitSub(poolGenerator, _ast, _ast.content, v));
                },
                func: () => {
                    ret(v);
                }
            });
            pool.add(() => v.visitDlistPost(_ast, parent));
            return pool.consume();
        })();
    } else if (ast instanceof NodeSyntaxTree && (ast.ruleName === RuleName.Paragraph || ast.ruleName === RuleName.BlockElementParagraph)) {
        let _ast = ast;
        return (() => {
            let pool = poolGenerator();
            let ret = v.visitParagraphPre(_ast, parent);
            pool.handle(ret, {
                next: () => {
                    _ast.childNodes.forEach((next) => {
                        pool.add(() => _visitSub(poolGenerator, _ast, next, v));
                    });
                },
                func: () => {
                    ret(v);
                }
            });
            pool.add(() => v.visitParagraphPost(_ast, parent));
            return pool.consume();
        })();
    } else if (ast instanceof NodeSyntaxTree) {
        let _ast = ast;
        return (() => {
            let pool = poolGenerator();
            let ret = v.visitNodePre(_ast, parent);
            pool.handle(ret, {
                next: () => {
                    _ast.childNodes.forEach((next) => {
                        pool.add(() => _visitSub(poolGenerator, _ast, next, v));
                    });
                },
                func: () => {
                    ret(v);
                }
            });
            pool.add(() => v.visitNodePost(_ast, parent));
            return pool.consume();
        })();
    } else if (ast instanceof TextNodeSyntaxTree) {
        let _ast = ast;
        return (() => {
            let pool = poolGenerator();
            let ret = v.visitTextPre(_ast, parent);
            pool.handle(ret, {
                next: () => {
                },
                func: () => {
                    ret(v);
                }
            });
            pool.add(() => v.visitTextPost(_ast, parent));
            return pool.consume();
        })();
    } else if (ast instanceof SingleLineCommentSyntaxTree) {
        let _ast = ast;
        return (() => {
            let pool = poolGenerator();
            let ret = v.visitSingleLineCommentPre(_ast, parent);
            pool.handle(ret, {
                next: () => {
                },
                func: () => {
                    ret(v);
                }
            });
            pool.add(() => v.visitSingleLineCommentPost(_ast, parent));
            return pool.consume();
        })();
    } else if (ast) {
        return (() => {
            let pool = poolGenerator();
            let ret = v.visitDefaultPre(parent, ast);
            pool.handle(ret, {
                next: () => {
                },
                func: () => {
                    ret(v);
                }
            });
            pool.add(() => v.visitDefaultPost(parent, ast));
            return pool.consume();
        })();
    } else {
        return (() => {
            let pool = poolGenerator();
            return pool.consume();
        })();
    }
}

/**
 * 構文木を渡り歩くためのVisitor。
 * 実装されなかったメソッドは、visitDefault または NodeSyntaxTree を継承している場合 visitNode にフォールバックする。
 * 各メソッドの返り値としてanyを返す。
 * undefined, true を返した時、子要素の探索は継続される。
 * false を返した時、子要素の探索は行われない。
 * Function を返した時、子要素の探索を行う代わりにその関数が実行される。Functionには引数として実行中のTreeVisitorが渡される。
 */
export interface TreeVisitor {
    visitDefaultPre(node: SyntaxTree, parent: SyntaxTree): any;
    visitDefaultPost?(node: SyntaxTree, parent: SyntaxTree): void;
    visitNodePre?(node: NodeSyntaxTree, parent: SyntaxTree): any;
    visitNodePost?(node: NodeSyntaxTree, parent: SyntaxTree): void;
    visitBlockElementPre?(node: BlockElementSyntaxTree, parent: SyntaxTree): any;
    visitBlockElementPost?(node: BlockElementSyntaxTree, parent: SyntaxTree): void;
    visitInlineElementPre?(node: InlineElementSyntaxTree, parent: SyntaxTree): any;
    visitInlineElementPost?(node: InlineElementSyntaxTree, parent: SyntaxTree): void;
    visitArgumentPre?(node: ArgumentSyntaxTree, parent: SyntaxTree): any;
    visitArgumentPost?(node: ArgumentSyntaxTree, parent: SyntaxTree): void;
    visitChapterPre?(node: ChapterSyntaxTree, parent: SyntaxTree): any;
    visitChapterPost?(node: ChapterSyntaxTree, parent: SyntaxTree): void;
    visitParagraphPre?(node: NodeSyntaxTree, parent: SyntaxTree): any;
    visitParagraphPost?(node: NodeSyntaxTree, parent: SyntaxTree): void;
    visitHeadlinePre?(node: HeadlineSyntaxTree, parent: SyntaxTree): any;
    visitHeadlinePost?(node: HeadlineSyntaxTree, parent: SyntaxTree): void;
    visitUlistPre?(node: UlistElementSyntaxTree, parent: SyntaxTree): any;
    visitUlistPost?(node: UlistElementSyntaxTree, parent: SyntaxTree): void;
    visitOlistPre?(node: OlistElementSyntaxTree, parent: SyntaxTree): any;
    visitOlistPost?(node: OlistElementSyntaxTree, parent: SyntaxTree): void;
    visitDlistPre?(node: DlistElementSyntaxTree, parent: SyntaxTree): any;
    visitDlistPost?(node: DlistElementSyntaxTree, parent: SyntaxTree): void;
    visitColumnPre?(node: ColumnSyntaxTree, parent: SyntaxTree): any;
    visitColumnPost?(node: ColumnSyntaxTree, parent: SyntaxTree): void;
    visitColumnHeadlinePre?(node: ColumnHeadlineSyntaxTree, parent: SyntaxTree): any;
    visitColumnHeadlinePost?(node: ColumnHeadlineSyntaxTree, parent: SyntaxTree): void;
    visitSingleLineCommentPre?(node: SingleLineCommentSyntaxTree, parent: SyntaxTree): any;
    visitSingleLineCommentPost?(node: SingleLineCommentSyntaxTree, parent: SyntaxTree): void;
    visitTextPre?(node: TextNodeSyntaxTree, parent: SyntaxTree): any;
    visitTextPost?(node: TextNodeSyntaxTree, parent: SyntaxTree): void;
}

/**
 * 同期化処理と非同期化処理の記述を一本化するためのヘルパインタフェース。
 * 構造が汚いのでexportしないこと。
 */
interface TaskPool<T> {
    add(value: () => T): void;
    handle(value: any, statements: { next: () => void; func: () => void; }): void;
    consume(): any; // T | Promise<T[]>
}

/**
 * 同期化処理をそのまま同期処理として扱うためのヘルパクラス。
 */
class SyncTaskPool<T> implements TaskPool<T> {
    tasks: { (): T; }[] = [];

    add(value: () => T): void {
        this.tasks.push(value);
    }

    handle(value: any, statements: { next: () => void; func: () => void; }): void {
        if (typeof value === "undefined" || (typeof value === "boolean" && value)) {
            statements.next();
        } else if (typeof value === "function") {
            statements.func();
        }
    }

    consume(): T[] {
        return this.tasks.map(task => task());
    }
}

/**
 * 同期化処理を非同期化するためのヘルパクラス。
 * array.forEach(value => process(value)); を以下のように書き換えて使う。
 * let pool = new AsyncTaskPool<any>();
 * array.forEach(value => pool.add(()=> process(value));
 * pool.consume().then(()=> ...);
 */
class AsyncTaskPool<T> implements TaskPool<T> {
    tasks: { (): Promise<T>; }[] = [];

    add(value: () => T): void;

    add(task: () => Promise<T>): void;

    add(value: () => any) {
        this.tasks.push(() => Promise.resolve(value()));
    }

    handle(value: any, statements: { next: () => void; func: () => void; }): void {
        if (typeof value === "undefined" || (typeof value === "boolean" && value)) {
            statements.next();
        } else if (value && typeof value.then === "function") {
            this.tasks.push(() => Promise.resolve(value));
        } else if (typeof value === "function") {
            statements.func();
        }
    }

    consume(): Promise<T[]> {
        let promise = new Promise<T[]>(resolve => {
            let result: T[] = [];
            let next = () => {
                let func = this.tasks.shift();
                if (!func) {
                    resolve(result);
                    return;
                }
                func().then(value => {
                    result.push(value);
                    next();
                });
            };
            next();
        });
        return promise;
    }
}
