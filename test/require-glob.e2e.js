/* eslint-env mocha */

var requireGlob = require('../index'),
	expect = require('expect'),
	path = require('path');

describe('require-glob e2e', function () {
	it('should handle empty match sets', function (done) {
		requireGlob('test/fixtures/null/**/*.js', function (err, modules) {
			expect(err).toBe(null);

			expect(modules).toEqual({});

			done();
		});
	});

	it('should require shallow modules', function (done) {
		requireGlob('test/fixtures/shallow/**/*.js', function (err, modules) {
			expect(err).toBe(null);

			expect(modules).toEqual({
				a: 'a',
				b: 'b',
				c: 'c',
				d: { e: 'f' }
			});

			done();
		});
	});

	it('should require deep modules', function (done) {
		var cwd = path.resolve(process.cwd(), 'test/fixtures/deep');

		requireGlob('**/*.js', { cwd: cwd }, function (err, modules) {
			expect(err).toBe(null);

			expect(modules).toEqual({
				a: {
					a1: 'a1',
					a2: 'a2'
				},
				b: {
					b1: 'b1',
					b2: 'b2',
					b_bB: { // eslint-disable-line camelcase
						_bB1: '_b.b1',
						bB2: 'b.b2'
					}
				}
			});

			done();
		});
	});

	it('should execute glob-generating functions', function (done) {
		function generateGlob() {
			return 'test/fixtures/shallow/**/*.js';
		}

		requireGlob(generateGlob, function (err, modules) {
			expect(err).toBe(null);

			expect(modules).toEqual({
				a: 'a',
				b: 'b',
				c: 'c',
				d: { e: 'f' }
			});

			done();
		});
	});

	it('should pass-through objects', function (done) {
		var obj = { foo: 'bar' };

		requireGlob(obj, function (err, modules) {
			if (err) throw err;
			expect(modules).toBe(obj);
			done();
		});
	});

	it('should pass-through null', function (done) {
		requireGlob(null, function (err, modules) {
			if (err) throw err;
			expect(modules).toBe(null);
			done();
		});
	});

	describe('sync', function () {
		it('should handle empty match sets', function () {
			var modules = requireGlob.sync('test/fixtures/null/**/*.js');

			expect(modules).toEqual({});
		});

		it('should require shallow modules', function () {
			var modules = requireGlob.sync('test/fixtures/shallow/**/*.js');

			expect(modules).toEqual({
				a: 'a',
				b: 'b',
				c: 'c',
				d: { e: 'f' }
			});
		});

		it('should require deep modules', function () {
			var modules = requireGlob.sync('test/fixtures/deep/**/*.js');

			expect(modules).toEqual({
				a: {
					a1: 'a1',
					a2: 'a2'
				},
				b: {
					b1: 'b1',
					b2: 'b2',
					b_bB: { // eslint-disable-line camelcase
						_bB1: '_b.b1',
						bB2: 'b.b2'
					}
				}
			});
		});

		it('should execute glob-generating functions', function () {
			function generateGlob() {
				return 'test/fixtures/shallow/**/*.js';
			}

			expect(requireGlob.sync(generateGlob)).toEqual({
				a: 'a',
				b: 'b',
				c: 'c',
				d: { e: 'f' }
			});
		});

		it('should pass-through objects', function () {
			var obj = { foo: 'bar' };

			expect(requireGlob.sync(obj)).toBe(obj);
		});

		it('should pass-through null', function () {
			expect(requireGlob.sync(null)).toBe(null);
		});

		it('should allow cache busting', function () {
			var a = requireGlob.sync('test/fixtures/shallow/**/*.js'),
				b = requireGlob.sync('test/fixtures/shallow/**/*.js'),
				c = requireGlob.sync('test/fixtures/shallow/**/*.js', { bustCache: true }),
				d = requireGlob.sync('test/fixtures/shallow/**/*.js');

			expect(a.d).toBe(b.d);
			expect(b.d).toNotBe(c.d);
			expect(c.d).toBe(d.d);
		});
	});
});
