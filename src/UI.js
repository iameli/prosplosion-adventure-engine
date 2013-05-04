/**
 * Games are the root object for a game.
 */
goog.require("PAE");
goog.provide("PAE.UI");
(function() {
	var TEXT_SPEED = 50;
	var UI = PAE.UI = function(params, parent) {
		var self = this;
		var width = 1024;
		var height = 768;
		var overlayGroup = self.overlayGroup = new Kinetic.Group ({
			x: 0,
			y: 0,
			width: width,
			height: height
		})
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
	    var inventoryGroup = self.inventoryGroup = new Kinetic.Group({
	    	x : 18,
	    	y : 650,
	    	width: 1000,
	    	height: 100
	    });
	    self.renderInventory();
	    talkGroup.add(rect);
	    rect.on('click', function(e) {
	    	self.stopText();
	    })
	    self.Group.add(overlayGroup);
	    self.Group.add(talkGroup);
	    self.Group.add(inventoryGroup);
	    talkGroup.moveToTop();
	    overlayGroup.moveToTop();
	    self._shouldStop = false;
	    PAE.EventMgr.on("playText", function(e) {
	    	self.stopText();
	    	self.playText(e)
    	});
    	PAE.EventMgr.on("gave-item", function(e) {
    		self.renderInventory();
    	})
    	PAE.EventMgr.on("removed-item", function(e) {
    		self.renderInventory();
    	})
    	PAE.EventMgr.on("item-action", function(e) {
    		self.renderInventory();
    	})
    	PAE.EventMgr.on("item-clicked", function(e) {
    		var self = this;
			var itemBox = e.itemBox;
			var item = e.item;
			var x = e.layerX;
			var y = e.layerY;
			itemBox.simulate('mousedown');
			itemBox.on('dragend', function(e) {
				PAE.EventMgr.trigger(new PAE.Event({
					name: 'item-action',
					item: item
				}))
				itemBox.remove();
			})
    	})
	}
	/**
	 * Get the item data from the game and render the 
	 * bar at the bottom of the screen.
	 */
	UI.prototype.renderInventory = function() {
		var self = this;
		var game = PAE.curGame
		var inv = game.inventory;
		self.inventoryGroup.removeChildren();
		for (var i = 0; i < 9; i++) { (function() { //This one took me forever to figure out. for loops are not closures. effing JS.
			var x = (111 * i);
			var y = 0;
			var rect = new Kinetic.Rect({
				x : x,
				y : y,
				width: 100,
				height : 100,
				fill : 'black',
				cornerRadius: 5,
	    		opacity: 0.75
			})
			self.inventoryGroup.add(rect);
			if (i < inv.length) { //this slot should be filled
				var itemName = game.inventory[i];
				var item = game.getItem(itemName);
				var width = 90;
				var height = 90;
				var svg_list = {};
				PAE.Util.objEach(item.vectorAnimations, function(anim, frames) {
					svg_list[anim] = [];
					frames.forEach(function(frame) {
						svg_list[anim].push(game.resources.getSVG(frame));
					})
				})
				var itemBox = new PAE.VectorSprite({
					x: x + 5,
					y: y + 5,
					width: item.width,
					height: item.height,
					listening: false,
					vectorAnimations: svg_list,
					animation : item.defaultAnimation,
					draggable: true
				});
				rect.on('click', function(e) {
					PAE.EventMgr.trigger(new PAE.Event({
						name: 'item-clicked',
						item: itemName,
						itemBox: itemBox
					}))
				})
				self.inventoryGroup.add(itemBox);
				itemBox.moveToTop();
				itemBox.initalize(function() {
					
				})
			}
		})()} //<3 you JS
	}
	/**
	 * Plays some text with audio.
	 */
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
		if (a_names[0]) audios[a_names[0]].play();
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
