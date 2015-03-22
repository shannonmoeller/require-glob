# `require-glob`

[![NPM version][npm-img]][npm-url] [![Downloads][downloads-img]][npm-url] [![Build Status][travis-img]][travis-url] [![Coverage Status][coveralls-img]][coveralls-url] [![Chat][gitter-img]][gitter-url]

Requires multiple modules using glob patterns. Supports exclusions.

## Install

    $ npm install --save-dev require-glob

## Api

### `requireGlob(patterns, [options], callback)`

### `requireGlob.sync(patterns, [options]) : Object`

- `patterns` `{String|Array.<String>}` - A glob string or array of glob strings.
- `options` `{Object=}` - Options for `globby` module and callbacks (see below).
- `callback` `{Function(?String, Object)}`

```
├── unicorn.js
├── cake.js
└── rainbow/
    ├── red-orange.js
    ├── yellow_green.js
    └── BluePurple.js
```

```js
var requireGlob = require('require-glob');

requireGlob(['**/*.js', '!cake.js'], function (err, modules) {
    console.log(modules);
    // {
    //     unicorn: [Object object],
    //     rainbow: {
    //         redOrange: [Object object],
    //         yellowGreen: [Object object],
    //         bluePurple: [Object object]
    //     }
    // }
});
```

## Options

All options are inherited from [`globby`][globby] with two additions.

[globby]: https://www.npmjs.com/package/globby

### `mapper` `Function(path, i, paths) : Object`

The mapper is reponsible for requiring the globbed modules. The default mapper returns an object containing path information and the result of requiring the module.

```js
// the glob result

[
    'unicorn.js',
    'rainbow/red-orange.js',
    'rainbow/yellow_green.js',
    'rainbow/BluePurple.js',
]

// is mapped to

[
    {
        cwd: '/home/jdoe/my-module',
        path: '/home/jdoe/my-module/unicorn.js',
        shortPath: 'unicorn.js',
        contents: require('./unicorn')
    },
    {
        cwd: '/home/jdoe/my-module',
        path: '/home/jdoe/my-module/rainbow/red-orange.js',
        shortPath: 'rainbow/red-orange.js',
        contents: require('./rainbow/red-orange')
    },
    {
        cwd: '/home/jdoe/my-module',
        path: '/home/jdoe/my-module/rainbow/yellow_green.js',
        shortPath: 'rainbow/yellow_green.js',
        contents: require('./rainbow/yellow_green')
    },
    {
        cwd: '/home/jdoe/my-module',
        path: '/home/jdoe/my-module/rainbow/BluePurple.js',
        shortPath: 'rainbow/BluePurple.js',
        contents: require('./rainbow/BluePurple')
    }
]
```

### `reducer` `Function(obj, file, i, files) : obj`

The reducer is responsible for generating the final object structure. The default reducer expects an array as produced by the default mapper and turns it into a nested object. Directory names and file names are converted to `camelCase` and path separators determine the nesting.

```js
// mapper example is reduced to

{
    unicorn: require('./unicorn'),
    rainbow: {
        redOrange: require('./rainbow/red-orange'),
        yellowGreen: require('./rainbow/yellow_green'),
        bluePurple: require('./rainbow/BluePurple'),
    }
}
```

## Contribute

[![Tasks][waffle-img]][waffle-url] [![Tip][gittip-img]][gittip-url]

Standards for this project, including tests, code coverage, and semantics are enforced with a build tool. Pull requests must include passing tests with 100% code coverage and no linting errors.

### Test

    $ gulp test

----

© 2014 Shannon Moeller <me@shannonmoeller.com>

Licensed under [MIT](http://shannonmoeller.com/mit.txt)

[coveralls-img]: http://img.shields.io/coveralls/shannonmoeller/require-glob/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/shannonmoeller/require-glob
[downloads-img]: http://img.shields.io/npm/dm/require-glob.svg?style=flat-square
[gitter-img]:    http://img.shields.io/badge/gitter-join_chat-1dce73.svg?style=flat-square
[gitter-url]:    https://gitter.im/shannonmoeller/require-glob
[gittip-img]:    http://img.shields.io/gittip/shannonmoeller.svg?style=flat-square
[gittip-url]:    https://www.gittip.com/shannonmoeller
[npm-img]:       http://img.shields.io/npm/v/require-glob.svg?style=flat-square
[npm-url]:       https://npmjs.org/package/require-glob
[travis-img]:    http://img.shields.io/travis/shannonmoeller/require-glob.svg?style=flat-square
[travis-url]:    https://travis-ci.org/shannonmoeller/require-glob
[waffle-img]:    http://img.shields.io/github/issues/shannonmoeller/require-glob.svg?style=flat-square
[waffle-url]:    http://waffle.io/shannonmoeller/require-glob