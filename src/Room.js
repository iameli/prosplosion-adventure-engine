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
		attrs.layers._zeroBG = {zIndex: -1, scrollSpeed: 0.0}
		attrs.layers._walkable = {zIndex: 0, scrollSpeed: 1.0}
		attrs.layers._debug = {zIndex: 101, scrollSpeed: 1.0}
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
	        x : 0,
	        y : 0,
	        width: self.attrs.width,
	        height: self.attrs.height,
	        fill: self.attrs.bgColor
	    });
	    this.layers._zeroBG.add(bg);
	    
	    var walkFunc = function(e) {
	    	if (self.attrs.follow) {
	    		var rpos = self.layers._walkable.getPosition();
	    		var x = e.offsetX - rpos.x;
	    		var y = e.offsetY - rpos.y;
	    		self.dynamics[self.attrs.follow].walkTo(x, y);
			}
		}
	    //Set up walkability clickable
	    if (self.attrs.walkable) {
	    	var walkable = self.walkablePath = new Kinetic.Path({
	    		data: self.attrs.walkable,
	    		x: 0,
	    		y: 0,
	    		fill: 'red',
	    		opacity: 0.2
	    	});
	    	self.layers._walkable.add(walkable);
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
		var rpos = self.layers._walkable.getPosition();
		var rx = rpos.x;
		var ry = rpos.y;
		if ((rx + sx) < XBUFFER) { //room too far left
			if (0 > rx) { // If we're at the left border of the scree'
				self.scrollX(XBUFFER - sx);
			}
			else {
				self.scrollX(0);
			}
		}
		else if ((WIDTH - sx - rx - dimensions.width) < XBUFFER) { //room too far right
			if ((-1) * rx + WIDTH < self.attrs.width) {
				self.scrollX(WIDTH - sx - dimensions.width - XBUFFER)
			}
			else { //iF we're at the right border of the screen
				self.scrollX((self.attrs.width - WIDTH) * (-1));
			}
		}
		if ((ry + sy) < YBUFFER) { //Room too far up
			if (0 > ry) {
				self.scrollY(YBUFFER - sy)
			}
			else {
				self.scrollY(0);
			}
		}
		else if ((HEIGHT - sy - ry - dimensions.height) < YBUFFER) { //room too far down
			if ((-1) * ry + HEIGHT < self.attrs.height) {
				self.scrollY(HEIGHT - sy - dimensions.height - YBUFFER)
			}
			else {
				self.scrollY((self.attrs.height - HEIGHT) * (-1));
			}
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