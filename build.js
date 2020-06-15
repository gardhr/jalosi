const system = require('system.js')
var commands = 
[
 'prettier --write jalosi.js', 
 'prettier --write examples/example.js',
 'prettier --write examples/conditional.js',
 'prettier --write examples/functions.js',
 'prettier --write examples/number.js',
 'prettier --write examples/text.js',
 //'--write examples/object.js'
 'cd examples && node example'    
]
var ok = system(commands)
console.log(ok ? 'Success!' : 'ERROR: build failed!!!')

