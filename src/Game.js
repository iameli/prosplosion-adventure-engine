/**
 * Games are the root object for a game.
 */
goog.require("PAE");
goog.require("PAE.Room");
goog.require("PAE.Resources");
goog.require("PAE.UI");
goog.require("PAE.Serializer");
goog.provide("PAE.Game");
(function() {
	/**
	 * Create a game!
	 * 
	 * Params is the entire gamestate file.
	 */
	var Game = PAE.Game = function(gameData, windowData) {
	    console.log(typeof gameData)
	    if (typeof gameData != 'object') {
	        gameData = PAE.Serializer.deserialize(gameData);
	    }
		var self = this;
		var params = gameData;
		self.attrs = params;
		PAE.curGame = self;
		self.inventory = [];
		self.stage = new Kinetic.Stage({
			"container" : windowData.container,
			"width" : windowData.width,
			"height" : windowData.height
		});
		self._uid = 0; //Unique identifiers for anything that needs them. Increments.
		self.UI = new PAE.UI();
		self.resources = new PAE.Resources(params, windowData);
		self.layer = new Kinetic.Layer();
		self.stage.add(self.layer);
		self.group = new Kinetic.Group();
		//self.Group.add(self.UI.Group);
		self.layer.add(self.group);
		self.resources.download(function() {
			self.transition({room: self.attrs.startRoom});
			self.group.add(self.UI.Group);
		})
		self.stage.draw();
		self.layer.beforeDraw(function() {
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
	    return PAE.Serializer.serialize(this.attrs);
	}
	/**
	 * Transition to a new room.
	 */
	Game.prototype.transition = function(params) {
		var self = this;
		var roomParams = self.attrs.rooms[params.room];
		if (self.curRoom) {
			self.curRoom.group.remove();
		}
		roomParams.name = params.room;
		self.curRoom = new PAE.Room(roomParams, self);
		self.group.add(self.curRoom.group);
		self.curRoom.initalize(function() {
			self.UI.Group.moveToTop();
		});
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
	Game.prototype.getDynamicData = function(id) {
		var self = this;
		return self.attrs.dynamics[id];
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
	}/**
	  * http://www.youtube.com/watch?v=uEx5G-GOS1k
	  * 
	  * @param {Object} f flag name
	  */
	Game.prototype.hasFlag = function(f) {
		var self = this;
		return (self.flagStates[f] === true);
	}
})(); 