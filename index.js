var globby = require('globby'),
	path = require('path'),
	removeNonWord = require('mout/string/removeNonWord'),
	replaceAccents = require('mout/string/replaceAccents'),
	set = require('mout/object/set'),
	upperCase = require('mout/string/upperCase');

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
		resolvedPath = path.resolve(cwd, filePath),
		shortPaths = this.shortPaths || (
			this.shortPaths = trimPaths(filePaths) // run once and cache
		);

	if (this.bustCache) {
		resolvedPath = require.resolve(resolvedPath);
		delete require.cache[resolvedPath];
	}

	return {
		cwd: cwd,
		path: filePath,
		shortPath: shortPaths[i],
		exports: require(resolvedPath)
	};
}

function changeCase(str) {
	str = replaceAccents(str);
	str = str.replace(/[\.-]/g, ' ');
	str = removeNonWord(str);

	return str
		.replace(/\s[a-z]/g, upperCase)
		.replace(/\s+/g, '');
}

function keygen(file) {
	return file.shortPath
		.split('/')
		.map(changeCase)
		.join('.');
}

function reducer(result, file) {
	// jshint validthis:true
	set(result, this.keygen(file), file.exports);

	return result;
}

function normalizeOptions(options) {
	options = Object.create(options || {});

	options.cwd = options.cwd || process.cwd();
	options.keygen = (options.keygen || keygen).bind(options);
	options.mapper = (options.mapper || mapper).bind(options);
	options.reducer = (options.reducer || reducer).bind(options);

	return options;
}

function normalizePaths(paths, options) {
	return paths
		.map(options.mapper)
		.reduce(options.reducer, {});
}

function normalizePatterns(patterns, options) {
	if (typeof patterns === 'function') {
		return patterns(options);
	}

	return patterns;
}

function isGlob(patterns) {
	return typeof patterns === 'string' || Array.isArray(patterns);
}

/**
 * Requires multiple modules using glob patterns. Supports exclusions.
 *
 * @type {Function}
 * @param {String|Array.<String>|Function|*} patterns A glob string, array of
 *   glob strings, or a function that will return either. If not a string or
 *   an array, value will be returned as-is.
 * @param {Object=} options Options for `globby` module and callbacks.
 * @param {Boolean=} options.bustCache Whether to force the reload of modules by deleting them from the cache.
 * @param {Function=} options.mapper Custom mapper.
 * @param {Function=} options.reducer Custom reducer.
 * @param {Function=} options.keygen Custom key generator.
 * @param {Function(?String, Object)} callback
 * @return {Null}
 */
function requireGlob(patterns, options, callback) {
	// Make `options` optional
	if (arguments.length === 2) {
		callback = options;
		options = null;
	}

	options = normalizeOptions(options);
	patterns = normalizePatterns(patterns, options);

	// If patterns isn't a glob, act as a pass-through
	if (!isGlob(patterns)) {
		callback(null, patterns);
		return;
	}

	globby(patterns, options).then(function (paths) {
		try {
			callback(null, normalizePaths(paths, options));
		}
		catch (e) {
			// istanbul ignore next
			callback(e);
		}
	});
}

/**
 * Syncronous version of the above.
 *
 * @method sync
 * @param {String|Array.<String>|Function|*} patterns Same as async method.
 * @param {Object=} options Same as async method.
 * @return {Object}
 * @static
 */
requireGlob.sync = function (patterns, options) {
	options = normalizeOptions(options);
	patterns = normalizePatterns(patterns, options);

	// If patterns isn't a glob, act as a pass-through
	if (!isGlob(patterns)) {
		return patterns;
	}

	var paths = globby.sync(patterns, options);

	return normalizePaths(paths, options);
};

module.exports = requireGlob;
