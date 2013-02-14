/**
 * Resources.js manages getting all the data--images and such--that we need from the server. 
 * 
 * This is the only part of PAE to utilize jQuery. As such, if we ever want to utilize some other method
 * of loading all the data, this is the only file that will have to be changed.
 */
goog.require("PAE");
goog.provide("PAE.Resources");

(function() {
	var Resources = PAE.Resources = function(params) {
		var self = this;
		self.images = {};
		self.url = params.resourceURL;
		var sprites = params.sprites;
		Object.keys(sprites).forEach(function(n) {
			sprite = sprites[n];
			self.images[sprite.image] = null;
		})
	}
	Resources.prototype.download = function(callback) {
		var self = this;
		var dloads = Object.keys(self.images);
		var count = dloads.length;
		dloads.forEach(function(file) {
			var img = new Image();
			img.onload = function() {
				self.images[file] = img;
				count -= 1;
				if (count == 0) {
					callback();
				}
			}
			img.src = self.url + '/' + file;
		})
	}
})();
