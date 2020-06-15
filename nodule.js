const { statSync, readFileSync } = require("fs");
const { resolve, normalize, extname } = require("path");

const cache = {};

function getFileCache(fileName) {
  let cached = cache[fileName];
  if (!cached) return (cache[fileName] = {});
  return cached;
}

function compile(scripts, globals) {
  let combined = "";
  if (!Array.isArray(scripts)) scripts = [scripts];
  /* TODO: Check for BOM? */

  for (let sdx = 0, smx = scripts.length; sdx < smx; ++sdx)
    combined += scripts[sdx].trim() + ";";
  if (!globals) globals = {};
  for (let key in global) globals[key] = global[key];
  /* TODO: Necessary? */

  if (!globals.require) globals.require = require;
  try {
    if (combined == "") throw new Error();
    globals.nodule = combined;
    let body = `const vm=globals.require('vm');let script=new vm.Script
(globals.nodule);let context=vm.createContext(globals);
return function(){script.runInContext(context);return context}`;
    let compiled = new Function("globals", body);
    return compiled(globals);
  } catch (ignored) {
    if (combined.startsWith("{")) combined = "return " + combined;
    let body = "return function(){let exports={};let module={};";
    for (let tag in globals) body += "let " + tag + "=globals." + tag + ";";
    body += combined + "return module.exports?module.exports:exports}";
    let compiled = new Function("globals", body);
    return compiled(globals);
  }
}

const run = (scripts, globals) => compile(scripts, globals)();

function defer(fileNames, globals) {
  let scripts = [];
  let namesGlobbed = "";
  let needsRecompile = false;
  if (!Array.isArray(fileNames)) fileNames = [fileNames];
  for (let fdx = 0, fmx = fileNames.length; fdx < fmx; ++fdx) {
    let path = resolve(normalize(fileNames[fdx].trim()));
    if (!extname(path)) path += ".js";
    let stamp = statSync(path).mtimeMs;
    let cached = getFileCache(path);
    if (stamp != cached.stamp) {
      cached.contents = readFileSync(path, "utf-8");
      cached.stamp = stamp;
      needsRecompile = true;
    }
    scripts.push(cached.contents);
    if (fdx != 0) namesGlobbed += "&";
    namesGlobbed += path;
  }
  let glob = getFileCache(namesGlobbed);
  if (needsRecompile) glob.deferred = compile(scripts, globals);
  return glob.deferred;
}

const load = (fileNames, globals) => defer(fileNames, globals)();

load.cache = cache;
load.compile = compile;
load.run = run;
load.defer = defer;
load.load = load;
module.exports = load;
