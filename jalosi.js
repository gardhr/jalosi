"use strict;";

const { statSync } = require("fs");
const { resolve, normalize, sep } = require("path");
const getCachedFile = require("ssfc");

function compile(scripts, imports, options) {
  if (!imports) imports = {};
  if (!options) options = {};
  if (!options.sandbox) {
    /*
      Node doesn't make require an enumerable property
    
      TODO: More to add?   
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
  for (let sdx in scripts) {
    if (sdx != 0) script += ";";
    script += scripts[sdx].trim();
  }

  function attemptCompile(preamble, epilogue) {
    const vm = require("vm");
    let compiler = new vm.Script(
      "'use strict';this.constructor=undefined;" + preamble + script + epilogue
    );
    let context = vm.createContext(imports);
    return function () {
      var result = compiler.runInContext(context);
      return result === undefined ? context : result;
    };
  }

  let alternatives = [
    () => attemptCompile("", ""),
    () => attemptCompile("(function(){return(", ")})()"),
    () => attemptCompile("(function(){", "})()"),
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
    scripts.push(getCachedFile(path, { utf: true }));
  }
  return compile(scripts, imports, options);
}

const load = (fileNames, imports, options) =>
  defer(fileNames, imports, options)();

load.cache = getCachedFile;
load.compile = compile;
load.run = run;
load.defer = defer;
load.load = load;
if (typeof module !== "undefined") module.exports = load;

/*
  Suppress deprecation warning emmitted when accessing 'GLOBAL'
  
  See: https://github.com/gardhr/jalosi/issues/1
*/

if (typeof process !== "undefined" && process.emitWarning) {
  const { emitWarning } = process;
  process.emitWarning = function () {
    if (arguments[2] === "DEP0016") return;
    return emitWarning.apply(null, arguments);
  };
}
