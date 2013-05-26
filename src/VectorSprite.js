/**
 * Completely rewritten not-dumb VectorSprite class. 
 */
goog.provide("PAE.VectorSprite");
goog.require("canvg");
(function() {
    var VectorSprite = PAE.VectorSprite = function(params) {
        this.frameRate = params.frameRate;
        this.vectorAnimations = params.vectorAnimations;
        this.cachedVectorAnimations = {};
        this.curAnim = params.animation;
        this.frameCounts = {};
        this.animIndex = 0;
        Kinetic.Shape.call(this, params);
        this._setDrawFuncs();
    }
    /**
     * draw VectorSprite
     * @param {Canvas} canvas on which to draw
     */
    VectorSprite.prototype.drawFunc = function(canvas) {
        var context = canvas.getContext();
        var cached = this.cachedVectorAnimations[this.curAnim][this.animIndex];
        context.drawImage(cached, 0, 0, this.attrs.width, this.attrs.height);
    }
    /**
     * initalize the VectorSprite by caching its svgs
     * @param {Object} callback upon complete initalization
     */
    VectorSprite.prototype.initalize = function(callback) {
        this._cacheSVG(callback);
    }
    /**
     * cache all the SVG files as images
     */
    VectorSprite.prototype._cacheSVG = function(callback) {
        var self = this;
        var total = 0;
        _.each(this.vectorAnimations, function(animlist, anim) {
            total += animlist.length;
            self.frameCounts[anim] = animlist.length;
            self.cachedVectorAnimations[anim] = {};
            animlist.forEach(function(svg, index) {
                //Hi. I'm a really horrible hack to turn scaled vectors into images so's that 
                //they can be cached. I'm emulating the behavior of the context here and it's
                //real ugly. I've just worked on this all day and need to move on to something else.
                //Implications: You may adjust the scale of Dynamics. You may adjust the scale of the
                //stage at-large. You may not ajust scale anywhere else or so help me god I will end you.
                //TODO FIXME OH PLEASE
                self.cachedVectorAnimations[anim][index] = false; //cache started, hasn't finished
                var scale = self.getLayer().getScale();
                var sx = scale.x;
                var sy = scale.y;
                if (sx < 1.0) sx = 1.0;
                if (sy < 1.0) sy = 1.0;
                if (self.attrs.scale) {
                    sx *= self.attrs.scale.x;
                    sy *= self.attrs.scale.y;
                }
                var width = Math.round(self.attrs.width * sx);
                var height = Math.round(self.attrs.height * sy);
                var canvas = new Kinetic.SceneCanvas({width: width, height: height});
                var context = canvas.getContext();
                context.save();
                context.drawSvg(svg, 0, 0, width, height);
                context.restore();
                var data = canvas.toDataURL(0, 0); //i'm sorry
                var output = {};
                Kinetic.Util._getImage(data, function(image) {
                    total -= 1;
                    self.cachedVectorAnimations[anim][index] = image;
                    if (total == 0) callback && callback();
                })
            })
        })
    }
    /**
     * start animation of the VectorSprite
     */
    VectorSprite.prototype.start = function() {
        var self = this;
        this.animIndex = 0;
        if (this.interval) {
            this.stop();
        }
        this.interval = setInterval(function() {
            var l = self.getLayer();
            var newAnim = self.animIndex + 1;
            if (newAnim >= self.frameCounts[self.curAnim]) {
                newAnim = 0;
            }
            self.animIndex = newAnim;
            l.draw();
        }, 1000 / self.frameRate)
    }
    /**
     * stop animation of the VectorSprite
     */
    VectorSprite.prototype.stop = function() {
        if (this.interval) {
            clearInterval(this.interval);
            delete this.interval;
        }
    }
    /**
     * Get an image version of this VectorSprite.
     */
    VectorSprite.prototype.toImage = function() {
        
    }
    /**
     * Set the active animation of this VectorSprite.
     * @param {String} newAnim The new animation
     */
    VectorSprite.prototype.setAnimation = function(newAnim) {
        this.animIndex = 0;
        this.curAnim = newAnim;
    }
    Kinetic.Util.extend(PAE.VectorSprite, Kinetic.Shape);
})()