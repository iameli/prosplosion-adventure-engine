/**
 * Unit tests for Scripts
 */
goog.provide("Tests.Unit.Script");
(function() {
    var FakeGame = function() {
        this.flagStates = {testFlag: false}
    };
    FakeGame.prototype.hasFlag = function(f) {
        return this.flagStates[f];
    }
    FakeGame.prototype.setFlag = function(f) {
        this.flagStates[f] = true;
    }
    FakeGame.prototype.clearFlag = function(f) {
        this.flagStates[f] = false;
    }
    PAE.test({
        'Script flags test': function() {
            var fake = new FakeGame();
            var scriptRan = false;
            var self = this;
            var script = new PAE.Script({
                script: function() {
                    scriptRan = true;
                    var flag = this.flag.hasFlag('testFlag');
                    self.assertEquals(flag, false, 'Flag should start unset.');
                    this.flag.setFlag('testFlag');
                    self.assertEquals(this.flag.hasFlag('testFlag'), false, 'Flag should still be unset after being called in the script')
                }
            })
            script.run({game: fake}, function() {
                self.assert(scriptRan, 'Script should have run.');
                self.assert(fake.hasFlag('testFlag'), 'Flag should be set.')
                self.done();
            })
        }
    })
})()