var Testino = { };

// Build up the object through helper methods
function buildTestResult() {
  Testino.TestResult = function(text, message) {
    this.text = text;
    this.message = message != null ? message : "";
  }
  Testino.TestResult.prototype.toString = function() {
    return this.text + ((this.message != null && this.message != "") ? " - " + this.message : "");
  }

  const INCONCLUSIVE = "Inconclusive";
  const PASSED = "Passed";
  const FAILED = "Failed";

  Testino.TestResult.prototype.isInconclusive = function() { return this.text === INCONCLUSIVE; }
  Testino.TestResult.prototype.isPassed = function() { return this.text === PASSED; }
  Testino.TestResult.prototype.isFailed = function() { return this.text === FAILED; }

  Testino.inconclusive = function(message) { return new Testino.TestResult(INCONCLUSIVE, message); }
  Testino.passed = function(message) { return new Testino.TestResult(PASSED, message); }
  Testino.failed = function(message) { return new Testino.TestResult(FAILED, message); }
}


function buildTest() {
  Testino.Test = function(name, testMethod) {
    this.name = name;
    this.result = Testino.inconclusive();
    this.testMethod = testMethod;
  }

  Testino.Test.prototype.setResult = function(result) {
    if (result instanceof Testino.TestResult) {
      this.result = result;
    } else {
      throw new Error("result argument must be an instance of TestResult");
    }
  }

  Testino.Test.prototype.isPassed = function() { return this.result.isPassed(); }
  Testino.Test.prototype.isFailed = function() { return this.result.isFailed(); }
  Testino.Test.prototype.isInconclusive = function() { return this.result.isInconclusive(); }


  Testino.Test.prototype.run = function(testObject) {
    return this.testMethod.apply(testObject);
  }

  Testino.Test.prototype.toString = function() {
    return this.name + ": " + this.result.toString();
  }
}



function buildDefaultResultFormatters() {
  Testino.objectResultsFormatter = {
    format: function(results, options) { return results; }
  }

  Testino.jsonStringResultsFormatter = {
    format: function(results, options) {
      // TODO: Make the spacing an option in the options object
      return JSON.stringify(results, null, 2);
    }
  }

  Testino.testRunnerResultsFromatter = {
    format: function(results, options) {
      var output = "TEST RESULTS FOR " + results.fixtureName +
        "    Total: " + (results.passed.length + results.failed.length + results.inconclusive.length + results.other.length) +
        "\n    Passed: " + results.passed.length +
        "    Failed: " + results.failed.length +
        "    Inconclusive: " + results.inconclusive.length;

      if (results.other.length > 0) {
        output += "    Other (unknown): " + results.other.length;
      }

      return output;
    }
  }
}


function buildTestFixtureRunner() {
  Testino.run = function(testObject, resultsFormatter) {
    if (typeof testObject != 'object') {
      throw new Error("testObject must be an object");
    }

    if (resultsFormatter == null) {
      resultsFormatter = Testino.objectResultsFormatter;
    }

    if (typeof resultsFormatter.format != 'function') {
      throw new Error("resultsFormatter must have a format method");
    }

    var buildTestList = function(testObject) {
      var tests = testObject.tests;
      if (typeof tests != 'object') {
        throw new Error("The testObject must have a member called tests that is an object");
      }

      var testList = {};
      Object.keys(tests).forEach(function(name, _index, _array) {
        testList[name] = new Testino.Test(name, tests[name]);
      });

      return testList;
    }

    var runTests = function(tests, testObject) {

      var assignTestToResultGroup = function(test, results) {
        var group = results.other;

        if (test.isPassed()) {
          group = results.passed;
        } else if (test.isFailed()) {
          group = results.failed;
        } else if (test.isInconclusive()) {
          group = results.inconclusive;
        }

        group.push(test);
      }

      var testResults = {
        fixtureName: testObject.name,
        passed: [],
        failed: [],
        inconclusive: [],
        other: []  // Nothing should end up here, but leaving a spot just in case
      }

      Object.keys(tests).forEach(function(testName, _index, _array) {
        var test = tests[testName];
        var testResult = test.run(testObject);

        if (testResult != null) {
          test.setResult(testResult);
        }

        assignTestToResultGroup(test, testResults);
      });

      return testResults;
    }

    var tests = buildTestList(testObject);
    var results = runTests(tests, testObject);

    return resultsFormatter.format(results);
  }
}


// Initialize root objects
buildTestResult();
buildTest();
buildDefaultResultFormatters();
buildTestFixtureRunner();


Testino.createFixture = function(fixtureName) {
  return {
    name: fixtureName,

    tests: {},

    Testino: Testino,

    run: function(resultsFormatter) {
      return Testino.run(this, resultsFormatter);
    }
  };
}


module.exports = Testino;
