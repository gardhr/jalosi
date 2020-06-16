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
  /* Node doesn't expose everything through global object; TODO: more to add? */

  if (!globals.require && typeof require !== "undefined")
    globals.require = require;
  if (!globals.Error && typeof Error !== "undefined") globals.Error = Error;
  if (!globals.console && typeof console !== "undefined")
    globals.console = console;
  for (let key in global) globals[key] = global[key];

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
      let savedVersion = globals.jalosi.script;
      globals.jalosi.script = combined;
      let body = `const vm=globals.require('vm');let script=new vm.Script
     (globals.jalosi.script);let context=vm.createContext(globals);
     return function(){script.runInContext(context);return context}`;
      let compiled = new Function("globals", body);
      let result = compiled(globals);
      /* Cleanup kludge */
      globals.jalosi.script = savedVersion;
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

    let preferredExtensions = ["", ".jso", ".js"];
    for (let pdx in preferredExtensions)
      if (fileExists(path + preferredExtensions[pdx]))
        path += preferredExtensions[pdx];
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
