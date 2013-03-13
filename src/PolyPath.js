/**
 * PolyPath maintains a polygon that automatically does pathing information for what's within it. 
 */
goog.provide("PAE.PolyPath");
(function() {
	var PolyPath = PAE.PolyPath = function(params) {
		var self = this;
		self.debugGroup = new Kinetic.Group();
		self.attrs = params;
		self.pathingData = new Kinetic.Group();
		self.layer = new Kinetic.Group();
		self.polygon = new Kinetic.Polygon({
			points: self.attrs.points,
			opacity: "0.5"
		})
		self.lineGroup = new Kinetic.Group();
		self.squareGroup = new Kinetic.Group();
		self.debugGroup.add(self.lineGroup);
		self.debugGroup.add(self.squareGroup);
		self.layer.add(self.debugGroup)
		self.layer.add(self.polygon)
	}
	/**
	 * Activate debug mode. The polygon may be easily moved around. Right-clicking on a line makes a new point, middle-clicking an existing point deletes it. 
	 */
	PolyPath.prototype.debug = function(on) {
		var self = this;
		if (on === true) {
			self.polygon.setFill('red');
			self.polygon.setOpacity(0.5);
			var points = self.attrs.points;

			self.layer.add(self.debugGroup);
			var prevPoint = self.attrs.points[self.attrs.points.length - 1];
			points.forEach(function(coord, idx) {
				var line = new Kinetic.Line({
					points: [coord, prevPoint],
					stroke: 'yellow',
					strokeWidth: 10,
					lineCap: 'round',
					opacity: 0.0
				})
				line.on('click', function(e) {
					if (e.button == 2) {
						var pos = PAE.Util.relativePosition({x: e.layerX, y: e.layerY}, line);
						self.attrs.points.splice(idx, 0, pos);
						self.debug(false);
						self.debug(true);
					}
				})
				var rect = new Kinetic.Rect({
					x: coord.x - 5,
					y: coord.y - 5,
					width: 11,
					height: 11,
					fill: "green",
					draggable: true,
					opacity: 0.5
				})
				rect.on("dragend", function(e) {
					self.attrs.points[idx] = {x: rect.getX() + 5, y: rect.getY() + 5}
					self.debug(false);
					self.debug(true);
				})
				rect.on("click", function(e) {
					if (e.button == 1 && self.attrs.points.length > 3) {
						self.attrs.points.splice(idx, 1)
						self.debug(false);
						self.debug(true);
					}
				})
				self.squareGroup.add(rect);
				self.lineGroup.add(line);
				prevPoint = coord;
			})
			self.squareGroup.moveToTop();
			self.debugGroup.moveToTop();
		}
		else {
			self.squareGroup.removeChildren();
			self.lineGroup.removeChildren();
			self.polygon.setOpacity(0.0);
		}
	}
	/**
	 * Display pathfinding data.
	 */
	PolyPath.prototype.displayPathing = function(on) {
		var self = this;
		if (on === true) {
			self.concaveLines.forEach(function(line) {
				self.pathingData.add(new Kinetic.Line({
					points: line,
					stroke: 'blue',
					strokeWidth: 6,
					lineCap: 'round'
				}))
			})
			self.sightLines.forEach(function(line) {
				self.pathingData.add(new Kinetic.Line({
					points: line,
					stroke: 'yellow',
					strokeWidth: 2,
					lineCap: 'round',
					dashArray: [10, 5],
					listening: false
				}))
			})
			self.concavePoints.forEach(function(point) {
				self.pathingData.add(new Kinetic.Rect({
					x: point.x - 3,
					y: point.y - 3,
					width: 5,
					height: 5,
					fill: 'red'
				}))
			})
		}
		else {
			self.pathingData.removeChildren();
		}
	}
	/**
	 * Calculate the walking graph.
	 * 
	 * SLOW. But easily cached.
	 */
	PolyPath.prototype.buildWalkGraph = function() {
		var self = this; 
		var points = self.attrs.points.slice(0);
		var convexHull = self.getConvexHull(points);
		var concaveLines = [];
		var concavePoints = self.concavePoints = [];
		var prevPoint = points[points.length - 1];
		self.astar = new gamlib.AStarMap();
		for(var i = 0; i<points.length; i+=1){(function() {
			var point = points[i];
			if (!_.findWhere(convexHull, point)) { // this is a concave point
				if (!point.node) {
					point.node = new gamlib.AStarNode(point.x, point.y, 0);
					self.astar.add(point.node);
				}
				concavePoints.push({x: point.x, y: point.y, node: point.node})
				concaveLines.push([point, prevPoint])
				if (prevPoint.node) {
					point.node.connect(prevPoint.node);
				}
			}
			else if (!_.findWhere(convexHull, prevPoint)) { // last one was a concave point
				concaveLines.push([point, prevPoint])
			}
			prevPoint = point;
		})();}
		self.concaveLines = concaveLines;
		self.sightLines = concaveLines.slice();
		concavePoints.forEach(function(p1){
			concavePoints.forEach(function(p2){
				if (p1.x != p2.x || p1.y != p2.y) {
					if (!_.findWhere(self.sightLines, [p1, p2]) && !_.findWhere(self.sightLines, [p2, p1])) { // No duplicates!
						if (self.lineOfSight(p1, p2)) { //border lines are automatically sight lines
							self.sightLines.push([p1, p2]);
							p1.node.connect(p2.node, true);
						}
					}
				}
			})
		})
	}
	/**
	 * Returns the most efficient path from a to b.
	 * 
	 * Returns a list of points that get you from a to b, INCLUSIVE.
	 */
	PolyPath.prototype.getPath = function(a, b) {
		var self = this;
		if (self.lineOfSight(a, b)) return [a, b];
		var n1 = new gamlib.AStarNode(a.x, a.y, 0);
		var n2 = new gamlib.AStarNode(b.x, b.y, 0);
		var removals = []
		self.astar.add(n1); //Do I need to do this?
		self.astar.add(n2);
		self.concavePoints.forEach(function(point) {
			if (self.lineOfSight(a, point)) {
				removals.push({remove: n1, from: point.node})
				n1.connect(point.node);
			}
			if (self.lineOfSight(b, point)) {
				removals.push({remove: n2, from: point.node})
				n2.connect(point.node);
			}
		})
		var astarpath = self.astar.find(n1, n2);
		var ret = [];
		astarpath.forEach(function(node) {
			var x = node.position.x;
			var y = node.position.y;
			self.pathingData.add(new Kinetic.Rect{
				x: x - 5,
				y: y - 5,
				width: 12,
				height: 12,
				fill: 'green'
			})
			ret.push({x: x, y: y});
		})
		removals.forEach(function(r) {
			r.from.disconnect(r.remove, true);
		});
		self.astar.remove(n1);
		self.astar.remove(n2);
		return ret;
	}
	var buildConvexHull = function(baseLine, points) {
	    var convexHullBaseLines = new Array();
	    var t = findMostDistantPointFromBaseLine(baseLine, points);
	    if (t.maxPoint.length) { // if there is still a point "outside" the base line
	        convexHullBaseLines = 
	            convexHullBaseLines.concat( 
	                buildConvexHull( [baseLine[0],t.maxPoint], t.newPoints) 
	            );
	        convexHullBaseLines = 
	            convexHullBaseLines.concat( 
	                buildConvexHull( [t.maxPoint,baseLine[1]], t.newPoints) 
	            );
	        return convexHullBaseLines;
	    } else {  // if there is no more point "outside" the base line, the current base line is part of the convex hull
	        return [baseLine];
	    }    
	}
	
	var getDistant = function(cpt, bl) {
	    var Vy = bl[1][0] - bl[0][0];
	    var Vx = bl[0][1] - bl[1][1];
	    return (Vx * (cpt[0] - bl[0][0]) + Vy * (cpt[1] -bl[0][1]))
	}
	
	
	var findMostDistantPointFromBaseLine = function(baseLine, points) {
	    var maxD = 0;
	    var maxPt = new Array();
	    var newPoints = new Array();
	    for (var idx in points) {
	        var pt = points[idx];
	        var d = getDistant(pt, baseLine);
	        
	        if ( d > 0) {
	            newPoints.push(pt);
	        } else {
	            continue;
	        }
	        
	        if ( d > maxD ) {
	            maxD = d;
	            maxPt = pt;
	        }
	    
	    } 
	    return {'maxPoint':maxPt, 'newPoints':newPoints}
	}
	
	
	var toObjs = function(list) {
		var out = [];
		list.forEach(function(pt) {
			out.push(toObj(pt));
		});
		return out;
	}
	var toLists = function(list) {
		var out = [];
		list.forEach(function(pt) {
			out.push(toList(pt));
		});
		return out;
	}
	var toObj = function(pt) {
		return {x: pt[0], y: pt[1]}
	}
	var toList = function(pt) {
		return [pt.x, pt.y];
	}
	// var intersects = PolyPath.prototype.intersects = function(l1, l2) {
		// var x1 = l1[0].x, y1=l1[0].y
		// var x2 = l1[1].x, y2=l1[1].y
		// var x3 = l2[0].x, y3=l2[0].y
		// var x4 = l2[1].x, y4=l2[1].y
	    // var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
	    // var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
	    // if (isNaN(x)||isNaN(y)) {
	        // return false;
	    // } else {
	        // if (x1>=x2) {
	            // if (!(x2<=x&&x<=x1)) {return false;}
	        // } else {
	            // if (!(x1<=x&&x<=x2)) {return false;}
	        // }
	        // if (y1>=y2) {
	            // if (!(y2<=y&&y<=y1)) {return false;}
	        // } else {
	            // if (!(y1<=y&&y<=y2)) {return false;}
	        // }
	        // if (x3>=x4) {
	            // if (!(x4<=x&&x<=x3)) {return false;}
	        // } else {
	            // if (!(x3<=x&&x<=x4)) {return false;}
	        // }
	        // if (y3>=y4) {
	            // if (!(y4<=y&&y<=y3)) {return false;}
	        // } else {
	            // if (!(y3<=y&&y<=y4)) {return false;}
	        // }
	    // }
	    // return true;
	// }
	var intersects = function(l1, l2) {
		var a = l1[0];
		var b = l1[1];
		var c = l2[0];
		var d = l2[1];
	    var denominator = ((b.x - a.x) * (d.y - c.y)) - ((b.y - a.y) * (d.x - c.x));
	 
	    if (denominator == 0)
	    {
	        return false;
	    }
	 
	    var numerator1 = ((a.y - c.y) * (d.x - c.x)) - ((a.x - c.x) * (d.y - c.y));
	     
	    var numerator2 = ((a.y - c.y) * (b.x - a.x)) - ((a.x - c.x) * (b.y - a.y));
	 
	    if (numerator1 == 0 || numerator2 == 0)
	    {
	        return false;
	    }
	 
	    var r = numerator1 / denominator;
	    var s = numerator2 / denominator;
	 
	    return (r > 0 && r < 1) && (s > 0 && s < 1);
	}
	PolyPath.prototype.lineOfSight = function(p1, p2) {
		var self = this
		return (function() {
			var line;
			for(var i = 0; i<self.concaveLines.length; i++) {
				line = self.concaveLines[i];
				if (intersects([p1, p2], line)) {
					return false;
				}
			}
			var midpoint = {x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2};
			return self.isPointInWalkable(midpoint);
		})();
	}
	var printLine = function(line) {
		return "(" + line[0].x + ", " + line[0].y + ") --> (" + line[1].x + ", " + line[1].y + ")";
	}
	var printPoint = function(point) {
		return "(" + point.x + ", " + point.y + ")"
	}
	/**
	 * Is a given point in a polygon? Find out next week!
	 */
	PolyPath.prototype.isPointInWalkable = function(pt) {
		var self = this;
		var poly = self.attrs.points;
		for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
			((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
			&& (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
			&& (c = !c);
		return c;
	}
	/**
	 * Get the convex hull of the points inputted.
	 * @param {Object} thePoints in {x: 0, y: 0} format
	 */ 
	PolyPath.prototype.getConvexHull = function(thePoints) {
		var points = toLists(thePoints);
	    //find first baseline
	    var maxX, minX;
	    var maxPt, minPt;
	    for (var idx in points) {
	        var pt = points[idx];
	        if (pt[0] > maxX || !maxX) {
	            maxPt = pt;
	            maxX = pt[0]; 
	        }
	        if (pt[0] < minX || !minX) {
	            minPt = pt;
	            minX = pt[0];
	        }
	    }
	    var ch = [].concat(buildConvexHull([minPt, maxPt], points),
	                       buildConvexHull([maxPt, minPt], points))
	    var outpoints = [];
	    ch.forEach(function(line) {
	    	outpoints.push(line[0])
	    })
	    return toObjs(outpoints);
	}

})();