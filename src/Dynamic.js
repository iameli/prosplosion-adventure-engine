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
        scale: {type: 'float', def: 1.0},
        layer: {type: 'string'},
        listening: {type: 'boolean', def: false}
    }
	var Dynamic = PAE.Dynamic = function(params) {
		var self = this;
		PAE.Util.setAttrs(self, dynamicStruct, params);
		var attrs = self.attrs;
		var game = PAE.curGame;
		var def = game.getDynamicDefinition(params.id); //Get the sprite definition
		if (!def) throw "Dynamic with id '" + params.id + "' not found!"
		var imports = ['width', 'height', 'defaultAnimation', 'frameRate', 'vectorAnimations', 'speed', 'onClick', 'talkNoises'];
		imports.forEach(function(attrib) {
		    if (self.attrs[attrib] === null || self.attrs[attrib] === undefined) {
		        self.attrs[attrib] = def.attrs[attrib];
		    }
		})
		if (params.onClick) {
		    this.onClick = new PAE.Script(params.onClick);
		}
		else {
		    this.onClick = new PAE.Script({script: function(){}})
		}
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
		    if (self.onClick) {
		        self.onClick.run({
		            game: game,
		            room: PAE.curGame.curRoom //FIXME
		        })
		    }
		})
	}
	/**
	 * Fire it up.
	 */
	Dynamic.prototype.initalize = function(callback) {
		var self = this;
		self.sprite.initalize(function() {
			self.sprite.start();
			callback && callback();
		})
	}
	/**
	 * WE OUT
	 */
	Dynamic.prototype.shutdown = function() {
	    this.sprite.stop();
	    this.sprite.remove();
	    delete this.sprite;
	}
	/**
	 * Returns whether this Dynamic is getting Listening events.
	 */
	Dynamic.prototype.getListening = function() {
	    return this.attrs.listening;
	}
	/**
	 * Set whether this Dynamic responds to click events.
	 */
	Dynamic.prototype.setListening = function(listening) {
	    this.attrs.listening = PAE.Util.ensureBool(listening);
	    if (this.sprite) {
	        this.sprite.setListening(this.attrs.listening);
	    }
	}
	/**
	 * Return the offset location of the foot, as well as the width and height of 
	 * the sprite (they're calculated as a side-effect anyway)
	 */
	Dynamic.prototype.getDimensions = function() {
		var self = this;
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
	 * Save this sprite's position so it spawns here next time.
	 */
	Dynamic.prototype.savePosition = function() {
	    this.setX(this.sprite.getX());
	    this.setY(this.sprite.getY());
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
		var tween = new Kinetic.Tween({
		    node: self.sprite,
		    x: x,
            y: y,
            duration: dist / self.attrs.speed,
            onFinish: function() {
                if (done !== false) {
                    if (self.sprite) { //TODO: this is a hack. should unregister the tween when the room changes.
                        PAE.EventMgr.trigger(new PAE.Event({
                            name: 'sprite-walking-done',
                            uid: self.uid
                        }))
                        self.sprite.setAnimation('idle');
                    }
                }
                callback && callback();
            }
		})
		tween.play();
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
     * Get onClick Script 
     */
    Dynamic.prototype.getOnClick = function() {
        return this.onClick;
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
    Dynamic.prototype.getScale = function(scale) {
        return this.attrs.scale;
    }
    Dynamic.prototype.setScale = function(scale) {
        this.attrs.scale = PAE.Util.ensureFloat(scale);
        if (this.sprite) {
            this.sprite.setScale({x: scale, y: scale});
        }
    }
    /**
     * Get a static image representation of this object as a data string. Frame 0 of default animation.
     */
    Dynamic.prototype.getImage = function() {
        return this.sprite.toImage().src;
    }
    Dynamic.prototype.getAttrs = function() {
        var dump = PAE.Util.dumpAttrs(dynamicStruct, this.attrs);
        dump.onClick = this.onClick.getAttrs();
        return dump;
    }
    PAE.Util.addSetters(Dynamic, ['id', 'x', 'y', 'layer']);
    PAE.Util.addGetters(Dynamic, ['x', 'y', 'layer']);
	PAE.Global.extend(PAE.Dynamic, PAE.Talker);
})();
