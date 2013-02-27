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
		self.groupList._zero = {zIndex: 0, scrollSpeed: 0}
		while (self.Game.className != "Game" && self.Game.Parent) {
			self.Game = self.Game.Parent;
		}
		self.dynamicList = params.dynamics;
		self.staticList = params.statics;
		self.bgcolor = params.bgColor || "black";
		this.Group = new Kinetic.Group();
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
		
		var w = 1024;
		var h = 768;
		this.entities = {};
		var bg = this.entities.zeroRect = new Kinetic.Rect({
	        x : 0,
	        y : 0,
	        width: w,
	        height: h,
	        fill: self.bgcolor
	    });
	    bg.on('click', function(e) {
	    	self.Dynamics.player.walkTo(e.layerX, e.layerY);
	    })
	    this.Groups._zero.add(bg);
	    var dynamics = self.dynamicList;
	    var statics = self.staticList;
	    Object.keys(dynamics).forEach(function(name) {
	    	var dynamic = dynamics[name];
	    	self.addDynamic(name, dynamic);
	    })
	    Object.keys(statics).forEach(function(name) {
	    	var stat = statics[name];
	    	self.addStatic(name, stat);
	    })
	    PAE.Util.objEachSorted(self.Groups, function(name, group) {
	    		return self.groupList[name].zIndex; 
	    	}, 
	    	function(name, group) {
		    	var gDef = self.groupList[name];
		    	group.moveToTop();
	    })
	}
	
	Room.prototype.addDynamic = function(name, sprite) {
		var self = this;
		var s = self.Dynamics[name] = new PAE.Dynamic(sprite);
	    self.Groups[sprite.layer].add(s.Sprite);
	    s.init();
	}
	Room.prototype.addStatic = function(name, stat) {
		var self = this;
		var s = self.Statics[name] = new PAE.Static(stat);
		self.Groups[stat.layer].add(s.Sprite);
		s.init();
	}
})(); 