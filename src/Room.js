/**
 * Games are the root object for a game.
 */
goog.require("PAE");
goog.require("PAE.Dynamic");
goog.provide("PAE.Room");
(function() {
	var Room = PAE.Room = function(params, parent) {
		var self = this;
		self.Dynamics = {};
		self.Statics = {};
		self.className = 'Room';
		self.Parent = parent;
		self.Game = self.Parent;
		self.background = params.background;
		self.groupList = params.layers;
		self.follow = params.follow;
		self.groupList._zero = {zIndex: 0, scrollSpeed: 0}
		while (self.Game.className != "Game" && self.Game.Parent) {
			self.Game = self.Game.Parent;
		}
		self.dynamicList = params.dynamics;
		self.staticList = params.statics;
		self.bgcolor = params.bgColor || "black";
		self.Group = new Kinetic.Group();
	};
	Room.prototype.setBgColor = function(color) {
		self.bgcolor = color
		this.entities.zeroRect.setFill(color);
	}
	/**
	 * Call initalize after the layer has been added to the stage.
	 * We can't do this stuff in the constructor because we don't really know what
	 * we're working with yet.
	 */
	Room.prototype.initalize = function() {
		var self = this;
		var stage = this.Group.getStage();
		
		self.Groups = {};
		Object.keys(self.groupList).forEach(function(g_name) {
			var gDef = self.groupList[g_name];
			var g = self.Groups[g_name] = new Kinetic.Group();
			self.Group.add(g);
		})
		
		var WIDTH = 1024;
		var HEIGHT = 768;
		this.entities = {};
		var bg = this.entities.zeroRect = new Kinetic.Rect({
	        x : -10000,
	        y : -10000,
	        width: 20000,
	        height: 20000,
	        fill: self.bgcolor
	    });
	    bg.on('click', function(e) {
	    	if (self.follow) {
	    		console.log(e);
	    		var rpos = self.Group.getPosition();
	    		var x = e.offsetX - rpos.x;
	    		var y = e.offsetY - rpos.y;
	    		self.Dynamics[self.follow].walkTo(x, y);
	    	}
	    })
	    this.Groups._zero.add(bg);
	    var dynamics = self.dynamicList;
	    self.spriteIdx = {};
	    Object.keys(dynamics).forEach(function(name) {
	    	var dynamic = dynamics[name];
	    	var idx = self.addDynamic(name, dynamic);
	    	self.spriteIdx[idx] = name;
	    })
	    //This sorts the layers by z-index then runs moveottop on them.
	    //Needed because I can't start to fathom how KineticJS handles
	    //setZIndex. 
	    PAE.Util.objEachSorted(self.Groups, function(name, group) {
	    		return self.groupList[name].zIndex; 
	    	}, 
	    	function(name, group) {
		    	var gDef = self.groupList[name];
		    	group.moveToTop();
	    })
	    var XBUFFER = 250; //defining these as constants just so's we can edit later if need be
	    var YBUFFER = 150;
	    PAE.EventMgr.on('sprite-walking', function(e) {
	    	var sprite = self.spriteIdx[e.uid];
	    	if (sprite && self.follow == sprite) { //If the player is moving
	    		var dynamic = self.Dynamics[self.follow];
	    		var sprite = dynamic.sprite;
	    		var dimensions = dynamic.getDimensions();
	    		var responder = PAE.EventMgr.on('before-draw', function(e) {
	    			var spos = sprite.getPosition();
	    			var sx = spos.x;
	    			var sy = spos.y;
	    			var rpos = self.Group.getPosition();
	    			var rx = rpos.x;
	    			var ry = rpos.y;
	    			if ((rx + sx) < XBUFFER) { //room too far right
	    				self.Group.setX(XBUFFER - sx)
	    			}
	    			else if ((WIDTH - sx - rx - dimensions.width) < XBUFFER) {
	    				self.Group.setX(WIDTH - sx - dimensions.width - XBUFFER)
	    			}
	    			if ((ry + sy) < YBUFFER) { //room too far right
	    				self.Group.setY(YBUFFER - sy)
	    			}
	    			else if ((HEIGHT - sy - ry - dimensions.height) < YBUFFER) {
	    				self.Group.setY(HEIGHT - sy - dimensions.height - YBUFFER)
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
	    if (self.follow) {
	    	PAE.EventMgr.trigger(new PAE.Event({ //Inital one to move the camera
				name: 'sprite-walking',
				uid: self.Dynamics[self.follow].uid
			}))
	    }
	}
	/**
	 * Add a Dynamic to this room.
	 * @param {Object} name
	 * @param {Object} sprite
	 */
	Room.prototype.addDynamic = function(name, sprite) {
		var self = this;
		var s = self.Dynamics[name] = new PAE.Dynamic(sprite);
	    self.Groups[sprite.layer].add(s.sprite);
	    s.init();
	    return s.uid;
	}
})(); 