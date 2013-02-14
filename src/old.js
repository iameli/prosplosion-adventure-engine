
var ghostImg = new Image();
ghostImg.onload = function() {

    
    var ghost = new Kinetic.Sprite({
        x: 200,
        y: 200,
        image: ghostImg,
        animation: 'idle',
        animations: ghostAnim,
        frameRate : 4,
        scale: 0.3
    })
    
    var Skepto = {};
    Skepto.toX = 200;
    Skepto.toY = 200;
    Skepto.walkTo = function(x, y) {
        Skepto.toX = x;
        Skepto.toY = y;
    }
    Skepto.step = function() {
        var x = ghost.getX();
        var y = ghost.getY();
        if (Skepto.toX != ghost.getX() || Skepto.toY != ghost.getY()) {
            
            if (x < Skepto.toX) {
                if (ghost.getAnimation() != 'walkRight') {
                    ghost.setAnimation('walkRight');
                }
                ghost.setX(x+1);
            }
            else if (x > Skepto.toX) {
                if (ghost.getAnimation() != 'walkLeft') {
                    ghost.setAnimation('walkLeft');
                }
                ghost.setX(x-1); 
            }
            if (y < Skepto.toY) ghost.setY(y+1);
            else if (y > Skepto.toY) ghost.setY(y-1);
        }
        else {
            if (ghost.getAnimation() != 'idle') {
                ghost.setAnimation('idle');
            }
        }
        
    }
    
    
    
    window.Skepto = Skepto;

    
    window.ghost = ghost;
    
    var stage = new Kinetic.Stage({
        container : 'container',
        width : 1024,
        height : 768
    });
    
    var bgLayer = new Kinetic.Layer();
    var layer = new Kinetic.Layer();
    
    var bg = new Kinetic.Rect({
        x : 0,
        y : 0,
        width: stage.getWidth(),
        height: stage.getHeight(),
        fill: "black"
    });
    
    var simpleText = new Kinetic.Text({
        x : stage.getWidth() / 2,
        y : 15,
        text : 'Simple Text',
        fontSize : 30,
        fontFamily : 'Verlag',
        fill : 'green'
    });
    
    window.st = simpleText;
    
    bg.on('mousemove', function(event) {
        simpleText.setText("x: " + event.layerX + " y: " + event.layerY);
        stage.draw();
    });
    
    bg.on('click', function(event) {
        Skepto.walkTo(event.layerX, event.layerY);
    })
    
    bgLayer.add(bg);
    
    var rect = new Kinetic.Rect({
        x : 239,
        y : 75,
        width : 100,
        height : 50,
        fill : 'green',
        stroke : 'black',
        strokeWidth : 4
    });
    
    var blueBlob = new Kinetic.Blob({
        points : [{
            x : 73,
            y : 140
        }, {
            x : 340,
            y : 23
        }, {
            x : 500,
            y : 109
        }, {
            x : 300,
            y : 170
        }],
        stroke : 'blue',
        strokeWidth : 10,
        fill : '#aaf',
        tension : 0.8
    });
    
    
    
    blueBlob.on("click", function(evt) {
        console.log("You touched the blob!");
    });
    
    // add the shape to the layer
    layer.add(ghost);
    layer.add(simpleText);
    
    // add the layer to the stage
    stage.add(bgLayer);
    stage.add(layer);
    
    window.stage = stage;
    ghost.start();
    ghost.setAnimation('walk');
    
    layer.beforeDraw(function(frame) {
        Skepto.step();
    })
}
