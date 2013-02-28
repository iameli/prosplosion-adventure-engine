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
            self.paths = [];
            config.paths.forEach(function(path) {
            	path.x = 0;
            	path.y = 0;
            	path.stroke = '#555';
          		path.strokeWidth = 1;
          		path.fill= '#eee',
          		path.data = 'M69,1.65c-2.134,1.233-4.95,1.667-8.45,1.3l-0.75,0.2c2.4,2.733,4.4,5.917,6,9.55c1.134,2.533,2.217,5.7,3.25,9.5c0.267,1,1.117,3.983,2.55,8.95c1.267,4.833,1.9,8.217,1.9,10.15c0,0.833-0.333,2.617-1,5.35V69.9c-1.967,4.267-3.25,9.916-3.85,16.949c-0.801,9.5-1.434,15.351-1.9,17.551c-1.667,7.933-7.65,15.666-17.95,23.199c-4.133,3-8.3,5.434-12.5,7.301c-4.033,1.833-7.216,2.75-9.55,2.75c-6.067,0-10.633-2.334-13.7-7c-0.966-1.467-1.783-3.167-2.45-5.101c-0.467-1.7-0.75-2.666-0.85-2.899c-0.367-0.7-2.05-3.301-5.05-7.801c-2.2-3.3-3.417-5.949-3.65-7.949c-0.533-4.367-0.867-10.767-1-19.2C0.017,79.934,0,75.833,0,75.4c0-3.767,0.25-7.067,0.75-9.9c1.067-5.9,1.733-9.85,2-11.85c0.367-3.3,1.2-6.95,2.5-10.95c0.267-0.867,0.383-2.65,0.35-5.35c-0.033-2.333,0.267-4.05,0.9-5.15C10,26.267,13.833,21.167,18,16.9c2.533-2.633,5.2-4.95,8-6.95C32.833,5.083,40.333,2,48.5,0.7c6.3-1,12.983-0.934,20.05,0.2L69,1.65z M63.5,12.15c-1.8-3.6-4.134-6.683-7-9.25l-5.45-0.2c-0.833,0.033-1.684,0.117-2.55,0.25C39.967,3.983,31.35,8.267,22.65,15.8c-1.667,1.434-3.217,2.9-4.65,4.4c-1.967,2.066-3.717,4.183-5.25,6.35c-2.6,3.733-4.1,6.934-4.5,9.6C7.883,38.617,6.7,44.833,4.7,54.8C2.9,64.467,2,71.283,2,75.25c0,3.767,0.083,7.816,0.25,12.15c0.167,4.333,0.25,9.166,0.25,14.5c0,2.433,0.85,5.25,2.55,8.449c0.967,1.867,2.617,4.733,4.95,8.601c0.267,0.467,0.783,1.85,1.55,4.149c0.8,2.301,1.567,4.134,2.3,5.5c2.533,4.567,6.25,6.851,11.15,6.851c8.067,0,16.833-4.533,26.3-13.601c3.667-3.533,6.834-7.199,9.5-11c2.5-3.633,3.917-6.449,4.25-8.449c0.134-0.767,0.667-6.351,1.601-16.75c0.6-6.733,1.883-12.15,3.85-16.25V46.15c0.233-1.1,0.4-1.95,0.5-2.55c0.2-1.1,0.3-1.9,0.3-2.4c0-2.333-0.583-5.55-1.75-9.65c-1.399-4.533-2.333-7.816-2.8-9.85C65.884,18.033,64.8,14.85,63.5,12.15z M41.9,41.3c0.066,0.233,0.1,0.6,0.1,1.1c0,0.067-0.517,2.55-1.55,7.45c-0.967,4.533-1.283,7.4-0.95,8.6v7.2c-0.333,0.2-0.667,0.367-1,0.5c-0.8-1.033-1.283-2.617-1.45-4.75C37.017,61.067,37,59.283,37,56.05c0-2.433,0.3-5.167,0.9-8.2c0.9-4.567,2.2-6.883,3.9-6.95C41.8,40.933,41.833,41.067,41.9,41.3z M18.5,45.3c0.167-0.566,0.767-0.867,1.8-0.9c0,0.167,0.45,3.55,1.35,10.15C22.55,61.417,23,65.7,23,67.4c0,0.5-0.1,0.9-0.3,1.2c-0.133,0.167-0.35,0.433-0.65,0.8l-0.55,0.25c-0.7-2.3-1.4-6.634-2.1-13c-0.6-5.367-0.9-8.767-0.9-10.2C18.4,45.95,18.4,45.567,18.5,45.3z M18.25,97C18.083,96.9,18,96.583,18,96.05c0-0.333,0.5-0.8,1.5-1.399c6.967,0.1,13.067-0.584,18.3-2.051c6.134-1.733,13.533-2.8,22.2-3.199v-0.25c0.467,0.199,0.8,0.533,1,1c-0.8,0.767-3.816,1.483-9.05,2.149c-6.667,0.867-10.816,1.5-12.45,1.9c-3.2,0.767-4.883,1.166-5.05,1.2c-2.167,0.366-7.317,0.949-15.45,1.75C18.6,97.083,18.35,97.033,18.25,97z'
            	console.log(path);
            	var p = new Kinetic.Path(p);
            	self.paths.push(p);
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
            	this.paths.forEach(function(path) {
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
