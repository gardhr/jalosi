const log = console.log;
const jalosi = require("../jalosi.js");

log(jalosi("conditional", { twice: false }));
log(jalosi("conditional", { twice: true }));
var functions = jalosi("functions");
functions.foo();
functions.bar();
jalosi("anonymous")();
jalosi("arrow").arrow();
log(jalosi("text"));
log(jalosi("number"));
log(jalosi("array"));
log(jalosi("object"));
