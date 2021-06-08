'use strict';

var assert = require('assert');

async function test(msg, fn) {
	try {
		await fn(assert);
		console.log(`pass - ${msg}`);
	} catch (error) {
		console.error(`fail - ${msg}`, error);
		process.exit(1);
	}
}

module.exports = test;
