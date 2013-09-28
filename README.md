# ReVIEW.js

[ReVIEW](https://github.com/kmuto/review) のJavaScript実装です。
Node.js上とモダンなWebブラウザ上で動作することを目指します。

# 現状

意味解析ができるようになりました。
example/online/index.html を開いて試してみてください。

# インストール

とりあえず npm install git@github.com:vvakame/review.js.git で動くんじゃないかなぁと思います。
npm publish するのはもう少しちゃんと実用できるようになってから…。

# 開発方法

`./setup.sh` を叩きます。
その後、`grunt` で /bin に実行可能なJSが出力されます。
`grunt test`, `grunt test-browser`, `grunt-karma` でテストを実行することができます。

# 協力

今貰えると嬉しい手助けはいくつかあります。

* src/test/resource/valid へのファイルの追加
* DefaultAnalyzerが対応する構文の追加
* 各種Builderの実装

# 構文追加のための最初の一歩

 1. 構文のノード構築部分を追加する
src/main/typescript/parser/Analyzer.ts の DefaultAnalyzer に構文用のメソッドを追加すします。
Analyzer.tsの末尾にある TODO 以下のものの実装をすすめます。
Analyzer.tsの中でinlineが先頭になっているものが簡単に実装できる。実装はまわりのメソッドを参考に。
 2. 出力部分を追加する
src/main/typescript/builder/ のなかに出力用ファイルがあります。
HtmlBuilder.ts,TextBuilder.ts のファイルにも1と同様に同名のメソッドを追加します。

メソッド名＿pre,メソッド名＿postの関数を用意した場合にはメソッドの実行前、実行後にそれぞれ処理が実行されます。

まずはテキストのデータを表示してみましょう。
テキストのデータを取り出したい場合は以下の様に記述すると文字の部分が取得できます。

process.out(nodeToString(process,node));

nodeの中に文字列があるので構築されたnodeを利用して出力を作りましょう。

