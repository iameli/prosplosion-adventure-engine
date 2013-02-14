/**
 * Games are the root object for a game.
 */
goog.require("PAE");
goog.provide("PAE.Room");
(function() {
	var Room = PAE.Room = function(params, parent) {
		var self = this;
		self.Parent = parent;
		self.Game = self.Parent;
		while (self.Game.className != "Game" && self.Game.Parent) {
			self.Game = self.Game.Parent;
		}
		self.sprites = params.sprites;
		self.bgcolor = params.bgColor || "black";
		this.Layer = new Kinetic.Layer();
		
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
		var stage = this.Layer.getStage();
		this.Layers = {};
		this.Layers._zero = new Kinetic.Layer();
		Object.keys(this.Layers).forEach(function(thing) {
			self.Layer.add(self.Layers[thing])
		})
		var w = stage.getWidth();
		var h = stage.getHeight();
		this.entities = {};
		this.entities.zeroRect = new Kinetic.Rect({
	        x : 0,
	        y : 0,
	        width: w,
	        height: h,
	        fill: self.bgcolor
	    });
	    this.Layers._zero.add(this.entities.zeroRect);
	    var sprites = self.sprites
	    Object.keys(sprites).forEach(function(name) {
	    	var sprite = sprites[name];
	    })
	}
})(); 