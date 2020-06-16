📃 [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/gardhr/jalosi/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/jalosi.png)](https://badge.fury.io/js/jalosi)
[![Build Status](https://travis-ci.com/gardhr/jalosi.png?branch=master)](https://travis-ci.com/gardhr/jalosi)
[![Known Vulnerabilities](https://snyk.io/test/github/gardhr/jalosi/badge.svg?targetFile=package.json)](https://snyk.io/test/github/gardhr/jalosi?targetFile=package.json)

# Jalosi 

JAvascript LOading SImplified





















- [Features](#features)
- [Installation](#installation)
- [Examples](#examples)
  - [Basic fetch module](#basic-fetch-module)
 - [API](#api)
- [Sandboxing and security](#sandboxing-and-security)
- [License](#license)
- [API](#api)
## Features
- Seamlessly reuse code between the browser and node with fussing with `module.exports`
- Run untrusted code within a sandbox

## Installation
The fetch.js module is implemented as a single script file so you can simply include either "fetch.js" or "fetch-min.js" directly into your projects. Of course if your using node.js and want to install it globally just clone or download the repository and type:

npm install

## Examples
### Basic usage
```js
var fetch = require("fetch");
console.log(fetch.object("object.jso"));
fetch.module("module.js").invoke();
fetch.module("flat-module.js");
fetch.functor("functor.js")();
```
## API
### Fetch functions
#### fetch.exceptions(setting)
   Set or get exception-enabled state.

   NOTE: enabled by default.
#### fetch.resource(parameters)
   Fetch a raw resource. Useful for images, plain text, binary data, etc.
#### fetch.module(parameters)
   Loads and returns a module.

   NOTE: Code should be in common.js (module.exports) or fetch.js (exports) format.
#### fetch.object(parameters)
   Returns a JSO object or array (ie: a single "flat"/anonymous javascript declaration)
#### fetch.functor(parameters)
   Returns a "flat" file containing no exports as a javascript function.
### Fetch parameters
#### file
   Item to be fetched.

   Node.js: relative or absolute path.

   HTTP: fully qualified URL.
#### username
   HTTP login name for this request. (If applicable.)
#### password
   HTTP authenication password for this request. (If applicable.)
#### headers
   Additional HTTP headers to append to request.
#### method
   HTTP method.

   NOTE: defaults to GET unless the post parameter is set.
#### post
   HTTP post data.
#### callback
   Function to invoke once data has been loaded. If set, request is asynchronous, otherwise synchronous.
#### imports
   User-defined parameter to passed to the fetched module/object/functor.

   NOTE: format is presumed to be understood by the callee.
#### cache
   Indicate whether or not fetched items are to be cached.

   NOTE: disabled by default.
#### strict
   Indicates whether not fetched items should be loaded in "strict mode".

   NOTE: enabled by default.
## Sandboxing and security
Sandboxing is no longer supported. You can use fetch.resource() in conjunction with the safe.js library to load sandboxed scripts.
## License
<img align="right" src="http://opensource.org/trademarks/opensource/OSI-Approved-License-100x137.png">

This module is released under the [MIT License](http://opensource.org/licenses/MIT).
