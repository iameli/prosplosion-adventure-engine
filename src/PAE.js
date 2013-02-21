/**
 * Base class. Provides some necessary OOP shit. 
 */
goog.provide("PAE");
var PAE = {};
(function() {
	PAE.Global = {};
	PAE.Global.extend = function(c1, c2) {
		for (var key in c2.prototype) {
			if (!( key in c1.prototype)) {
				c1.prototype[key] = c2.prototype[key];
			}
		}
	}
})();

( function(root, factory) {
    if( typeof exports === 'object') {
        module.exports = factory();
    }
    else if( typeof define === 'function' && define.amd) {
        define(factory);
    }
    else {
        root.returnExports = factory();
    }
}(this, function() {
    return PAE;
}));