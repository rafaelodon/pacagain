var DEVELOPMENT_MODE = 1;
var touch = {}; 

window.onload = function(){    

    document.onkeydown = keyDown;
    document.body.addEventListener('touchstart', onTouchStart, false)
    document.body.addEventListener('touchend', onTouchEnd, false);

    Game.setCanvas(document.getElementById("canvas"));
    Game.resetAll();        
    Loop.run(Game);
}

function keyDown(e) {

    e = e || window.event;
    
    if(DEVELOPMENT_MODE == 1){
        if (e.keyCode == '80') { //P = pause game loop            
            Loop.togglePausePlay(); 
            return;
        }else if(e.keyCode == '190'){ //> = next game loop            
            Loop.loop(Loop.lastTime + 1000/Loop.fps);
            return;
        }
    }

    if(e.keyCode){
        if(Game.continueOnKeyOrTouch()){
            return;
        }
    }

    if (e.keyCode == '38') { //up
        window.scrollTo(0,0);
        e.preventDefault();
        Game.moveUp();
    } else if (e.keyCode == '40') { //down
        window.scrollTo(0,0);
        e.preventDefault();
        Game.moveDown();
    } else if (e.keyCode == '37') { //left
        window.scrollTo(0,0);
        e.preventDefault();
        Game.moveLeft();
    } else if (e.keyCode == '39') { //right
        window.scrollTo(0,0);
        e.preventDefault();
        Game.moveRight();
    } else if (e.keyCode == '32') { //space
        e.preventDefault();
        Game.select();
    } else if (e.keyCode == '27') { //esc
        e.preventDefault();
        Game.escape();
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
 *
 * - Improve Canvas performance:
 *   https://www.html5rocks.com/en/tutorials/canvas/performance/
 */