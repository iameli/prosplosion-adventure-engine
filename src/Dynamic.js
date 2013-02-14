/**
 * Dynamics are everything in a level that's not static. Everything that's a clickable or moves or anything is dynamic.
 */
goog.require("PAE");
goog.provide("PAE.Dynamic");
(function() {
	var Dynamic = PAE.Dynamic = function(params) {
		var self = this;
		self.Game = params.game;
		var spriteInstance = self.SpriteInstance = params.spriteInstance;
		var spriteDef      = self.SpriteDef      = self.Game.getSpriteData(self.SpriteInstance.id);
		var img            = self.Img            = self.Game.Resources.getImage(spriteDef.image);
		var s              = self.Sprite         = new Kinetic.Sprite({
	        x: spriteInstance.x,
	        y: spriteInstance.y,
	        image: img,
	        animation: spriteDef.defaultAnimation,
	        animations: spriteDef.animations,
	        frameRate : spriteDef.frameRate,
	        scale: spriteInstance.scale
	   });
	}
	Dynamic.prototype.init = function() {
		var self = this;
		self.Sprite.start();
	}
})();
