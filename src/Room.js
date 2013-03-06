/**
 * Games are the root object for a game.
 */
goog.require("PAE");
goog.require("PAE.Dynamic");
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
		attrs.layers._zero = {zIndex: 0, scrollSpeed: 1.0}
		self.group = new Kinetic.Group();
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
	        x : -10000,
	        y : -10000,
	        width: 20000,
	        height: 20000,
	        fill: self.attrs.bgColor
	    });
	    this.layers._zero.add(bg);
	    
	    var walkFunc = function(e) {
	    	if (self.attrs.follow) {
	    		var rpos = self.layers._zero.getPosition();
	    		var x = e.offsetX - rpos.x;
	    		var y = e.offsetY - rpos.y;
	    		self.dynamics[self.attrs.follow].walkTo(x, y);
			}
		}
	    
	    if (self.attrs.walkable) {
	    	var walkable = new Kinetic.Path({
	    		data: self.attrs.walkable,
	    		x: 0,
	    		y: 0,
	    		fill: 'red'
	    	});
	    	this.layers._zero.add(walkable);
	    	walkable.moveToTop();
	    	walkable.on('click', walkFunc);
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
		var rpos = self.layers._zero.getPosition();
		var rx = rpos.x;
		var ry = rpos.y;
		if ((rx + sx) < XBUFFER) { //room too far right
			self.scrollX(XBUFFER - sx)
		}
		else if ((WIDTH - sx - rx - dimensions.width) < XBUFFER) {
			self.scrollX(WIDTH - sx - dimensions.width - XBUFFER)
		}
		if ((ry + sy) < YBUFFER) { //room too far right
			self.scrollY(YBUFFER - sy)
		}
		else if ((HEIGHT - sy - ry - dimensions.height) < YBUFFER) {
			self.scrollY(HEIGHT - sy - dimensions.height - YBUFFER)
		}
	}
	Room.prototype.clearCenter = function() {
		
	}
	Room.prototype.scrollX = function(newx) {
		var self = this;
		PAE.Util.objEach(self.attrs.layers, function(name, deets) {
			self.layers[name].setX(Math.floor(newx * deets.scrollSpeed));
		})
	}
	Room.prototype.scrollY = function(newy) {
		var self = this;
		PAE.Util.objEach(self.attrs.layers, function(name, deets) {
			self.layers[name].setY(newy);
		})
	}
})(); 