/**
 * Talker is the parent class of anything that can hijack the UI and talk to you.
 */
goog.require("PAE");
goog.provide("PAE.Talker");
(function() {
	var Talker = PAE.Talker = function(params, game) {
		this._talkerInit(this, params, game);
	}
	Talker.prototype._talkerInit = function(self, params, game) {
		var self = this;
		self.Game = game;
		console.log(params);
		self.audios = {};
		params.talkNoises.forEach(function(n) {
			self.audios[n] = game.Resources.getAudio(n);
		});
	}
	Talker.prototype.playText = function(text) {
		var self = this;
		self.Game.UI.playText({text : text, audios : self.audios})
	}
})();