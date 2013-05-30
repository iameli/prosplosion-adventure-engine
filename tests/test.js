goog.require("PAE.Game");
goog.provide("PAE.test");
window.onerror = function(message, url, lineNumber) {  
  console.log("%cTOP-LEVEL ERROR ENCOUNTERED.", 'color: red');
  console.log("Last test run: %s", lastTest);
  return false;
};  
lastTest = null;
(function() {
    /**
     * Agressively simple testing framework. Call PAE.test with a map of 
     * test names to tests. Each of the tests will be run in sequence.
     * 
     * Tests are functions that will be created with the new parameter
     * so that we may give them a context. Within that context, they
     * have the following methods.
     * 
     * assert(statement, message) ensure statement is true, associated
     *                            with the given message. each of these
     *                            is an individual check within a test.
     * 
     * assertEquals(s1, s2, message)
     * 
     * end() call this when you're done. can't just rely on method 
     *       execution because async.
     * 
     * Caling this TestMonad was kinda dumb, it just means "one test"
     *      
     * 
     * @param {Object} tests
     */
    var stage = new Kinetic.Stage({
        container: document.getElementById('container'),
        width: 1024,
        height: 768
    });
    var TestMonad = function(testMethod, message) {
        this.testMethod = testMethod;
        this.message = message;
        this.passed = true;
        this.testCount = 0;
        this.results = [];
        this.layer = new Kinetic.Layer();
        stage.add(this.layer);
        this.stage = stage;
    }
    TestMonad.prototype.assertEquals = function(one, two, message) {
        var res = _.isEqual(one, two);
        if (!res) {
            var onestring = JSON.stringify(one);
            var twostring = JSON.stringify(two);
            message = message + " [" + onestring + " != " + twostring + "]";
        }
        this.assert(res, message);
    }
    TestMonad.prototype.assert = function(statement, message) {
        this.testCount += 1;
        var results = [];
        if (statement === true) {
            results.push(true);
            results.push(message);
        }
        else {
            this.passed = false;
            results.push(false);
            results.push(message);
        }
        this.results.push(results);
    }
    TestMonad.prototype.done = function() {
        this.layer.remove();
        this.callback();
    }
    TestMonad.prototype.run = function(callback) {
        this.callback = callback;
        try {
            lastTest = this.message;
            this.testMethod();
        }
        catch(e) {
            this.passed = false;
            this.message = this.message + " (THREW ERROR!!)";
            this.results.push([false, e.stack]);
            this.callback();
        }
    }
    PAE.test = function(tests) {
        var testArr = [];
        var finishedArr = [];
        _.each(tests, function(test, message) {
            var t = new TestMonad(test, message);
            testArr.push(t);
        });
        var oneTest = function() {
            if (testArr.length > 0) {
                var t = testArr.pop();
                finishedArr.push(t);
                t.run(oneTest);
            }
            else {
                _.each(finishedArr, function(test) {
                    var count = test.testCount;
                    var success = 0;
                    _.each(test.results, function(arr) {
                        if (arr[0] === true) success +=1;
                    })
                    //console.group(test.message + ": " + success + "/" + count + " PASSED");
                    var css = '';
                    if (count !== success) {
                        css = 'color: red';
                    }
                    console.group("%s: %c%s/%s PASSED", test.message, css, success, count);
                    _.each(test.results, function(arr) {
                        if (arr[0] === true) {
                            console.log("PASS: %s", arr[1]);
                        }
                        else {
                            console.log("%cFAIL: %s", 'color: red', arr[1]);
                        }
                    })
                    console.groupEnd();
                })
            }
        }
        oneTest();
    }
    PAE.testResults = [];
})()