/**
 * Resources.js manages getting all the data--images and such--that we need from the server. 
 */
goog.require("PAE");
goog.provide("PAE.Resources");

(function() {
	var Resources = PAE.Resources = function(params) {
		var self = this;
		self.images = {};
		self.url = params.resourceURL;
		var rooms = params.rooms;
		self.svgs = {};
		params.resources.svgs.forEach(function(file) {
			self.svgs[file] = null;
		})
		var audios = params.resources.audio;
		self.audio = {};
		audios.forEach(function(n) {
			self.audio[n] = null;
		})
	}
	Resources.prototype.download = function(callback) {
		var self = this;
		var audio_dloads = Object.keys(self.audio);
		var svg_dloads = Object.keys(self.svgs);
		var count = audio_dloads.length + svg_dloads.length;
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
		svg_dloads.forEach(function(file) {
			var req = new XMLHttpRequest();
			req.onreadystatechange = function() {
				if (req.readyState == 4) {
					console.log("Got file!");
					self.svgs[file] = req.responseXML;
					count -= 1;
					if (count == 0) callback();
				}
			}
			req.open("GET", self.url + '/' + file, true);
			req.send(null);
		})
	}
	Resources.prototype.getImage = function(img) {
		return this.images[img];
	}
	Resources.prototype.getAudio = function(audio) {
		return this.audio[audio];
	}
	Resources.prototype.getSVG = function(f) {
		return this.svgs[f];
	}
})();
