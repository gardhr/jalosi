# Jalosi 

[![npm version](https://badge.fury.io/js/jalosi.png)](https://badge.fury.io/js/jalosi)
[![NPM Downloads](https://img.shields.io/npm/dm/jalosi)](https://www.npmjs.com/package/jalosi)
[![Build Status](https://travis-ci.com/gardhr/jalosi.png?branch=master)](https://travis-ci.com/gardhr/jalosi)
[![Known Vulnerabilities](https://snyk.io/test/github/gardhr/jalosi/badge.svg?targetFile=package.json)](https://snyk.io/test/github/gardhr/jalosi?targetFile=package.json)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/gardhr/jalosi/blob/master/LICENSE)

- [Features](#features)
- [Installation](#installation)
- [Examples](#examples)

## Features
- Seamlessly reuse code between the browser and node without fussing with `module.exports`
- Hot-reload caching of scripts loaded from files
- Run untrusted code within a sandbox
- Supports deferred loading

## Installation
```
npm install jalosi
```

## Examples
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

