





declare module ReVIEW {
    function isNodeJS(): boolean;
    function isAMD(): boolean;
    function flatten(data: any[]): any[];
    function nodeToString(process: Process, node: Parse.SyntaxTree): string;
    function nodeToString(process: BuilderProcess, node: Parse.SyntaxTree): string;
    function nodeContentToString(process: Process, node: Parse.SyntaxTree): string;
    function nodeContentToString(process: BuilderProcess, node: Parse.SyntaxTree): string;
    function findUp(node: Parse.SyntaxTree, predicate: (node: Parse.SyntaxTree) => boolean): Parse.SyntaxTree;
    function findChapter(node: Parse.SyntaxTree, level?: number): Parse.ChapterSyntaxTree;
    function findChapterOrColumn(node: Parse.SyntaxTree, level?: number): Parse.NodeSyntaxTree;
    function target2builder(target: string): Build.IBuilder;
    module IO {
        function read(path: string): Promise<string>;
        function write(path: string, content: string): Promise<void>;
    }
    function stringRepeat(times: number, src: string): string;
    module Exec {
        function singleCompile(input: string, fileName?: string, target?: string, tmpConfig?: any): Promise<{
            book: Book;
            results: any;
        }>;
    }
}
declare module ReVIEW {
    var ja: {
        "sample": string;
        "description": {
            "headline": string;
            "column": string;
            "ulist": string;
            "olist": string;
            "dlist": string;
            "block_list": string;
            "inline_list": string;
            "block_listnum": string;
            "block_emlist": string;
            "block_emlistnum": string;
            "block_image": string;
            "block_indepimage": string;
            "inline_img": string;
            "inline_icon": string;
            "block_footnote": string;
            "inline_fn": string;
            "block_lead": string;
            "block_noindent": string;
            "block_source": string;
            "block_cmd": string;
            "block_quote": string;
            "inline_hd": string;
            "inline_code": string;
            "inline_br": string;
            "inline_u": string;
            "inline_ruby": string;
            "inline_b": string;
            "inline_href": string;
            "block_label": string;
            "inline_kw": string;
            "inline_tti": string;
            "inline_ttb": string;
            "inline_ami": string;
            "inline_bou": string;
            "inline_i": string;
            "inline_strong": string;
            "inline_uchar": string;
            "inline_tt": string;
            "inline_em": string;
            "block_raw": string;
            "inline_raw": string;
            "block_comment": string;
            "inline_comment": string;
            "block_table": string;
            "inline_table": string;
            "block_tsize": string;
        };
        "compile": {
            "file_not_exists": string;
            "block_not_supported": string;
            "inline_not_supported": string;
            "part_is_missing": string;
            "chapter_is_missing": string;
            "reference_is_missing": string;
            "duplicated_label": string;
            "args_length_mismatch": string;
            "body_string_only": string;
            "chapter_not_toplevel": string;
            "chapter_topleve_eq1": string;
            "deprecated_inline_symbol": string;
        };
        "builder": {
            "image_not_found": string;
            "chapter": string;
            "list": string;
            "table": string;
        };
    };
}
declare module ReVIEW {
    var en: {
        "sample": string;
    };
}
declare module ReVIEW.i18n {
    function setup(lang?: string): void;
    function t(str: string, ...args: any[]): string;
}
declare module ReVIEW {
    module Parse {
    }
    import SyntaxTree = ReVIEW.Parse.SyntaxTree;
    import BlockElementSyntaxTree = ReVIEW.Parse.BlockElementSyntaxTree;
    import InlineElementSyntaxTree = ReVIEW.Parse.InlineElementSyntaxTree;
    import ArgumentSyntaxTree = ReVIEW.Parse.ArgumentSyntaxTree;
    import ChapterSyntaxTree = ReVIEW.Parse.ChapterSyntaxTree;
    import HeadlineSyntaxTree = ReVIEW.Parse.HeadlineSyntaxTree;
    import UlistElementSyntaxTree = ReVIEW.Parse.UlistElementSyntaxTree;
    import OlistElementSyntaxTree = ReVIEW.Parse.OlistElementSyntaxTree;
    import DlistElementSyntaxTree = ReVIEW.Parse.DlistElementSyntaxTree;
    import ColumnSyntaxTree = ReVIEW.Parse.ColumnSyntaxTree;
    import ColumnHeadlineSyntaxTree = ReVIEW.Parse.ColumnHeadlineSyntaxTree;
    import NodeSyntaxTree = ReVIEW.Parse.NodeSyntaxTree;
    import TextNodeSyntaxTree = ReVIEW.Parse.TextNodeSyntaxTree;
    function walk(ast: SyntaxTree, actor: (ast: SyntaxTree) => SyntaxTree): void;
    function visit(ast: SyntaxTree, v: ITreeVisitor): void;
    function visitAsync(ast: SyntaxTree, v: ITreeVisitor): Promise<void>;
    interface ITreeVisitor {
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
        visitTextPre?(node: TextNodeSyntaxTree, parent: SyntaxTree): any;
        visitTextPost?(node: TextNodeSyntaxTree, parent: SyntaxTree): void;
    }
}
declare module ReVIEW.Parse {
    function parse(input: string): {
        ast: NodeSyntaxTree;
        cst: IConcreatSyntaxTree;
    };
    function transform(rawResult: IConcreatSyntaxTree): SyntaxTree;
    class ParseError implements Error {
        syntax: IConcreatSyntaxTree;
        message: string;
        name: string;
        constructor(syntax: IConcreatSyntaxTree, message: string);
    }
    interface IConcreatSyntaxTree {
        syntax: string;
        line: number;
        column: number;
        offset: number;
        endPos: number;
        headline?: any;
        text?: any;
        level?: number;
        label?: any;
        cmd?: any;
        caption?: any;
        symbol?: any;
        args?: any;
        content?: any;
        contents?: any;
        arg?: any;
        no?: any;
    }
    enum RuleName {
        SyntaxError = 0,
        Start = 1,
        Chapters = 2,
        Chapter = 3,
        Headline = 4,
        Contents = 5,
        Content = 6,
        Paragraph = 7,
        ParagraphSubs = 8,
        ParagraphSub = 9,
        ContentText = 10,
        BlockElement = 11,
        InlineElement = 12,
        BracketArg = 13,
        BraceArg = 14,
        BlockElementContents = 15,
        BlockElementContent = 16,
        BlockElementParagraph = 17,
        BlockElementParagraphSubs = 18,
        BlockElementParagraphSub = 19,
        BlockElementContentText = 20,
        InlineElementContents = 21,
        InlineElementContent = 22,
        InlineElementContentText = 23,
        SinglelineContent = 24,
        ContentInlines = 25,
        ContentInline = 26,
        ContentInlineText = 27,
        Ulist = 28,
        UlistElement = 29,
        Olist = 30,
        OlistElement = 31,
        Dlist = 32,
        DlistElement = 33,
        DlistElementContent = 34,
        Column = 35,
        ColumnHeadline = 36,
        ColumnContents = 37,
        ColumnContent = 38,
        ColumnTerminator = 39,
        SinglelineComment = 40,
    }
    class SyntaxTree {
        parentNode: SyntaxTree;
        offset: number;
        line: number;
        column: number;
        endPos: number;
        ruleName: RuleName;
        no: number;
        prev: SyntaxTree;
        next: SyntaxTree;
        constructor(data: IConcreatSyntaxTree);
        toJSON(): any;
        toString(indentLevel?: number): string;
        makeIndent(indentLevel: number): string;
        toStringHook(indentLevel: number, result: string): void;
        checkNumber(value: any): number;
        checkString(value: any): string;
        checkObject(value: any): any;
        checkArray(value: any): any[];
        private checkSyntaxType(clazz);
        isNode(): boolean;
        isBlockElement(): boolean;
        isInlineElement(): boolean;
        isArgument(): boolean;
        isChapter(): boolean;
        isHeadline(): boolean;
        isUlist(): boolean;
        isOlist(): boolean;
        isDlist(): boolean;
        isTextNode(): boolean;
        private toOtherNode<T>(clazz);
        toNode(): NodeSyntaxTree;
        toBlockElement(): BlockElementSyntaxTree;
        toInlineElement(): InlineElementSyntaxTree;
        toArgument(): ArgumentSyntaxTree;
        toChapter(): ChapterSyntaxTree;
        toColumn(): ColumnSyntaxTree;
        toHeadline(): HeadlineSyntaxTree;
        toColumnHeadline(): ColumnHeadlineSyntaxTree;
        toUlist(): UlistElementSyntaxTree;
        toOlist(): OlistElementSyntaxTree;
        toDlist(): DlistElementSyntaxTree;
        toTextNode(): TextNodeSyntaxTree;
    }
    class NodeSyntaxTree extends SyntaxTree {
        childNodes: SyntaxTree[];
        constructor(data: IConcreatSyntaxTree);
        private processChildNodes(content);
        toStringHook(indentLevel: number, result: string): void;
    }
    class ChapterSyntaxTree extends NodeSyntaxTree {
        headline: HeadlineSyntaxTree;
        text: SyntaxTree[];
        constructor(data: IConcreatSyntaxTree);
        level: number;
        fqn: string;
    }
    class HeadlineSyntaxTree extends SyntaxTree {
        level: number;
        label: ArgumentSyntaxTree;
        caption: NodeSyntaxTree;
        constructor(data: IConcreatSyntaxTree);
    }
    class BlockElementSyntaxTree extends NodeSyntaxTree {
        symbol: string;
        args: ArgumentSyntaxTree[];
        constructor(data: IConcreatSyntaxTree);
    }
    class InlineElementSyntaxTree extends NodeSyntaxTree {
        symbol: string;
        constructor(data: IConcreatSyntaxTree);
    }
    class ColumnSyntaxTree extends NodeSyntaxTree {
        headline: ColumnHeadlineSyntaxTree;
        text: SyntaxTree[];
        constructor(data: IConcreatSyntaxTree);
        level: number;
        fqn: string;
    }
    class ColumnHeadlineSyntaxTree extends SyntaxTree {
        level: number;
        caption: NodeSyntaxTree;
        constructor(data: IConcreatSyntaxTree);
    }
    class ArgumentSyntaxTree extends SyntaxTree {
        arg: string;
        constructor(data: IConcreatSyntaxTree);
    }
    class UlistElementSyntaxTree extends NodeSyntaxTree {
        level: number;
        text: SyntaxTree;
        constructor(data: IConcreatSyntaxTree);
    }
    class OlistElementSyntaxTree extends SyntaxTree {
        no: number;
        text: SyntaxTree;
        constructor(data: IConcreatSyntaxTree);
    }
    class DlistElementSyntaxTree extends SyntaxTree {
        text: SyntaxTree;
        content: SyntaxTree;
        constructor(data: IConcreatSyntaxTree);
    }
    class TextNodeSyntaxTree extends SyntaxTree {
        text: string;
        constructor(data: IConcreatSyntaxTree);
    }
}
declare module ReVIEW.Build {
    import SyntaxTree = ReVIEW.Parse.SyntaxTree;
    enum SyntaxType {
        Block = 0,
        Inline = 1,
        Other = 2,
    }
    interface IAnalyzeProcessor {
        (process: Process, node: SyntaxTree): any;
    }
    class AcceptableSyntaxes {
        acceptableSyntaxes: AcceptableSyntax[];
        constructor(acceptableSyntaxes: AcceptableSyntax[]);
        find(node: SyntaxTree): AcceptableSyntax[];
        inlines: AcceptableSyntax[];
        blocks: AcceptableSyntax[];
        others: AcceptableSyntax[];
        toJSON(): any;
    }
    class AcceptableSyntax {
        type: SyntaxType;
        clazz: any;
        symbolName: string;
        argsLength: number[];
        allowInline: boolean;
        allowFullySyntax: boolean;
        description: string;
        process: IAnalyzeProcessor;
        toJSON(): any;
    }
    interface IAnalyzer {
        getAcceptableSyntaxes(): AcceptableSyntaxes;
    }
    interface IAcceptableSyntaxBuilder {
        setSyntaxType(type: SyntaxType): void;
        setClass(clazz: any): void;
        setSymbol(symbolName: string): void;
        setDescription(description: string): void;
        checkArgsLength(...argsLength: number[]): void;
        setAllowInline(enable: boolean): void;
        setAllowFullySyntax(enable: boolean): void;
        processNode(func: IAnalyzeProcessor): void;
    }
    class DefaultAnalyzer implements IAnalyzer {
        private _acceptableSyntaxes;
        getAcceptableSyntaxes(): AcceptableSyntaxes;
        constructAcceptableSyntaxes(): AcceptableSyntax[];
        headline(builder: IAcceptableSyntaxBuilder): void;
        column(builder: IAcceptableSyntaxBuilder): void;
        ulist(builder: IAcceptableSyntaxBuilder): void;
        olist(builder: IAcceptableSyntaxBuilder): void;
        dlist(builder: IAcceptableSyntaxBuilder): void;
        block_list(builder: IAcceptableSyntaxBuilder): void;
        block_listnum(builder: IAcceptableSyntaxBuilder): void;
        inline_list(builder: IAcceptableSyntaxBuilder): void;
        block_emlist(builder: IAcceptableSyntaxBuilder): void;
        block_emlistnum(builder: IAcceptableSyntaxBuilder): void;
        inline_hd(builder: IAcceptableSyntaxBuilder): void;
        block_image(builder: IAcceptableSyntaxBuilder): void;
        block_indepimage(builder: IAcceptableSyntaxBuilder): void;
        inline_img(builder: IAcceptableSyntaxBuilder): void;
        inline_icon(builder: IAcceptableSyntaxBuilder): void;
        block_footnote(builder: IAcceptableSyntaxBuilder): void;
        inline_fn(builder: IAcceptableSyntaxBuilder): void;
        blockDecorationSyntax(builder: IAcceptableSyntaxBuilder, symbol: string, ...argsLength: number[]): void;
        block_lead(builder: IAcceptableSyntaxBuilder): void;
        block_noindent(builder: IAcceptableSyntaxBuilder): void;
        block_source(builder: IAcceptableSyntaxBuilder): void;
        block_cmd(builder: IAcceptableSyntaxBuilder): void;
        block_quote(builder: IAcceptableSyntaxBuilder): void;
        inlineDecorationSyntax(builder: IAcceptableSyntaxBuilder, symbol: string): void;
        inline_br(builder: IAcceptableSyntaxBuilder): void;
        inline_ruby(builder: IAcceptableSyntaxBuilder): void;
        inline_b(builder: IAcceptableSyntaxBuilder): void;
        inline_code(builder: IAcceptableSyntaxBuilder): void;
        inline_tt(builder: IAcceptableSyntaxBuilder): void;
        inline_href(builder: IAcceptableSyntaxBuilder): void;
        block_label(builder: IAcceptableSyntaxBuilder): void;
        inline_u(builder: IAcceptableSyntaxBuilder): void;
        inline_kw(builder: IAcceptableSyntaxBuilder): void;
        inline_em(builder: IAcceptableSyntaxBuilder): void;
        inline_tti(builder: IAcceptableSyntaxBuilder): void;
        inline_ttb(builder: IAcceptableSyntaxBuilder): void;
        inline_ami(builder: IAcceptableSyntaxBuilder): void;
        inline_bou(builder: IAcceptableSyntaxBuilder): void;
        inline_i(builder: IAcceptableSyntaxBuilder): void;
        inline_strong(builder: IAcceptableSyntaxBuilder): void;
        inline_uchar(builder: IAcceptableSyntaxBuilder): void;
        block_table(builder: IAcceptableSyntaxBuilder): void;
        inline_table(builder: IAcceptableSyntaxBuilder): void;
        block_tsize(builder: IAcceptableSyntaxBuilder): void;
        block_raw(builder: IAcceptableSyntaxBuilder): void;
        inline_raw(builder: IAcceptableSyntaxBuilder): void;
        block_comment(builder: IAcceptableSyntaxBuilder): void;
        inline_comment(builder: IAcceptableSyntaxBuilder): void;
    }
}
declare module ReVIEW.Build {
    import SyntaxTree = ReVIEW.Parse.SyntaxTree;
    import NodeSyntaxTree = ReVIEW.Parse.NodeSyntaxTree;
    import BlockElementSyntaxTree = ReVIEW.Parse.BlockElementSyntaxTree;
    import InlineElementSyntaxTree = ReVIEW.Parse.InlineElementSyntaxTree;
    import HeadlineSyntaxTree = ReVIEW.Parse.HeadlineSyntaxTree;
    import UlistElementSyntaxTree = ReVIEW.Parse.UlistElementSyntaxTree;
    import OlistElementSyntaxTree = ReVIEW.Parse.OlistElementSyntaxTree;
    import DlistElementSyntaxTree = ReVIEW.Parse.DlistElementSyntaxTree;
    import TextNodeSyntaxTree = ReVIEW.Parse.TextNodeSyntaxTree;
    import ChapterSyntaxTree = ReVIEW.Parse.ChapterSyntaxTree;
    import ColumnSyntaxTree = ReVIEW.Parse.ColumnSyntaxTree;
    import ColumnHeadlineSyntaxTree = ReVIEW.Parse.ColumnHeadlineSyntaxTree;
    interface IBuilder {
        name: string;
        extention: string;
        init(book: Book): Promise<void>;
        escape(data: any): string;
        chapterPre(process: BuilderProcess, node: ChapterSyntaxTree): any;
        chapterPost(process: BuilderProcess, node: ChapterSyntaxTree): any;
        headlinePre(process: BuilderProcess, name: string, node: HeadlineSyntaxTree): any;
        headlinePost(process: BuilderProcess, name: string, node: HeadlineSyntaxTree): any;
        columnPre(process: BuilderProcess, node: ColumnSyntaxTree): any;
        columnPost(process: BuilderProcess, node: ColumnSyntaxTree): any;
        columnHeadlinePre(process: BuilderProcess, node: ColumnHeadlineSyntaxTree): any;
        columnHeadlinePost(process: BuilderProcess, node: ColumnHeadlineSyntaxTree): any;
        ulistPre(process: BuilderProcess, name: string, node: UlistElementSyntaxTree): any;
        ulistPost(process: BuilderProcess, name: string, node: UlistElementSyntaxTree): any;
        olistPre(process: BuilderProcess, name: string, node: OlistElementSyntaxTree): any;
        olistPost(process: BuilderProcess, name: string, node: OlistElementSyntaxTree): any;
        blockPre(process: BuilderProcess, name: string, node: BlockElementSyntaxTree): any;
        blockPost(process: BuilderProcess, name: string, node: BlockElementSyntaxTree): any;
        inlinePre(process: BuilderProcess, name: string, node: InlineElementSyntaxTree): any;
        inlinePost(process: BuilderProcess, name: string, node: InlineElementSyntaxTree): any;
        text(process: BuilderProcess, node: TextNodeSyntaxTree): any;
    }
    class DefaultBuilder implements IBuilder {
        book: Book;
        extention: string;
        name: string;
        init(book: Book): Promise<void>;
        processAst(chunk: ContentChunk): Promise<void>;
        escape(data: any): string;
        processPost(process: BuilderProcess, chunk: ContentChunk): void;
        chapterPre(process: BuilderProcess, node: ChapterSyntaxTree): any;
        chapterPost(process: BuilderProcess, node: ChapterSyntaxTree): any;
        headlinePre(process: BuilderProcess, name: string, node: HeadlineSyntaxTree): any;
        headlinePost(process: BuilderProcess, name: string, node: HeadlineSyntaxTree): any;
        columnPre(process: BuilderProcess, node: ColumnSyntaxTree): any;
        columnPost(process: BuilderProcess, node: ColumnSyntaxTree): any;
        columnHeadlinePre(process: BuilderProcess, node: ColumnHeadlineSyntaxTree): any;
        columnHeadlinePost(process: BuilderProcess, node: ColumnHeadlineSyntaxTree): any;
        paragraphPre(process: BuilderProcess, name: string, node: NodeSyntaxTree): any;
        paragraphPost(process: BuilderProcess, name: string, node: NodeSyntaxTree): any;
        ulistPre(process: BuilderProcess, name: string, node: UlistElementSyntaxTree): any;
        ulistPost(process: BuilderProcess, name: string, node: UlistElementSyntaxTree): any;
        olistPre(process: BuilderProcess, name: string, node: OlistElementSyntaxTree): any;
        olistPost(process: BuilderProcess, name: string, node: OlistElementSyntaxTree): any;
        dlistPre(process: BuilderProcess, name: string, node: DlistElementSyntaxTree): any;
        dlistPost(process: BuilderProcess, name: string, node: DlistElementSyntaxTree): any;
        text(process: BuilderProcess, node: TextNodeSyntaxTree): any;
        blockPre(process: BuilderProcess, name: string, node: BlockElementSyntaxTree): any;
        blockPost(process: BuilderProcess, name: string, node: BlockElementSyntaxTree): any;
        inlinePre(process: BuilderProcess, name: string, node: InlineElementSyntaxTree): any;
        inlinePost(process: BuilderProcess, name: string, node: InlineElementSyntaxTree): any;
        ulistParentHelper(process: BuilderProcess, node: UlistElementSyntaxTree, action: () => void, currentLevel?: number): void;
        findReference(process: BuilderProcess, node: SyntaxTree): ISymbol;
        block_raw(process: BuilderProcess, node: BlockElementSyntaxTree): any;
        inline_raw(process: BuilderProcess, node: InlineElementSyntaxTree): any;
    }
}
declare module ReVIEW.Build {
    import BlockElementSyntaxTree = ReVIEW.Parse.BlockElementSyntaxTree;
    import ColumnSyntaxTree = ReVIEW.Parse.ColumnSyntaxTree;
    interface IPreprocessor {
        start(book: Book, acceptableSyntaxes: AcceptableSyntaxes): void;
    }
    class SyntaxPreprocessor implements IPreprocessor {
        acceptableSyntaxes: AcceptableSyntaxes;
        start(book: Book): void;
        preprocessChunk(chunk: ContentChunk): void;
        preprocessColumnSyntax(chunk: ContentChunk, column: ColumnSyntaxTree): void;
        preprocessBlockSyntax(chunk: ContentChunk, node: BlockElementSyntaxTree): void;
    }
}
declare module ReVIEW.Build {
    interface IValidator {
        start(book: Book, acceptableSyntaxes: AcceptableSyntaxes, builders: IBuilder[]): void;
    }
    class DefaultValidator implements IValidator {
        acceptableSyntaxes: AcceptableSyntaxes;
        builders: IBuilder[];
        start(book: Book, acceptableSyntaxes: AcceptableSyntaxes, builders: IBuilder[]): void;
        checkBuilder(book: Book, acceptableSyntaxes: AcceptableSyntaxes, builders?: IBuilder[]): void;
        checkBook(book: Book): void;
        checkChunk(chunk: ContentChunk): void;
        resolveSymbolAndReference(book: Book): void;
    }
}
declare module ReVIEW {
    class Config {
        original: IConfigRaw;
        _builders: Build.IBuilder[];
        _bookStructure: BookStructure;
        constructor(original: IConfigRaw);
        read: (path: string) => Promise<string>;
        write: (path: string, data: string) => Promise<void>;
        exists: (path: string) => Promise<{
            path: string;
            result: boolean;
        }>;
        analyzer: Build.IAnalyzer;
        validators: Build.IValidator[];
        builders: Build.IBuilder[];
        listener: IConfigListener;
        book: BookStructure;
        resolvePath(path: string): string;
    }
    class NodeJSConfig extends Config {
        options: IOptions;
        original: IConfigRaw;
        _listener: IConfigListener;
        constructor(options: IOptions, original: IConfigRaw);
        read: (path: string) => Promise<string>;
        write: (path: string, data: string) => Promise<void>;
        exists: (path: string) => Promise<{
            path: string;
            result: boolean;
        }>;
        listener: IConfigListener;
        onReports(reports: ProcessReport[]): void;
        onCompileSuccess(book: Book): void;
        onCompileFailed(): void;
        resolvePath(path: string): string;
    }
    class WebBrowserConfig extends Config {
        options: IOptions;
        original: IConfigRaw;
        _listener: IConfigListener;
        constructor(options: IOptions, original: IConfigRaw);
        read: (path: string) => Promise<string>;
        write: (path: string, data: string) => Promise<void>;
        exists: (path: string) => Promise<{
            path: string;
            result: boolean;
        }>;
        _existsFileScheme(path: string): Promise<{
            path: string;
            result: boolean;
        }>;
        _existsHttpScheme(path: string): Promise<{
            path: string;
            result: boolean;
        }>;
        listener: IConfigListener;
        onReports(reports: ProcessReport[]): void;
        onCompileSuccess(book: Book): void;
        onCompileFailed(book?: Book): void;
        resolvePath(path: string): string;
        private startWith(str, target);
        private endWith(str, target);
    }
}
declare module ReVIEW {
    class Controller {
        options: IOptions;
        private config;
        builders: typeof Build;
        constructor(options?: IOptions);
        initConfig(data: IConfigRaw): void;
        process(): Promise<Book>;
        acceptableSyntaxes(book: Book): Promise<Book>;
        toContentChunk(book: Book): Book;
        readReVIEWFiles(book: Book): Promise<Book>;
        parseContent(book: Book): Book;
        preprocessContent(book: Book): Book;
        processContent(book: Book): Promise<Book>;
        writeContent(book: Book): Promise<Book>;
        compileFinished(book: Book): Book;
        handleError(err: any): Promise<Book>;
    }
}
declare module ReVIEW {
    interface IReferenceTo {
        part?: ContentChunk;
        partName: string;
        chapter?: ContentChunk;
        chapterName: string;
        targetSymbol: string;
        label: string;
        referenceNode?: Parse.SyntaxTree;
    }
    interface ISymbol {
        part?: ContentChunk;
        chapter?: ContentChunk;
        symbolName: string;
        labelName?: string;
        referenceTo?: IReferenceTo;
        node: Parse.SyntaxTree;
    }
    enum ReportLevel {
        Info = 0,
        Warning = 1,
        Error = 2,
    }
    class ProcessReport {
        level: ReportLevel;
        part: ContentChunk;
        chapter: ContentChunk;
        message: string;
        nodes: Parse.SyntaxTree[];
        constructor(level: ReportLevel, part: ContentChunk, chapter: ContentChunk, message: string, nodes?: Parse.SyntaxTree[]);
    }
    class BookProcess {
        reports: ProcessReport[];
        info(message: string): void;
        warn(message: string): void;
        error(message: string): void;
    }
    class Process {
        part: ContentChunk;
        chapter: ContentChunk;
        input: string;
        symbols: ISymbol[];
        indexCounter: {
            [x: string]: number;
        };
        afterProcess: Function[];
        private _reports;
        constructor(part: ContentChunk, chapter: ContentChunk, input: string);
        info(message: string, ...nodes: Parse.SyntaxTree[]): void;
        warn(message: string, ...nodes: Parse.SyntaxTree[]): void;
        error(message: string, ...nodes: Parse.SyntaxTree[]): void;
        nextIndex(kind: string): number;
        reports: ProcessReport[];
        addSymbol(symbol: ISymbol): void;
        missingSymbols: ISymbol[];
        constructReferenceTo(node: Parse.InlineElementSyntaxTree, value: string, targetSymbol?: string, separator?: string): IReferenceTo;
        constructReferenceTo(node: Parse.BlockElementSyntaxTree, value: string, targetSymbol: string, separator?: string): IReferenceTo;
        addAfterProcess(func: Function): void;
        doAfterProcess(): void;
    }
    class BuilderProcess {
        builder: Build.IBuilder;
        base: Process;
        constructor(builder: Build.IBuilder, base: Process);
        info: (message: string, ...nodes: Parse.SyntaxTree[]) => void;
        warn: (message: string, ...nodes: Parse.SyntaxTree[]) => void;
        error: (message: string, ...nodes: Parse.SyntaxTree[]) => void;
        result: string;
        out(data: any): BuilderProcess;
        outRaw(data: any): BuilderProcess;
        pushOut(data: string): BuilderProcess;
        input: string;
        symbols: ISymbol[];
        findImageFile(id: string): Promise<string>;
    }
    class Book {
        config: Config;
        process: BookProcess;
        acceptableSyntaxes: Build.AcceptableSyntaxes;
        predef: ContentChunk[];
        contents: ContentChunk[];
        appendix: ContentChunk[];
        postdef: ContentChunk[];
        constructor(config: Config);
        allChunks: ContentChunk[];
        reports: ProcessReport[];
        hasError: boolean;
        hasWarning: boolean;
    }
    class ContentChunk {
        book: Book;
        parent: ContentChunk;
        nodes: ContentChunk[];
        no: number;
        name: string;
        _input: string;
        tree: {
            ast: Parse.SyntaxTree;
            cst: Parse.IConcreatSyntaxTree;
        };
        process: Process;
        builderProcesses: BuilderProcess[];
        constructor(book: Book, parent: ContentChunk, name: string);
        constructor(book: Book, name: string);
        input: string;
        createBuilderProcess(builder: Build.IBuilder): BuilderProcess;
        findResultByBuilder(builderName: string): string;
        findResultByBuilder(builder: Build.IBuilder): string;
    }
}
declare module ReVIEW {
    interface IOptions {
        reviewfile?: string;
        base?: string;
    }
    interface IConfigRaw {
        basePath?: string;
        read?: (path: string) => Promise<string>;
        write?: (path: string, data: string) => Promise<void>;
        listener?: IConfigListener;
        analyzer?: Build.IAnalyzer;
        validators?: Build.IValidator[];
        builders?: Build.IBuilder[];
        book: IConfigBook;
    }
    interface IConfigListener {
        onAcceptables?: (acceptableSyntaxes: Build.AcceptableSyntaxes) => any;
        onSymbols?: (symbols: ISymbol[]) => any;
        onReports?: (reports: ProcessReport[]) => any;
        onCompileSuccess?: (book: Book) => void;
        onCompileFailed?: (book?: Book) => void;
    }
    interface IConfigBook {
        predef?: IConfigChapter[];
        contents: IConfigPartOrChapter[];
        appendix?: IConfigChapter[];
        postdef?: IConfigChapter[];
    }
    interface IConfigPartOrChapter {
        part?: IConfigPart;
        chapter?: IConfigChapter;
        file?: string;
    }
    interface IConfigPart {
        file: string;
        chapters: IConfigChapter[];
    }
    interface IConfigChapter {
        file: string;
    }
    class BookStructure {
        predef: ContentStructure[];
        contents: ContentStructure[];
        appendix: ContentStructure[];
        postdef: ContentStructure[];
        constructor(predef: ContentStructure[], contents: ContentStructure[], appendix: ContentStructure[], postdef: ContentStructure[]);
        static createBook(config: IConfigBook): BookStructure;
    }
    class ContentStructure {
        part: IConfigPart;
        chapter: IConfigChapter;
        constructor(part: IConfigPart, chapter: IConfigChapter);
        static createChapter(file: string): ContentStructure;
        static createChapter(chapter: IConfigChapter): ContentStructure;
        static createPart(part: IConfigPart): ContentStructure;
    }
}
declare module ReVIEW.Build {
    import NodeSyntaxTree = ReVIEW.Parse.NodeSyntaxTree;
    import BlockElementSyntaxTree = ReVIEW.Parse.BlockElementSyntaxTree;
    import InlineElementSyntaxTree = ReVIEW.Parse.InlineElementSyntaxTree;
    import HeadlineSyntaxTree = ReVIEW.Parse.HeadlineSyntaxTree;
    import UlistElementSyntaxTree = ReVIEW.Parse.UlistElementSyntaxTree;
    import OlistElementSyntaxTree = ReVIEW.Parse.OlistElementSyntaxTree;
    import DlistElementSyntaxTree = ReVIEW.Parse.DlistElementSyntaxTree;
    import ColumnSyntaxTree = ReVIEW.Parse.ColumnSyntaxTree;
    import ColumnHeadlineSyntaxTree = ReVIEW.Parse.ColumnHeadlineSyntaxTree;
    class TextBuilder extends DefaultBuilder {
        extention: string;
        escape(data: any): string;
        headlinePre(process: BuilderProcess, name: string, node: HeadlineSyntaxTree): void;
        headlinePost(process: BuilderProcess, name: string, node: HeadlineSyntaxTree): void;
        columnHeadlinePre(process: BuilderProcess, node: ColumnHeadlineSyntaxTree): (v: ITreeVisitor) => void;
        columnHeadlinePost(process: BuilderProcess, node: ColumnHeadlineSyntaxTree): void;
        columnPost(process: BuilderProcess, node: ColumnSyntaxTree): void;
        paragraphPost(process: BuilderProcess, name: string, node: NodeSyntaxTree): void;
        ulistPre(process: BuilderProcess, name: string, node: UlistElementSyntaxTree): void;
        ulistPost(process: BuilderProcess, name: string, node: UlistElementSyntaxTree): void;
        olistPre(process: BuilderProcess, name: string, node: OlistElementSyntaxTree): void;
        olistPost(process: BuilderProcess, name: string, node: OlistElementSyntaxTree): void;
        dlistPre(process: BuilderProcess, name: string, node: DlistElementSyntaxTree): (v: ITreeVisitor) => void;
        dlistPost(process: BuilderProcess, name: string, node: DlistElementSyntaxTree): void;
        block_list_pre(process: BuilderProcess, node: BlockElementSyntaxTree): (v: ITreeVisitor) => void;
        block_list_post(process: BuilderProcess, node: BlockElementSyntaxTree): void;
        block_listnum_pre(process: BuilderProcess, node: BlockElementSyntaxTree): (v: ITreeVisitor) => void;
        block_listnum_post(process: BuilderProcess, node: BlockElementSyntaxTree): void;
        inline_list(process: BuilderProcess, node: InlineElementSyntaxTree): boolean;
        block_emlist_pre(process: BuilderProcess, node: BlockElementSyntaxTree): (v: ITreeVisitor) => void;
        block_emlist_post(process: BuilderProcess, node: BlockElementSyntaxTree): void;
        block_emlistnum_pre(process: BuilderProcess, node: BlockElementSyntaxTree): (v: ITreeVisitor) => void;
        block_emlistnum_post(process: BuilderProcess, node: BlockElementSyntaxTree): void;
        inline_hd_pre(process: BuilderProcess, node: InlineElementSyntaxTree): boolean;
        inline_hd_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_br(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_b_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_b_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_code_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_code_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_href_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_href_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_href(process: BuilderProcess, node: InlineElementSyntaxTree): boolean;
        block_label(process: BuilderProcess, node: BlockElementSyntaxTree): boolean;
        inline_ruby(process: BuilderProcess, node: InlineElementSyntaxTree): (v: ITreeVisitor) => void;
        inline_u_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_u_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_kw(process: BuilderProcess, node: InlineElementSyntaxTree): (v: ITreeVisitor) => void;
        inline_tt_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_tt_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_em_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_em_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        block_image(process: BuilderProcess, node: BlockElementSyntaxTree): Promise<boolean>;
        block_indepimage(process: BuilderProcess, node: BlockElementSyntaxTree): boolean;
        inline_img(process: BuilderProcess, node: InlineElementSyntaxTree): boolean;
        inline_icon(process: BuilderProcess, node: InlineElementSyntaxTree): boolean;
        block_footnote(process: BuilderProcess, node: BlockElementSyntaxTree): boolean;
        inline_fn(process: BuilderProcess, node: InlineElementSyntaxTree): boolean;
        block_lead_pre(process: BuilderProcess, node: BlockElementSyntaxTree): void;
        block_lead_post(process: BuilderProcess, node: BlockElementSyntaxTree): void;
        inline_tti_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_tti_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_ttb_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_ttb_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        block_noindent(process: BuilderProcess, node: BlockElementSyntaxTree): boolean;
        block_source_pre(process: BuilderProcess, node: BlockElementSyntaxTree): (v: ITreeVisitor) => void;
        block_source_post(process: BuilderProcess, node: BlockElementSyntaxTree): void;
        block_cmd_pre(process: BuilderProcess, node: BlockElementSyntaxTree): (v: ITreeVisitor) => void;
        block_cmd_post(process: BuilderProcess, node: BlockElementSyntaxTree): void;
        block_quote_pre(process: BuilderProcess, node: BlockElementSyntaxTree): (v: ITreeVisitor) => void;
        block_quote_post(process: BuilderProcess, node: BlockElementSyntaxTree): void;
        inline_ami_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_ami_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_bou_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_bou_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_i_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_i_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_strong_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_strong_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_uchar(process: BuilderProcess, node: InlineElementSyntaxTree): boolean;
        block_table_pre(process: BuilderProcess, node: BlockElementSyntaxTree): (v: ITreeVisitor) => void;
        block_table_post(process: BuilderProcess, node: BlockElementSyntaxTree): void;
        inline_table(process: BuilderProcess, node: InlineElementSyntaxTree): boolean;
        block_tsize(process: BuilderProcess, node: BlockElementSyntaxTree): boolean;
        block_comment_pre(process: BuilderProcess, node: BlockElementSyntaxTree): (v: ITreeVisitor) => void;
        block_comment_post(process: BuilderProcess, node: BlockElementSyntaxTree): void;
        inline_comment_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_comment_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
    }
}
declare module ReVIEW.Build {
    import NodeSyntaxTree = ReVIEW.Parse.NodeSyntaxTree;
    import BlockElementSyntaxTree = ReVIEW.Parse.BlockElementSyntaxTree;
    import InlineElementSyntaxTree = ReVIEW.Parse.InlineElementSyntaxTree;
    import HeadlineSyntaxTree = ReVIEW.Parse.HeadlineSyntaxTree;
    import UlistElementSyntaxTree = ReVIEW.Parse.UlistElementSyntaxTree;
    import OlistElementSyntaxTree = ReVIEW.Parse.OlistElementSyntaxTree;
    import DlistElementSyntaxTree = ReVIEW.Parse.DlistElementSyntaxTree;
    import ColumnSyntaxTree = ReVIEW.Parse.ColumnSyntaxTree;
    import ColumnHeadlineSyntaxTree = ReVIEW.Parse.ColumnHeadlineSyntaxTree;
    class HtmlBuilder extends DefaultBuilder {
        private standalone;
        extention: string;
        escapeMap: {
            [x: string]: string;
        };
        constructor(standalone?: boolean);
        escape(data: any): string;
        processPost(process: BuilderProcess, chunk: ContentChunk): void;
        headlinePre(process: BuilderProcess, name: string, node: HeadlineSyntaxTree): void;
        headlinePost(process: BuilderProcess, name: string, node: HeadlineSyntaxTree): void;
        columnPre(process: BuilderProcess, node: ColumnSyntaxTree): void;
        columnPost(process: BuilderProcess, node: ColumnSyntaxTree): void;
        columnHeadlinePre(process: BuilderProcess, node: ColumnHeadlineSyntaxTree): (v: ITreeVisitor) => void;
        columnHeadlinePost(process: BuilderProcess, node: ColumnHeadlineSyntaxTree): void;
        paragraphPre(process: BuilderProcess, name: string, node: NodeSyntaxTree): void;
        paragraphPost(process: BuilderProcess, name: string, node: NodeSyntaxTree): void;
        ulistPre(process: BuilderProcess, name: string, node: UlistElementSyntaxTree): void;
        ulistPost(process: BuilderProcess, name: string, node: UlistElementSyntaxTree): void;
        olistPre(process: BuilderProcess, name: string, node: OlistElementSyntaxTree): void;
        olistPost(process: BuilderProcess, name: string, node: OlistElementSyntaxTree): void;
        dlistPre(process: BuilderProcess, name: string, node: DlistElementSyntaxTree): (v: ITreeVisitor) => void;
        dlistPost(process: BuilderProcess, name: string, node: DlistElementSyntaxTree): void;
        block_list_pre(process: BuilderProcess, node: BlockElementSyntaxTree): (v: ITreeVisitor) => void;
        block_list_post(process: BuilderProcess, node: BlockElementSyntaxTree): void;
        block_listnum_pre(process: BuilderProcess, node: BlockElementSyntaxTree): (v: ITreeVisitor) => void;
        block_listnum_post(process: BuilderProcess, node: BlockElementSyntaxTree): void;
        inline_list(process: BuilderProcess, node: InlineElementSyntaxTree): boolean;
        block_emlist_pre(process: BuilderProcess, node: BlockElementSyntaxTree): (v: ITreeVisitor) => void;
        block_emlist_post(process: BuilderProcess, node: BlockElementSyntaxTree): void;
        block_emlistnum_pre(process: BuilderProcess, node: BlockElementSyntaxTree): (v: ITreeVisitor) => void;
        block_emlistnum_post(process: BuilderProcess, node: BlockElementSyntaxTree): void;
        inline_hd_pre(process: BuilderProcess, node: InlineElementSyntaxTree): boolean;
        inline_hd_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_br(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_b_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_b_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_code_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_code_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_href(process: BuilderProcess, node: InlineElementSyntaxTree): boolean;
        block_label(process: BuilderProcess, node: BlockElementSyntaxTree): boolean;
        inline_tt_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_tt_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_ruby_pre(process: BuilderProcess, node: InlineElementSyntaxTree): (v: ITreeVisitor) => void;
        inline_ruby_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_u_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_u_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_kw_pre(process: BuilderProcess, node: InlineElementSyntaxTree): (v: ITreeVisitor) => void;
        inline_kw_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_em_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_em_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        block_image(process: BuilderProcess, node: BlockElementSyntaxTree): Promise<boolean>;
        block_indepimage(process: BuilderProcess, node: BlockElementSyntaxTree): boolean;
        inline_img(process: BuilderProcess, node: InlineElementSyntaxTree): boolean;
        inline_icon(process: BuilderProcess, node: InlineElementSyntaxTree): boolean;
        block_footnote(process: BuilderProcess, node: BlockElementSyntaxTree): boolean;
        inline_fn(process: BuilderProcess, node: InlineElementSyntaxTree): boolean;
        block_lead_pre(process: BuilderProcess, node: BlockElementSyntaxTree): void;
        block_lead_post(process: BuilderProcess, node: BlockElementSyntaxTree): void;
        inline_tti_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_tti_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_ttb_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_ttb_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        block_noindent(process: BuilderProcess, node: BlockElementSyntaxTree): boolean;
        block_source_pre(process: BuilderProcess, node: BlockElementSyntaxTree): (v: ITreeVisitor) => void;
        block_source_post(process: BuilderProcess, node: BlockElementSyntaxTree): void;
        block_cmd_pre(process: BuilderProcess, node: BlockElementSyntaxTree): (v: ITreeVisitor) => void;
        block_cmd_post(process: BuilderProcess, node: BlockElementSyntaxTree): void;
        block_quote_pre(process: BuilderProcess, node: BlockElementSyntaxTree): (v: ITreeVisitor) => void;
        block_quote_post(process: BuilderProcess, node: BlockElementSyntaxTree): void;
        inline_ami_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_ami_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_bou_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_bou_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_i_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_i_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_strong_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_strong_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_uchar_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_uchar_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        block_table_pre(process: BuilderProcess, node: BlockElementSyntaxTree): (v: ITreeVisitor) => void;
        block_table_post(process: BuilderProcess, node: BlockElementSyntaxTree): void;
        inline_table(process: BuilderProcess, node: InlineElementSyntaxTree): boolean;
        block_tsize(process: BuilderProcess, node: BlockElementSyntaxTree): boolean;
        block_comment_pre(process: BuilderProcess, node: BlockElementSyntaxTree): (v: ITreeVisitor) => void;
        block_comment_post(process: BuilderProcess, node: BlockElementSyntaxTree): void;
        inline_comment_pre(process: BuilderProcess, node: InlineElementSyntaxTree): void;
        inline_comment_post(process: BuilderProcess, node: InlineElementSyntaxTree): void;
    }
}


declare module ReVIEW {
    function start(setup: (review: Controller) => void, options?: IOptions): Promise<Book>;
}

declare module "review.js" {
    export = ReVIEW;
}
