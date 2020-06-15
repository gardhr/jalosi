const log = console.log;
const nodule = require("../nodule.js");

log(nodule("conditional", { twice: false }));
log(nodule("conditional", { twice: true }));

log(nodule("object"));

var functions = nodule("functions", { print: console.log });
functions.foo();
functions.bar();

log(nodule("number"));
