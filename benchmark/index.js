// RESULT peg.js 0.8.0
// parse0 x 2.78 ops/sec ±4.92% (11 runs sampled)
// parse1 x 123 ops/sec ±0.78% (79 runs sampled)
// parse2 x 119 ops/sec ±0.73% (79 runs sampled)
// Fastest is parse1

// RESULT peg.js master/HEAD
// parse0 x 26.06 ops/sec ±5.00% (49 runs sampled)
// parse1 x 123 ops/sec ±1.32% (81 runs sampled)
// parse2 x 121 ops/sec ±1.08% (80 runs sampled)
// Fastest is parse1

var fs = require("fs");
var content = fs.readFileSync("./vvakame.re", {encoding: "utf8"});

var PEG = require("pegjs");

var reviewParser = require("../resources/grammar").PEG;

var baseGrammar = fs.readFileSync("../resources/grammar.pegjs", {encoding: "utf8"});
var base1 = PEG.buildParser(baseGrammar);

var altGrammar = fs.readFileSync("../resources/grammar-improve.pegjs", {encoding: "utf8"});
var base2 = PEG.buildParser(altGrammar);

var benchmark = require('benchmark');
var suite = new benchmark.Suite();
suite
	.add("parse0", function() {
		reviewParser.parse(content);
	})
	.add("parse1", function() {
		base1.parse(content);
	})
	.add("parse2", function() {
	  base2.parse(content);
	})
	.on('cycle', function(event) {
	  console.log(String(event.target));
	})
	.on('complete', function() {
	  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
	})
	.run({ 'async': true });
