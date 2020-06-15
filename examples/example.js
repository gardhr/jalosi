var log = console.log;
var nodule = require("../nodule.js");

log(nodule("object"));

var functions = nodule("functions", { print: console.log });
functions.foo();
functions.bar();

log(nodule("number"));

log(nodule("conditional", { twice: true }));
log(nodule("conditional", { twice: false }));
