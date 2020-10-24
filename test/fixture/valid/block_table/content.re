= 表

//table[TABLE-1][インラインあり]{
COL1	COL2
--------------
テスト	@<code>{printf();}
閉じ波括弧	@<code>{{print();\}}
改行	@<code>{{}@<br>{}@<code>{\}}
//}
表の間の段落
//table[TABLE-2][区切りが足りない]{
COL1	COL2
-----------
列1	列2
//}

//table[TABLE-3][区切りが2回]{
COL1	COL2
------------
列1	列2
------------
列3	列4
//}

//table[TABLE-4][ヘッダーが2行]{
COL1	COL2
COL3	COL4
------------
列1	列2
//}

//table[TABLE-5][ヘッダーとボディで列数違う]{
COL1	COL2
------------
列1
//}

//table[TABLE-6][ヘッダーとボディで列数違う]{
COL1	COL2
------------
列1	列2	列3
//}

//table[TABLE-7][空セルに.がない]{
COL1	COL2	COL3
------------
列1		列3
//}

//table[TABLE-8][トリム]{
COL1	COL2
------------
 列1 	 列2 
　列1　	　列2　
//}

//table[TABLE-9][区切りが=]{
COL1	COL2
============
列1	列2
//}
