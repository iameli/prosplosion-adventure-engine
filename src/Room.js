/**
 * Games are the root object for a game.
 */
goog.require("PAE");
goog.require("PAE.Dynamic");
goog.require("PAE.Layer");
goog.require("PAE.PolyPath");
goog.provide("PAE.Room");
(function() {
	var WIDTH = 1024;
	var HEIGHT = 768;
	var XBUFFER = 250; //defining these as constants just so's we can edit later if need be
	var YBUFFER = 150;
	var roomStruct = {
	    name: {type: 'string'},
	    bgColor: {type: 'string', def: 'black'},
	    follow: {type: 'string'},
	    height: {type: 'int', def: 1024},
	    width: {type: 'int', def: 768},
	    walkable: {type: 'object', def: {"points":[{"x":0,"y":0},{"x":970,"y":24},{"x":1010,"y":758},{"x":10,"y":757}]}},
	    onEnter: {type: 'function', def: function(){}}
	}
	var Room = PAE.Room = function(params) {
		var self = this;
		self.dynamics = {};
		self.layers = {};
		var attrs = self.attrs = params;
		self.layer = new Kinetic.Group() //TODO I'd like this to be a layer someday.
		self.group = new Kinetic.Group();
		self.layer.add(self.group);
		self.leftBorder = PAE.curGame.leftOffset / PAE.curGame.scale
	};
	/**
	 * Call initalize after the layer has been added to the stage.
	 * We can't do this stuff in the constructor because we don't really know what
	 * we're working with yet.
	 */
	Room.prototype.initalize = function(callback) {
		var self = this;

		//Layer creation
		self.layers = {};
		var makeLayers = _.clone(self.attrs.layers);
		
		//Add the internal and debug layers.
        makeLayers.push({name: '_zeroBG', zIndex: -1, scrollSpeed: 0.0});
        makeLayers.push({name: '_walkable', zIndex: 0, scrollSpeed: 1.0});
        makeLayers.push({name: '_debug', zIndex: 101, scrollSpeed: 1.0});
		makeLayers.forEach(function(layerDef) {
		    var layer = new PAE.Layer(layerDef);
		    self.addLayer(layer, false);
		})
	
		
		//Add the background square
		var bg = self.zeroRect = new Kinetic.Rect({ //TODO: make this screen-sized but not scrolling
	        x : 0,
	        y : 0,
	        width: self.attrs.width,
	        height: self.attrs.height,
	        fill: self.attrs.bgColor
	    });
	    this.layers._zeroBG.add(bg);
	    
	    var walkFunc = function(e) {
	        console.log("walkFunc")
	        var normalE = PAE.curGame.translateClick(e);
	    	if (self.attrs.follow && e.button != 1) {
	    		var player = self.getDynamic(self.attrs.follow);
	    		var rpos = self.layers._walkable.getPosition();
	    		var x = normalE.x - rpos.x;
	    		var y = normalE.y - rpos.y;
	    		var path = self.walkable.getPath(player.getFootPosition(), {x: x, y: y})
	    		var idx = 1;
	    		var next = function() {
	    			var x = path[idx].x;
	    			var y = path[idx].y;
	    			if (idx + 1 >= path.length) {
	    				player.walkTo(x, y, true);
	    			}
	    			else {
	    				idx += 1;
	    				player.walkTo(x, y, false, next);
	    			}
	    		}
	    		next();
			}
		}
	    //Set up walkability clickable
	    if (self.attrs.walkable) {
	    	var walkable = self.walkable = new PAE.PolyPath(self.attrs.walkable);
	    	self.layers._walkable.add(walkable.layer)
	    	walkable.layer.on('click', walkFunc);
	    }
	    else {
	    	bg.on('click', walkFunc);
	    }
	    
	    //Add all Dynamics
	    this.spriteIdx = {};
	    self.attrs.dynamics.forEach(function(dyn) {
	    	self.addDynamic(dyn);
	    })

	    //This sorts the layers by z-index then runs moveottop on them.
	    //Needed because I can't start to fathom how KineticJS handles
	    //setZIndex. 
	    this.sortLayers();
	    
	    self.walkResponder = PAE.EventMgr.on('sprite-walking', function(e) {
	    	var sprite = self.spriteIdx[e.uid];
	    	if (sprite && self.attrs.follow == sprite) { //If the player is moving
	    		var l = self.group.getLayer();
	    		l.on('beforeDraw', function(e) {
			         self.centerOn(sprite);
	    		})
	    		var ender = self.walkEnder = PAE.EventMgr.on('sprite-walking-done', function(e) {
					var sprite = self.spriteIdx[e.uid];
					if (sprite && self.attrs.follow == sprite) {
						l.off('beforeDraw');
						PAE.EventMgr.off(ender);
					}
				})
	    	}
	    })
	    var done = function() {
	    	var game = PAE.curGame;
	    	var onEnter = self.attrs.onEnter || function(e){};
	    	onEnter.prototype.game = game;
	    	onEnter.prototype.dynamics = self.getDynamics();
	    	onEnter.prototype.room = self;
	    	new onEnter();
	    	self.scrollX(self.leftBorder * -1);
	    	if (self.attrs.follow) {
		    	self.centerOn(self.attrs.follow);
		    }
		    PAE.EventMgr.trigger(new PAE.Event({
		    	name: 'room-initalized',
		    	id: self.attrs.name,
		    	room: self
		    }))
		    callback && callback();
	    }
	    var dyns = self.getDynamics().length;
	    if (dyns == 0) done();
	    self.getDynamics().forEach( function(dynamic) {
	    	dynamic.initalize(function() {
	    		dyns -= 1;
	    		if (dyns == 0) done();
	    	})
	    });
	    /**
	     * Only can drag with the middle mouse button in debug mode.
	     */
	    this.group.on('dragstart', function(e) {
	        e.cancelBubble = true;
	    })
	    self.walkable.buildWalkGraph();
	}
	/**
	 * WE OUT
	 */
	Room.prototype.shutdown = function() {
	    this.group.getLayer().off('beforeDraw');
	    PAE.EventMgr.off(this.walkResponder);
	    delete this.walkResponder;
	    if (this.walkEnder) {
	        PAE.EventMgr.off(this.walkEnder);
	        delete this.walkEnder;
	    }
	    this.getDynamics().forEach(function(d) {
	        d.shutdown();
	    })
	}
	/**
	 * Kinetic z-indexing is scary! Tell all our layers
	 * to move to top in order.
	 */	
	Room.prototype.sortLayers = function() {
	    _.sortBy(this.layers, function(layer){
            return layer.getZIndex();
        }).forEach(function(layer) {
            layer.moveToTop();
        })
	}
	/**
	 * Enable room scrolling, lines at borders, some other stuff.
	 */
	Room.prototype.roomDebug = function(yes) {
	    if (yes) {
	        this.debugLayer = new Kinetic.Group();
	        this.layers['_debug'].add(this.debugLayer);
	        this.group.setDraggable(true);
	        this.drawBorderLines();
	    }
	    else {
	        if (this.debugLayer) {
    	        this.debugLayer.remove();
    	        delete this.debugLayer;
    	    }
    	    this.group.setDraggable(false);
    	    this.group.setPosition({x: 0, y: 0});
	    }
	}
	/**
	 * If debug mode is enabled, draw a red line around the broder of the room.
	 */
	Room.prototype.drawBorderLines = function() {
	    if (this.debugLayer !== undefined) {
	        if (this.crazyLine) {
	            this.crazyLine.remove();
	            delete this.crazyLine;
	        }
	        this.crazyLine = new Kinetic.Line({
                points: [{x:-1, y:-1}, {x:-1, y: this.attrs.height + 1}, {x: this.attrs.width + 1, y:this.attrs.height + 1}, {x: this.attrs.width + 1, y: -1}, {x:-1, y:-1}],
                stroke: 'red',
                strokeWidth: 1,
                lineCap: 'square',
                lineJoin: 'square'
            });
            this.debugLayer.add(this.crazyLine);
	    }
	}
	/**
	 * Set room width.
	 */
	Room.prototype.setWidth = function(width) {
	    this.attrs.width = PAE.Util.ensureInt(width);
	    this.zeroRect.setWidth(width);
	    this.drawBorderLines();
	}
	/**
	 * Set room height.
	 */
	Room.prototype.setHeight = function(height) {
	    this.attrs.height = PAE.Util.ensureInt(height);
	    this.zeroRect.setHeight(height);
	    this.drawBorderLines();
	}
	/**
	 * Add a Dynamic to this room.
	 * @param {Object} name
	 * @param {Object} sprite
	 */
	Room.prototype.addDynamic = function(def, initalize) {
		var self = this;
		var name = def.name;
		var s = new PAE.Dynamic(def);
	    self.layers[def.layer].add(s);
	    var uid = s.getUID();
	    self.spriteIdx[uid] = name;
	    if (initalize === true) {
	        s.initalize();
	    }
	}
	/**
	 * Remove this dynamic.
	 */
	Room.prototype.removeDynamic = function(dyn) {
	    if (typeof name == 'string') dyn = this.getDynamic(dyn);
	    var l = this.layers[dyn.getLayer()];
	    l.removeDynamic(dyn.getName());
	}
	/**
	 * Scroll the window to center on on a certain dynamic.
 	 * @param {Object} dynamic
	 */
	Room.prototype.centerOn = function(dynamic_name) {
		var self = this;
		var dynamic = self.getDynamic(dynamic_name);
		var sprite = dynamic.sprite;
		var spos = sprite.getPosition();
		var dimensions = dynamic.getDimensions();
		var sx = spos.x;
		var sy = spos.y;
		var rpos = self.layers._walkable.getPosition();
		var rx = rpos.x;
		var ry = rpos.y;
		if ((rx + sx) < XBUFFER) { //room too far left
			self.scrollX(XBUFFER - sx);
		}
		else if ((WIDTH - sx - rx - dimensions.width) < XBUFFER) { //room too far right
			self.scrollX(WIDTH - sx - dimensions.width - XBUFFER)
		}
		if ((ry + sy) < YBUFFER) { //Room too far up
            self.scrollY(YBUFFER - sy)
		}
		else if ((HEIGHT - sy - ry - dimensions.height) < YBUFFER) { //room too far down
			self.scrollY(HEIGHT - sy - dimensions.height - YBUFFER)
		}
	}
	/**
	 * Get the coordinates of the current midpoint of the screen.
	 * 
	 * This is where newly inserted Dynamics end up.
	 */
	Room.prototype.getMid = function() {
	    var rpos = this.layers._walkable.getPosition();
        var x = (WIDTH/2) - rpos.x;
        var y = (HEIGHT/2) - rpos.y;
        return {x: x, y: y};
	}
	/**
	 * Scroll the background frame to the given X, accounting for background paralax.
	 */
	Room.prototype.scrollX = function(newx) {
		var self = this;
		var righty = (self.leftBorder + 1024) - this.attrs.width;
		if (newx < righty) newx = righty
		else if (newx > (self.leftBorder * -1)) {newx = (self.leftBorder * -1)}
		_.each(self.layers, function(layer) {
			layer.scrollX(newx);
		})
	}
	/**
	 * Scroll the foreground frame to the given Y, accounting for background paralax. 
	 */
	Room.prototype.scrollY = function(newy) {
		var self = this;
        _.each(self.layers, function(layer) {
            layer.scrollY(newy);
        })
	}
	/**
	 * Turn on walkable debug.
 	 * @param {Object} on
	 */
	Room.prototype.walkableDebug = function(on) {
		var self = this;
		if (on) {
			self.walkable.layer.moveTo(self.layers._debug);
			self.walkable.debug(true);
		}
		else {
			self.walkable.debug(false);
			self.walkable.layer.moveTo(self.layers._walkable);
			self.walkable.displayPathing(false);
		}
	}
	/**
	 * Display pathfinding debug information.
     * @param {Object} on
	 */
	Room.prototype.pathingDebug = function(on) {
		var self = this;
		if (on) {
			self.layers._debug.add(self.walkable.pathingData);
			self.walkable.displayPathing(true);
			if (self.attrs.follow) {
			    var dyn = self.getDynamic(self.attrs.follow);
			    self.walkable.renderSightLines(dyn.getFootPosition());
			}
		}
		else {
			self.walkable.displayPathing(false);
			self.walkable.pathingData.remove();
		}
	}
	/**
	 * Rebuild the pathfinding graph.
	 */
	Room.prototype.rebuildPathfinding = function() {
	    var self = this;
	    self.walkable.buildWalkGraph();
	}
    /**
     * Get layers.
     */
    Room.prototype.getLayers = function() {
        return _.toArray(this.layers);
    }
	/**
	 * Get the dynamics in this room. 
	 */
    Room.prototype.getDynamics = function() {
        return _.toArray(this.getDynamicMap());
    }
    /**
     * Get an object mapping names to dynamics.
     */
	Room.prototype.getDynamicMap = function() {
	    var layerDyns = _.map(this.layers, function(layer) {return layer.getDynamics()});
	    var ret = _.reduce(layerDyns, function(left, right) {return _.extend(left, right)}, {});
	    return ret;
	}
	/**
	 * Get a certain dynamic.
	 */
	Room.prototype.getDynamic = function(name) {
	    return this.getDynamicMap()[name];
	}
	/**
	 * Set the background color of the room.
     * @param {Object} color
	 */
	Room.prototype.setBgColor = function(color) {
	    var self = this;
	    self.zeroRect.setFill(color);
	    self.attrs.bgColor = color;
	}
    /**
     * Add a layer. If it's a debug layer or something, save = false.
     */
    Room.prototype.addLayer = function(l, save) {
        if (this.layers[l.getName()]) throw ("This room already has a layer named " + l.getName());
        this.layers[l.getName()] = l;
        if (save !== false) this.attrs.layers.push(l.attrs);
        this.group.add(l.getGroup());
        if (this.layers._walkable) { //new layers need to get correctly positioned wrt the scrolling
            var pos = this.layers._walkable.getPosition();
            l.scrollX(pos.x);
            l.scrollY(pos.y);
        }
    }
    /**
     * Remove a layer.
     */
    Room.prototype.removeLayer = function(name) {
        var layer = this.layers[name];
        if (!layer) throw ("Can't delete layer '" + name + "', doesn't exist.");
        var dynamics = _.filter(this.getDynamics(), function(dyn) {
            return (dyn.getLayer() === name)
        })
        if (dynamics.length > 0) {
            var names = _.map(dynamics, function(dyn) {
                return dyn.getName();
            })
            throw ("Can't remove populated layer. Dynamics still in this layer: " + names.join(", "))
        }
        if (!PAE.Util.removeObj(this.attrs.layers, layer.attrs)) throw ("Layer not found in room attributes. Perhaps it's a debug layer?");
        layer.remove();
        delete this.layers[name];
    }
    /**
     * Save this room.
     */
    Room.prototype.getAttrs = function() {
        var attrs = PAE.Util.dumpAttrs(roomStruct, this.attrs);
        var ls = _.filter(this.layers, function(l, name) {
            return (name.slice(0, 1) !== "_")
        })
        attrs.layers = PAE.Util.collectionAttrs(ls);
        attrs.dynamics = PAE.Util.collectionAttrs(this.getDynamics());
        attrs.walkable = this.walkable.getAttrs();
        return attrs;
    }
    Room.prototype.getWalkable = function() {
        return this.walkable;
    }
	PAE.Util.addGetters(PAE.Room, ['name', 'bgColor', 'width', 'height']);
	PAE.Util.addSetters(PAE.Room, ['name']);
})(); 