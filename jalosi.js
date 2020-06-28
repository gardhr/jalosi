"use strict";

module.exports = (function () {
  const { resolve, normalize, sep } = require("path");
  const { statSync, readFileSync } = require("fs");

  function fileExists(fileName, throws) {
    try {
      return statSync(fileName).isFile();
    } catch (notFound) {
      return false;
    }
  }

  const cache = {};

  function getCachedFile(fileName) {
    let info = statSync(fileName);
    let cached = cache[fileName];
    if (!cached) cached = cache[fileName] = {};
    let stamp = info.mtimeMs;
    if (stamp != cached.stamp) {
      cached.contents = readFileSync(fileName, "utf-8");

      /* 
          Strip out BOM marker, if present.
         
          [https://github.com/nodejs/node-v0.x-archive/issues/1918] 
*/
      if (cached.contents.charCodeAt(0) == 0xfeff)
        cached.contents = cached.contents.slice(1);
      cached.stamp = stamp;
    }
    return cached.contents;
  }

  var compile = undefined;

  const run = (scripts, imports, options) =>
    compile(scripts, imports, options)();

  function defer(fileNames, imports, options) {
    try {
      let scripts = [];
      let directory = "";
      if (!options) options = {};
      if (options.path) directory = options.path + sep;
      if (!Array.isArray(fileNames)) fileNames = [fileNames];
      for (let fdx in fileNames) {
        let path = resolve(normalize(directory + fileNames[fdx].trim()));
        if (fileExists(path + ".jso")) path += ".jso";
        else if (fileExists(path + ".js")) path += ".js";
        scripts.push(getCachedFile(path));
      }
      return compile(scripts, imports, options);
    } catch (error) {
      if (options.throws) throw error;
    }
  }

  const load = (fileNames, imports, options) =>
    defer(fileNames, imports, options)();

  compile = function compiler(scripts, imports, options) {
    if (!(this instanceof compiler))
      return new compiler(scripts, imports, options);
    try {
      if (!imports) imports = {};
      if (!options) options = {};
      if (!options.sandbox) {
        /*
        Node doesn't make require an enumerable property
    
        TODO: More to add?   
*/
        if (this.require === undefined && typeof require !== "undefined")
          this.require = require;
        if (this.compile === undefined) this.compile = compile;
        if (this.run === undefined) this.run = run;
        if (this.defer === undefined) this.defer = defer;
        if (this.load === undefined) this.load = load;
        if (this.jalosi === undefined) this.jalosi = load;

        let propertyNames = Object.getOwnPropertyNames(this);
        for (let adx in propertyNames) {
          let property = propertyNames[adx];
          if (!imports.hasOwnProperty(property))
            imports[property] = this[property];
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
          `'use strict';this.constructor=this;` 
          + preamble + script + epilogue
        );
        let context = vm.createContext(imports);
        return function () {
          var result = compiler.runInContext(context);
          return context.constructor !== context.constructor.constructor
            ? context
            : result;
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
    } catch (error) {
      if (options.throws) throw error;
    }
  };

  load.compile = compile;
  load.run = run;
  load.defer = defer;
  load.load = load;
  load.cache = cache;

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

  return load;
})();
