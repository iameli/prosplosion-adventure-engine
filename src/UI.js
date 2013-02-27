/**
 * Games are the root object for a game.
 */
goog.require("PAE");
goog.provide("PAE.UI");
(function() {
	var TEXT_SPEED = 50;
	var UI = PAE.UI = function(params, parent) {
		var self = this;
		
		self.Group = new Kinetic.Group();
		var talkGroup = self.TalkGroup = new Kinetic.Group( {
	    	x : 12,
	    	y : 570,
	    	width : 1000,
	    	height : 186,
	    	visible: false
	    });
		var rect = new Kinetic.Rect({
	        x : 0,
	        y : 0,
	        width : talkGroup.getWidth(),
	        height : talkGroup.getHeight(),
	        fill : 'green',
	        stroke : 'white',
	        strokeWidth : 4
	    });
	    talkgroup = talkGroup;
	    talkGroup.add(rect);
	    rect.on('click', function(e) {
	    	self.stopText();
	    })
	    self.Group.add(talkGroup);
	    self._shouldStop = false;
	    PAE.EventMgr.on("playText", function(e) {
	    	self.stopText();
	    	self.playText(e)
    	});
	}
	UI.prototype.playText = function(params) {
		var self = this;
		self._shouldStop = false;
		var fullText = params.text;
		self.TalkGroup.setVisible(true);
		var text = new Kinetic.Text({
	        x : 40,
	        y : 40,
	        text : '',
	        fontSize : 30,
	        fontFamily : 'Verlag',
	        fill : 'black'
	    });
	    self.CurText = text;
	    self.TalkGroup.add(text);
		var audios = params.audios;
		var a_names = Object.keys(audios);
		var prev_num = -1;
		var going = true;
		var listener = function(e) {
			var rando;
			do {
				rando = Math.floor(Math.random()*a_names.length);
			}
			while (rando == prev_num);
			prev_num = rando;
			audios[a_names[rando]].play();
		}
		a_names.forEach(function(name) {
			var audio = audios[name]
			audio.addEventListener('ended', listener)
		})
		audios[a_names[0]].play();
		var index = 0;
		var i = setInterval(function() {
			var string = fullText.substring(0, index);
			text.setText(string);
			if (string === fullText || self._shouldStop) {
				clearInterval(i);
				a_names.forEach(function(name) {
					var audio = audios[name]
					audio.removeEventListener('ended', listener)
				})
				self._shouldStop = false;
			}
			index += 1;
		}, TEXT_SPEED)
	}
	UI.prototype.stopText = function() {
		var self = this;
		self._shouldStop = true;
		self.CurText && self.CurText.remove();
		self.TalkGroup.setVisible(false);
	}
})();
