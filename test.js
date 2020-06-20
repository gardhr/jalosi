var jalosi = require(".");
var assert = require("assert");

const complain = console.error;
const print = console.log;
const crlf = () => print();
const suppressOutput = { console: { log: function () {} } };

var tests = 0;
var errors = 0;

function report(useCase, assertion) {
  ++tests;
  try {
    assertion();
    print(useCase, ": passed");
  } catch (error) {
    ++errors;
    let maxLength = 120;
    let message = error.toString();
    if (message.length > maxLength)
      message = message.substr(0, maxLength) + "...";
    complain(useCase, ": FAILED (" + message + ")");
  }
}

print("****************** Unit Test ******************");
crlf();

report("Numeric literals", () => {
  assert.equal(1024, jalosi.run("return 1024"));
});

report("Numeric literals from file", () => {
  assert.equal(1024, jalosi("examples/number"));
});

report("String literals", () => {
  assert.equal("This is some text!", jalosi.run("return 'This is some text!'"));
});

report("String literals from file", () => {
  assert.equal("This is some text!", jalosi("examples/text"));
});

report("Array literals", () => {
  assert.deepStrictEqual([1, 2, 3], jalosi.run("return [1, 2, 3]"));
});

report("Array literals from file", () => {
  assert.deepStrictEqual([1, 2, 3], jalosi("examples/array"));
});

report("Anonymous function literals", () => {
  jalosi.run("return function(){}")();
});

report("Anonymous function literals from file", () => {
  jalosi("examples/anonymous", suppressOutput)();
});

report("Function literals", () => {
  jalosi.run("function foo(){}").foo();
});

report("Function literals from file", () => {
  jalosi("examples/functions", suppressOutput).foo();
});

report("Arrow function literals", () => {
  jalosi.run("var arrow = () => {}").arrow();
});

report("Arrow function literals from file", () => {
  jalosi("examples/arrow", suppressOutput).arrow();
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

report("Conditional literals from file", () => {
  assert.equal(6, jalosi("examples/conditional", { twice: true }));
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

report("Object literals from file", () => {
  assert.equal(563, jalosi("examples/object").id);
});

report("Can invoke `require` without sandbox", () => {
  assert.doesNotThrow(() => {
    jalosi.run("require('fs')", null);
  });
});

report("Cannot invoke `require` from sandbox", () => {
  assert.throws(() => {
    jalosi.run("require('fs')", null, { sandbox: true });
  });
});

report("Cannot access `process` from sandbox", () => {
  assert.throws(() => {
    jalosi.run("process.exit()", null, { sandbox: true });
  });
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
print("***********************************************");
process.exit(code);
