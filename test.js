var jalosi = require(".");
var assert = require("assert");

const complain = console.error;
const print = console.log;
const crlf = () => print();

var tests = 0;
var errors = 0;

function report(useCase, assertion) {
  ++tests;
  try {
    assertion();
    print(useCase, ": passed");
  } catch (error) {
    ++errors;
    let maxLength = 80;
    let message = error.toString();
    if (message.length > maxLength)
      message = message.substr(0, maxLength) + "...";
    complain(useCase, ": FAILED (" + message + ")");
  }
}

print("************** Unit Test **************");
crlf();

report("Numeric literals", () => {
  assert.equal(1024, jalosi.run("return 1024"));
});

report("String literals", () => {
  assert.equal("foobar", jalosi.run("return 'foobar'"));
});

report("Array literals", () => {
  assert.deepEqual([1, 2, 3], jalosi.run("return [1, 2, 3]"));
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
  assert.equal(
    6,
    jalosi.run(
      `
      var value = 3;
      if (twice) return value + value;
      else return value;
    `,
      { twice: true }
    )
  );
});

report("Object literals", () => {
  assert.equal(
    563,
    jalosi.run(
      `
   {
    name: 'Carmichael',
    id: 563  
   }
  `
    ).id
  );
});

const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;

var code = undefined;

crlf();

if (errors) {
  complain(" Passed", tests - errors, "of", tests, "tests.");
  code = EXIT_FAILURE;
} else {
  print(" All tests passed.");
  code = EXIT_SUCCESS;
}

crlf();
print("***************************************");
process.exit(code);
