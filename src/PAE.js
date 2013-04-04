/**
 * Base class. Provides some necessary OOP shit. And someone needs to define PAE. It's not going to define itself.
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
	/**
	 * Transform pos into a relative position based on the absolute location of the parent.
	 * 
	 * Useful for getting the relative position of a mouse event.
	 * 
	 * @param pos Position in format {x: 0, y: 0}
	 * @param parent Anything with a getAbsolutePosition method.
	 */
	PAE.Util.relativePosition = function(pos, parent) {
		var delta = parent.getAbsolutePosition();
		return {x: pos.x-delta.x, y: pos.y-delta.y};
	}
	/**
	 * Capatalize a thing, yo.
	 */
	PAE.Util.camelCase = function(str) {
	    return str.slice(0, 1).toUpperCase() + str.slice(1);
	}
	/**
	 * Add getters to a given object for obj.attrs.
	 * 
	 * So this is incompatable with Closure Compiler in
	 * Advanced Mode. That's actually great. It's only used for the 
	 * non-Advanced Mode editor.
	 */
	PAE.Util.addGetters = function(self, attribs) {
	    attribs.forEach(function(attr){
	        console.log("AddGetter called for",self,attr)
	        var n = 'get' + PAE.Util.camelCase(attr);
	        self.prototype[n] = function() {
	            return this.attrs[attr];
	        }
	    })
	}
	/**
	 * Same deal here.
	 */
	PAE.Util.addSetters = function(self, attribs) {
        attribs.forEach(function(attr){
            var n = 'set' + PAE.Util.camelCase(attr);
            self.prototype[n] = function(val) {
                this.attrs[attr] = val;
            }
        })
    }
	/**
	 * Event system. Very straightforward but functional.
	 */
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
				fn(e);
			})
		}
		if (e.id) {
			var specific = e.name + "." + e.id
			if (PAE.EventMgr.listeners[specific]) {
				PAE.Util.objEach(PAE.EventMgr.listeners[specific], function(idx, fn) {
					fn(e);
				})
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