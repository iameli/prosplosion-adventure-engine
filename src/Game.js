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
	};
	Game.prototype.transition = function(params) {
		var self = this;
		var roomParams = this.GameStruct.rooms[params.room];
		self.CurRoom = new PAE.Room(roomParams, self);
		self.Stage.add(self.CurRoom.Layer);
		self.CurRoom.initalize();
		self.Stage.draw();
	}
	Game.prototype.getDimensions = function(params) {
		return {width: this.Stage.getWidth(), height: this.Stage.getHeight()};
	}
})(); 