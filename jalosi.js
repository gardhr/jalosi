"use strict;";

const { statSync, readFileSync } = require("fs");
const { resolve, normalize } = require("path");

const cache = {};

function getFileCache(fileName) {
  let cached = cache[fileName];
  if (!cached) return (cache[fileName] = {});
  return cached;
}

function compile(scripts, globals) {
  let combined = "";
  if (!Array.isArray(scripts)) scripts = [scripts];
  for (let sdx in scripts) combined += scripts[sdx].trim() + ";";
  if (!globals) globals = {};
  if (!globals.jalosi) globals.jalosi = load;
  if (!globals.jalosi.sandbox) {
    let propertyNames = Object.getOwnPropertyNames(this);
    for (let adx in propertyNames) {
      let property = propertyNames[adx];
      /*
         TODO: Suppress deprecation warnings

         DeprecationWarning: 'GLOBAL' is deprecated, use 'global'
         DeprecationWarning: 'root' is deprecated, use 'global'
*/
      if (!globals.hasOwnProperty(property)) globals[property] = this[property];
    }
  }
  /* 
     TODO: More to add? 
*/
  if (!globals.require && typeof require !== "undefined")
    globals.require = require;

  function attemptCompile(prelude) {
    let body = "return function(){let exports={};let module={};";
    for (let tag in globals) body += "let " + tag + "=globals." + tag + ";";
    body +=
      prelude + combined + "return module.exports?module.exports:exports}";
    let compiled = new Function("globals", body);
    return compiled(globals);
  }

  let alternatives = [
    () => {
      /* KLUDGE: Passing string literals won't work here */
      globals.jalosi["stored-script"] = combined;
      let body = `const vm=globals.require("vm");let script=new vm.Script
     (globals.jalosi["stored-script"]);let context=vm.createContext(globals);
     return function(){script.runInContext(context);return context}`;
      let compiled = new Function("globals", body);
      let result = compiled(globals);
      /* Cleanup kludge */
      delete globals.jalosi["stored-script"];
      return result;
    },
    () => attemptCompile("return "),
    () => attemptCompile(""),
  ];
  let lastError = undefined;
  for (let fdx in alternatives) {
    try {
      return alternatives[fdx]();
    } catch (currentError) {
      lastError = currentError;
    }
  }
  throw lastError;
}

const run = (scripts, globals) => compile(scripts, globals)();

function defer(fileNames, globals) {
  let scripts = [];
  if (!Array.isArray(fileNames)) fileNames = [fileNames];
  for (let fdx in fileNames) {
    let path = resolve(normalize(fileNames[fdx].trim()));

    function fileExists(fileName) {
      try {
        return statSync(fileName).isFile();
      } catch (notFound) {
        return false;
      }
    }

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
        cached.contents = cached.contents.substr(1);
      cached.stamp = stamp;
    }
    scripts.push(cached.contents);
  }
  return compile(scripts, globals);
}

const load = (fileNames, globals) => defer(fileNames, globals)();

load.cache = cache;
load.compile = compile;
load.run = run;
load.defer = defer;
load.load = load;
module.exports = load;
