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
  for (let sdx = 0, smx = scripts.length; sdx < smx; ++sdx)
    combined += scripts[sdx].trim() + ";";
  if (!globals) globals = {};
  globals.jalosi = load;
  if (!globals.require) globals.require = require;
  if (!globals.Error) globals.Error = Error;
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
      let body =
        `const vm=globals.require('vm');let script=new vm.Script
     ('` +
        combined +
        `');let context=vm.createContext(globals);
     return function(){script.runInContext(context);return context}`;

      let compiled = new Function("globals", body);
      return compiled(globals);
    },
    () => attemptCompile("return "),
    () => attemptCompile(""),
  ];
  let error = undefined;
  for (let fdx = 0; fdx < 3; ++fdx) {
    try {
      return alternatives[fdx]();
    } catch (next) {
      error = next;
    }
  }
  throw error;
}

const run = (scripts, globals) => compile(scripts, globals)();

function defer(fileNames, globals) {
  let scripts = [];
  if (!Array.isArray(fileNames)) fileNames = [fileNames];
  for (let fdx = 0, fmx = fileNames.length; fdx < fmx; ++fdx) {
    let path = resolve(normalize(fileNames[fdx].trim()));
    try {
      statSync(path);
    } catch (notFound) {
      path += ".js";
    }
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
