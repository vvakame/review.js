# ReVIEW.js [![Build Status](https://travis-ci.org/vvakame/review.js.png?branch=master)](https://travis-ci.org/vvakame/review.js) [![Dependency Status](https://david-dm.org/vvakame/review.js.png)](https://david-dm.org/vvakame/review.js) [![devDependency Status](https://david-dm.org/vvakame/review.js/dev-status.png)](https://david-dm.org/vvakame/review.js#info=devDependencies)

## What is ReVIEW?

Composition system for Japanese environment.
ReVIEW is flexible and powerful more than Markdown and textile.

ReVIEW.js is implemented by TypeScript :)

## ReVIEWとは？

[ReVIEW](https://github.com/kmuto/review) のJavaScript実装です。
Node.js上とモダンなWebブラウザ上で動作することを目指します。

[ドキュメント](https://vvakame.github.io/review.js/docs/)

# 現状

それなりに多くの構文をサポートしています。
現状Ruby版で使えて、ReVIEW.jsで使えない記法は以下の通りです。

* texequation ブロック記法
* chap インライン記法
* title インライン記法
* chapref インライン記法
* m インライン記法
* bibpaper ブロック記法
* bib インライン記法
* graph ブロック記法
* tsize ブロック記法
* table ブロック記法
* table インライン記法

サポートしている変換先はTextとHTMLのみです。
LaTeXやPDF, EPUBなどはサポートしていません。

また、部(Part)のサポートは部分的です。
部があっても処理できますが、単に章として扱われます。

# インストール

npm または bower が利用できます。用途にあったものを利用してください。
[こちら](https://github.com/vvakame/review.js/tree/master/example)にサンプルを用意してあります。

# 開発方法

`./setup.sh` を叩きます。
その後、`grunt` で /bin に実行可能なJSが出力されます。
`grunt test`, `grunt test-browser`, `grunt-karma` でテストを実行することができます。

## 開発お得情報

WebStormで開発している場合、Cmd+Oとかでクラス一覧が参照できる。
この時、同一シンボルが複数参照される場合、lib/main.d.tsなどが原因だと思うのでファイルを右クリックしてMark as plain textを押す。
この設定は残念ながら共有できない。

# 協力

今貰えると嬉しい手助けはいくつかあります。

* test/fixture/valid へのファイルの追加
* DefaultAnalyzerが対応する構文の追加
* 各種Builderの実装 (LaTeXとか)
* 説明文の改善
  * ja.ts を書き換えればできます。
* バグを見つけたら報告してください
  * 報告は日本語が良いです。日本語向けの組版システムだし。

# 構文追加のための最初の一歩

 1. 構文のノード構築部分を追加する
lib/parser/Analyzer.ts の DefaultAnalyzer に構文用のメソッドを追加します。
Analyzer.tsの末尾にある TODO 以下のものの実装をすすめます。
Analyzer.tsの中でinlineが先頭になっているものが簡単に実装できる。実装はまわりのメソッドを参考に。
 2. 出力部分を追加する
lib/builder/ のなかに出力用ファイルがあります。
HtmlBuilder.ts,TextBuilder.ts のファイルにも1と同様に同名のメソッドを追加します。
メソッド名＿pre,メソッド名＿postの関数を用意した場合にはメソッドの実行前、実行後にそれぞれ処理が実行されます。
まずはテキストのデータを表示してみましょう。
テキストのデータを取り出したい場合は以下の様に記述すると文字の部分が取得できます。

process.out(nodeToString(process,node));

nodeの中に文字列があるので構築されたnodeを利用して出力を作りましょう。

nodeの処理を大きく変更したい場合はpre(もしくはサフィックスなし)でリターンすると
trueを返すと処理を続行する
false を返すと処理打ちきって次のノードを処理を行う
関数を返すとその関数でノードの評価を行うことができる。
TODO:図を入れる

 3. 構文の説明を入れる。
最後に構文の説明を追加します。
lib/i18n/ja.ts の中に説明の文章を追加します。
オブジェクト記法の中の"description"の中に追加したメソッド名と同じものを追加します。
そうすることで構文の説明が追加されます。

# シンタックスダイアグラムを作るには？

http://bottlecaps.de/convert/ を使うとよい。
