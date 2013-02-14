/**
 * Games are the root object for a game.
 */
goog.require("PAE");
goog.require("PAE.Room");
goog.require("PAE.Resources");
goog.provide("PAE.Game");
(function() {
	var Game = PAE.Game = function(params) {
		var self = this;
		self.className = "Game";
		self.Stage = new Kinetic.Stage({
			container : params.container,
			width : params.width,
			height : params.height
		});
		self.GameStruct = params;
		self.Resources = new PAE.Resources(params);
		self.Resources.download(function() {
			self.transition({room: self.GameStruct.startRoom});
		})
		self.Layer = new Kinetic.Layer();
		self.Stage.add(self.Layer);
		self.UI = new PAE.UI(self.Layer);
	};
	Game.prototype.transition = function(params) {
		var self = this;
		var roomParams = self.GameStruct.rooms[params.room];
		self.CurRoom = new PAE.Room(roomParams, self);
		self.Layer.add(self.CurRoom.Group);
		self.CurRoom.initalize();
		self.Stage.draw();
	}
	Game.prototype.getDimensions = function(params) {
		return {width: this.Stage.getWidth(), height: this.Stage.getHeight()};
	}
	Game.prototype.getSpriteData = function(id) {
		var self = this;
		return self.GameStruct.sprites[id];
	}
})(); 