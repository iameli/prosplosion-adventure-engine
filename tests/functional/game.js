goog.provide("Tests.Functional.Game");
PAE.test({
    'initial test of tests' : function() {
        this.assert(true, 'true test works');
        this.assert(true, 'test two works');
        this.done();
    },
    'second set of tests' : function() {
        this.assert(false, "oh no this test fails");
        this.done();
    }
})
