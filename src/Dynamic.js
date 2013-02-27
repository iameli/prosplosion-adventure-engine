/**
 * Dynamics are everything in a level that's not static. Everything that's a clickable or moves or anything is dynamic.
 */
goog.require("PAE");
goog.require("PAE.Talker");
goog.require("PAE.Static");
goog.provide("PAE.Dynamic");
(function() {
	var Dynamic = PAE.Dynamic = function(params) {
		var self = this;
		var game = PAE.curGame;
		var spriteInstance = self.SpriteInstance = params;
		var spriteDef = self.SpriteDef = game.getDynamicData(self.SpriteInstance.id);
		var img = self.Img = game.Resources.getImage(spriteDef.image);
		var s = self.Sprite = new Kinetic.Sprite({
			x : spriteInstance.x,
			y : spriteInstance.y,
			image : img,
			animation : spriteDef.defaultAnimation,
			animations : spriteDef.animations,
			frameRate : spriteDef.frameRate,
			scale : spriteInstance.scale
		});
		self.speed = spriteDef.speed || 200;
		self.animations = spriteDef.animations;
		self._talkerInit(self, spriteDef, params.game);
		self.onClick = params.onClick;
		if (params.onClick) {
			self.onClick.prototype.game = PAE.curGame;
			s.on('click', function(e) {
				new self.onClick(self);
			})
		}
	}
	Dynamic.prototype.init = function() {
		var self = this;
		self.Sprite.start();
	}
	/**
	 * Use the character's walking animation (if any) to move to another place.
	 * @param {Object} x
	 * @param {Object} y
	 */
	Dynamic.prototype.walkTo = function(x, y) {
		var self = this;
		var animName = self.Sprite.getAnimation();
		var anim = self.Sprite.getAnimations()[animName][0];
		var scale = self.Sprite.getScale();
		var footX = Math.floor((anim.width/2) * scale.x);
		var footY = Math.floor(anim.height * scale.y);
		x -= footX;
		y -= footY;
		var curX = self.Sprite.getX();
		var curY = self.Sprite.getY();
		var dxs = (curX - x) * (curX - x);
		var dys = (curY - y) * (curY - y);
		var dist = Math.sqrt(dxs + dys);
		if (self.animations.walkLeft && self.animations.walkRight) {
			if (x < curX) {
				self.Sprite.setAnimation('walkLeft');
			} else {
				self.Sprite.setAnimation('walkRight');
			}
		} else if (self.animations.walk) {
			self.Sprite.setAnimation('walk');
		}
		self.Sprite.transitionTo({
			x : x,
			y : y,
			duration : dist / self.speed,
			callback : function() {
				self.Sprite.setAnimation('idle');
			}
		})
	}
	/**
	 * Remove this thing from the world.
	 */
	Dynamic.prototype.remove = function() {
		var self = this;
		self.Sprite.remove();
	}
	PAE.Global.extend(PAE.Dynamic, PAE.Talker);
})();
