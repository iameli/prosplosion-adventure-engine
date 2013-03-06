/**
 * Games are the root object for a game.
 */
goog.require("PAE");
goog.require("PAE.Dynamic");
goog.provide("PAE.Room");
(function() {
	var WIDTH = 1024;
	var HEIGHT = 768;
	var Room = PAE.Room = function(params) {
		var self = this;
		self.dynamics = {};
		self.statics = {};
		var attrs = self.attrs = params;
		attrs.layers._zero = {zIndex: 0, scrollSpeed: 0}
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
	    bg.on('click', function(e) {
	    	if (self.attrs.follow) {
	    		var rpos = self.group.getPosition();
	    		var x = e.offsetX - rpos.x;
	    		var y = e.offsetY - rpos.y;
	    		self.dynamics[self.attrs.follow].walkTo(x, y);
	    	}
	    })
	    this.layers._zero.add(bg);
	    
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
	    var XBUFFER = 250; //defining these as constants just so's we can edit later if need be
	    var YBUFFER = 150;
	    PAE.EventMgr.on('sprite-walking', function(e) {
	    	var sprite = self.spriteIdx[e.uid];
	    	if (sprite && self.attrs.follow == sprite) { //If the player is moving
	    		var dynamic = self.dynamics[self.attrs.follow];
	    		var sprite = dynamic.sprite;
	    		var dimensions = dynamic.getDimensions();
	    		var responder = PAE.EventMgr.on('before-draw', function(e) {
	    			var spos = sprite.getPosition();
	    			var sx = spos.x;
	    			var sy = spos.y;
	    			var rpos = self.group.getPosition();
	    			var rx = rpos.x;
	    			var ry = rpos.y;
	    			if ((rx + sx) < XBUFFER) { //room too far right
	    				self.group.setX(XBUFFER - sx)
	    			}
	    			else if ((WIDTH - sx - rx - dimensions.width) < XBUFFER) {
	    				self.group.setX(WIDTH - sx - dimensions.width - XBUFFER)
	    			}
	    			if ((ry + sy) < YBUFFER) { //room too far right
	    				self.group.setY(YBUFFER - sy)
	    			}
	    			else if ((HEIGHT - sy - ry - dimensions.height) < YBUFFER) {
	    				self.group.setY(HEIGHT - sy - dimensions.height - YBUFFER)
	    			}
	    		})
	    		var ender = PAE.EventMgr.on('sprite-walking-done', function(e) {
	    			var sprite = self.spriteIdx[e.uid];
	    			if (sprite && self.follow == sprite) {
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
		    	PAE.EventMgr.trigger(new PAE.Event({ //Inital one to move the camera
					name: 'sprite-walking',
					uid: self.dynamics[self.attrs.follow].getUID()
				}))
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
})(); 