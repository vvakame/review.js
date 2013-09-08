Start "start"
    = _ c:Chapters? _
    ;

Chapters "chapters"
    = c:Chapter cc:Chapters?
    ;

Chapter "chapter"
    = headline:Headline text:Paragraphs?
    ;

// = 章タイトル
Headline "headline"
    = level:"="+ label:BracketArg? tag:BraceArg? Space* caption:SinglelineContent Newline*
    ;

Paragraphs "paragraphs"
    = !"=" c:Paragraph cc:Paragraphs?
    ;

Paragraph "paragraph"
    = Newline* c:Contents Newline?
    ;

Contents "contents"
    // eof 検出に &. を使っている
    = &. !"=" c:Content cc:Contents? Newline?
    ;

Content "content"
    // TODO InlineElement の後に Ulist / Olist / Dlist が来ると先頭行じゃなくてマッチできてしまうかも
    = c:SinglelineComment / c:BlockElement / c:InlineElement / c:Ulist / c:Olist / c:Dlist / c:ContentText
    ;

ContentText "text of content"
    = text:$( !Newline !Headline !SinglelineComment !BlockElement !Ulist !Olist !Dlist ( !InlineElement [^\r\n] )+ Newline? ContentText? )
    ;

BlockElement "block element"
    = "//" name:$(AZ+) args:BracketArg* "{" Newline contents:BlockElementContents? "//}"
    / "//" name:$(AZ+) args:BracketArg*
    ;

InlineElement "inline element"
    = "@<" name:$([^>\r\n]+) ">" "{" contents:InlineElementContents? "}"
    ;

BracketArg "bracket argument"
    = "[" arg:$([^\n\]]*) "]"
    ;

BraceArg "brace argument"
    = "{" arg:$([^\n\}]*) "}"
    ;

// contents との差は paragraph を切るか切らないか
BlockElementContents "contents of block element"
    = c:BlockElementContent cc:BlockElementContents?
    ;

BlockElementContent "content of block element"
    // 各要素は Newline で終わらなければならない
    = c:SinglelineComment / c:BlockElement / c:InlineElement / c:Ulist / c:Olist / c:Dlist / c:BlockElementContentText
    ;

BlockElementContentText "text of block element"
    = text:$( ( &. !"//}" !SinglelineComment !BlockElement !InlineElement !Ulist !Olist !Dlist ( !InlineElement [^\r\n] )+ Newline? )+ )
    ;

InlineElementContents "contents of inline element"
    = !"}" c:InlineElementContent cc:InlineElementContents?
    ;

InlineElementContent "content of inline element"
    = c:InlineElement / c:InlineElementContentText
    ;

InlineElementContentText "text of inline element"
    = text:$( ( !InlineElement [^\r\n}] )+ )
    ;

SinglelineContent "inline content"
    = c:ContentInlines (Newline / EOF)
    ;

ContentInlines "children of inline content"
    = c:ContentInline cc:ContentInlines?
    ;

ContentInline "child of inline content"
    = c:InlineElement / c:ContentInlineText
    ;

ContentInlineText "text of child of inline content"
    = text:$( ( !InlineElement [^\r\n] )+ )
    ;

// * 箇条書き
Ulist "ulist"
    // 行頭から… の指定がない
    = c:(UlistElement / SinglelineComment) cc:Ulist?
    ;

UlistElement "ulist element"
    = " "+ level:"*"+ _ text:SinglelineContent
    ;

// 1. 番号付き箇条書き
Olist "olist"
    // 行頭から… の指定がない
    = c:(OlistElement / SinglelineComment) cc:Olist?
    ;

OlistElement "olist element"
    = " "+ n:Digits "." _ text:SinglelineContent
    ;

// : 用語リスト
Dlist "dlist"
    // 行頭から… の指定がない
    = c:(DlistElement / SinglelineComment) cc:Dlist?
    ;

DlistElement "dlist element"
    = " "* ":" " " _ text:SinglelineContent content:DlistElementContent
    ;

DlistElementContent "content of dlist element"
    = [ \t]+ c:SinglelineContent
    ;

SinglelineComment "signle line comment"
    = text:$("#@" $([^\r\n]*) Newline?)
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

_ "spacer"
    = $(Space*)
    ;

Space "space"
    = [ \t\r\n]
    ;

EOF "end of file"
    = !.
    ;
