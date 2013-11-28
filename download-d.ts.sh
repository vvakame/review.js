mkdir -p d.ts/DefinitelyTyped/i18next
mkdir -p d.ts/DefinitelyTyped/jquery
mkdir -p d.ts/DefinitelyTyped/node
mkdir -p d.ts/DefinitelyTyped/mocha
mkdir -p d.ts/DefinitelyTyped/expectations

curl https://raw.github.com/borisyankov/DefinitelyTyped/master/i18next/i18next.d.ts -o d.ts/DefinitelyTyped/i18next/i18next.d.ts
curl https://raw.github.com/borisyankov/DefinitelyTyped/master/jquery/jquery.d.ts -o d.ts/DefinitelyTyped/jquery/jquery.d.ts
curl https://raw.github.com/borisyankov/DefinitelyTyped/master/node/node.d.ts -o d.ts/DefinitelyTyped/node/node.d.ts
curl https://raw.github.com/borisyankov/DefinitelyTyped/master/mocha/mocha.d.ts -o d.ts/DefinitelyTyped/mocha/mocha.d.ts
curl https://raw.github.com/borisyankov/DefinitelyTyped/master/expectations/expectations.d.ts -o d.ts/DefinitelyTyped/expectations/expectations.d.ts
