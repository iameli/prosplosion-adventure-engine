goog.require("PAE");
goog.provide("PAE.VectorSprite");
(function() {
    /**
     * VectorSprite code adopted from VectorJS Sprite code. MIT Licensed as follows:
     * 
	 * Copyright (C) 2011 - 2013 by Eric Rowell
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the "Software"), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
     * 
     * Sprite constructor
     * @constructor
     * @augments Kinetic.Shape
     * @param {Object} config
     * @param {String} config.animation animation key
     * @param {Object} config.animations animation map
     * @param {Integer} [config.index] animation index
     * {{ShapeParams}}
     * {{NodeParams}}
     */
    PAE.VectorSprite = function(config) {
        this._initSprite(config);
    };

    PAE.VectorSprite.prototype = {
        _initSprite: function(config) {
        	var self = this;
            this.setDefaultAttrs({
                index: 0,
                frameRate: 17
            });
            
            console.log(config);
            self.anims = [];
            PAE.Util.objEach(config.paths, function(anim, config) {
            	self.anims[anim] = [];
            	config.forEach(function(sprite) {
            		var paths = [];
            		sprite.paths.forEach(function(path) {
            			path.fill = "3F3F3F"
            			paths.push(new Kinetic.Path(path));
            		})
            		self.anims[anim].push(paths);
            	})
            })
            
            // call super constructor
            Kinetic.Shape.call(this, config);
            this.shapeType = 'VectorSprite';
            this._setDrawFuncs();

            this.anim = new Kinetic.Animation();
            var self = this;
            this.on('animationChange', function() {
                // reset index when animation changes
                self.setIndex(0);
            });
        },
        drawFunc: function(canvas) {
            var anim = this.attrs.animation, index = this.attrs.index, f = this.attrs.animations[anim][index], context = canvas.getContext(), image = this.attrs.image;

            if(image) {
            	this.anims[anim][index].forEach(function(path) {
            		path.drawFunc(canvas);
            	})
                //context.drawImage(image, f.x, f.y, f.width, f.height, 0, 0, f.width, f.height);
            }
        },
        drawHitFunc: function(canvas) {
            var anim = this.attrs.animation, index = this.attrs.index, f = this.attrs.animations[anim][index], context = canvas.getContext();

            context.beginPath();
            context.rect(0, 0, f.width, f.height);
            context.closePath();
            canvas.fill(this);
        },
        /**
         * start sprite animation
         * @name start
         * @methodOf PAE.VectorSprite.prototype
         */
        start: function() {
            var self = this;
            var layer = this.getLayer();

            /*
             * animation object has no executable function because
             *  the updates are done with a fixed FPS with the setInterval
             *  below.  The anim object only needs the layer reference for
             *  redraw
             */
            this.anim.node = layer;

            this.interval = setInterval(function() {
                var index = self.attrs.index;
                self._updateIndex();
                if(self.afterFrameFunc && index === self.afterFrameIndex) {
                    self.afterFrameFunc();
                    delete self.afterFrameFunc;
                    delete self.afterFrameIndex;
                }
            }, 1000 / this.attrs.frameRate);

            this.anim.start();
        },
        /**
         * stop sprite animation
         * @name stop
         * @methodOf PAE.VectorSprite.prototype
         */
        stop: function() {
            this.anim.stop();
            clearInterval(this.interval);
        },
        /**
         * set after frame event handler
         * @name afterFrame
         * @methodOf PAE.VectorSprite.prototype
         * @param {Integer} index frame index
         * @param {Function} func function to be executed after frame has been drawn
         */
        afterFrame: function(index, func) {
            this.afterFrameIndex = index;
            this.afterFrameFunc = func;
        },
        _updateIndex: function() {
            var i = this.attrs.index;
            var a = this.attrs.animation;
            if(i < this.attrs.animations[a].length - 1) {
                this.attrs.index++;
            }
            else {
                this.attrs.index = 0;
            }
        }
    };
    Kinetic.Global.extend(PAE.VectorSprite, Kinetic.Shape);

    // add getters setters
    Kinetic.Node.addGettersSetters(PAE.VectorSprite, ['animation', 'animations', 'index']);

    /**
     * set animation key
     * @name setAnimation
     * @methodOf PAE.VectorSprite.prototype
     * @param {String} anim animation key
     */

    /**
     * set animations object
     * @name setAnimations
     * @methodOf PAE.VectorSprite.prototype
     * @param {Object} animations
     */

    /**
     * set animation frame index
     * @name setIndex
     * @methodOf PAE.VectorSprite.prototype
     * @param {Integer} index frame index
     */

    /**
     * get animation key
     * @name getAnimation
     * @methodOf PAE.VectorSprite.prototype
     */

    /**
     * get animations object
     * @name getAnimations
     * @methodOf PAE.VectorSprite.prototype
     */

    /**
     * get animation frame index
     * @name getIndex
     * @methodOf PAE.VectorSprite.prototype
     */
})();
