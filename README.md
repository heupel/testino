testino
=======
"small test" for node

A small test runner for a simple, small test framework.  Because, hey, everyone writes a test framework in node, right?

Really, I just wanted to see what I could do in a day or two.  I'm currently using it in [node-ravendb](http://github.com/tchype/node-ravend) for two reasons:

1. vows was not catching non-AssertionError errors in the code
2. I didn't want to use anything very big--I don't have that many tests


Approach
--------
Keep things small and simple (the main testino module is around 300 lines of code), supporting the assert module.
Other than that, a few simple things:

1. Each test fixture is created using **testino.createFixture** and then adding a tests member to that object
2. You simply add a **tests** object as a member of the fixture, and each function is considered a test case
3. Each test module should export the test fixture as it's **module.exports** and optionally consider adding a code snippet to run the tests if the file is run directly

*Bonus*: Since this is JavaScript, tests members can have a name that is a string, not just a legal function name, so have fun with spec-style test names!

These points are demonstrated in the *Usage* section below.

Usage
-----
```js
var testino = require('testino');
var assert = require('assert');

module.exports = sampleTester = testino.createFixture('Sample Tester');

sampleTester.tests = {
  thingsAreWiredUp: function() {
    assert.ok(true, 'just making sure things are wired up');
  },

  'we can use string names for methods too!': function() {
    assert.ok(true, 'see, this is easy!');
  },

  thisTestShouldFail: function() {
    var actual = expected = null;
    assert.fail(actual, expected, 'this test failed on purpsose');
  },

  'tests with unexpected errors end up in the "Other" category': function () {
    throw new Error("This result should end up in the Other category");
  }
};

// If the file is run directly, just run the test fixture with default output
if (require.main === module) console.log(module.exports.run());
```

and the output is:
```shell
$ node sample-test.js
TEST RESULTS FOR Sample Tester    Total: 4
    Passed: 2    Failed: 1    Other (unknown): 1

  FAILED test details:
        thisTestShouldFail              AssertionError: this test failed on purpsose


  OTHER test details:
        tests with unexpected errors end up in the "Other" category             Error: This result should end up in the Other category
```

Running testino from the command-line
-------------------------------------
Testino is also a command-line runner that takes a glob file path pattern and runs all fixtures matching that pattern.
By default, it uses the default test runner formatter, but you can also get results in JSON format.

```shell
$ testino --files=**/*-test.js --json
[ '{
  "fixtureName": "Sample Tester",
  "passed": [
    {
      "name": "thingsAreWiredUp",
      "result": {
        "text": "Passed",
        "message": ""
      }
    },
    {
      "name": "we can use string names for methods too!",
      "result": {
        "text": "Passed",
        "message": ""
      }
    }
  ],
  "failed": [
    {
      "name": "thisTestShouldFail",
      "result": {
        "text": "AssertionError",
        "message": "AssertionError: this test failed on purpsose"
      }
    }
  ],
  "other": [
    {
      "name": "tests with unexpected errors end up in the \\"Other\\" category",
      "result": {
        "text": "Error",
        "message": "Error: This result should end up in the Other category"
      }
    }
  ]
}' ]


```

