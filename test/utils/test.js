'use strict';

var assert = require('assert');
var tests = [];

function test(msg, fn) {
	tests.push([msg, fn]);
}

setTimeout(async function run() {
	for (const [msg, fn] of tests) {
		try {
			await fn(assert);
			console.log(`pass - ${msg}`);
		} catch (error) {
			console.error(`fail - ${msg}`, error);
			process.exit(1);
		}
	}
});

module.exports = test;
