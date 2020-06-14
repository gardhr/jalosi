var log = console.log
var nodule = require('../nodule.js')
var object = nodule('object')
log(object)


var functions = nodule('functions', { print: console.log })


functions.foo()
functions.bar()

var flat = nodule('flat')

log(flat)
