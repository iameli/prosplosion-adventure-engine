/**
 * Talker is the parent class of anything that can hijack the UI and talk to you.
 */
goog.require("PAE");
goog.provide("PAE.Talker");
(function() {
	var Talker = PAE.Talker = function(params) {
		this._talkerInit(this, params);
	}
	Talker.prototype._talkerInit = function(self, params) {
		var self = this;
		self.audios = {};
		if (params.talkNoises) {
			params.talkNoises.forEach(function(n) {
				self.audios[n] = PAE.curGame.Resources.getAudio(n);
			});
		}
	}
	Talker.prototype.playText = function(params, callback) {
		var self = this;
		var text = params.text;
		var e = new PAE.Event({name : 'playText', text : text, audios : self.audios});
		PAE.EventMgr.trigger(e);
	}
})();