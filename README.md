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
