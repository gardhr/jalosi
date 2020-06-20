"use strict;";

const { statSync, readFileSync } = require("fs");
const { resolve, normalize, sep } = require("path");

const cache = {};

function getFileCache(fileName) {
  let cached = cache[fileName];
  if (!cached) return (cache[fileName] = {});
  return cached;
}

function compile(scripts, imports, options) {
  if (!imports) imports = {};
  if (!options) options = {};
  if (!options.sandbox) {
    /*
   Node doesn't make require an enumerable property
    
   TODO: more to add?   
*/
    if (this.require === undefined && typeof require !== "undefined")
      this.require = require;

    let propertyNames = Object.getOwnPropertyNames(this);
    for (let adx in propertyNames) {
      let property = propertyNames[adx];
      if (!imports.hasOwnProperty(property)) imports[property] = this[property];
    }
  }

  let script = "";
  if (!Array.isArray(scripts)) scripts = [scripts];
  for (let sdx in scripts) script += scripts[sdx].trim() + ";";

  function attemptCompile(prelude) {
    let $ = imports;
    let body = "return function(){let exports={};let module={};";
    for (let tag in imports) body += "let " + tag + "=$." + tag + ";";
    body +=
      "$=undefined;" +
      prelude +
      script +
      "return module.exports?module.exports:exports}";
    return new Function("$", body)($);
  }

  let alternatives = [
    () => {
      let $ = { require: require, script: script, imports: imports };
      let body = `const vm=$.require("vm");let script=new vm.Script
     ($.script);let context=vm.createContext($.imports);
     return function(){script.runInContext(context);return context}`;
      return new Function("$", body)($);
    },
    () => attemptCompile("return "),
    () => attemptCompile(""),
  ];

  let lastError = undefined;
  for (let adx in alternatives) {
    try {
      return alternatives[adx]();
    } catch (currentError) {
      lastError = currentError;
    }
  }
  throw lastError;
}

const run = (scripts, imports, options) => compile(scripts, imports, options)();

function defer(fileNames, imports, options) {
  let scripts = [];
  let directory = "";
  if (!options) options = {};
  if (options.path) directory = options.path + sep;
  if (!Array.isArray(fileNames)) fileNames = [fileNames];

  function fileExists(fileName) {
    try {
      return statSync(fileName).isFile();
    } catch (notFound) {
      return false;
    }
  }

  for (let fdx in fileNames) {
    let path = resolve(normalize(directory + fileNames[fdx].trim()));
    if (fileExists(path + ".jso")) path += ".jso";
    else if (fileExists(path + ".js")) path += ".js";
    let stamp = statSync(path).mtimeMs;
    let cached = getFileCache(path);
    if (stamp != cached.stamp) {
      cached.contents = readFileSync(path, "utf-8");
      /* 
        Strip out BOM marker, if present.
         
        [https://github.com/nodejs/node-v0.x-archive/issues/1918] 
      */
      if (cached.contents.charCodeAt(0) == 0xfeff)
        cached.contents = cached.contents.slice(1);
      cached.stamp = stamp;
    }
    scripts.push(cached.contents);
  }
  return compile(scripts, imports, options);
}

const load = (fileNames, imports, options) =>
  defer(fileNames, imports, options)();

load.cache = cache;
load.compile = compile;
load.run = run;
load.defer = defer;
load.load = load;
module.exports = load;
