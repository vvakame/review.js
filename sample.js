var parser = require("./grammer");

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
    chunk.trim().split('\n').forEach(function(line) {
        var result = parser.parse(line);
        console.log("> " + result);
    });
});
process.stdin.on('end', function () {
});

