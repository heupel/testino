var testino = require('../testino');
var assert = require('assert');

var testinoTester = testino.createFixture('testinoTester');

testinoTester.tests = {
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
}


module.exports = testinoTester;


// if this file is being run directly, just
// run the tests
if (require.main === module) {
  var results = module.exports.run(testino.objectResultsFormatter);

  console.log(results);
  console.log('\n\n');
  console.log(testino.jsonStringResultsFormatter.format(results));
  console.log('\n\n');
  console.log(testino.defaultResultsFormatter.format(results));
}
