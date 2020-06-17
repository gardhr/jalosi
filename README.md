# Jalosi 

[![npm version](https://badge.fury.io/js/jalosi.png)](https://badge.fury.io/js/jalosi)
[![NPM Downloads](https://img.shields.io/npm/dm/jalosi)](https://www.npmjs.com/package/jalosi)
[![Build Status](https://travis-ci.com/gardhr/jalosi.png?branch=master)](https://travis-ci.com/gardhr/jalosi)
[![Known Vulnerabilities](https://snyk.io/test/github/gardhr/jalosi/badge.svg?targetFile=package.json)](https://snyk.io/test/github/gardhr/jalosi?targetFile=package.json)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/gardhr/jalosi/blob/master/LICENSE)

- [Features](#features)
- [Examples](#examples)
- [Installation](#installation)

## Features
- Seamlessly reuse code between the browser and node with fussing with `module.exports`
- Run untrusted code within a sandbox
- Deferred loading of scripts

## Installation
```
npm install jalosi
```

## Examples
```js
var jalosi = require("jalosi");
var example = jalosi.run("function ten(){ return 10 }")
console.log(example.ten())

```

