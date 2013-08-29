# ReVIEW.js

[ReVIEW](https://github.com/kmuto/review) のJavaScript実装です。
Node.js上とモダンなWebブラウザ上で動作することを目指します。

# 現状

抽象構文木が取得できるようになりました。
今は意味解析をしようとしています。
Rubyに比べるとユーザに自由な拡張を許す設計にするのが難しい感じしますね。

# 開発方法

`./setup.sh` を叩きます。
その後、`grunt` で /bin に実行可能なJSが出力されます。
`grunt test`, `grunt test-browser`, `grunt-karma` でテストを実行することができます。

# 協力

今貰えると嬉しい手助けはいくつかあります。

* src/test/resource/valid へのファイルの追加
* src/main/peg/grammer.pegjs のリファクタリング
