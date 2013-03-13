var Walkable = function() {
	
}
Walkable.prototype.buildWalkGraph = function() {
	var self = this;
	var points = self.walkablePoly.getPoints()
	var convexHull = getConvexHull(points);
	var concaveLines = [];
	var concavePoints = [];
	var prevPoint = points[points.length - 1]
	self.graph = new AStarGraph()
	for(var i = 0; i<points.length; i+=1){
		var point = points[i];
		if (convexHull.indexOf(point) === -1) { // this is a concave point
			concavePoints.push(point)
			self.graph.add(point[0], point[1], 0)
			concaveLines.push([point, prevPoint])
		}
		else if (convexHull.indexOf(prevPoint) === -1) { // last one was a concave point
			concaveLines.push([point, prevPoint])
		}
		prevPoint = point;
	}
	self.concaveLines = concaveLines;
	
	concavePoints.forEach(function(p1){
		concavePoints.forEach(function(p2){
			if self.lineOfSight(p1, p2) {
				self.graph.addConnection(p1, p2);
			}
		})
	})
}
// Given p1 and p2, find if this crosses any interior lines.
// unpredictable results if given points outside the poly.
// dont you dare.
// can take wither two points or a list of points
Walkable.prototype.lineOfSight = function(p1, p2) {
	var self = this;
	
	var ret = true;
	self.concaveLines.forEach(function(line){ // optimize me
		if (intersects([p1, p2], line) ret = false
	})
	return ret
}

var intersects(l1, l2) {
	var x1 = l1[0][0], y1=l1[0][1]
	var x2 = l1[1][0], y2=l1[1][1]
	var x3 = l2[0][0], y3=l2[0][1]
	var x4 = l2[1][0], y4=l2[1][1]
    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    if (isNaN(x)||isNaN(y)) {
        return false;
    } else {
        if (x1>=x2) {
            if (!(x2<=x&&x<=x1)) {return false;}
        } else {
            if (!(x1<=x&&x<=x2)) {return false;}
        }
        if (y1>=y2) {
            if (!(y2<=y&&y<=y1)) {return false;}
        } else {
            if (!(y1<=y&&y<=y2)) {return false;}
        }
        if (x3>=x4) {
            if (!(x4<=x&&x<=x3)) {return false;}
        } else {
            if (!(x3<=x&&x<=x4)) {return false;}
        }
        if (y3>=y4) {
            if (!(y4<=y&&y<=y3)) {return false;}
        } else {
            if (!(y3<=y&&y<=y4)) {return false;}
        }
    }
    return true;
}



