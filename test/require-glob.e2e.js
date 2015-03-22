'use strict';

var requireGlob = require('../index'),
	expect = require('expect.js'),
	path = require('path');

describe('require-glob e2e', function () {
	it('should handle empty match sets', function (done) {
		requireGlob('test/fixtures/null/**/*.js', function (err, modules) {
			expect(err).to.be(null);

			expect(modules).to.eql({});

			done();
		});
	});

	it('should require shallow modules', function (done) {
		requireGlob('test/fixtures/shallow/**/*.js', function (err, modules) {
			expect(err).to.be(null);

			expect(modules).to.eql({
				a: 'a',
				b: 'b',
				c: 'c',
				d: 'd'
			});

			done();
		});
	});

	it('should require deep modules', function (done) {
		var cwd = path.resolve(process.cwd(), 'test/fixtures/deep');

		requireGlob('**/*.js', { cwd: cwd }, function (err, modules) {
			expect(err).to.be(null);

			expect(modules).to.eql({
				a: {
					a1: 'a1',
					a2: 'a2'
				},
				b: {
					b1: 'b1',
					b2: 'b2',
					// jscs:disable
					b_bB: { // jshint ignore:line
						_bB1: '_b.b1',
						bB2: 'b.b2'
					}
					// jscs:enable
				}
			});

			done();
		});
	});

	describe('sync', function () {
		it('should handle empty match sets', function () {
			var modules = requireGlob.sync('test/fixtures/null/**/*.js');

			expect(modules).to.eql({});
		});

		it('should require shallow modules', function () {
			var modules = requireGlob.sync('test/fixtures/shallow/**/*.js');

			expect(modules).to.eql({
				a: 'a',
				b: 'b',
				c: 'c',
				d: 'd'
			});
		});

		it('should require deep modules', function () {
			var modules = requireGlob.sync('test/fixtures/deep/**/*.js');

			expect(modules).to.eql({
				a: {
					a1: 'a1',
					a2: 'a2'
				},
				b: {
					b1: 'b1',
					b2: 'b2',
					// jscs:disable
					b_bB: { // jshint ignore:line
						_bB1: '_b.b1',
						bB2: 'b.b2'
					}
					// jscs:enable
				}
			});
		});
	});
});
