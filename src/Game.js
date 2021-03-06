/**
 * Games are the root object for a game.
 */
goog.require("PAE");
goog.require("PAE.Script");
goog.require("PAE.Room");
goog.require("PAE.Resources");
goog.require("PAE.DynamicDefinition");
goog.require("PAE.UI");
goog.require("PAE.Serializer");
goog.provide("PAE.Game");
(function() {
    var gameStruct = {
        name:      {type: 'string'},
        shortName: {type: 'string'},
        startRoom: {type: 'string'},
        flags:     {type: 'object'},
        items:     {type: 'object'},
        resources: {type: 'object'},
        rooms:     {type: 'object'}
    }
	/**
	 * Create a game!
	 * 
	 * Params is the entire gamestate file.
	 * 
	 * TODO: This method is a mess!
	 */
	var Game = PAE.Game = function(gameData, windowData) {
	    if (typeof gameData != 'object') {
	        gameData = PAE.Serializer.deserialize(gameData);
	    }
		var self = this;
		var params = gameData;
		self.attrs = params;
		PAE.curGame = self;
		self.inventory = [];
		var container = document.getElementById(windowData.container);
		var width = container.scrollWidth;
		var height = container.scrollHeight;
		var scale = self.scale = height / 768;
		var leftOffset = self.leftOffset = Math.floor((width - (1024*scale)) / 2);
		self.dynamicDefinitions = {};
		_.forEach(gameData.dynamics, function(def) {
		    var dynDef = new PAE.DynamicDefinition(def);
		    self.dynamicDefinitions[def.name] = dynDef;
		});
		self.stage = new Kinetic.Stage({
			"container" : windowData.container,
			"width" : width,
			"height" : height
		});
		self._uid = 0; //Unique identifiers for anything that needs them. Increments.
		self.UI = new PAE.UI();
		self.resources = new PAE.Resources(params, windowData);
		self.layer = new Kinetic.Layer({
		    scale: scale,
		    x: leftOffset
		});
		self.stage.add(self.layer);
		self.group = new Kinetic.Group();
		//self.Group.add(self.UI.Group);
		self.layer.add(self.group);
		self.resources.download(function() {
		    self.group.add(self.UI.Group);
			self.transition({room: self.attrs.startRoom});
		})
		self.loadingScreen = new Kinetic.Group();
		self.loadingScreen.add(new Kinetic.Rect({
            x: -5000,
            y: -5000,
            width: 10000,
            height: 10000,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        }))
		self.layer.on('beforeDraw', function() {
			PAE.EventMgr.trigger(new PAE.Event({
				name: 'before-draw'
			}))
		})
		self.flagStates = {};
		PAE.Util.objEach(self.attrs.flags, function(name, set) {
			self.flagStates[name] = set;
		})
	};
	/**
	 * Given a click somewhere on our window, translate it according to the 
	 * current scale and leftOffset.
	 */
	Game.prototype.translateClick = function(e) {
	    var normalX = e.layerX - this.leftOffset;
	    return {x: (normalX / this.scale), y: (e.layerY / this.scale)};
	}
	/**
	 * Get a unique identifier for whatever. 
	 */
	Game.prototype.uid = function() {
		var self = this;
		var ret = self._uid;
		self._uid += 1;
		return ret;
	}
	/**
	 * Serialize the game, for purposes of editing and saving it.
	 */
	Game.prototype.serialize = function() {
	    return PAE.Serializer.serialize(this.getAttrs());
	}
	/**
	 * Transition to a new room.
	 */
	Game.prototype.transition = function(params, callback) {
		var self = this;
		self.group.add(self.loadingScreen);
		self.loadingScreen.moveToTop();
		self.saveRoom();
		var roomParams = self.attrs.rooms[params.room];
		if (self.curRoom) {
		    self.curRoom.shutdown();
			self.curRoom.layer.remove();
		}
		self.layer.draw();
		roomParams.name = params.room;
		setTimeout(function() {
		    self.curRoom = new PAE.Room(roomParams, self);
            self.layer.add(self.curRoom.layer);
            self.curRoom.initalize(function() {
                self.UI.Group.moveToTop();
                self.loadingScreen.remove();
                self.stage.draw();
                callback && callback();
            });
		}, 1)
	}
	/*
	 * Get the dimensions of the stage.
	 */
	Game.prototype.getDimensions = function(params) {
		return {width: this.stage.getWidth(), height: this.stage.getHeight()};
	}
	/**
	 * Get the definition of a dynamic.
	 */
	Game.prototype.getDynamicDefinition = function(id) {
		return this.dynamicDefinitions[id];
	}
	/**
	 * Get a list of all dynamic definitions.
	 */
	Game.prototype.getDynamicDefinitions = function() {
	    return this.dynamicDefinitions;
	}
	/**
	 * Give the item to a player.
 	 * @param {Object} item
	 */
	Game.prototype.giveItem = function(item) {
		var self = this;
		PAE.EventMgr.trigger(new PAE.Event({
			name : 'giving-item',
			item : item
		}));
		self.inventory.push(item);
		PAE.EventMgr.trigger(new PAE.Event({
			name : 'gave-item',
			item : item
		}))
	}
	/**
	 * Remove an item from the player's inventory.
 	 * @param {Object} item
	 */
	Game.prototype.removeItem = function(item) {
		var self = this;
		PAE.EventMgr.trigger(new PAE.Event({
			name : 'removing-item',
			item : item
		}));
		var idx = self.inventory.indexOf(item);
		if (idx != -1) {
			self.inventory.splice(idx, 1);
			PAE.EventMgr.trigger(new PAE.Event({
				name: 'removed-item',
				item: item
			}))
		}
	}
	/**
	 * Check to see if a player has a certain item.
 	 * @param {Object} item
	 */
	Game.prototype.hasItem = function(item) {
		var self = this;
		var idx = self.inventory.indexOf(item);
		return (idx != -1)
	}
	/**
	 * Get item data
	 */
	Game.prototype.getItem = function(name) {
		return this.attrs.items[name];
	}
	/**
	 * Set a flag.
	 * 
     * @param {Object} flag name
	 */
	Game.prototype.setFlag = function(f) {
		var self = this;
		if (self.flagStates[f] === undefined) throw "Tried to set undefined flag " + f;
		else self.flagStates[f] = true;
		
	}
	/**
	 * Clear a flag.
	 * 
     * @param {Object} flag name
	 */
	Game.prototype.clearFlag = function(f) {
		var self = this;
		if (self.flagStates[f] === undefined) throw "Tried to set undefined flag " + f;
		else self.flagStates[f] = false;
	}
	/**
	  * http://www.youtube.com/watch?v=uEx5G-GOS1k
	  * 
	  * @param {Object} f flag name
	  */
	Game.prototype.hasFlag = function(f) {
		var self = this;
		return (self.flagStates[f] === true);
	}
	/**
	 * Get current room.
	 */
	Game.prototype.getCurrentRoom = function() {
	    return this.curRoom;
	}
	/**
	 * Save current room to this.attrs
	 */
	Game.prototype.saveRoom = function() {
	    var room = this.getCurrentRoom();
	    if (room) {
	        var name = room.getName();
            this.attrs.rooms[name] = room.getAttrs();
	    }
	}
	/**
	 * Serialize the game for storage.
	 * 
	 * Not to be confused with saving and loading the game.
	 */
	Game.prototype.getAttrs = function() {
	    this.saveRoom();
	    var attrs = PAE.Util.dumpAttrs(gameStruct, this.attrs);
	    attrs.dynamics = PAE.Util.collectionAttrs(this.dynamicDefinitions);
	    return attrs;
	}
	PAE.Util.addGetters(PAE.Game, ['name', 'shortName', 'startRoom']);
    PAE.Util.addSetters(PAE.Game, ['name', 'shortName', 'startRoom']);
})(); 