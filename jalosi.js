"use strict;";

const { statSync, readFileSync } = require("fs");
const { resolve, normalize, pathSep } = require("path");

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
    let parameters = imports;
    let body = "return function(){let exports={};let module={};";
    for (let tag in imports)
      body += "let " + tag + "=parameters." + tag + ";delete parameters;";
    body += prelude + script + "return module.exports?module.exports:exports}";
    return new Function("parameters", body)(parameters);
  }

  let alternatives = [
    () => {
      let parameters = { require: require, script: script, imports: imports };
      let body = `const vm=parameters.require("vm");let script=new vm.Script
     (parameters.script);let context=vm.createContext(parameters.imports);
     return function(){script.runInContext(context);return context}`;
      return new Function("parameters", body)(parameters);
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
  let directory = ""
  if(options.path)
   directory = normalize(options.path + pathSep)
  if (!Array.isArray(fileNames)) fileNames = [fileNames];
  for (let fdx in fileNames) {
    let path = directory + resolve(normalize(fileNames[fdx].trim()));

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
