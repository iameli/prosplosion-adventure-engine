/**
 * Rooms have many PAE.Layers. Don't get this confused with Kinetic.Layers.
 * 
 * Each of these maintains a Kinetic.Group that contains all the VectorSprites for its layer.
 */
goog.require("Kinetic");
goog.require("PAE.Dynamic");
goog.provide("PAE.Layer");
(function() {
    /**
     * Params accepts the following options.
     * 
     * name - required - name of the layer
     * scrollSpeed - default 1.0 - a float that represents how fast this scrolls wrt other layers
     * zIndex - default 10 - where does this layer exist wrt other layers?
     * 
     * @param {Object} params
     */
    var Layer = PAE.Layer = function(params) {
        this.attrs = {};
        this.attrs.name = params.name;
        if (!params.name) {
            throw "PAE.Layer created without a name!!";
        }
        this.attrs.scrollSpeed = params.scrollSpeed || 1.0;
        this.attrs.zIndex = params.zIndex;
        if (params.zIndex === undefined) this.attrs.zIndex = 10;
        this.group = new Kinetic.Group();
        this.dynamics = {};
    }
    /**
     * Add any kind of Kinetic.Node, or a PAE.Dynamic.
     * @param {Object} obj
     */
    Layer.prototype.add = function(obj) {
        var kNode;
        if (obj instanceof PAE.Dynamic) {
            this.dynamics[obj.name] = obj;
            kNode = obj.getSprite();
        }
        else {
            kNode = obj;
        }
        this.group.add(kNode);
    }
    /**
     * Get our Kinetic.Group.
     */
    Layer.prototype.getGroup = function() {
        return this.group;
    }
    /*
     * Get name.
     */
    Layer.prototype.getName = function() {
        return this.attrs.name;
    }
    /*
     * Set name.
     */
    Layer.prototype.setName = function(name) {
        this.attrs.name = name;
    }
    /*
     * Get scrollSpeed.
     */
    Layer.prototype.getScrollSpeed = function() {
        return this.attrs.scrollSpeed;
    }
    /*
     * Set scrollSpeed.
     */
    Layer.prototype.setScrollSpeed = function(value) {
        this.attrs.scrollSpeed = value;
    }
    /*
     * Get zIndex
     */
    Layer.prototype.getZIndex = function() {
        return this.attrs.zIndex;
    }
    /**
     * Set zIndex
     */
    Layer.prototype.setZIndex = function(z) {
        this.attrs.zIndex = z;
    }
    /**
     * Scroll to X, accounting for scroll speed.
     */
    Layer.prototype.scrollX = function(x) {
        this.group.setX(x * this.attrs.scrollSpeed);
    }
    /**
     * Scroll to Y, accounting for scroll speed.
     */
    Layer.prototype.scrollY = function(y) {
        this.group.setY(y * this.attrs.scrollSpeed);
    }
    Layer.prototype.moveToTop = function() {
        this.group.moveToTop();
    }
    Layer.prototype.getPosition = function() {
        return this.group.getPosition();
    }
})()