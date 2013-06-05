goog.provide("Tests.Unit.PolyPath");
(function() {
    PAE.test({
        'PolyPath': function() {
            var points = [{x: 0, y: 0}, {x: 100, y: 0}, {x: 200, y: 0}, {x: 200, y: 200}, {x: 100, y: 100}, {x: 0, y: 100}];
            var poly = new PAE.PolyPath({points: points});
            this.assertEquals(points, poly.getPoints(), "getPoints()");
            this.assertEquals(poly.getLines(), [
                [{x: 0, y: 0}, {x: 100, y: 0}],
                [{x: 100, y: 0}, {x: 200, y: 0}],
                [{x: 200, y: 0}, {x: 200, y: 200}],
                [{x: 200, y: 200}, {x: 100, y: 100}],
                [{x: 100, y: 100}, {x: 0, y: 100}],
                [{x: 0, y: 100}, {x: 0, y: 0}]
            ], 'getLines()')
            this.done();
        },
        'PolyPath bottom mode' : function() {
            var points = [{x: 0, y: 0}, {x: 100, y: 0}, {x: 200, y: 100}, {x: 200, y: 200}, {x: 100, y: 100}, {x: 0, y: 100}];
            var poly = new PAE.PolyPath({points: points, mode: 'bottom'});
            this.assertEquals(poly.getPoint({x: 50, y: 50}),   {x: 50, y: 100},   'Point on straight line works');
            this.assertEquals(poly.getPoint({x: 150, y: 100}), {x: 150, y: 150}, 'Point on diagonal surface works');
            this.assertEquals(poly.getPoint({x: 300, y: 300}), null,            'Point outside of object yields null');
            this.done();
        }
    });
})();