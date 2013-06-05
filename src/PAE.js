/**
 * Base class. Provides some necessary OOP shit. And someone needs to define PAE. It's not going to define itself.
 */
goog.provide("PAE");
goog.require("Kinetic");
goog.require("Underscore");
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
	 * Called in the constructor of most game nodes. Given a structure and a list of parameters,
	 * populate the attrs of the thing by using .setWhatever functions. Those will be called in the order
	 * that they're listed in the struct. If there are any paremeters provided that aren't in the struct,
	 * they will be ignored. If they are any parameters in the struct not in the params, we will either assign
	 * the default or throw an error if there is no default. This comment is very long.
	 * 
	 * Also initializes the object's attrs variable if it hasn't been done yet. Anything to make our constructors
	 * short and concise.
	 */
	PAE.Util.setAttrs = function(obj, struct, params) {
	    if (!obj.attrs) obj.attrs = {};
	    var errors = [];
	    _.forEach(struct, function(field, name) {
	        var val = params[name];
	        if (val === undefined || val === null) { //null and undefiend values get the default
	            if (field.def !== undefined) {
	                val = field.def;
	            }
	            else if (field.required !== false) {
	                errors.push("Value not provided for required field: " + name);
	                return;
	            }
	        }
	        var funcName = 'set' + PAE.Util.camelCase(name);
	        try {
	            obj[funcName](val);
	        }
	        catch(e) {
	            errors.push("Error on " + funcName + ": " + e);
	        }
	    })
	    if (errors.length > 0) throw (errors.join(', '));
	    
	}
	/**
	 * parseInt except it throws an error if it's not.
	 */
	PAE.Util.ensureInt = function(val) {
	    var ret = parseInt(val);
	    if (isNaN(ret)) throw "Value must be an integer."
	    else return ret;
	}
	/**
     * parseFloat except it throws an error if it's not.
     */
    PAE.Util.ensureFloat = function(val) {
        var ret = parseFloat(val);
        if (isNaN(ret)) throw "Value must be a number."
        else return ret;
    }
    /**
     * parseBool except... oh wait that's not a thing.
     * Turns "true" or "false" into true or false,
     * throws an error otherwise.
     */
    PAE.Util.ensureBool = function(val) {
        if (val === true || val === 'true') return true;
        if (val === false || val === 'false') return false;
        throw "Value must be true or false."
    }
	/**
	 * Why on earth doesn't have a method that's this?
	 */
	PAE.Util.objEach = function(obj, fn) {
		var keys = Object.keys(obj);
		keys.forEach(function(key, idx) {
			fn(key, obj[key]);
		})
	}
	/**
	 * Sort the objects by sorter. Do fn on them in that order.
	 */
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
     * Remove the first occurance of _.isEqual(array, obj) from array.
     */
    PAE.Util.removeObj = function(array, obj) {
        for (var i = 0; i < array.length; i++) {
            if (_.isEqual(array[i], obj)) {
                array.splice(i, 1);
                return true;
            }
        }
        return false;
    }
    /**
     * Given a structure and an attrs object, return an object with all the variables mentioned 
     * in the struct.
     */
    PAE.Util.dumpAttrs = function(struct, obj) {
        var ret = {};
        _.forEach(struct, function(data, name) {
            ret[name] = obj[name];
        })
        return ret;
    }
    /**
     * Run getAttrs on everything in this collection, return a list of all the attrs.
     * 
     * Used for Rooms saving all their Layers, for example.
     */
    PAE.Util.collectionAttrs = function(coll) {
        var ret = [];
        _.forEach(coll, function(node) {
            ret.push(node.getAttrs());
        })
        return ret;
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
		if (name && PAE.EventMgr.listeners[name] && PAE.EventMgr.listeners[name][id]) {
		    delete PAE.EventMgr.listeners[name][id];
		}
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