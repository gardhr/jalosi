# Jalosi

[![npm version](https://badge.fury.io/js/jalosi.png)](https://badge.fury.io/js/jalosi)
[![NPM Downloads](https://img.shields.io/npm/dm/jalosi)](https://www.npmjs.com/package/jalosi)
[![Build Status](https://travis-ci.com/gardhr/jalosi.png?branch=master)](https://travis-ci.com/gardhr/jalosi)
[![Known Vulnerabilities](https://snyk.io/test/github/gardhr/jalosi/badge.svg?targetFile=package.json)](https://snyk.io/test/github/gardhr/jalosi?targetFile=package.json)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/gardhr/jalosi/blob/master/LICENSE)

- [Features](#features)
- [Installation](#installation)
- [Example](#examples)
- [API](#api)

## Features

- Seamlessly reuse code between the browser and node without fussing with `module.exports`
- Hot-reload caching of scripts loaded from files
- Native support for [JSO](https://github.com/gardhr/jalosi/wiki/JSO-file-format) files
- Run untrusted code within a sandbox
- Supports deferred loading
- No dependencies, single-file implementation
- Lightweight, less than 4k (uncompressed)

## Installation

```
npm install jalosi
```

## Example

```js
var jalosi = require("jalosi");

var script = `

function ten() {
  return 10;
}

function twice(value) {
  return value + value;
}
`;

var { ten, twice } = jalosi.run(script);
console.log(twice(ten()));
```

## API

```js
jalosi.compile(scripts, imports, options);
```

Compiles an array of scripts together, but doesn't execute the code. (The `scripts` parameter can also be a single string.) If `options.sandbox` is truthy then only `imports` are made accesible to the script. Otherwise, everything from the global scope is included. (Excluding properties already defined by the `imports` object.) Returns an anonymous function.

```js
jalosi.run(scripts, imports, options);
```

Invokes `jalosi.compile`, then runs the code. Returns whatever is returned by the combined scripts.

```js
jalosi.defer(files, imports, options);
```

Same as `jalosi.compile`, but reads the scripts from an array of files instead. (The `files` parameter can also be a single string.) If `options.path` is set, all files will be loaded from the directory that it points to. Returns an anonymous function.

```js
jalosi.load(files, imports, options);
```

Invokes `jalosi.defer`, then runs the code. Returns whatever is returned by the combined scripts.

```js
jalosi(files, imports, options);
```

Alias for `jalosi.load`.

```js
jalosi.cache;
```

Reference to Jalosi's file cache. (Useful for diagnostics.)
