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
            
            self.vectorAnimations = config.vectorAnimations;
            self.cachedVectorAnimations = {};
            
            
            // call super constructor
            Kinetic.Shape.call(this, config);
            this.shapeType = 'VectorSprite';
            this._setDrawFuncs();

            this.anim = new Kinetic.Animation();
            this.on('animationChange', function() {
                // reset index when animation changes
                self.setIndex(0);
            });
            PAE.EventMgr.on("scale-changed", function(e) {
            	self.cacheSVG();
            })
            self.cacheSVG();
        },
        drawFunc: function(canvas) {
        	var self = this;
            var anim = this.attrs.animation, index = this.attrs.index, f = this.attrs.animations[anim][index], context = canvas.getContext(), image = this.attrs.image;
			var cached = this.cachedVectorAnimations[anim][index];
            if(cached) {
            	context.drawImage(cached, 0, 0, this.attrs.width, this.attrs.height);
            }
        },
        cacheSVG: function() {
        	var self = this;
        	PAE.Util.objEach(this.vectorAnimations, function(anim, animlist) {
        		self.cachedVectorAnimations[anim] = {};
        		animlist.forEach(function(svg, index) {
	        		self.cachedVectorAnimations[name] = {}
		        	//Hi. I'm a really horrible hack to turn scaled vectors into images so's that 
		        	//they can be cached. I'm emulating the behavior of the context here and it's
		        	//real ugly. I've just worked on this all day and need to move on to something else.
		        	//Implications: You may adjust the scale of Dynamics. You may adjust the scale of the
		        	//stage at-large. You may not ajust scale anywhere else or so help me god I will end you.
		        	//TODO FIXME OH PLEASE
					self.cachedVectorAnimations[anim][index] = false; //cache started, hasn't finished
					var scale = PAE.curGame.Stage.getScale();
					var scaleX = scale.x * self.attrs.scale.x;
					var scaleY = scale.y * self.attrs.scale.y;
					var width = Math.round(self.attrs.width * scaleX);
					var height = Math.round(self.attrs.height * scaleY);
					var canvas = new Kinetic.SceneCanvas(width, height, 1);
					context = canvas.getContext();
		    		context.save();
		    		context.drawSvg(svg, 0, 0, width, height);
		    		context.restore();
					var data = canvas.toDataURL(0, 0); //i'm sorry
					Kinetic.Type._getImage(data, function(image) {
						self.cachedVectorAnimations[anim][index] = image;
					})
        		})
			})
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
