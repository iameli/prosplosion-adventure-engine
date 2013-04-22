/**
 * Dynamics are everything in a level that's not static. Everything that's a clickable or moves or anything is dynamic.
 */
goog.require("PAE");
goog.require("PAE.Talker");
goog.require("PAE.VectorSprite");
goog.provide("PAE.Dynamic");
(function() {
	var Dynamic = PAE.Dynamic = function(params) {
		var self = this;
		var game = PAE.curGame;
		var attrs = self.attrs = game.getDynamicData(params.id); //Get the sprite definition
		if (!attrs) throw "Dynamic with id '" + params.id + "' not found!"
		PAE.Util.objEach(params, function(key, val) { //and copy in any specific info from this istance.
			attrs[key] = val;
		})
		self.uid = game.uid();
		var svg_list = {};
		/**
		 * Get all the SVG data from the game.
		 */
		PAE.Util.objEach(attrs.vectorAnimations, function(anim, frames) {
			svg_list[anim] = [];
			frames.forEach(function(frame) {
				svg_list[anim].push(game.resources.getSVG(frame));
			})
		})
		//Create the sprite
		var s = self.sprite = new PAE.VectorSprite({
			x : attrs.x,
			y : attrs.y,
			width: attrs.width,
			height: attrs.height,
			animation : attrs.defaultAnimation,
			frameRate : attrs.frameRate,
			scale : attrs.scale,
			vectorAnimations: svg_list,
			listening: attrs.listening
		});
		//Init talker functionality.
		self._talkerInit(self, attrs, params.game);
		//Init onClick functionality.
		var onClick = attrs.onClick || function(e){};
		onClick.prototype.game = PAE.curGame;
		onClick.prototype.dynamic = self;
		s.on('click', function(e) {
			PAE.EventMgr.trigger(new PAE.Event({
				name: 'sprite-clicked.' + self.uid,
				item: null
			}))
		})
		//Init onClick with item functionality.
		s.on('mousedown', function(e) {
			var listener = PAE.EventMgr.on('item-action', function(e) {
				PAE.EventMgr.off(listener);
				PAE.EventMgr.trigger(new PAE.Event({
					name: 'sprite-clicked',
					id: self.uid,
					item: e.item
				}))
			})
			setTimeout(function() { //TODO: This is a bit of a hack.
				PAE.EventMgr.off(listener);
			}, 100);
		})
		PAE.EventMgr.on("sprite-clicked."+self.uid, function(e) {
			new onClick(e);
		})
	}
	/**
	 * Fire it up.
	 */
	Dynamic.prototype.initalize = function(callback) {
		var self = this;
		self.sprite.initalize(function() {
			self.sprite.start();
			callback();
		})
	}
	/**
	 * Return the offset location of the foot, as well as the width and height of 
	 * the sprite (they're calculated as a side-effect anyway)
	 */
	Dynamic.prototype.getDimensions = function() {
		var self = this;
		var animName = self.sprite.getAnimation();
		var anim = self.sprite.getAnimations()[animName][0];
		var scale = self.sprite.getScale();
		var width = Math.floor(self.attrs.width * scale.x);
		var footX = Math.floor(width/2);
		var footY = Math.floor(self.attrs.height * scale.y);
		return {footX: footX, footY: footY, height: footY, width:width}
	}
	/**
	 * Get the position of my feet.
	 */
	Dynamic.prototype.getFootPosition = function() {
		var self = this;
		var dimensions = this.getDimensions();
		var pos = self.sprite.getPosition();
		return {x: pos.x + dimensions.footX, y: pos.y + dimensions.footY};
	}
	/**
	 * Use the character's walking animation (if any) to move to another place.
	 * @param {Object} x
	 * @param {Object} y
	 */
	Dynamic.prototype.walkTo = function(x, y, done, callback) {
		var self = this;
		PAE.EventMgr.trigger(new PAE.Event({
			name: 'sprite-walking',
			uid: self.uid
		}))
		var foot = self.getDimensions();
		x -= foot.footX;
		y -= foot.footY;
		var curX = self.sprite.getX();
		var curY = self.sprite.getY();
		var dxs = (curX - x) * (curX - x);
		var dys = (curY - y) * (curY - y);
		var dist = Math.sqrt(dxs + dys);
		if (self.attrs.vectorAnimations.walkLeft && self.attrs.vectorAnimations.walkRight) {
			if (x < curX) {
				self.sprite.setAnimation('walkLeft');
			} else {
				self.sprite.setAnimation('walkRight');
			}
		} else if (self.attrs.vectorAnimations.walk) {
			self.sprite.setAnimation('walk');
		}
		self.sprite.transitionTo({
			x: x,
			y: y,
			duration: dist / self.attrs.speed,
			callback: function() {
				if (done !== false) {
					PAE.EventMgr.trigger(new PAE.Event({
						name: 'sprite-walking-done',
						uid: self.uid
					}))
					self.sprite.setAnimation('idle');
				}
				callback && callback();
			}
		})
	}
	/**
	 * Remove this thing from the world.
	 */
	Dynamic.prototype.remove = function() {
		var self = this;
		self.sprite.remove();
	}
	/**
	 * Get uid.
	 */
	Dynamic.prototype.getUID = function() {
		return this.uid;
	}
	/**
	 * Get name.
	 */
	Dynamic.prototype.getId = function() {
	    return this.attrs.id;
	}
	PAE.Global.extend(PAE.Dynamic, PAE.Talker);
})();
