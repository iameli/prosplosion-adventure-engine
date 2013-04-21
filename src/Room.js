/**
 * Games are the root object for a game.
 */
goog.require("PAE");
goog.require("PAE.Dynamic");
goog.require("PAE.PolyPath");
goog.provide("PAE.Room");
(function() {
	var WIDTH = 1024;
	var HEIGHT = 768;
	var XBUFFER = 250; //defining these as constants just so's we can edit later if need be
	var YBUFFER = 150;
	var Room = PAE.Room = function(params) {
		var self = this;
		self.dynamics = {};
		self.statics = {};
		var attrs = self.attrs = params;
		attrs.layers._zeroBG = {zIndex: -1, scrollSpeed: 0.0}
		attrs.layers._walkable = {zIndex: 0, scrollSpeed: 1.0}
		attrs.layers._debug = {zIndex: 101, scrollSpeed: 1.0}
		self.group = new Kinetic.Group();
		self.leftBorder = PAE.curGame.leftOffset / PAE.curGame.scale
	};
	/**
	 * Call initalize after the layer has been added to the stage.
	 * We can't do this stuff in the constructor because we don't really know what
	 * we're working with yet.
	 */
	Room.prototype.initalize = function(callback) {
		var self = this;

		//Add all Layers
		self.layers = {};
		PAE.Util.objEach(self.attrs.layers, function(name, layer) {
			var g = self.layers[name] = new Kinetic.Group();
			self.group.add(g);
		})
		
		//Add the background square
		var bg = self.zeroRect = new Kinetic.Rect({ //TODO: make this screen-sized but not scrolling
	        x : 0,
	        y : 0,
	        width: self.attrs.width,
	        height: self.attrs.height,
	        fill: self.attrs.bgColor
	    });
	    this.layers._zeroBG.add(bg);
	    
	    var walkFunc = function(e) {
	        var normalE = PAE.curGame.translateClick(e);
	    	if (self.attrs.follow) {
	    		var player = self.dynamics[self.attrs.follow];
	    		var rpos = self.layers._walkable.getPosition();
	    		var x = normalE.x - rpos.x;
	    		var y = normalE.y - rpos.y;
	    		var path = self.walkable.getPath(player.getFootPosition(), {x: x, y: y})
	    		var idx = 1;
	    		var next = function() {
	    			var x = path[idx].x;
	    			var y = path[idx].y;
	    			if (idx + 1 >= path.length) {
	    				player.walkTo(x, y, true);
	    			}
	    			else {
	    				idx += 1;
	    				player.walkTo(x, y, false, next);
	    			}
	    		}
	    		next();
			}
		}
	    //Set up walkability clickable
	    if (self.attrs.walkable) {
	    	// var walkable = self.walkablePath = new Kinetic.Path({
	    		// data: self.attrs.walkable,
	    		// x: 0,
	    		// y: 0,
	    		// fill: 'red',
	    		// opacity: 0.2
	    	// });
	    	//self.layers._walkable.add(walkable);
	    	var walkable = self.walkable = new PAE.PolyPath(self.attrs.walkable);
	    	self.layers._walkable.add(walkable.layer)
	    	walkable.layer.on('click', walkFunc);
	    }
	    else {
	    	bg.on('click', walkFunc);
	    }
	    
	    //Add all Dynamics
	    this.spriteIdx = {};
	    PAE.Util.objEach(self.attrs.dynamics, function(name, dyn) {
	    	self.addDynamic(name, dyn);
	    })

	    //This sorts the layers by z-index then runs moveottop on them.
	    //Needed because I can't start to fathom how KineticJS handles
	    //setZIndex. 
	    PAE.Util.objEachSorted(self.layers, function(name, group) {
	    		return self.attrs.layers[name].zIndex; 
	    	}, 
	    	function(name, group) {
		    	group.moveToTop();
	    })
	    
	    PAE.EventMgr.on('sprite-walking', function(e) {
	    	var sprite = self.spriteIdx[e.uid];
	    	if (sprite && self.attrs.follow == sprite) { //If the player is moving
	    		var responder = PAE.EventMgr.on('before-draw', function(e) {
	    			self.centerOn(sprite);
	    		})
	    		var ender = PAE.EventMgr.on('sprite-walking-done', function(e) {
					var sprite = self.spriteIdx[e.uid];
					if (sprite && self.attrs.follow == sprite) {
						PAE.EventMgr.off(responder);
						PAE.EventMgr.off(ender);
					}
				})
	    	}
	    })
	    var done = function() {
	    	var game = PAE.curGame;
	    	var onEnter = self.attrs.onEnter || function(e){};
	    	onEnter.prototype.game = game;
	    	onEnter.prototype.dynamics = self.dynamics;
	    	onEnter.prototype.room = self;
	    	new onEnter();
	    	self.scrollX(self.leftBorder * -1);
	    	if (self.attrs.follow) {
		    	self.centerOn(self.attrs.follow);
		    }
		    PAE.EventMgr.trigger(new PAE.Event({
		    	name: 'room-initalized',
		    	id: self.attrs.name,
		    	room: self
		    }))
		    callback && callback();
	    }
	    var dyns = Object.keys(self.dynamics).length;
	    if (dyns == 0) done();
	    PAE.Util.objEach(self.dynamics, function(name, dynamic) {
	    	dynamic.initalize(function() {
	    		dyns -= 1;
	    		if (dyns == 0) done();
	    	})
	    })
	    self.walkable.buildWalkGraph();
	}	
	/**
	 * Add a Dynamic to this room.
	 * @param {Object} name
	 * @param {Object} sprite
	 */
	Room.prototype.addDynamic = function(name, sprite) {
		var self = this;
		var s = self.dynamics[name] = new PAE.Dynamic(sprite);
	    self.layers[sprite.layer].add(s.sprite);
	    var uid = s.getUID();
	    self.spriteIdx[uid] = name;
	}
	/**
	 * Scroll the window to center on on a certain dynamic.
 	 * @param {Object} dynamic
	 */
	Room.prototype.centerOn = function(dynamic_name) {
		var self = this;
		var dynamic = self.dynamics[dynamic_name];
		var sprite = dynamic.sprite;
		var spos = sprite.getPosition();
		var dimensions = dynamic.getDimensions();
		var sx = spos.x;
		var sy = spos.y;
		var rpos = self.layers._walkable.getPosition();
		var rx = rpos.x;
		var ry = rpos.y;
		if ((rx + sx) < XBUFFER) { //room too far left
			self.scrollX(XBUFFER - sx);
		}
		else if ((WIDTH - sx - rx - dimensions.width) < XBUFFER) { //room too far right
			self.scrollX(WIDTH - sx - dimensions.width - XBUFFER)
		}
		if ((ry + sy) < YBUFFER) { //Room too far up
            self.scrollY(YBUFFER - sy)
		}
		else if ((HEIGHT - sy - ry - dimensions.height) < YBUFFER) { //room too far down
			self.scrollY(HEIGHT - sy - dimensions.height - YBUFFER)
		}
	}
	/**
	 * Scroll the background frame to the given X, accounting for background paralax.
	 */
	Room.prototype.scrollX = function(newx) {
		var self = this;
		var righty = (self.leftBorder + 1024) - this.attrs.width;
		if (newx < righty) newx = righty
		else if (newx > (self.leftBorder * -1)) {newx = (self.leftBorder * -1)}
		PAE.Util.objEach(self.attrs.layers, function(name, deets) {
			self.layers[name].setX(Math.floor(newx * deets.scrollSpeed));
		})
	}
	/**
	 * Scroll the foreground frame to the given Y, accounting for background paralax. 
	 */
	Room.prototype.scrollY = function(newy) {
		var self = this;
		PAE.Util.objEach(self.attrs.layers, function(name, deets) {
			self.layers[name].setY(newy);
		})
	}
	/**
	 * Turn on walkable debug.
 	 * @param {Object} on
	 */
	Room.prototype.walkableDebug = function(on) {
		var self = this;
		if (on) {
			self._followDebug = self.attrs.follow;
			self.walkable.layer.moveTo(self.layers._debug);
			self.walkable.debug(true);
			self.attrs.follow = null;
		}
		else {
			self.walkable.debug(false);
			self.walkable.layer.moveTo(self.layers._walkable);
			self.walkable.displayPathing(false);
			self.attrs.follow = self._followDebug;
		}
	}
	/**
	 * Display pathfinding debug information.
     * @param {Object} on
	 */
	Room.prototype.pathingDebug = function(on) {
		var self = this;
		if (on) {
			self.layers._debug.add(self.walkable.pathingData);
			self.walkable.displayPathing(true);
			if (self.attrs.follow) {
			    var dyn = self.dynamics[self.attrs.follow];
			    self.walkable.renderSightLines(dyn.getFootPosition());
			}
		}
		else {
			self.walkable.displayPathing(false);
			self.walkable.pathingData.remove();
		}
	}
	/**
	 * Rebuild the pathfinding graph.
	 */
	Room.prototype.rebuildPathfinding = function() {
	    var self = this;
	    self.walkable.buildWalkGraph();
	}
	/**
	 * Set the background color of the room.
     * @param {Object} color
	 */
	Room.prototype.setBgColor = function(color) {
	    var self = this;
	    self.zeroRect.setFill(color);
	    self.attrs.bgColor = color;
	}
	/**
	 * Set width of the room.
	 */
	Room.prototype.setWidth = function(w) {
	    throw "Room.setWidth not yet implemented."
	}
	/**
     * Set height of the room.
     */
    Room.prototype.setHeight = function(w) {
        throw "Room.setHeight not yet implemented."
    }
	PAE.Util.addGetters(PAE.Room, ['name', 'bgColor', 'width', 'height']);
	PAE.Util.addSetters(PAE.Room, ['name'])
})(); 