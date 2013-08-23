var peg = require('../node_modules/pegjs');
var overrideAction = require('../node_modules/pegjs-override-action');

var parser = peg.buildParser(
	"start = 'a' / 'b' / 'c' / 'd' { return 'd' } / hoge:$(child+)\nchild = hoge:'e' / fuga:'b'",
	{
		plugins: [overrideAction],
		overrideActionPlugin: {
			rules: {
				start: [
					function () {
						return "b";
					},
					"return 'a';",
					undefined,
					undefined,
					function (hoge) {
						console.log(line(), column(), offset(), hoge);
						return hoge + "❤";
					}
				],
				child: [
					function (hoge) {
						console.log(line(), column(), offset(), hoge);
						return hoge + "❤";
					},
					function (fuga) {
						console.log(line(), column(), offset(), fuga);
						return hoge + "❤";
					}
				]
			}
		}
	}
);

function parse(str) {
	var result = parser.parse(str);
	console.log(result);
}

parse('a') // 'b'
parse('b') // 'a'
parse('c') // 'c'
parse('d') // 'd'
parse('eeee') // e.g. 1.3.1

console.log(JSON.stringify(parser));