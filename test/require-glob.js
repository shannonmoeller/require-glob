import path from 'path';
import test from 'ava';
import requireGlob from '../src/require-glob';

test('should require no modules', async assert => {
	const noneA = await requireGlob('./fixtures/bogu*.js');
	const noneB = requireGlob.sync('./fixtures/bogu*.js');

	assert.same(noneA, {});
	assert.same(noneB, {});
});

test('should require a module', async assert => {
	const oneA = await requireGlob('./fixtures/rand*.js');
	const oneB = requireGlob.sync('./fixtures/rand*.js');

	assert.same(typeof oneA.random, 'number');
	assert.same(typeof oneB.random, 'number');
});

test('should require multiple modules', async assert => {
	const shallowA = await requireGlob('./fixtures/shallow/**/*.js');
	const shallowB = requireGlob.sync('./fixtures/shallow/**/*.js');
	const expected = {
		a: 'a',
		b: 'b',
		c: 'c',
		d: {
			e: 'f'
		}
	};

	assert.same(shallowA, expected);
	assert.same(shallowB, expected);
});

test('should require nested modules', async assert => {
	const deepA = await requireGlob('./fixtures/deep/**/*.js');
	const deepB = requireGlob.sync('./fixtures/deep/**/*.js');
	const expected = {
		a: {
			a1: 'a1',
			a2: 'a2'
		},
		b: {
			b_bB: { // eslint-disable-line camelcase
				_bB1: '_b.b1',
				bB2: 'b.b2'
			},
			b1: 'b1',
			b2: 'b2'
		}
	};

	assert.same(deepA, expected);
	assert.same(deepB, expected);
});

test('should bust cache', async assert => {
	const a = await requireGlob('./fixtures/rand*.js');
	const b = await requireGlob('./fixtures/rand*.js');
	const c = await requireGlob('./fixtures/rand*.js', {bustCache: true});
	const d = await requireGlob('./fixtures/rand*.js', {bustCache: true});
	const e = await requireGlob('./fixtures/rand*.js');

	assert.is(a.random, b.random);
	assert.not(b.random, c.random);
	assert.not(c.random, d.random);
	assert.is(d.random, e.random);
});

test('should use custom cwd', async assert => {
	const deep = await requireGlob('./test/**/deep/**/*.js', {cwd: path.dirname(__dirname)});
	const expected = {
		a: {
			a1: 'a1',
			a2: 'a2'
		},
		b: {
			b_bB: { // eslint-disable-line camelcase
				_bB1: '_b.b1',
				bB2: 'b.b2'
			},
			b1: 'b1',
			b2: 'b2'
		}
	};

	assert.same(deep, expected);
});

test('should use custom mapper', async assert => {
	function mapper(filePath, i) {
		return {
			shortPath: path.basename(filePath).toUpperCase(),
			exports: i
		};
	}

	const deep = requireGlob.sync('./fixtures/deep/**/*.js', {mapper});
	const expected = {
		A1: 0,
		A2: 1,
		_BB1: 2,
		BB2: 3,
		B1: 4,
		B2: 5
	};

	assert.same(deep, expected);
});

test('should use custom reducer', async assert => {
	function reducer(tree, file) {
		if (!Array.isArray(tree)) {
			tree = [];
		}

		tree.push(file.exports);

		return tree;
	}

	const deep = await requireGlob('./fixtures/deep/**/*.js', {reducer});
	const expected = [
		'a1',
		'a2',
		'_b.b1',
		'b.b2',
		'b1',
		'b2'
	];

	assert.same(deep, expected);
});

test('should use custom keygen', async assert => {
	function keygen(file) {
		return file.shortPath;
	}

	const deep = await requireGlob('./fixtures/deep/**/*.js', {keygen});
	const expected = {
		'a/a1.js': 'a1',
		'a/a2.js': 'a2',
		'b/b_b-b/_b.b1.js': '_b.b1',
		'b/b_b-b/b.b2.js': 'b.b2',
		'b/b1.js': 'b1',
		'b/b2.js': 'b2'
	};

	assert.same(deep, expected);
});
