/**
 * PolyPath maintains a polygon that automatically does pathing information for what's within it. 
 */
goog.provide("PAE.PolyPath");
(function() {
	var PolyPath = PAE.PolyPath = function(params) {
		var self = this;
		self.attrs = params;
		self.layer = new Kinetic.Group();
		self.polygon = new Kinetic.Polygon({
			points: self.attrs.points,
			opacity: "0.5"
		})
		self.layer.add(self.polygon)
	}
	PolyPath.prototype.debug = function(on) {
		var self = this;
		if (on === true) {
			self.polygon.setFill('red');
			self.polygon.setOpacity(0.5);
			var points = self.attrs.points;
			self.debugGroup = new Kinetic.Group();
			var lineGroup = self.lineGroup = new Kinetic.Group();
			var squareGroup = self.squareGroup = new Kinetic.Group();
			self.debugGroup.add(lineGroup);
			self.debugGroup.add(squareGroup);
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
				squareGroup.add(rect);
				lineGroup.add(line);
				prevPoint = coord;
			})
			squareGroup.moveToTop();
			self.debugGroup.moveToTop();
		}
		else {
			if (self.debugGroup) {
				self.lineGroup.remove();
				self.squareGroup.remove();
				self.debugGroup.remove();
			}
			self.polygon.setOpacity(0.0);
		}
	}
	PolyPath.prototype.getPoints = function() {
		return self.polygon.getPoints();
	}
})();