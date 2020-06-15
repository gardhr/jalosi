const log = console.log;
const jalosi = require("../jalosi.js");

log(jalosi("conditional", { twice: false }));
log(jalosi("conditional", { twice: true }));

log(jalosi("object"));

var functions = jalosi("functions", { print: console.log });
functions.foo();
functions.bar();

log(jalosi("number"));
