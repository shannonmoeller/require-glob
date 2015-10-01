# `require-glob`

[![NPM version][npm-img]][npm-url] [![Downloads][downloads-img]][npm-url] [![Build Status][travis-img]][travis-url] [![Coverage Status][coveralls-img]][coveralls-url] [![Chat][gitter-img]][gitter-url] [![Tip][amazon-img]][amazon-url]

Requires multiple modules using glob patterns. Supports exclusions.

## Install

    $ npm install --save-dev require-glob

## Api

### `requireGlob(patterns, [options], callback)`

### `requireGlob.sync(patterns, [options]) : Object`

- `patterns` `{String|Array.<String>|Function}` - A glob string, array of glob strings, or a function that will return either.
- `options` `{Object=}` - Options for `globby` module and callbacks (see below).
- `callback` `{Function(?String, Object)}`

```
├── unicorn.js
├── cake.js
└── rainbow/
    ├── red-orange.js
    ├── _yellow_green.js
    └── BluePurple.js
```

```js
var requireGlob = require('require-glob');

requireGlob(['**/*.js', '!cake.js'], function (err, modules) {
    console.log(modules);
});

// or

var modules = requireGlob.sync(['**/*.js', '!cake.js']);
console.log(modules);
```

```
{
    unicorn: [Object object],
    rainbow: {
        redOrange: [Object object],
        _yellow_green: [Object object],
        BluePurple: [Object object]
    }
}
```

If `patterns` is not a string or an array, the value will be passed through as-is. This makes it easy to have `requireGlob` handle an option value in your own modules.

```js
var option = requireGlob.sync({ foo: 'bar' });

console.log(option); // -> { foo: 'bar' }
```

#### Options

- [`bustCache` `{Boolean}` (default: `false`)](#bustcache-boolean-default-false)
- [`mapper` `{Function(filePath, i, filePaths) : file}`](#mapper-function-filepath-i-filepaths-file)
- [`reducer` `{Function(result, file, i, files) : result}`](#reducer-function-result-file-i-files-result)
- [`keygen` `{Function(file) : String}`](#keygen-function-file-string)

All options are inherited from [`globby`][globby] with these additions:

[globby]: https://www.npmjs.com/package/globby

### `bustCache` `{Boolean}` (default: `false`)

Whether to force the reload of a module by deleting it from the cache. Useful inside watch tasks.

### `mapper` `{Function(filePath, i, filePaths) : file}`

The mapper is reponsible for requiring the globbed modules. The default mapper returns an object containing path information and the result of requiring the module.

```js
// the glob result

[
    'unicorn.js',
    'rainbow/red-orange.js',
    'rainbow/_yellow_green.js',
    'rainbow/BluePurple.js',
]

// is mapped to

[
    {
        cwd: '/home/jdoe/my-module',
        path: '/home/jdoe/my-module/unicorn.js',
        shortPath: 'unicorn.js',
        exports: require('./unicorn')
    },
    {
        cwd: '/home/jdoe/my-module',
        path: '/home/jdoe/my-module/rainbow/red-orange.js',
        shortPath: 'rainbow/red-orange.js',
        exports: require('./rainbow/red-orange')
    },
    {
        cwd: '/home/jdoe/my-module',
        path: '/home/jdoe/my-module/rainbow/_yellow_green.js',
        shortPath: 'rainbow/_yellow_green.js',
        exports: require('./rainbow/_yellow_green')
    },
    {
        cwd: '/home/jdoe/my-module',
        path: '/home/jdoe/my-module/rainbow/BluePurple.js',
        shortPath: 'rainbow/BluePurple.js',
        exports: require('./rainbow/BluePurple')
    }
]
```

### `reducer` `{Function(result, file, i, files) : result}`

The reducer is responsible for generating the final object structure. The default reducer expects an array as produced by the default mapper and turns it into a nested object. The object structure is determined by the `keygen`.

```js
// mapper example is reduced to

{
    unicorn: require('./unicorn'),
    rainbow: {
        redOrange: require('./rainbow/red-orange'),
        _yellow_green: require('./rainbow/_yellow_green'),
        BluePurple: require('./rainbow/BluePurple'),
    }
}
```

### `keygen` `{Function(file) : String}`

The keygen is responsible for generating a unique key for every module. It is used by the default reducer to generate the final object structure. The default keygen converts hyphenated and dot-separated sections of directory names and file names to `camelCase`. Path separators determine object nesting.

## Contribute

[![Tasks][waffle-img]][waffle-url]

Standards for this project, including tests, code coverage, and semantics are enforced with a build tool. Pull requests must include passing tests with 100% code coverage and no linting errors.

### Test

    $ npm test

----

© 2015 Shannon Moeller <me@shannonmoeller.com>

Licensed under [MIT](http://shannonmoeller.com/mit.txt)

[amazon-img]:    https://img.shields.io/badge/amazon-tip_jar-yellow.svg?style=flat-square
[amazon-url]:    https://www.amazon.com/gp/registry/wishlist/1VQM9ID04YPC5?sort=universal-price
[coveralls-img]: http://img.shields.io/coveralls/shannonmoeller/require-glob/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/shannonmoeller/require-glob
[downloads-img]: http://img.shields.io/npm/dm/require-glob.svg?style=flat-square
[gitter-img]:    http://img.shields.io/badge/gitter-join_chat-1dce73.svg?style=flat-square
[gitter-url]:    https://gitter.im/shannonmoeller/shannonmoeller
[npm-img]:       http://img.shields.io/npm/v/require-glob.svg?style=flat-square
[npm-url]:       https://npmjs.org/package/require-glob
[travis-img]:    http://img.shields.io/travis/shannonmoeller/require-glob.svg?style=flat-square
[travis-url]:    https://travis-ci.org/shannonmoeller/require-glob
[waffle-img]:    http://img.shields.io/github/issues/shannonmoeller/require-glob.svg?style=flat-square
[waffle-url]:    http://waffle.io/shannonmoeller/require-glob
