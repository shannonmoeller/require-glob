'use strict';

function _interopDefault(ex) {
	return ex && typeof ex === 'object' && 'default' in ex ? ex.default : ex;
}

const globParent = _interopDefault(require('glob-parent'));
const globby = _interopDefault(require('globby'));
const parentModule = _interopDefault(require('parent-module'));

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
	// if the path tries to go above the root, `up` ends up > 0
	let up = 0;
	for (let i = parts.length - 1; i >= 0; i--) {
		const last = parts[i];
		if (last === '.') {
			parts.splice(i, 1);
		} else if (last === '..') {
			parts.splice(i, 1);
			up++;
		} else if (up) {
			parts.splice(i, 1);
			up--;
		}
	}

	// if the path is allowed to go above the root, restore leading ..s
	if (allowAboveRoot) {
		for (; up--; up) {
			parts.unshift('..');
		}
	}

	return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
const splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
const splitPath = function(filename) {
	return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
function resolve() {
	let resolvedPath = '',
		resolvedAbsolute = false;

	for (let i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
		const path = i >= 0 ? arguments[i] : '/';

		// Skip empty and invalid entries
		if (typeof path !== 'string') {
			throw new TypeError('Arguments to path.resolve must be strings');
		} else if (!path) {
			continue;
		}

		resolvedPath = path + '/' + resolvedPath;
		resolvedAbsolute = path.charAt(0) === '/';
	}

	// At this point the path should be resolved to a full absolute path, but
	// handle relative paths to be safe (might happen when process.cwd() fails)

	// Normalize the path
	resolvedPath = normalizeArray(
		filter(resolvedPath.split('/'), function(p) {
			return !!p;
		}),
		!resolvedAbsolute
	).join('/');

	return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
}
// path.normalize(path)
// posix version
function normalize(path) {
	let isPathAbsolute = isAbsolute(path),
		trailingSlash = substr(path, -1) === '/';

	// Normalize the path
	path = normalizeArray(
		filter(path.split('/'), function(p) {
			return !!p;
		}),
		!isPathAbsolute
	).join('/');

	if (!path && !isPathAbsolute) {
		path = '.';
	}
	if (path && trailingSlash) {
		path += '/';
	}

	return (isPathAbsolute ? '/' : '') + path;
}
// posix version
function isAbsolute(path) {
	return path.charAt(0) === '/';
}

// posix version
function join() {
	const paths = Array.prototype.slice.call(arguments, 0);

	return normalize(
		filter(paths, function(p, index) {
			if (typeof p !== 'string') {
				throw new TypeError('Arguments to path.join must be strings');
			}

			return p;
		}).join('/')
	);
}

// path.relative(from, to)
// posix version
function relative(from, to) {
	from = resolve(from).substr(1);
	to = resolve(to).substr(1);

	function trim(arr) {
		let start = 0;
		for (; start < arr.length; start++) {
			if (arr[start] !== '') break;
		}

		let end = arr.length - 1;
		for (; end >= 0; end--) {
			if (arr[end] !== '') break;
		}

		if (start > end) return [];

		return arr.slice(start, end - start + 1);
	}

	const fromParts = trim(from.split('/'));
	const toParts = trim(to.split('/'));

	const length = Math.min(fromParts.length, toParts.length);
	let samePartsLength = length;
	for (var i = 0; i < length; i++) {
		if (fromParts[i] !== toParts[i]) {
			samePartsLength = i;
			break;
		}
	}

	let outputParts = [];
	for (var i = samePartsLength; i < fromParts.length; i++) {
		outputParts.push('..');
	}

	outputParts = outputParts.concat(toParts.slice(samePartsLength));

	return outputParts.join('/');
}

const sep = '/';
const delimiter = ':';

function dirname(path) {
	let result = splitPath(path),
		root = result[0],
		dir = result[1];

	if (!root && !dir) {
		// No dirname whatsoever
		return '.';
	}

	if (dir) {
		// It has a dirname, strip trailing slash
		dir = dir.substr(0, dir.length - 1);
	}

	return root + dir;
}

function basename(path, ext) {
	let f = splitPath(path)[2];
	// TODO: make this comparison case-insensitive on windows?
	if (ext && f.substr(-1 * ext.length) === ext) {
		f = f.substr(0, f.length - ext.length);
	}

	return f;
}

function extname(path) {
	return splitPath(path)[3];
}
const path = {
	extname,
	basename,
	dirname,
	sep,
	delimiter,
	relative,
	join,
	isAbsolute,
	normalize,
	resolve,
};
function filter(xs, f) {
	if (xs.filter) return xs.filter(f);
	const res = [];
	for (let i = 0; i < xs.length; i++) {
		if (f(xs[i], i, xs)) res.push(xs[i]);
	}

	return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr =
	'ab'.substr(-1) === 'b'
		? function(str, start, len) {
				return str.substr(start, len);
		  }
		: function(str, start, len) {
				if (start < 0) start = str.length + start;

				return str.substr(start, len);
		  };

const CAMELIZE_PATTERN = /[.-]+(.)/g;
const SEPARATOR_PATTERN = /[\\/]/;

// Utilities

function toCamelCase(value) {
	return value.replace(CAMELIZE_PATTERN, (match, character) =>
		character.toUpperCase()
	);
}

function toCombinedValues(a, b) {
	return a.concat(b);
}

function toNestedObject(obj, key) {
	if (!obj[key]) {
		obj[key] = {};
	}

	return obj[key];
}

function toSplitPath(filePath) {
	return filePath.split(SEPARATOR_PATTERN);
}

// Map Reduce

function mapper(options, filePath) {
	const cwd = options.cwd;
	const base = options.base;

	filePath = require.resolve(path.resolve(cwd, filePath));

	if (options.bustCache) {
		delete require.cache[filePath];
	}

	return {
		cwd,
		base,
		path: filePath,
		exports: require(filePath),
	};
}

function reducer(options, tree, fileObj) {
	if (!fileObj || !fileObj.path || !('exports' in fileObj)) {
		return tree;
	}

	const keys = [].concat(options.keygen(fileObj));

	if (!keys.length) {
		return tree;
	}

	const lastKey = keys.pop();
	const obj = keys.reduce(toNestedObject, tree);

	obj[lastKey] = fileObj.exports;

	return tree;
}

function keygen(options, fileObj) {
	const uniquePath = fileObj.path.replace(fileObj.base, '');
	const parsedPath = path.parse(uniquePath);

	return [parsedPath.dir, parsedPath.name]
		.map(toSplitPath)
		.reduce(toCombinedValues)
		.map(toCamelCase)
		.filter(Boolean);
}

function mapReduce(options, filePaths) {
	return filePaths.map(options.mapper).reduce(options.reducer, {});
}

// API

function normalizeOptions(pattern, options) {
	pattern = [].concat(pattern || '');

	options.base =
		options.base || path.resolve(options.cwd, globParent(pattern[0]));
	options.bustCache = options.bustCache || false;

	options.mapper = (options.mapper || mapper).bind(null, options);
	options.reducer = (options.reducer || reducer).bind(null, options);
	options.keygen = (options.keygen || keygen).bind(null, options);

	return options;
}

function requireGlob(pattern, options) {
	options = options || {};

	// we have to do this outside of `normalizeOptions()`
	// for `parentModule()` to work properly
	options.cwd = options.cwd || path.dirname(parentModule());

	options = normalizeOptions(pattern, options);

	return globby(pattern, options).then(mapReduce.bind(null, options));
}

function requireGlobSync(pattern, options) {
	options = options || {};

	// we have to do this outside of `normalizeOptions()`
	// for `parentModule()` to work properly
	options.cwd = options.cwd || path.dirname(parentModule());

	options = normalizeOptions(pattern, options);

	return mapReduce(options, globby.sync(pattern, options));
}

requireGlob.sync = requireGlobSync;

module.exports = requireGlob;
// # sourceMappingURL=require-glob.cjs.js.map
