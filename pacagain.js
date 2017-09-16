/**
 * PAC-AGAIN
 * 
 * An HTML5/JS pacman revisit for learning purposes.
 * 
 * Author: Rafael Odon (odon.rafael@gmail.com)
 */

// constants
var STEP=16;
var FPS=30;
var HALF_STEP=STEP/2;
var WIDTH=25;
var HEIGHT=26;

//directions
var RIGHT = 0;
var DOWN = 1;
var LEFT = 2;
var UP = 3;

//scenes
var SCENE_INTRO = 0;
var SCENE_PRESS_ANY_KEY = 1;
var SCENE_GAME = 2;
var SCENE_GAME_OVER = 3;
var SCENE_LEVEL_COMPLETED = 4;
var SCENE_WIN  = 5;

//player states
var PLAYER_MOVING = 1;
var PLAYER_HIT = 2;
var PLAYER_DEAD = 3;
var PLAYER_COMPLETED = 4;

//ghosts states
var GHOST_CHASING = 1;
var GHOST_EXPLORING = 2;
var GHOST_STUCKED = 3;

var DIRECTIONS = [
    { dx: 1, dy: 0}, // right    
    { dx: 0, dy: 1}, // down    
    { dx: -1, dy: 0}, // left        
    { dx: 0, dy: -1}, // up    
];

var SOUNDS = {
    beep : new Audio("sound/beep.wav"),  
    PLAYER_HIT: new Audio("sound/hit.wav"),
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

//global attributes
var currentLevel = LEVELS[0];
var currentLevelNumber = 1;
var player = { x: 0, y: 0, speed: 2, direction: 0, color: "#FF0", lifes: 3, GHOST_STUCKED: false, state: PLAYER_MOVING, size: 1 };
var overlay = {};
var playing = true;
var pills = [];
var pillsCollected = 0;
var lastKeyDirection = RIGHT;
var gameInterval = undefined;
var cycle=0;
var scene = SCENE_INTRO;


window.onload = function(){    

    var replay = function() {        
        this.currentTime = 0.09;        
        this.play();
    };

    SOUNDS.bg1.addEventListener('ended', replay, false);
    SOUNDS.bg2.addEventListener('ended', replay, false);

    var canvas = document.getElementById("canvas");        

    var STEP_WIDTH = Math.floor((window.innerWidth / WIDTH) - ((window.innerWidth / WIDTH) % 4));
    var STEP_HEIGHT = Math.floor((window.innerHeight / HEIGHT) - ((window.innerHeight / HEIGHT) % 4));

    if(STEP_HEIGHT > STEP_WIDTH){
        STEP = STEP_WIDTH;                
    }else{
        STEP = STEP_HEIGHT;
    }  

    if(STEP < 16){
        STEP = 16;
    }  

    HALF_STEP = STEP / 2;

    canvas.width = WIDTH * STEP;
    canvas.height = HEIGHT * STEP;    

    var ctx = canvas.getContext("2d");  
    ctx.save();  

    document.getElementById("pause").onclick = function(){
        togglePausePlay(ctx);
    };

    document.getElementById("next").onclick = function(){
        game(ctx);
    };

    document.onkeydown = keyDown;

    resetOverlay();

    resetPills();    

    resetEnemies();    
    
    resetPlayer();    

    gameInterval = setInterval(game, 1000/FPS, ctx);     
}

function resetOverlay(){
    overlay = { 
        x: canvas.width/2,
        y: canvas.height/2,
        size : canvas.width * 1,
        opacity: 0
    };
}

function resetEnemies(){
    enemies = JSON.parse(JSON.stringify(currentLevel.enemies));
    enemies.forEach(function(enemy){
        enemy.x = enemy.gx * STEP + HALF_STEP;
        enemy.y = enemy.gy * STEP + HALF_STEP;        
    });
}

function resetPills(){
    for(var i=0; i<currentLevel.pillsCount; i++){
        var pill = generateCoordinateOnEmptySpace();
        if(pills[pill.x] === undefined){
            pills[pill.x] = new Array(WIDTH);
        }
        pills[pill.x][pill.y] = 1;        
    }
}

function game(ctx){ 

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.globalCompositeOperation='source-over';    

    ctx.beginPath();
    ctx.arc(overlay.x, overlay.y, overlay.size, 0, Math.PI*2);    
    ctx.fill();

    ctx.globalCompositeOperation='source-atop';

    if(scene == SCENE_INTRO){

        if(SOUNDS.bg1.paused){
            SOUNDS.bg1.play();
        }                
         
        drawBackground(ctx);              
        drawPacman(ctx, canvas.width / 2, canvas.height / 3, STEP * 4);
        displayText(ctx, "PAC-AGAIN", canvas.width / 2, canvas.height / 2 + STEP * 2, STEP * 3);                
        displayText(ctx, "by Rafael Odon", canvas.width / 2, canvas.height / 2 + STEP * 5, STEP * 0.75 )

        if(cycle % 30 < 15){
            displayText(ctx, "PRESS ANY KEY...", canvas.width / 2, canvas.height - STEP * 4, STEP);        
        }       
         

    }else if(scene == SCENE_PRESS_ANY_KEY){

        if(SOUNDS.bg1.paused){
            SOUNDS.bg2.pause();
            SOUNDS.bg1.play();
        }

        clearCanvas(ctx);         
        displayDarkOverlay(ctx);                       
        displayText(ctx, "LEVEL "+currentLevelNumber+" of "+LEVELS.length, canvas.width / 2, canvas.height / 4, STEP * 1.5 )
        displayText(ctx, "LIFES x "+player.lifes, canvas.width / 2, canvas.height / 3, STEP * 1.5 )
        drawGhost(ctx, canvas.width / 2, canvas.height / 5 * 3, 5, currentLevel.enemies[currentLevel.enemies.length - 1].color);

        if(cycle % 30 < 15){
            displayText(ctx, "PRESS ANY KEY...", canvas.width / 2, canvas.height - STEP * 4, STEP);        
        }

    }else if(scene == SCENE_GAME){

        if(SOUNDS.bg2.paused){
            SOUNDS.bg1.pause();
            SOUNDS.bg2.play();
        }

        clearCanvas(ctx);    
        moveAndDrawEnemies(ctx);         
        movePlayer(ctx);        
        drawPlayer(player, ctx);
        displayText(ctx, "LEVEL "+currentLevelNumber+" of "+LEVELS.length+
            "        LIFES: "+player.lifes+
            "        PILLS: "+pillsCollected+" of "+currentLevel.pillsCount,            
            canvas.width / 2, STEP, STEP);

    }else if(scene == SCENE_GAME_OVER){
        
        SOUNDS.bg1.pause();
        SOUNDS.bg2.pause();
        
        clearCanvas(ctx);   
        displayDarkOverlay(ctx);
        displayLifeCount(ctx); 
        displayText(ctx, "GAME OVER!", canvas.width / 2, canvas.height / 2, STEP * 3);
    }else if(scene == SCENE_LEVEL_COMPLETED){

        if(!SOUNDS.bg2.paused){
            SOUNDS.bg2.pause();            
            SOUNDS.win.play();
        }                

        clearCanvas(ctx);
        displayDarkOverlay(ctx);        
        displayText(ctx, "LEVEL COMPLETED!", canvas.width / 2, canvas.height / 3, STEP * 2);                
        drawPacman(ctx, canvas.width / 2, canvas.height / 5 * 3, STEP * 2);

        if(cycle % 30 < 15){
            displayText(ctx, "PRESS ANY KEY...", canvas.width / 2, canvas.height - STEP * 4, STEP);        
        }

    }else if(scene == SCENE_WIN){

        if(!SOUNDS.bg2.paused){
            SOUNDS.bg2.pause();            
            SOUNDS.win.play();
        }                

        clearCanvas(ctx);
        displayDarkOverlay(ctx);                
        displayText(ctx, "CONGRATULATIONS,", canvas.width / 2, canvas.height / 3 - STEP * 2, STEP);                
        displayText(ctx, "YOU HAVE COMPLETED ALL LEVELS!", canvas.width / 2, canvas.height / 3, STEP);                
        displayText(ctx, "THE END", canvas.width / 2, canvas.height / 2, STEP * 2);                
        drawPacman(ctx, canvas.width / 2, canvas.height / 3 * 2, STEP * 2);
    }



    doCycle();
}

function drawPacman(ctx, x, y, scale){
    ctx.fillStyle = player.color;
    ctx.beginPath();    
    ctx.arc(x, y, scale, 0, Math.PI - 0.5);       
    ctx.fill();
    ctx.beginPath(); 
    ctx.arc(x, y, scale, 0, Math.PI + 0.5, true);
    ctx.fill();
}

function togglePausePlay(ctx){  
    if(gameInterval){
        clearInterval(gameInterval);
        gameInterval = undefined;

    }else{
        gameInterval = setInterval(game, 1000/FPS, ctx);     
    }    
}

function keyDown(e) {

    e = e || window.event;

    if(scene == SCENE_GAME){    
        if (e.keyCode == '38') { //up
            lastKeyDirection = UP;
        } else if (e.keyCode == '40') { //down
            lastKeyDirection = DOWN;
        } else if (e.keyCode == '37') { //left
            lastKeyDirection = LEFT;
        } else if (e.keyCode == '39') { //right
            lastKeyDirection = RIGHT;
        } 
    }

    if(scene == SCENE_PRESS_ANY_KEY){
        scene = SCENE_GAME;
        resetEnemies();
        resetPlayer();
        playing = true;
        
    }

    if(scene == SCENE_LEVEL_COMPLETED){        
        nextLevel();      
    }

    if(scene == SCENE_INTRO){        
        scene = SCENE_PRESS_ANY_KEY;
    }
    
}

function resetPlayer(){
    player.x = canvas.width/2;
    player.y = canvas.height/2 + HALF_STEP;
    player.state = PLAYER_MOVING;
    player.size = 1;
}

function nextLevel(){
    if(currentLevelNumber < LEVELS.length){            
        currentLevel = LEVELS[currentLevelNumber];
        currentLevelNumber++;
        resetPills();
        resetEnemies();
        resetPlayer();
        pillsCollected = 0;
        playing = true;
        scene = SCENE_PRESS_ANY_KEY;
    }else{
        scene = SCENE_WIN;
    }  
}


function generateCoordinateOnEmptySpace(){
    var x=y=0;
    do{
        x = Math.floor(Math.random() * WIDTH);
        y = Math.floor(Math.random() * HEIGHT);
    }while(checkObstacle(x,y) || checkPill(x,y) || checkPlayer(x,y));
    return {x:x, y:y};
}

function clearCanvas(ctx){
    drawBackground(ctx);
    drawGrid(ctx)
    drawMap(ctx);  
    drawPills(ctx);
}

function drawBackground(ctx){
    ctx.fillStyle = "black"
    ctx.fillRect(0,0,WIDTH*STEP,HEIGHT*STEP);
}

function drawPills(ctx){    
    for(var x=0; x<WIDTH; x++){
        for(var y=0; y<HEIGHT; y++){
            if(checkPill(x, y) ==  1){
                drawPill(x, y, ctx);
            }
        }
    }
}

function drawPill(x, y, ctx){       
    ctx.fillStyle = "black"
    var value = (Math.sin(cycle * Math.PI * 2 / FPS) / 2 + 0.5) * 0xFF | 0;        
    var grayscale = (value << 16) | (value << 8) | value;
    var color = '#' + grayscale.toString(16);

    ctx.fillStyle = color;    
    ctx.beginPath();
    ctx.arc(x*STEP+HALF_STEP, y*STEP+HALF_STEP, HALF_STEP*0.3, 0, 2*Math.PI);
    ctx.arc(x*STEP+HALF_STEP, y*STEP+HALF_STEP, HALF_STEP*0.3, 0, 2*Math.PI);
    ctx.fill();
}

function drawGrid(ctx){
    ctx.strokeStyle = currentLevel.wallsColor;
    ctx.lineWIDTH = 1;
    for(var i=0; i<WIDTH; i++){        
        ctx.beginPath();
        ctx.moveTo(i*STEP,0);
        ctx.lineTo(i*STEP,HEIGHT*STEP);            
        ctx.stroke();
    }
    for(var j=0; j<HEIGHT; j++){
        ctx.beginPath();
        ctx.moveTo(0, j*STEP);
        ctx.lineTo(WIDTH*STEP, j*STEP);            
        ctx.stroke();
    }
}

function drawMap(ctx){
    for(var y=0; y<HEIGHT; y++){
        for(var x=0; x<WIDTH; x++){            
            if(checkObstacle(x,y)){
                ctx.fillStyle = currentLevel.wallsColor;
                ctx.fillRect(x*STEP,y*STEP,STEP,STEP);
            }
        }
    }
}

function checkPlayer(x,y){    
    return player.gx == x && player.gy == y;
}

function checkPill(x,y){
    return pills[x] && pills[x][y] == 1;    
}

function checkObstacle(x, y){
    return currentLevel.map[y] && currentLevel.map[y].charAt(x) == '#';
}

function checkEnemies(x, y, enemy){
    for(var i=0; i<enemies.length; i++){
        var other = enemies[i];        
        if((enemy == undefined || enemy.id != other.id) &&
            other.gx == x && other.gy == y){
            return true;
        }
    }
}

function displayDarkOverlay(ctx){
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function displayText(ctx, text, x, y, size){                
    ctx.font = size+"px sans-serif";                  
    var realX = x - (ctx.measureText(text).width / 2);
    var realY = y + (size / 2);    

    ctx.fillStyle = "#333";
    ctx.fillText(text,realX-2,realY+2);    
    ctx.fillStyle = "#FFF";
    ctx.fillText(text,realX,realY);
}

function displayLifeCount(ctx, x, y, scale){
    if(x == undefined){

        ctx.fillStyle = "red";
        ctx.font = "30px sans-serif";
        var text = "LIFE x "+player.lifes;
        var x = (canvas.width - ctx.measureText(text).width) / 2;
        var y = (canvas.height) / 3;
        ctx.fillText(text, x, y)
    }
}

function doCycle(){
    cycle = ++cycle % Number.MAX_VALUE; 
    document.getElementById("cycle").innerText = ""+ cycle;  
}

function movePlayer(ctx){

    var destX, destY, gridX, gridY;

    if(playing){
        if(player.state == PLAYER_MOVING){

            //Changes the direction only when the player is centered on the next tile
            if((player.x + HALF_STEP) % STEP == 0 && (player.y + HALF_STEP) % STEP == 0){                            
                gridX = player.gx + DIRECTIONS[lastKeyDirection].dx;
                gridY = player.gy + DIRECTIONS[lastKeyDirection].dy;
                if(!checkObstacle(gridX, gridY)){
                    player.direction = lastKeyDirection;
                }
            }
            
            destX = player.x + DIRECTIONS[player.direction].dx * STEP / 4;
            destY = player.y + DIRECTIONS[player.direction].dy * STEP / 4;            

            gridX = parseInt((player.x + DIRECTIONS[player.direction].dx * (HALF_STEP + 0.5)) / STEP); 
            gridY = parseInt((player.y + DIRECTIONS[player.direction].dy * (HALF_STEP + 0.5)) / STEP);                                    

            if(!checkObstacle(gridX, gridY)){                           
                player.x = destX;
                player.y = destY;

                player.gx = gridX;
                player.gy = gridY;

                player.GHOST_STUCKED = false;                  
            }else{
                if(!player.GHOST_STUCKED){
                    SOUNDS.PLAYER_HIT.play();
                    player.GHOST_STUCKED = true;
                }
            }              

            if(checkEnemies(player.gx, player.gy)){            
                SOUNDS.bg2.pause();
                player.state = PLAYER_HIT;            
                SOUNDS.die.play();               
                player.lifes -= player.lifes > 0 ? 1 : 0;            
                playing = false;            
            }
            
            if(checkPill(player.gx, player.gy)){                        
                SOUNDS.collect.currentTime = 0;
                SOUNDS.collect.volume = 0.1;
                SOUNDS.collect.play();
                pillsCollected++;
                pills[player.gx][player.gy] = undefined;

                if(pillsCollected >= currentLevel.pillsCount){                    
                    player.state = PLAYER_COMPLETED;                                                            
                    overlay.x = player.x;
                    overlay.y = player.y;
                }                
            }
        }        
    }

    if(player.state == PLAYER_COMPLETED){
        playing = false;                        
        overlay.size *= 0.9;                
        if(overlay.size <= STEP){            
            resetOverlay();
            scene = SCENE_LEVEL_COMPLETED;            
        }

    }else if(player.state == PLAYER_DEAD){
        if(player.lifes > 0){
            scene = SCENE_PRESS_ANY_KEY;        
        }else{
            scene = SCENE_GAME_OVER;        
            SOUNDS.over.play();
        }

    }else if(player.state == PLAYER_HIT){        
        player.aberturaBoca += 0.1; 
        if(player.aberturaBoca > 3){
            player.state = PLAYER_DEAD;
        }
    }
}

function moveAndDrawEnemies(ctx){
    enemies.forEach(function(enemy){
        if(playing){
            randomWalk(enemy);        
        }
        drawEnemy(enemy, ctx);
    });
}

function randomWalk(enemy){

    var r = Math.random();

    if((enemy.x - HALF_STEP) % STEP == 0 && (enemy.y - HALF_STEP) % STEP == 0){                                    

        var dx = player.gx - enemy.gx;
        var dy = player.gy - enemy.gy;
        var distance = Math.sqrt(dx*dx + dy*dy);        
        if(distance <= enemy.range){                                                                                
            enemy.state = GHOST_CHASING;                        
            if(dx*dx > dy*dy){                
                if(dx > 0){
                    enemy.direction = RIGHT;                                        
                }else{
                    enemy.direction = LEFT;                    
                }
            }else{
                if(dy > 0){
                    enemy.direction = DOWN;
                    
                }else{
                    enemy.direction = UP;                    
                }                
            }          
        }else{            
            enemy.state = GHOST_EXPLORING;
        }                

        if(enemy.state && enemy.state == GHOST_EXPLORING){                        
            if(r < 0.05){
                nextDirection(enemy);        
            }else if(r < 0.1){
                previousDirection(enemy);
            }        
        }
    }

    var tries = 0;
    while(true){
        var destX = enemy.x + DIRECTIONS[enemy.direction].dx * STEP / 8;
        var destY = enemy.y + DIRECTIONS[enemy.direction].dy * STEP / 8;

        var gridX = parseInt((enemy.x + DIRECTIONS[enemy.direction].dx * (HALF_STEP + 0.5)) / STEP); 
        var gridY = parseInt((enemy.y + DIRECTIONS[enemy.direction].dy * (HALF_STEP + 0.5)) / STEP);

        if(!checkObstacle(gridX, gridY)){                           
            enemy.x = destX;
            enemy.y = destY; 

            enemy.gx = gridX;
            enemy.gy = gridY;       

            break;
        }else{            
            if(r < 0.5){
                nextDirection(enemy);
            }else{
                previousDirection(enemy);
            }                    
        }
        tries++;
        if(tries > 4){
            break;
        }
    }
}

function oppositeDirection(enemy){
    enemy.direction = (enemy.direction + DIRECTIONS.length/2) % DIRECTIONS.length;
}

function nextDirection(enemy){
    enemy.direction = (enemy.direction + 1) % DIRECTIONS.length;    
}

function previousDirection(enemy){
    enemy.direction = (enemy.direction - 1 + DIRECTIONS.length) % DIRECTIONS.length;            
}

function drawEnemy(enemy, ctx){        

    ctx.fillStyle = enemy.color;    
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, HALF_STEP, Math.PI, 0);
    ctx.fill();
   
    ctx.fillRect(enemy.x - HALF_STEP , enemy.y, STEP, HALF_STEP);    
  
    
    if(enemy.state == GHOST_EXPLORING){
        ctx.fillStyle = "white";    
        ctx.beginPath();
        ctx.arc(enemy.x+0.70*STEP - HALF_STEP, enemy.y, STEP/4, 0, 2*Math.PI);        
        ctx.arc(enemy.x+0.30*STEP - HALF_STEP, enemy.y, STEP/4, 0, 2*Math.PI);
        ctx.fill();
        ctx.fillStyle = "black";    
        ctx.beginPath();
        ctx.arc(enemy.x+0.70*STEP + HALF_STEP*(1.0 + DIRECTIONS[enemy.direction].dx/5) - STEP, enemy.y+1*(1.0 + DIRECTIONS[enemy.direction].dy/5), STEP/8, 0, 2*Math.PI);
        ctx.arc(enemy.x+0.30*STEP + HALF_STEP*(1.0 + DIRECTIONS[enemy.direction].dx/5) - STEP, enemy.y+1*(1.0 + DIRECTIONS[enemy.direction].dy/5), STEP/8, 0, 2*Math.PI);
        ctx.fill();        
    }else if(enemy.state == GHOST_CHASING){
        ctx.fillStyle = "white";    
        ctx.beginPath();
        ctx.arc(enemy.x+0.70*STEP - HALF_STEP, enemy.y, STEP/4, Math.PI, 1.75*Math.PI, true);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(enemy.x+0.30*STEP - HALF_STEP, enemy.y, STEP/4, 1.25*Math.PI, 0, true);
        ctx.fill();
        ctx.fillStyle = "black";    
        ctx.beginPath();
        ctx.arc(enemy.x+0.70*STEP + HALF_STEP*(1.0 + DIRECTIONS[enemy.direction].dx/5) - STEP, enemy.y+1*(1.0 + DIRECTIONS[enemy.direction].dy/5), STEP/12, 0, 2*Math.PI);
        ctx.arc(enemy.x+0.30*STEP + HALF_STEP*(1.0 + DIRECTIONS[enemy.direction].dx/5) - STEP, enemy.y+1*(1.0 + DIRECTIONS[enemy.direction].dy/5), STEP/12, 0, 2*Math.PI);
        ctx.fill();    
    }    
}

function drawGhost(ctx, x, y, scale, color){
    ctx.fillStyle = color;    
    ctx.beginPath();
    ctx.arc(x, y, HALF_STEP*scale, Math.PI, 0);
    ctx.fill();
   
    ctx.fillRect(x - HALF_STEP*scale, y - 1, STEP*scale, HALF_STEP*scale);      
        
    ctx.fillStyle = "white";    
    ctx.beginPath();
    ctx.arc(x+0.70*STEP*scale - HALF_STEP*scale, y, STEP/4*scale, 0, 2*Math.PI);        
    ctx.arc(x+0.30*STEP*scale - HALF_STEP*scale, y, STEP/4*scale, 0, 2*Math.PI);
    ctx.fill();
        
    ctx.fillStyle = "black";    
    ctx.beginPath();
    ctx.arc(x+0.70*STEP*scale + HALF_STEP*scale*(1.0) - STEP*scale, y+1*(1.0), STEP*scale/8, 0, 2*Math.PI);
    ctx.arc(x+0.30*STEP*scale + HALF_STEP*scale*(1.0) - STEP*scale, y+1*(1.0), STEP*scale/8, 0, 2*Math.PI);
    ctx.fill(); 
}

function drawPlayer(player, ctx){

    ctx.fillStyle = player.color;    
   
    var inicioArco = 0;
    var fimArco = 0;

    if(player.direction == RIGHT){        
        inicioArco = 1;
        fimArco = 0;
    }

    if(player.direction == LEFT){
        inicioArco = 0;
        fimArco = 1;
    }

    if(player.direction == DOWN){
        inicioArco = 1.5;
        fimArco = 0.5;
    }

    if(player.direction == UP){
        inicioArco = 0.5;
        fimArco = 1.5;
    }    

    if(player.state == PLAYER_MOVING){
        player.aberturaBoca = (Math.sin(cycle * Math.PI * 2 / FPS*2) / 2 + 0.5);        
    }
        
    ctx.beginPath();    
    ctx.arc(player.x, player.y, STEP/2*player.size, Math.PI * inicioArco, -player.aberturaBoca + Math.PI * fimArco);       
    ctx.fill();
    ctx.beginPath(); 
    ctx.arc(player.x, player.y, STEP/2*player.size, Math.PI * inicioArco, +player.aberturaBoca + Math.PI * fimArco, true);
    ctx.fill();          
}