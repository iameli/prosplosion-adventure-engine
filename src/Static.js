/**
 * Statics are just pretty and sit there. No animation, no movement.
 * 
 * Used for optimization for background and such.
 */
goog.provide("PAE.Static");
(function() {
	var Static = PAE.Static = function(params) {
		var self = this;
		self.img_name = params.img;
		self.uid = PAE.curGame.uid();
		var def = PAE.curGame.getStaticData(params.id);
		self.img = PAE.curGame.Resources.getImage(def.image);
		console.log(self.img);
		var sprite = self.Sprite = new Kinetic.Rect({
			x : 0,
			y : 0,
			width: 1920,
			height: 1200,
			fillPatternImage : self.img
		})
		sprite.setListening(false);
	}
	Static.prototype.init = function() {
		 
	}
	PAE.Global.extend(PAE.Static, PAE.Talker);
})();
