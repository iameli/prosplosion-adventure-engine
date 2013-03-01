/**
 * Dynamics are everything in a level that's not static. Everything that's a clickable or moves or anything is dynamic.
 * 
 * Contains one ugly jQuery hack.
 */
goog.require("PAE");
goog.require("PAE.Talker");
goog.require("PAE.Static");
goog.require("PAE.VectorSprite");
goog.provide("PAE.Dynamic");
(function() {
	var Dynamic = PAE.Dynamic = function(params) {
		var self = this;
		var game = PAE.curGame;
		self.uid = game.uid();
		var spriteInstance = self.SpriteInstance = params;
		var spriteDef = self.SpriteDef = game.getDynamicData(self.SpriteInstance.id);
		var img = self.Img = game.Resources.getImage(spriteDef.image);
		var svgList = spriteDef.vectorAnimations;
		var vectorAnimations = {};
		PAE.Util.objEach(svgList, function(anim, frames) {
			vectorAnimations[anim] = [];
			frames.forEach(function(frame) {
				vectorAnimations[anim].push(game.Resources.getSVG(frame));
			})
		})
		var s = self.Sprite = new PAE.VectorSprite({
			x : spriteInstance.x,
			y : spriteInstance.y,
			width: spriteDef.width,
			height: spriteDef.height,
			image : img,
			animation : spriteDef.defaultAnimation,
			animations : spriteDef.animations,
			frameRate : spriteDef.frameRate,
			scale : spriteInstance.scale,
			vectorAnimations: vectorAnimations
		});
		self.speed = spriteDef.speed || 200;
		self.animations = spriteDef.animations;
		self._talkerInit(self, spriteDef, params.game);
		self.onClick = params.onClick || function(e){};
		self.onClick.prototype.game = PAE.curGame;
		self.onClick.prototype.sprite = self;
		s.on('click', function(e) {
			PAE.EventMgr.trigger(new PAE.Event({
				name: 'sprite-clicked.' + self.uid,
				item: null
			}))
		})
		s.on('mousedown', function(e) {
			if ($(e.srcElement).hasClass('kinetic-drag-and-drop-layer')) { //It'd be nice to find a more elegant way to do this, but.
				var listener = PAE.EventMgr.on('item-action', function(e) {
					PAE.EventMgr.off(listener);
					PAE.EventMgr.trigger(new PAE.Event({
						name: 'sprite-clicked.' + self.uid,
						item: e.item
					}))
				})
			}
		})
		PAE.EventMgr.on("sprite-clicked."+self.uid, function(e) {
			new self.onClick(e);
		})
	}
	Dynamic.prototype.init = function() {
		var self = this;
		self.Sprite.start();
	}
	/**
	 * Return the offset location of the foot, as well as the width and height of the sprite (they're calculated as a side-effect anyway)
	 */
	Dynamic.prototype.getDimensions = function() {
		var self = this;
		var animName = self.Sprite.getAnimation();
		var anim = self.Sprite.getAnimations()[animName][0];
		var scale = self.Sprite.getScale();
		var width = Math.floor(anim.width * scale.x);
		var footX = Math.floor(width/2);
		var footY = Math.floor(anim.height * scale.y);
		return {footX: footX, footY: footY, height: footY, width:width}
	}
	/**
	 * Use the character's walking animation (if any) to move to another place.
	 * @param {Object} x
	 * @param {Object} y
	 */
	Dynamic.prototype.walkTo = function(x, y) {
		var self = this;
		PAE.EventMgr.trigger(new PAE.Event({
			name: 'sprite-walking',
			uid: self.uid
		}))
		var foot = self.getDimensions();
		x -= foot.footX;
		y -= foot.footY;
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
			x: x,
			y: y,
			duration: dist / self.speed,
			callback: function() {
				PAE.EventMgr.trigger(new PAE.Event({
					name: 'sprite-walking-done',
					uid: self.uid
				}))
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
