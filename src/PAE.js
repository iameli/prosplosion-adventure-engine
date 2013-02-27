/**
 * Base class. Provides some necessary OOP shit.
 * 
 * Currently using jQuery's EventMgr system because it's what I know. I don't know if that's smart for 
 * something like this, so I've contained it to this file... should we ever want to use something else,
 * we just have to change PAE.EventMgr here.  
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
	PAE.Util = {};
	/**
	 * Why on earth doesn't have a method that's this?
	 */
	PAE.Util.objEach = function(obj, fn) {
		var keys = Object.keys(obj);
		keys.forEach(function(key, idx) {
			fn(key, obj[key]);
		})
	}
	PAE.Util.objEachSorted = function(obj, sorter, fn) {
		var keys = Object.keys(obj);
		var length = keys.length;
		var sorted = {};
		keys.forEach(function(key, idx) {
			var sort = sorter(key, obj[key]);
			if (!sorted[sort]) {
				sorted[sort] = [];
			}
			sorted[sort].push(key);
		});
		var groupings = Object.keys(sorted);
		groupings.sort(function(a,b){return a-b});
		for(var i = 0; i < groupings.length; i += 1) {
			var group = groupings[i];
			while (sorted[group].length > 0) {
				var thing = sorted[group].pop();
				fn(thing, obj[thing]);
			}
		}
		// groupings.forEach(function(key, idx) {
			// var group = groupings[key];
			// console.log("Spitting group",group);
			// while (sorted[group].length > 0) {
				// var thing = sorted[group].pop();
				// console.log(thing);
			// }
		// })
	}
	PAE.Event = function(params) {
		var self = this;
		PAE.Util.objEach(params, function(key, val) {
			self[key] = val;
		});
		self._cancelled = false;
	}
	PAE.EventMgr = {};
	PAE.EventMgr.listeners = {};
	PAE.EventMgr._e_idx = 0;
	PAE.EventMgr._e_list = {};
	/**
	 * On EventMgr, do callback.
	 * @param {Object} name
	 * @return Opaque EventMgr id for use with EventMgr.off.
	 */
	PAE.EventMgr.on = function(name, fn) {
		var id = PAE.EventMgr._e_idx;
		PAE.EventMgr._e_idx += 1;
		if (!PAE.EventMgr.listeners[name]) {
			PAE.EventMgr.listeners[name] = {};
		}
		PAE.EventMgr.listeners[name][id] = fn;
		PAE.EventMgr._e_list[id] = name;
		return id;
	}
	/**
	 * Given an EventMgr id,
     * @param {Object} id
	 */
	PAE.EventMgr.off = function(id) {
		var name = PAE.EventMgr._e_list[id];
		delete PAE.EventMgr.listeners[name][id];
	}
	/**
	 * Trigger an event. Return true if nobody in the chain returned false.
 	 * @param {Object} e
	 */
	PAE.EventMgr.trigger = function(e) {
		var success = true;
		if (!e.name) throw "Event without a name!"
		if (PAE.EventMgr.listeners[e.name]) {
			PAE.Util.objEach(PAE.EventMgr.listeners[e.name], function(idx, fn) {
				if (!e._cancelled) {
					var res = fn(e);
					if (res === false) {
						success = false;
					}
				}
			})
		}
		return success;
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