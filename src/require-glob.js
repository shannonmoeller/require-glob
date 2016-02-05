'use strict';

var assign = require('object-assign');
var globby = require('globby');
var path = require('path');

var CAMELIZE_PATTERN = /[\.\-]+(.)/g;
var SEPARATOR_PATTERN = /[\\\/]/;
var SEPARATOR = path.sep;

// Utilities

function toCamelCase(value) {
	return value.replace(CAMELIZE_PATTERN, function (match, character) {
		return character.toUpperCase();
	});
}

function toCombinedValues(a, b) {
	return a.concat(b);
}

function toCommonFirstValue(a, b) {
	return a && b && a.length && b.length && a[0] === b[0] ? a : false;
}

function toJoinedPath(filePath) {
	return filePath.join(SEPARATOR);
}

function toNestedObject(obj, key) {
	return obj[key] || (obj[key] = {});
}

function toResolvedPath(cwd, filePath) {
	return require.resolve(path.resolve(cwd, filePath));
}

function toShiftedPath(filePath) {
	return filePath.slice(1);
}

function toSplitPath(filePath) {
	return filePath.split(SEPARATOR_PATTERN);
}

// Mapper

function resolvePaths(cwd, paths) {
	return paths.map(toResolvedPath.bind(null, cwd));
}

function trimPaths(paths) {
	paths = paths.map(toSplitPath);

	if (paths.length === 1) {
		return paths[0].slice(-1);
	}

	while (paths.reduce(toCommonFirstValue)) {
		paths = paths.map(toShiftedPath);
	}

	return paths.map(toJoinedPath);
}

function mapper(filePath, i, filePaths) {
	var cwd = this.cwd;

	var resolvedPaths = this.resolvedPaths ||
		(this.resolvedPaths = resolvePaths(cwd, filePaths));

	var trimmedPaths = this.trimmedPaths ||
		(this.trimmedPaths = trimPaths(resolvedPaths));

	var resolvedPath = resolvedPaths[i];
	var trimmedPath = trimmedPaths[i];

	if (this.bustCache) {
		delete require.cache[resolvedPath];
	}

	return {
		cwd: cwd,
		path: resolvedPath,
		shortPath: trimmedPath,
		relativePath: filePath,
		exports: require(resolvedPath)
	};
}

// Reducer

function keygen(file) {
	var parsedPath = path.parse(file.shortPath);

	return [parsedPath.dir, parsedPath.name]
		.map(toSplitPath)
		.reduce(toCombinedValues)
		.filter(Boolean)
		.map(toCamelCase);
}

function reducer(tree, file) {
	var keys = [].concat(this.keygen(file));
	var lastKey = keys.pop();
	var obj = keys.reduce(toNestedObject, tree);

	obj[lastKey] = file.exports;

	return tree;
}

// Map Reduce

function mapReduce(options, filePaths) {
	return filePaths
		.map(options.mapper)
		.reduce(options.reducer, {});
}

// API

function normalizeOptions(options) {
	var defaults = {
		cwd: path.dirname(module.parent.filename),
		bustCache: false,
		keygen: keygen,
		mapper: mapper,
		reducer: reducer
	};

	options = assign(defaults, options);

	options.keygen = options.keygen.bind(options);
	options.mapper = options.mapper.bind(options);
	options.reducer = options.reducer.bind(options);

	return options;
}

/**
 * Requires multiple modules using glob patterns and returns the results as a
 * nested object. Supports exclusions.
 *
 * @type {Function}
 * @param {String|Array.<String>} pattern One or more glob patterns.
 * @param {Object=} options
 * @param {Boolean=} options.bustCache Whether to force the reload of modules.
 * @param {Boolean=} options.cwd The current working directory in which to search.
 * @param {Function=} options.mapper Optional custom map function.
 * @param {Function=} options.reducer Optional custom reduce function.
 * @param {Function=} options.keygen Optional custom key generator function.
 * @return {Promise.<Object>}
 */
function requireGlob(pattern, options) {
	options = normalizeOptions(options);

	return globby(pattern, options)
		.then(mapReduce.bind(null, options));
}

/**
 * Synchronous version of the above.
 *
 * @method sync
 * @param {String|Array.<String>} patterns Same as async method.
 * @param {Object=} options Same as async method.
 * @return {Object}
 */
function requireGlobSync(pattern, options) {
	options = normalizeOptions(options);

	return mapReduce(options, globby.sync(pattern, options));
}

module.exports = requireGlob;
module.exports.sync = requireGlobSync;
