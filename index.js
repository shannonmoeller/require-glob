'use strict';

var globby = require('globby'),
	camelCase = require('mout/string/camelCase'),
	set = require('mout/object/set'),
	path = require('path');

function getRootDir(filePath) {
	var index = filePath.indexOf('/');

	// Return root directory, if any
	if (index > -1) {
		return filePath.slice(0, index + 1);
	}
}

function trimExtension(filePath) {
	return filePath.replace(/\.[^.]+$/, '');
}

function trimPaths(paths) {
	var first = paths && paths[0],
		rootDir = first && getRootDir(first);

	function hasRootDir(filePath) {
		return filePath.indexOf(rootDir) === 0;
	}

	function trimRootDir(filePath) {
		return filePath.slice(rootDir.length);
	}

	// If every path has the same root dir
	while (rootDir && paths.every(hasRootDir)) {
		// Remove root dir
		paths = paths.map(trimRootDir);

		// Determine next root dir
		rootDir = getRootDir(paths[0]);
	}

	return paths.map(trimExtension);
}

function mapper(filePath, i, filePaths) {
	// jshint validthis:true
	var cwd = this.cwd,
		shortPaths = this.shortPaths || (
			this.shortPaths = trimPaths(filePaths) // run once and cache
		);

	return {
		cwd: cwd,
		path: filePath,
		shortPath: shortPaths[i],
		contents: require(path.resolve(cwd, filePath))
	};
}

function reducer(modules, module) {
	var keyPath = module.shortPath
		.split('/')
		.map(camelCase)
		.join('.');

	set(modules, keyPath, module.contents);

	return modules;
}

function normalizeOptions(options) {
	options = options || {};

	var cwd = options.cwd || process.cwd(),
		context = { cwd: cwd };

	return {
		mapper: (options.mapper || mapper).bind(context),
		reducer: (options.reducer || reducer).bind(context)
	};
}

function normalizePaths(options, paths) {
	options = normalizeOptions(options);

	return paths
		.map(options.mapper)
		.reduce(options.reducer, {});
}

/**
 * Requires multiple modules using glob patterns. Supports exclusions.
 *
 * @type {Function}
 * @param {String|Array.<String>} patterns A glob string or array of glob strings.
 * @param {Object=} options Options for `globby` module and callbacks (see below).
 * @param {Function(?String, Object)} callback Reduce method responsible for generating object from modules.
 * @return {Null}
 */
function requireGlob(globs, options, callback) {
	if (arguments.length === 2) {
		callback = options;
		options = null;
	}

	globby(globs, options, function (err, paths) {
		try {
			// istanbul ignore if
			if (err) {
				throw err;
			}

			callback(null, normalizePaths(options, paths));
		}
		catch (err) {
			// istanbul ignore next
			callback(err);
		}
	});
}

/**
 * Syncronous version of the above.
 *
 * @method sync
 * @param {String|Array.<String>} patterns A glob string or array of glob strings.
 * @param {Object=} options Options for `globby` module and callbacks (see below).
 * @return {Object}
 * @static
 */
requireGlob.sync = function (globs, options) {
	var paths = globby.sync(globs, options);

	return normalizePaths(options, paths);
};

module.exports = requireGlob;
