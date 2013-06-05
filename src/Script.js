/**
 * Scripts represent in-game scripts associated with whatever we feel. 
 * 
 * These are mostly documented in Scripting.md.
 */
goog.provide("PAE.Script");
(function() {
    var scriptStruct = {
        name: {type: 'string', required: false},
        script: {type: 'function', def: function(){}}
    }
    var Script = PAE.Script = function(params) {
        PAE.Util.setAttrs(this, scriptStruct, params)
    }
    Script.prototype.getAttrs = function() {
        return PAE.Util.dumpAttrs(scriptStruct, this.attrs)
    }
    /**
     * I
     */
    Script.prototype.getName = function() {
        return this.attrs.name;
    }
    /**
     * Love
     * @param {String} name
     */
    Script.prototype.setName = function(name) {
        this.attrs.name = name;
    }
    /**
     * Writing
     */
    Script.prototype.getScript = function() {
        return this.attrs.script;
    }
    /**
     * Comments
     * @param {Function} script
     */
    Script.prototype.setScript = function(script) {
        this.attrs.script = script;
    }
    /**
     * Run the script! 
     * @param {Object} params.game The game engine.
     * @param {Object} params.room The current room.
     * @param {Function} callback Optional callback called upon completion of the queue.
     */
    Script.prototype.run = function(params, callback) {
        var wrapper = new ScriptWrapper(params)
        if (params.args === undefined) params.args = []
        this.attrs.script.apply(wrapper, params.args)
        var queue = wrapper._internal.queue
        var queueItem = function() { //Execute the queue!
            if (queue.length > 0) {
                var item = queue.pop();
                var func = item[0];
                var args = item[1];
                var params = item[2];
                var cb = queueItem;
                if (params.async === true) cb = function(){}
                args.push(params);
                args.push(cb);
                func.apply(wrapper, args);
                if (params.async === true) queueItem();
            }
            else {
                callback && callback();
            }
            
        }
        queueItem();
    }
    /**
     * ScriptWrappers are the context that the scripts actually run in. Their
     * this objects are populated with stuff that implements the scripting API.
     */
    var ScriptWrapper = PAE.ScriptWrapper = function(context) {
        this._internal = {}
        this._internal.parent = this;
        this._internal.game = context.game
        this._internal.room = context.room
        this._internal.queue = []
    }
    /**
     * The structure of the API is defined here then programatically turned into classes and such.
     * 
     * "params" is special and will bubble downward to carry .parameters() down there
     */
    var apiStruct = {}
    apiStruct.flag = {}
    apiStruct.flag.setFlag = {
        queue: function(flag, params, cb) {
            this._internal.game.setFlag(flag);
            cb();
        }
    }
    apiStruct.flag.clearFlag = {
        queue: function(flag, params, cb) {
            this._internal.game.clearFlag(flag);
            cb();
        }
    }
    apiStruct.flag.hasFlag = {
        instant: function(flag) {
            return this._internal.game.hasFlag(flag);
        }
    }
    /**
     * This goes through our struct and populated the object accordingly.
     * 
     * It's... messy. The trouble is that we can't just put functions into objects into objects because they'll
     * just end up referencing the inner object without knowledge of the underlying ScriptWrapper. 
     * 
     * So for the internal objects... the ScriptWrapper prototype is populated with *classes*. When the object is 
     * accessed, objects are created for these classes. It's reasonably memory efficient because all of the relevant
     * functions still live in the prototype; the only thing the objects contain is an _internal object that 
     * maintains a reference to the parent object.
     * 
     * This is probably the most black magic thing in the code base right now and it's not even that bad! 
     * 
     * THIS WILL BE SO MUCH BETTER ONCE ES HARMONY IS IMPLEMENTED. PROXIES WOULD MAKE THIS HAPPY FUN TIMES.
     * 
     * Fuck that JS is dead long live writing in nothing but vanilla C
     */
    populator = [[apiStruct, ScriptWrapper]]
    while (populator.length > 0) {(function(){
        var popped = populator.pop();
        var struct = popped[0];
        var destination = popped[1];
        _.forEach(struct, function(leaf, name) {
            if (typeof leaf.instant === 'function' || typeof leaf.queue === 'function') { // This leaf is an API function!
                destination.prototype[name] = function() {
                    var self = this._internal.parent;
                    var args = _.toArray(arguments) //args are the arguments from when it's called
                    var params = {async: false}     //params are the post-invocation .option() params
                    if (leaf.params) _.extend(params, leaf.params)
                    if (typeof leaf.queue === 'function') {
                        self._internal.queue.push([leaf.queue, args, params]) //This function has us queue something.
                    }
                    if (typeof leaf.instant === 'function') {
                        return leaf.instant.apply(self, args) //This function has us do something right away.
                    }
                    var ret = {}
                    _.forEach(params, function(def, name) {
                        ret.name = function(val) {
                            params[name] = val;
                        }
                    })
                    return ret;
                }
            }
            else { //This is an internal object. Make a class!
                var newDest = function(cxt) {
                    this._internal = {parent: cxt}
                };
                Object.defineProperty(destination.prototype, name, {
                    get: function() {
                        return new newDest(this._internal.parent);
                    }
                })
                populator.push([leaf, newDest])
            }
        })
    })()}
})()