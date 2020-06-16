var jalosi = require(".");
var assert = require("assert");

const complain = console.error;
const print = console.log;
const crlf = () => print();

var tests = 0;
var errors = 0;

function report(message, assertion) {
  ++tests;
  try {
    assertion();
    print(message + " : passed");
  } catch (error) {
    complain(message + " : FAILED");
    ++errors;
  }
}

print("****** Unit Test ******");
crlf();

report("Numeric literals (with return statement)", () => {
  assert.equal(1024, jalosi.run("return 1024"));
});

report("Numeric literals (without return statement)", () => {
  assert.equal(1024, jalosi.run("1024"));
});

report("String literals (with return statement)", () => {
  assert.equal("foobar", jalosi.run("return 'foobar'"));
});

report("String literals (without return statement)", () => {
  assert.equal("foobar", jalosi.run("'foobar'"));
});

report("Array literals (with return statement)", () => {
  assert.deepEqual([1, 2, 3], jalosi.run("return [1, 2, 3]"));
});

report("Array literals (without return statement)", () => {
  assert.deepEqual([1, 2, 3], jalosi.run("[1, 2, 3]"));
});

report("Anonymous functions literals", () => {
  jalosi.run("return function(){}")();
});

report("Functions literals", () => {
  jalosi.run("function fun(){}").fun();
});

report("Arrow functions literals", () => {
  jalosi.run("var arrow = () => {}").arrow();
});

report("Conditional literals", () => {
  jalosi.run(
    `
   var value = 3;
   if (twice) return value + value;
   else return value;
  `,
    { twice: true }
  );
});

report("Object literals", () => {
  jalosi.run(
    `
   {
    name: 'Carmichael',
    id: 563  
   }
  `
  ).id == 563;
});

const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;

var code = undefined;

crlf();

if (errors) {
  complain("Passed", tests - errors, "of", tests, "tests.");
  code = EXIT_FAILURE;
} else {
  print("All tests passed.");
  code = EXIT_SUCCESS;
}

crlf();
print("***********************");
process.exit(code);
