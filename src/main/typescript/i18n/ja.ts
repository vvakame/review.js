module ReVIEW {
	export var ja = {
		"sample": "こんちゃーす！",
		"description": {
			"headline": "チャプターの始まりを示します。\n\"= 見出し\" という形式で書きます。",
			"block_list": "リストを示します。技術書ではプログラムコードの掲載に使います。\n//list[label][caption]{\nalert(\"Hello!\");\n//}\n という形式で書きます。",
			"inline_list": "リストへの参照を示します。\n//list[hoge][caption]{alert(\"Hello!\");\n//}\n を参照する時は @<list>{hoge} と書きます。",
			"inline_hd": "TODO 後で書く。見出し参照を作成する。",
			"inline_code": "短いプログラムコードを記述します。\n@<code>{alert(\"Hello!\");}\n長いソースコードにはlist記法を使いましょう。",
			"inline_br": "改行を示します。リスト内での改行や、段落を変えずに改行をしたい場合に使います。",
			"ulist": "番号なし箇条書きを示します。*記号をつなげて書くとネストした箇条書きにする事ができます。",
            "inline_u": "下線にします。\n@<u>{この部分が下線になる}",
			"inline_ruby": "読み仮名を振ります。\n@<ruby>{羊,ひつじ}",
			"inline_b": "ボールド(太字)にします。\n@<b>{この部分が太字になる}",
			"inline_href": "リンクを示します。URLを書きたい場合に使います。\n@<href>{https://github.com/vvakame/review.js}",
			"inline_tt": "囲まれたテキストを等幅フォントで表示します。",
			"inline_em": "テキストを強調します。\n@<em>{このように強調されます}"
		},
		"compile": {
			"file_not_exists": "ファイル %s が開けません",
			"block_not_supported": "%s というブロック構文はサポートされていません",
			"inline_not_supported": "%s というインライン構文はサポートされていません",
			"part_is_missing": "パート %s が見つかりません",
			"chapter_is_missing": "チャプター %s が見つかりません",
			"reference_is_missing": "参照先 %s の %s が見つかりません",
			"duplicated_label": "ラベルに重複があるようです",
			// TODO できれば 引数 という言葉を避けたい…
			"args_length_mismatch": "引数の数に齟齬があります 期待値 %s, 実際 %s",
			"body_string_only": "内容は全て文字でなければいけません",
			"chapter_not_toplevel": "深さ1のチャプターは最上位になければいけません",
			"chapter_topleve_eq1": "最上位のチャプターは深さ1のものでなければいけません",
			"chapter_level_omission": "深さ%sのチャプターは深さ%sのチャプターに属していなければいけません 今は深さ%sのチャプターの下にいます",
			"deprecated_inline_symbol": "%s というインライン構文は非推奨です。"
		},
		"builder": {
			"chapter": "第%d章",
			"list": "リスト%s.%s"
		}
	};
}
