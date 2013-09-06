module ReVIEW {
	export var ja = {
		"sample": "こんちゃーす！",
		"compile": {
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
			"chapter_level_omission": "深さ%sのチャプターは深さ%sのチャプターに属していなければいけません 今は深さ%sのチャプターの下にいます"
		},
		"builder": {
			"chapter": "第%d章",
			"list": "リスト%s.%s"
		}
	};
}
