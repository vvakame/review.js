{
    var b = require("../lib/peg/action");
    b.setup({
        text: text,
        location: location
    });
}

Start "start"
    = _ c:Chapters? _ { return b.content("Start", c); }
    ;

Chapters "chapters"
    = c:Chapter cc:Chapters? { return b.contents("Chapters", c, cc); }
    ;

Chapter "chapter"
    = comments:SinglelineComments? headline:Headline text:Contents? { return b.chapter(comments, headline, text); }
    ;

// = 章タイトル
Headline "headline"
    = level:"="+ label:BraceArg? Space* caption:SinglelineContent _l { return b.headline(level, label, caption); }
    ;

Contents "contents"
    // eof 検出に &. を使っている
    = &. c:Content cc:Contents? _l { return b.contents("Contents", c, cc); }
    ;

Content "content"
    // TODO InlineElement の後に Ulist / Olist / Dlist が来ると先頭行じゃなくてマッチできてしまうかも
    = c:SinglelineComment { return b.content("Content", c); }
    / c:BlockElement      { return b.content("Content", c); }
    / c:Ulist             { return b.content("Content", c); }
    / c:Olist             { return b.content("Content", c); }
    / c:Dlist             { return b.content("Content", c); }
    / c:Paragraph         { return b.content("Content", c); }
    / c:Column            { return b.content("Content", c); }
    ;

Paragraph "paragraph"
    = !"=" c:ParagraphSubs _l { return b.content("Paragraph", c); }
    ;

ParagraphSubs "paragraph subs"
    = c:ParagraphSub cc:ParagraphSubs? { return b.contents("ParagraphSubs", c, cc); }
    ;

ParagraphSub "paragraph sub"
    = c:InlineElement Newline? { return b.content("ParagraphSub", c); }
    / c:ContentText Newline?   { return b.content("ParagraphSub", c); }
    ;

ContentText "text of content"
    = text:$( !Newline !Headline !SinglelineComment !BlockElement !Ulist !Olist !Dlist ( !InlineElement [^\r\n] )+ ) { return b.text("ContentText", text); }
    ;

BlockElement "block element"
    = "//" symbol:$(AZ+) args:BracketArg* "{" _l contents:BlockElementContents? "//}" _l  { return b.blockElement(symbol, args, contents); }
    / "//" symbol:$(AZ+) args:BracketArg* _l                                              { return b.blockElement(symbol, args); }
    ;

InlineElement "inline element"
    = "@<" symbol:$([^>\r\n]+) ">" "{" contents:BraceInlineElementContents? "}" { return b.inlineElement(symbol, contents); }
    / "@<" symbol:$([^>\r\n]+) ">" "|" contents:PipeInlineElementContents? "|" { return b.inlineElement(symbol, contents); }
    / "@<" symbol:$([^>\r\n]+) ">" "$" contents:DollarInlineElementContents? "$" { return b.inlineElement(symbol, contents); }
    ;

Column "column"
    = headline:ColumnHeadline text:ColumnContents? ColumnTerminator? { return b.column(headline, text); }
    ;

ColumnHeadline "column headline"
    = level:"="+ "[column]" label:BraceArg? Space* Space* caption:SinglelineContent _l { return b.columnHeadline(level, label, caption); }
    ;

ColumnContents "column contents"
    // eof 検出に &. を使っている
    = &. c:ColumnContent cc:ColumnContents? _l { return b.contents("ColumnContents", c, cc); }
    ;

ColumnContent "column content"
    // TODO InlineElement の後に Ulist / Olist / Dlist が来ると先頭行じゃなくてマッチできてしまうかも
    = !ColumnTerminator c:SinglelineComment { return b.content("ColumnContent", c); }
    / !ColumnTerminator c:BlockElement      { return b.content("ColumnContent", c); }
    / !ColumnTerminator c:Ulist             { return b.content("ColumnContent", c); }
    / !ColumnTerminator c:Olist             { return b.content("ColumnContent", c); }
    / !ColumnTerminator c:Dlist             { return b.content("ColumnContent", c); }
    / !ColumnTerminator c:Paragraph         { return b.content("ColumnContent", c); }
    / !ColumnTerminator c:Chapter           { return b.content("ColumnContent", c); }
    ;

ColumnTerminator "column terminator"
    = level:"="+ "[/column]" Space* _l { return b.columnTerminator(level); }

BracketArg "bracket argument"
    = "[" c:BracketArgSubs "]" { return b.content("BracketArg", c); }
    ;

BracketArgSubs "bracket arg subs"
    = c:BracketArgSub cc:BracketArgSubs? { return b.contents("BracketArgSubs", c, cc); }
    ;

BracketArgSub "bracket arg sub"
    = c:InlineElement  { return b.content("BracketArgSub", c); }
    / c:BracketArgText { return b.content("BracketArgSub", c); }
    ;

BracketArgText "text of bracket arg"
    = text:$( ( !Newline !InlineElement ( "\\\\" / "\\]" / "\\" / !"]" . ) )+ ) { return b.text("BracketArgText", text); }
    ;

BraceArg "brace argument"
    = "{" arg:$( ( [^\r\n\}\\]+ ( "\\\\" / "\\}" / "\\" )? )* ) "}" { return b.braceArg(arg); }
    ;

// contents との差は paragraph を切るか切らないか
BlockElementContents "contents of block element"
    = c:BlockElementContent cc:BlockElementContents? _l { return b.contents("BlockElementContents", c, cc); }
    ;

BlockElementContent "content of block element"
    // 各要素は Newline で終わらなければならない
    = c:SinglelineComment     { return b.content("BlockElementContent", c); }
    / c:BlockElement          { return b.content("BlockElementContent", c); }
    / c:Ulist                 { return b.content("BlockElementContent", c); }
    / c:Olist                 { return b.content("BlockElementContent", c); }
    / c:Dlist                 { return b.content("BlockElementContent", c); }
    / c:BlockElementParagraph { return b.content("BlockElementContent", c); }
    ;

BlockElementParagraph "paragraph in block"
    = c:BlockElementParagraphSubs _l { return b.content("Paragraph", c); }
    ;

BlockElementParagraphSubs "paragraph subs in block"
    = c: BlockElementParagraphSub cc:BlockElementParagraphSubs? { return b.contents("ParagraphSubs", c, cc); }
    ;

BlockElementParagraphSub "paragraph sub in block"
    = c:InlineElement           { return b.content("ParagraphSub", c); }
    / c:BlockElementContentText { return b.content("ParagraphSub", c); }
    ;

BlockElementContentText "text of content in block"
    = text:$( ( !( "//}" / Newline "//}" ) Newline? !SinglelineComment !BlockElement !Ulist !Olist !Dlist ( !InlineElement [^\r\n] )+ Newline? )+ ) { return b.text("ContentText", text); }
    ;

BraceInlineElementContents "contents of inline element"
    = c:BraceInlineElementContent cc:BraceInlineElementContents? { return b.contents("InlineElementContents", c, cc); }
    ;

PipeInlineElementContents "contents of inline element"
    = c:PipeInlineElementContent cc:PipeInlineElementContents? { return b.contents("InlineElementContents", c, cc); }
    ;

DollarInlineElementContents "contents of inline element"
    = c:DollarInlineElementContent cc:DollarInlineElementContents? { return b.contents("InlineElementContents", c, cc); }
    ;

BraceInlineElementContent "content of inline element"
    = c:InlineElement                 { error("Inlines cannot not contain other inlines."); }
    / c:BraceInlineElementContentText { return b.content("InlineElementContent", c); }
    ;

PipeInlineElementContent "content of inline element"
    = c:InlineElement                { error("Inlines cannot not contain other inlines."); }
    / c:PipeInlineElementContentText { return b.content("InlineElementContent", c); }
    ;

DollarInlineElementContent "content of inline element"
    = c:InlineElement                  { error("Inlines cannot not contain other inlines."); }
    / c:DollarInlineElementContentText { return b.content("InlineElementContent", c); }
    ;

BraceInlineElementContentText "text of inline element"
    = text:( ( !InlineElement BraceInlineElementContentChar )+ ) { return b.text("InlineElementContentText", text.flatMap(function(x) { return x.filter(function(y) { return y != null; }); }).join("")); }
    ;

PipeInlineElementContentText "text of inline element"
    = text:( ( !InlineElement PipeInlineElementContentChar )+ ) { return b.text("InlineElementContentText", text.flatMap(function(x) { return x.filter(function(y) { return y != null; }); }).join("")); }
    ;

DollarInlineElementContentText "text of inline element"
    = text:( ( !InlineElement DollarInlineElementContentChar )+ ) { return b.text("InlineElementContentText", text.flatMap(function(x) { return x.filter(function(y) { return y != null; }); }).join("")); }
    ;

BraceInlineElementContentChar "char of inline element content"
    = !( "\\" / "}" / "\r\n" / "\n" ) char:. { return char; }
    / "\\\\" { return "\\"; }
    // "}" とやると PEG.js のパーサーが解析に失敗するので \u 形式。
    / "\\}" { return "\u007D"; }
    ;

PipeInlineElementContentChar "char of inline element content"
    = !( "\\" / "|" / "\r\n" / "\n" ) char:. { return char; }
    / "\\\\" { return "\\"; }
    / "\\|" { return "|"; }
    ;

DollarInlineElementContentChar "char of inline element content"
    = !( "\\" / "$" / "\r\n" / "\n" ) char:. { return char; }
    / "\\\\" { return "\\"; }
    / "\\$" { return "$"; }
    ;

SinglelineContent "inline content"
    = c:ContentInlines (Newline / EOF) { return b.content("SinglelineContent", c); }
    ;

ContentInlines "children of inline content"
    = c:ContentInline cc:ContentInlines? { return b.contents("ContentInlines", c, cc); }
    ;

ContentInline "child of inline content"
    = c:InlineElement     { return b.content("ContentInline", c); }
    / c:ContentInlineText { return b.content("ContentInline", c); }
    ;

ContentInlineText "text of child of inline content"
    = text:$( ( !InlineElement [^\r\n] )+ ) { return b.text("ContentInlineText", text); }
    ;

// * 箇条書き
Ulist "ulist"
    // 行頭から… の指定がない
    = c:(UlistElement / SinglelineComment) cc:Ulist? _l { return b.contents("Ulist", c, cc); }
    ;

UlistElement "ulist element"
    = " "+ level:"*"+ Space* text:SinglelineContent { return b.ulistElement(level, text); }
    ;

// 1. 番号付き箇条書き
Olist "olist"
    // 行頭から… の指定がない
    = c:(OlistElement / SinglelineComment) cc:Olist? _l { return b.contents("Olist", c, cc); }
    ;

OlistElement "olist element"
    = " "+ n:Digits "." Space* text:SinglelineContent { return b.olistElement(n, text); }
    ;

// : 用語リスト
Dlist "dlist"
    // 行頭から… の指定がない
    = c:(DlistElement / SinglelineComment) cc:Dlist? _l { return b.contents("Dlist", c, cc); }
    ;

DlistElement "dlist element"
    = " "* ":" " " Space* text:SinglelineContent content:DlistElementContents _l { return b.dlistElement(text, content); }
    ;

DlistElementContents "contents of dlist element"
    = c:DlistElementContent cc:DlistElementContents? _l { return b.contents("DlistElementContents", c, cc); }
    ;

DlistElementContent "content of dlist element"
    = [ \t]+ c:SinglelineContent Newline? { return b.content("DlistElementContent", c); }
    ;

SinglelineComments "signle line comments"
    = c:SinglelineComment cc:SinglelineComments? { return b.contents("SinglelineComments", c, cc); }
    ;

SinglelineComment "signle line comment"
    = text:$("#@" $([^\r\n]*) Newline?) _l { return b.text("SinglelineComment", text); }
    ;

Digits "digits"
    = $(Digit+)
    ;

Digit "digit"
    = [0-9]
    ;

AZ "lower alphabet"
    = [a-z]
    ;

Newline "newline"
    = "\r\n"
    / "\n"
    ;

// 単に _ を使うと "hoge\n * fuga" の "\n " が食べられてしまいUlistにならなくなってしまう
_l "blank lines"
    = $([ \t]* Newline)*

_ "spacer"
    = $([ \t\r\n]*)
    ;

Space "space"
    = [ 　\t]
    ;

EOF "end of file"
    = !.
    ;
