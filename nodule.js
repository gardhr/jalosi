const { statSync, readFileSync } = require('fs')
const { resolve, normalize, extname } = require('path')

const cache = {};

const fileStamp = (fileName) => statSync(fileName).mtimeMs;

function getFileCache(fileName)
{
 let cached = cache[fileName];
 if(!cached)
  return cache[fileName] = {};
 return cached;
}

const fileModified = (fileName) =>
 getFileCache(fileName).stamp != fileStamp(fileName)

const isArray = (object) => Array.isArray(object)

function compile(scripts, globals)
{
 let combined = ''
 if(!isArray(scripts))
  scripts = [scripts]
 for(let sdx = 0, smx = scripts.length; sdx < smx; ++sdx)
  combined += scripts[sdx].trim() + ';'
 if(!globals)
  globals = {}
 for(let key in global)
  globals[key] = global[key]
 if(!globals.require)
  globals.require = require  
 let body = undefined 
 try
 { 
  globals.nodule = combined
  body = 
`const vm=globals.require('vm');let script=new vm.Script
(globals.nodule);let context=vm.createContext(globals);
return function(){script.runInContext(context);return context}`
 }
 catch(ignored) 
 {
  if(combined.startsWith('{'))
   combined = 'return ' + combined
  let body = 'return function(){let exports={};let module={};'
  for(let tag in globals) 
   body += 'let ' + tag + '=globals.' + tag + ';' 
  body += combined + 'return module.exports?module.exports:exports}' 
 }
 let compiled = new Function('globals', body)
 return compiled(globals) 
}

const run = (scripts, globals) => compile(scripts, globals)()

const absolutePath = (fileName) => resolve(normalize(fileName.trim()))

function defer(fileNames, globals) 
{
 let scripts = []
 let namesGlobbed = ''
 if(!isArray(fileNames))
  fileNames = [fileNames]
 for(let fdx = 0, fmx = fileNames.length; fdx < fmx; ++fdx)
 {
  let path = absolutePath(fileNames[fdx])
  if(!extname(path))
   path += '.js'  
  let stamp = fileStamp(path)  
  let cached = getFileCache(path)
  if(stamp != cached.stamp)
  {
   cached.contents = readFileSync(path, 'utf-8')
   cached.stamp = stamp
  } 
  scripts.push(cached.contents)
  if(fdx != 0)
   namesGlobbed += '&'
  namesGlobbed += path  
 }
 return getFileCache(namesGlobbed).deferred = compile(scripts, globals)
}

const load = (fileNames, globals) => defer(fileNames, globals)()

load.cache = cache
load.compile = compile
load.run = run
load.defer = defer
load.load = load
module.exports = load

