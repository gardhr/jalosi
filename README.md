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

## Installation
```
npm install jalosi
```

## Example
```js
var jalosi = require("jalosi");
var script = 
`
 function ten()
 { 
  return 10; 
 }

 function twice(value)
 { 
  return value + value;
 }
`;
var { ten, twice } = jalosi.run(script);
console.log(twice(ten()));

```

## API
```js
jalosi.compile(script, imports)
```

Compiles a script with the given imports but doesn't execute the code. If no imports are specified, everything in the global scope is used. If the `script` parameter is an array then all scripts are combined together.


```js
jalosi.run(script, imports)
```

Invokes `jalosi.compile`, then runs the code.


```js
jalosi.defer(file, imports)
```

Same as `jalosi.compile`, but reads the script from a file instead. If the `file` parameter is an array then all scripts are combined together.


```js
jalosi.load(file, imports)
```

Invokes `jalosi.defer`, then runs the code.


```js
jalosi(file, imports)
```

Alias for `jalosi.load`.

```js
jalosi.cache
```

Reference to Jalosi's file cache. (Useful for diagnostics.)

