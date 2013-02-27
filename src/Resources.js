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
		var dynamics = params.dynamics;
		Object.keys(dynamics).forEach(function(n) {
			var dynamic = dynamics[n];
			self.images[dynamic.image] = null;
		})
		var rooms = params.rooms;
		Object.keys(rooms).forEach(function(n) {
			var room = rooms[n];
			if (room.backgroundImage) {
				self.images[room.backgroundImage] = null;
			}
		})
		var audios = params.resources.audio;
		self.audio = {};
		audios.forEach(function(n) {
			self.audio[n] = null;
		})
		var images = params.resources.images;
		images.forEach(function(n) {
			self.images[n] = null;
		})
	}
	Resources.prototype.download = function(callback) {
		var self = this;
		var img_dloads = Object.keys(self.images);
		var audio_dloads = Object.keys(self.audio);
		var count = img_dloads.length + audio_dloads.length;
		img_dloads.forEach(function(file) {
			var img = new Image();
			img.onload = function() {
				self.images[file] = img;
				count -= 1;
				if (count == 0) { 
					callback();
				}
			}
			img.src = self.url + '/' + file;
		});
		audio_dloads.forEach(function(file) {
			var audio = new Audio();
			audio.addEventListener('canplaythrough', function() {
				self.audio[file] = audio;
				count -= 1;
				if (count == 0) {
					callback();
				}
			}, false);
			audio.src = self.url + '/' + file;
		});
	}
	Resources.prototype.getImage = function(img) {
		return this.images[img];
	}
	Resources.prototype.getAudio = function(audio) {
		return this.audio[audio];
	}
})();
