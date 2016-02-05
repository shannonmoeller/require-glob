# `require-glob`

[![NPM version][npm-img]][npm-url] [![Downloads][downloads-img]][npm-url] [![Build Status][travis-img]][travis-url] [![Coverage Status][coveralls-img]][coveralls-url] [![Chat][gitter-img]][gitter-url] [![Tip][amazon-img]][amazon-url]

Requires multiple modules using glob patterns and combines them into a nested object. Supports exclusions.

## Install

    $ npm install --save require-glob

## Usage

```
┣━ unicorn.js
┣━ cake.js
┗━ rainbow/
   ┣━ red-orange.js
   ┣━ _yellow_green.js
   ┗━ BluePurple.js
```

```js
var requireGlob = require('require-glob');

requireGlob(['**/*.js', '!cake.js']).then(function (modules) {
    console.log(modules);
    // {
    //     unicorn: [Object object],
    //     rainbow: {
    //         redOrange: [Object object],
    //         _yellow_green: [Object object],
    //         BluePurple: [Object object]
    //     }
    // }
});
```

## API

### requireGlob(patterns [, options]): Promise

### requireGlob.sync(patterns [, options]): Object

#### patterns

Type: `{String|Array.<String>}`

See supported `minimatch` glob  [patterns][minimatch].

[minimatch]: https://github.com/isaacs/minimatch#usage

#### options

Type: `{Object=}`

All options are inherited from [`globby`][globby] plus those listed below.

[globby]: https://github.com/sindresorhus/globby#api

## Options

### bustCache

Type: `{Boolean}` (default: `false`)

Whether to force the reload of modules by deleting them from the cache. Useful inside watch tasks.

### cwd

Type: `{String}` (default: `__dirname`)

The current working directory in which to search. Defaults to the `__dirname` of the requiring module so relative paths work as you would expect.

```js
requireGlob('./sibling/dir/**/*.js').then(function (modules) { ... });
requireGlob('../../some/cousin/dir/**/*.js').then(function (modules) { ... });
```

### mapper

Type: `{Function(filePath, i, filePaths) : file}`

The mapper is reponsible for requiring the globbed modules. The default mapper returns an object containing path information and the result of requiring the module.

```js

// the glob result

[
    './unicorn.js',
    './rainbow/red-orange.js',
    './rainbow/_yellow_green.js',
    './rainbow/BluePurple.js',
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

### reducer

Type: `{Function(results, file, i, files) : results}`

The reducer is responsible for generating the final object structure. The default reducer expects an array as produced by the default mapper and turns it into a nested object. The object structure is determined by the `keygen`.

```js
// mapper example is reduced to

{
    unicorn: require('./unicorn.js'),
    rainbow: {
        redOrange: require('./rainbow/red-orange.js'),
        _yellow_green: require('./rainbow/_yellow_green.js'),
        BluePurple: require('./rainbow/BluePurple.js'),
    }
}
```

### keygen

Type: `{Function(file) : String|Array.<String>}`

The default reducer uses this function to generate a unique key for every module. The default keygen converts hyphenated and dot-separated sections of directory names and the file name to `camelCase`. File extensions are ignored. Path separators determine object nesting.

```js
// given the mapped object
{
    shortPath: 'fooBar/bar-baz/_bat.qux.js',
    exports: require('./fooBar/bar-baz/_bat.qux.js')
}

// the keygen will produce
[
    'fooBar',
    'barBaz',
    '_batQux'
]

// which the reducer will use to construct
{
    fooBar: {
        barBaz: {
            _batQux: require('./fooBar/bar-baz/_bat.qux.js')
        }
    }
}
```

## Contribute

Standards for this project, including tests, code coverage, and semantics are enforced with a build tool. Pull requests must include passing tests with 100% code coverage and no linting errors.

### Test

    $ npm test

----

© 2016 Shannon Moeller <me@shannonmoeller.com>

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
