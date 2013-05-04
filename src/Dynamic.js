/**
 * Dynamics are everything in a level that's not static. Everything that's a clickable or moves or anything is dynamic.
 */
goog.require("PAE");
goog.require("PAE.Talker");
goog.require("PAE.VectorSprite");
goog.provide("PAE.Dynamic");
(function() {
    var dynamicStruct = {
        name: {type: 'string'},
        id: {type: 'string'},
        x: {type: 'int'},
        y: {type: 'int'},
        scale: {type: 'float', def: null},
        layer: {type: 'string'},
        onClick: {type: 'function', def: function(e){}}
    }
	var Dynamic = PAE.Dynamic = function(params) {
		var self = this;
		PAE.Util.setAttrs(self, dynamicStruct, params);
		var attrs = self.attrs;
		var game = PAE.curGame;
		var def = game.getDynamicDefinition(params.id); //Get the sprite definition
		if (!def) throw "Dynamic with id '" + params.id + "' not found!"
		var imports = ['width', 'height', 'defaultAnimation', 'frameRate', 'vectorAnimations', 'speed', 'listening', 'onClick', 'talkNoises'];
		imports.forEach(function(attrib) {
		    if (self.attrs[attrib] === null || self.attrs[attrib] === undefined) {
		        self.attrs[attrib] = def.attrs[attrib];
		    }
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
		this.sprite.remove();
	}
	/**
	 * Get this sprite.
	 */
	Dynamic.prototype.getSprite = function() {
	    return this.sprite;
	}
	/**
	 * Get uid.
	 */
	Dynamic.prototype.getUID = function() {
		return this.uid;
	}
	/**
	 * Get ID.
	 */
	Dynamic.prototype.getId = function() {
	    return this.attrs.id;
	}
	/**
	 * Get name.
	 */
	Dynamic.prototype.getName = function() {
	    return this.attrs.name;
	}
	/**
     * Set name.
     */
    Dynamic.prototype.setName = function(name) {
        this.attrs.name = name;
    }
    /**
     * Get layer
     */
    Dynamic.prototype.getLayer = function(name) {
        return this.attrs.layer;
    }
    /**
     * Set whether we can drag this dude around for game creation purposes.
     */
    Dynamic.prototype.setDraggable = function(yes) {
        if (yes) {
            this.sprite.setDraggable(yes);
            this.sprite.setListening(true);
        }
        else {
            this.sprite.setDraggable(false);
            this.sprite.setListening(this.attrs.listening);
        }
    }
    /**
     * Get a static image representation of this object as a data string. Frame 0 of default animation.
     */
    Dynamic.prototype.getImage = function() {
        return this.sprite.toImage().src;
    }
    Dynamic.prototype.getAttrs = function() {
        return PAE.Util.dumpAttrs(dynamicStruct, this.attrs);
    }
    PAE.Util.addSetters(Dynamic, ['id', 'x', 'y', 'scale', 'layer', 'onClick']);
	PAE.Global.extend(PAE.Dynamic, PAE.Talker);
})();
