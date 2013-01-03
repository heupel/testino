var testino = require('../testino');

var testinoTester = testino.createFixture('testinoTester');

testinoTester.tests = {
  thingsAreWiredUp: function() {
    return this.Testino.passed('just making sure things are wired up');
  },

  thisTestShouldFail: function() {
    return this.Testino.failed('this test failed on purpsose');
  },

  thisTestIsInconclusive: function() {
    return this.Testino.inconclusive('this test is inconclusive on purpose');
  },

  testsAreInconclusiveByDefault: function() { },

  testsCanHaveOtherResultTypesTooButNotExpected: function() {
    return new this.Testino.TestResult('Craziness Ensues',
                                         'this test is not normal and should be in other');
  }
}


module.exports = testinoTester;


function main(args) {
  var results = testinoTester.run();

  console.log(results);
  console.log(testinoTester.Testino.jsonStringResultsFormatter.format(results));
  console.log(testinoTester.Testino.testRunnerResultsFromatter.format(results));
}

// if this file is being run directly, just
// run the tests
if (require.main === module) {
  main();
}
