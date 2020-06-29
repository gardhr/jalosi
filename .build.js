#!/usr/bin/env node

let system = require("../system.js/system.js")
let jalosi = require("../jalosi/jalosi.js")
let args = process.argv.slice(2)
if(system("node test"))
{
 system("prettier --write *")
 system("prettier --parser typescript --write package.jso")
 system("jtj") 
 system("jtj --write")
 if(args[0] == "publish")
  system(`gitt ${args[1]?args[1]:""}`, "npm publish")
} 


