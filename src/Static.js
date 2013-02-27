/**
 * Statics are just pretty and sit there. No animation, no movement.
 * 
 * Used for optimization for background and such.
 */
goog.provide("PAE.Static");
(function() {
	var Static = PAE.Static = function(params) {
		console.log(params);
		var self = this;
		self.img_name = params.img;
		self.img = PAE.curGame.Resources.getImage(params.img);
		
		var sprite = self.Sprite = new Kinetic.Rect({
			x : 0,
			y : 0,
			width: 100,
			height: 100,
			fillPattern : self.img
		})
	}
	Static.prototype.init = function() {
		 
	}
	PAE.Global.extend(PAE.Static, PAE.Talker);
})();
