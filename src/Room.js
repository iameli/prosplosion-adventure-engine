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
		self.className = 'Room';
		self.Parent = parent;
		self.Game = self.Parent;
		self.groupList = params.layers;
		self.groupList._zero = {zIndex: 0, scrollSpeed: 0}
		while (self.Game.className != "Game" && self.Game.Parent) {
			self.Game = self.Game.Parent;
		}
		self.sprites = params.sprites;
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
			gDef = self.groupList[g_name];
			var g = self.Groups[g_name] = new Kinetic.Group();
			self.Group.add(g);
			g.setZIndex(gDef.zIndex);
		})
		
		var w = stage.getWidth();
		var h = stage.getHeight();
		this.entities = {};
		var bg = this.entities.zeroRect = new Kinetic.Rect({
	        x : 0,
	        y : 0,
	        width: w,
	        height: h,
	        fill: self.bgcolor
	    });
	    bg.on('click', function(e) {
	    	console.log(e);
	    })
	    this.Groups._zero.add(bg);
	    var sprites = self.sprites;
	    Object.keys(sprites).forEach(function(name) {
	    	var sprite = sprites[name];
	    	self.addDynamic(name, sprite);
	    })
	}
	
	Room.prototype.addDynamic = function(name, sprite) {
		var self = this;
		var s = self.Dynamics[name] = new PAE.Dynamic({
			game : self.Game,
			spriteInstance : sprite
		});
	    self.Groups[sprite.layer].add(s.Sprite);
	    s.init();
	}
})(); 