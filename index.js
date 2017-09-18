var DEVELOPMENT_MODE = 1;

var SOUNDS = {
    beep : new Audio("sound/beep.wav"),  
    hit: new Audio("sound/hit.wav"),
    jump: new Audio("sound/jump.wav"),
    collect: new Audio("sound/collect.wav"),
    die: new Audio("sound/die.wav"),
    over: new Audio("sound/over.wav"),    
    win: new Audio("sound/win.wav"),
    bg1: new Audio("sound/bg1.wav"),
    bg2: new Audio("sound/bg2.wav"),
}

//Levels objects described in levels.js
var LEVELS = [LEVEL1, LEVEL2, LEVEL3, LEVEL4, LEVEL5, LEVEL6];

var touch = {}; 

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x+r, y);
    this.arcTo(x+w, y,   x+w, y+h, r);
    this.arcTo(x+w, y+h, x,   y+h, r);
    this.arcTo(x,   y+h, x,   y,   r);
    this.arcTo(x,   y,   x+w, y,   r);
    this.closePath();
    return this;
}    

window.onload = function(){    

    initializeSounds();        
    
    document.onkeydown = keyDown;
    document.body.addEventListener('touchstart', onTouchStart, false)
    document.body.addEventListener('touchend', onTouchEnd, false);

    Game.setCanvas(document.getElementById("canvas"));
    Game.resetAll();        
    Game.run();
}

function initializeSounds(){
    var replay = function() {        
        this.currentTime = 0.09;        
        this.play();
    };

    SOUNDS.bg1.addEventListener('ended', replay, false);
    SOUNDS.bg2.addEventListener('ended', replay, false);    
}

function keyDown(e) {

    e = e || window.event;
    
    if(DEVELOPMENT_MODE == 1){
        if (e.keyCode == '80') { //P = pause game loop            
            Game.togglePausePlay(); 
            return;
        }else if(e.keyCode == '190'){ //> = next game loop
            Game.loop();
            return;
        }
    }

    if (e.keyCode == '38') { //up
        Game.moveUp();
    } else if (e.keyCode == '40') { //down
        Game.moveDown();
    } else if (e.keyCode == '37') { //left
        Game.moveLeft();
    } else if (e.keyCode == '39') { //right
        Game.moveRight();
    }

    if(e.keyCode){
        Game.continueOnKeyOrTouch();    
    }
}

function onTouchStart(e){
    Game.continueOnKeyOrTouch();
    touch.x = e.changedTouches[0].pageX;
    touch.y = e.changedTouches[0].pageY;
}

function onTouchEnd(e){        
    var dx = e.changedTouches[0].pageX - touch.x;
    var dy = e.changedTouches[0].pageY - touch.y;
    if (dx*dx > dy*dy){
        if(dx > 0){
            Game.moveRight();
        }else{
            Game.moveLeft();
        }
    }else{
        if(dy > 0){
            Game.moveDown();
        }else{
            Game.moveUp();
        }
    }
}

/**
 * TODO List:
 * Game loop:
 *  - http://nokarma.org/2011/02/02/javascript-game-development-the-game-loop/index.html
 * Canvas Performance:
 *  - https://www.html5rocks.com/en/tutorials/canvas/performance/
 */