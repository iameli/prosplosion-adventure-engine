/**
 * Games are the root object for a game.
 */
goog.require("PAE");
goog.require("PAE.Room");
goog.require("PAE.Resources");
goog.require("PAE.UI");
goog.provide("PAE.Game");
(function() {
	var Game = PAE.Game = function(params) {
		var self = this;
		PAE.curGame = self;
		self.className = "Game";
		self.Stage = new Kinetic.Stage({
			container : params.container,
			width : params.width,
			height : params.height
		});
		self.GameStruct = params;
		self.UI = new PAE.UI();
		self.Resources = new PAE.Resources(params);
		self.Layer = new Kinetic.Layer();
		self.Stage.add(self.Layer);
		self.Group = new Kinetic.Group();
		//self.Group.add(self.UI.Group);
		self.Layer.add(self.Group);
		self.Resources.download(function() {
			self.transition({room: self.GameStruct.startRoom});
		})
		self.Stage.draw();
	};
	Game.prototype.transition = function(params) {
		var self = this;
		var roomParams = self.GameStruct.rooms[params.room];
		self.CurRoom = new PAE.Room(roomParams, self);
		self.Group.add(self.CurRoom.Group);
		self.Group.add(self.UI.Group);
		self.CurRoom.initalize();
	}
	Game.prototype.getDimensions = function(params) {
		return {width: this.Stage.getWidth(), height: this.Stage.getHeight()};
	}
	Game.prototype.getDynamicData = function(id) {
		var self = this;
		return self.GameStruct.dynamics[id];
	}
})(); 