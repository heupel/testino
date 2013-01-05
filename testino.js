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

  const PASSED = "Passed";
  const FAILED = "AssertionError";

  Testino.TestResult.prototype.isPassed = function() { return this.text === PASSED; }
  Testino.TestResult.prototype.isFailed = function() { return this.text === FAILED; }

  Testino.passed = function(message) { return new Testino.TestResult(PASSED, message); }
  Testino.failed = function(message) { return new Testino.TestResult(FAILED, message); }
}


function buildTest() {
  Testino.Test = function(name, testMethod) {
    this.name = name;
    this.result = Testino.passed();
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

  Testino.defaultResultsFormatter = {
    format: function(results, options) {
      var output = "TEST RESULTS FOR " + results.fixtureName +
        "    Total: " + (results.passed.length + results.failed.length + results.other.length) +
        "\n    Passed: " + results.passed.length +
        "    Failed: " + results.failed.length;

      if (results.other.length > 0) {
        output += "    Other (unknown): " + results.other.length;
      }

      var detailedSectionOutput = function(sectionName, resultsSection) {
        var detailedOutput = "";

        var testOutput = function(test) {
          return "\t" + test.name + " \t\t" + test.result.message;
        }

        var testSectionOutput = function(testSection) {
          var sectionOutput = "";

          testSection.forEach(function(test, _index, _array) {
            sectionOutput += testOutput(test) + "\n";
          });

          return sectionOutput;
        }


        if (resultsSection.length > 0) {
          detailedOutput += "\n\n  " + sectionName + " test details:\n" + testSectionOutput(resultsSection);
        }

        return detailedOutput;
      }

      output += detailedSectionOutput('FAILED', results.failed);
      output += detailedSectionOutput('OTHER', results.other);

      return output;
    }
  }
}


function buildTestFixtureRunners() {
  Testino.run = function(testObject, resultsFormatter) {
    if (typeof testObject != 'object') {
      throw new Error("testObject must be an object");
    }

    if (typeof resultsFormatter === 'undefined' || resultsFormatter === null) {
      resultsFormatter = Testino.defaultResultsFormatter;
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
        }

        group.push(test);
      }

      var testResults = {
        fixtureName: testObject.name,
        passed: [],
        failed: [],
        other: []  // Nothing should end up here, but leaving a spot just in case
      }

      var runTest = function(test, testObject) {
        var testResult = Testino.passed();

        try {
          test.run(testObject);
        } catch (err) {
          testResult = new Testino.TestResult(err.name, err.toString());
        }

        test.setResult(testResult);

        assignTestToResultGroup(test, testResults);
      }


      Object.keys(tests).forEach(function(testName, _index, _array) {
        var test = tests[testName];
        runTest(test, testObject);
      });

      return testResults;
    }

    var tests = buildTestList(testObject);
    var results = runTests(tests, testObject);

    return resultsFormatter.format(results);
  }


  Testino.runFixtures = function(fixtureArray, resultFormatter) {
    if (!(fixtureArray instanceof Array)) {
      fixtureArray = [ fixtureArray ];
    }

    var results = [];
    fixtureArray.forEach(function(fixture, _index, _array) {
      results.push(Testino.run(fixture, resultFormatter));
    });

    // TODO: Special logic for the default formatter -- see if I can do something better here
    if (typeof resultFormatter === 'undefined' || resultFormatter == null || resultFormatter === Testino.defaultResultsFormatter) {
      defaultFixturesOutput = ""
      results.forEach(function(result, _index, _array) {
        defaultFixturesOutput += result + "\n\n"
      });
      return defaultFixturesOutput;
    }

    return results;
  }


  Testino.runFiles = function(globPattern, resultFormatter) {
    var glob = require('glob');
    var path = require('path');
    const EMPTY_OPTIONS = {};
    var files = glob.sync(globPattern, EMPTY_OPTIONS);

    if (files === null || !files.length) {
      return [];
    }

    var fixtures = [];
    files.forEach(function(file, _index, _array) {
      fixtures.push(require(path.resolve(file)));
    });

    return Testino.runFixtures(fixtures, resultFormatter);
  }
}


// Initialize root objects
buildTestResult();
buildTest();
buildDefaultResultFormatters();
buildTestFixtureRunners();


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
