/**
 * PAC-AGAIN
 * 
 * An HTML5/JS pacman revisit for learning purposes.
 * 
 * Author: Rafael Odon (odon.rafael@gmail.com)
 */

// constants
var STEP=24;
var FPS=30;
var HALF_STEP=STEP/2;
var WIDTH=25;
var HEIGHT=26;
var REAL_WIDTH=STEP*WIDTH;
var REAL_HEIGHT=STEP*HEIGHT;

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

var Game = {    
    ctx : undefined,
    currentLevel : LEVELS[0],
    currentLevelNumber : 1,
    player : { x: 0, y: 0, speed: 1, direction: 0, color: "#FF0", lifes: 3, GHOST_STUCKED: false, state: PLAYER_MOVING, size: 1 },
    overlay : {},
    playing : true,
    pills : [],
    pillsCollected : 0,
    lastKeyDirection : RIGHT,
    gameInterval : undefined,
    cycle : 0,
    scene : SCENE_INTRO,        
    extraLife : { collected: true, gx: 0, gy: 0}, //TODO: extra life
    gameInterval : undefined
}

Game.setCanvas = function(canvas){              
    var scale = 1;        
    var scaleX = window.innerWidth / (WIDTH * STEP);
    var scaleY = window.innerHeight / (HEIGHT * STEP);
    
    if(scaleX < scaleY){
        scale = scaleX;
    }else{
        scale = scaleY;
    }

    canvas.width = WIDTH * STEP * scale;
    canvas.height = HEIGHT * STEP * scale;    

    this.ctx = canvas.getContext("2d");    
    this.ctx.scale(scale,scale);        
}

Game.resetAll = function(){
    this.resetOverlay();
    this.resetPills();    
    this.resetEnemies();
    this.resetPlayer();
}

Game.resetOverlay = function(){
    this.overlay = { 
        x: REAL_WIDTH / 2,
        y: REAL_HEIGHT / 2,
        size : REAL_WIDTH * 1,
        opacity: 0
    };
}

Game.resetEnemies = function(){
    this.enemies = JSON.parse(JSON.stringify(this.currentLevel.enemies));
    this.enemies.forEach(function(enemy){
        enemy.x = enemy.gx * STEP + HALF_STEP;
        enemy.y = enemy.gy * STEP + HALF_STEP;        
    });
}

Game.resetPills = function(){
    for(var i=0; i<this.currentLevel.pillsCount; i++){
        var pill = this.generateCoordinateOnEmptySpace();
        if(this.pills[pill.x] === undefined){
            this.pills[pill.x] = new Array(WIDTH);
        }
        this.pills[pill.x][pill.y] = 1;        
    }
}

Game.run = function(){         
    this.gameInterval = setInterval(Game.loop, 1000/FPS)
}

Game.togglePausePlay =  function(){  
    if(this.gameInterval){
        clearInterval(this.gameInterval);
        this.gameInterval = undefined;
    }else{
        Game.run();
    }    
}

Game.loop = function(){
    Game.update();
    Game.draw();
}

Game.update = function(){
    if(this.scene == SCENE_GAME){
        this.moveEnemies();
        this.movePlayer();
    }
    this.doCycle();        
}

Game.draw = function(){             

    var ctx = this.ctx;

    ctx.clearRect(0, 0, REAL_WIDTH, REAL_HEIGHT);
    
    ctx.globalCompositeOperation='source-over';    

    ctx.beginPath();
    ctx.arc(this.overlay.x, this.overlay.y, this.overlay.size, 0, Math.PI*2);    
    ctx.fill();

    ctx.globalCompositeOperation='source-atop';

    if(this.scene == SCENE_INTRO){

        if(SOUNDS.bg1.paused){
            SOUNDS.bg1.play();
        }                
            
        this.drawBackground(ctx);
        this.drawPacman(ctx, REAL_WIDTH / 2, REAL_HEIGHT / 3, STEP * 4);
        this.displayText(ctx, "PAC-AGAIN", REAL_WIDTH / 2, REAL_HEIGHT / 2 + STEP * 2, STEP * 3);                
        this.displayText(ctx, "by Rafael Odon", REAL_WIDTH / 2, REAL_HEIGHT / 2 + STEP * 5, STEP * 0.75 )

        if(this.cycle % 30 < 15){
            this.displayText(ctx, "PRESS ANY KEY...", REAL_WIDTH / 2, REAL_HEIGHT - STEP * 4, STEP);        
        }       
            

    }else if(this.scene == SCENE_PRESS_ANY_KEY){

        if(SOUNDS.bg1.paused){
            SOUNDS.bg2.pause();
            SOUNDS.bg1.play();
        }

        this.clearCanvas(ctx);         
        this.displayDarkOverlay(ctx);                       
        this.displayText(ctx, "LEVEL "+this.currentLevelNumber+" of "+LEVELS.length, REAL_WIDTH / 2, REAL_HEIGHT / 4, STEP * 1.5 )
        this.displayText(ctx, "LIFE x "+this.player.lifes, REAL_WIDTH / 2, REAL_HEIGHT / 3, STEP * 1.5, "red" )
        this.drawGhost(ctx, REAL_WIDTH / 2, REAL_HEIGHT / 5 * 3, 5, this.currentLevel.enemies[this.currentLevel.enemies.length - 1].color);

        if(this.cycle % 30 < 15){
            this.displayText(ctx, "PRESS ANY KEY...", REAL_WIDTH / 2, REAL_HEIGHT - STEP * 4, STEP);        
        }

    }else if(this.scene == SCENE_GAME){

        if(SOUNDS.bg2.paused){
            SOUNDS.bg1.pause();
            SOUNDS.bg2.play();
        }

        this.clearCanvas(ctx);
        this.drawEnemies(ctx);
        this.drawPlayer(this.player, ctx);
        this.drawHeader(ctx);

    }else if(this.scene == SCENE_GAME_OVER){
        
        SOUNDS.bg1.pause();
        SOUNDS.bg2.pause();
        
        this.clearCanvas(ctx);   
        this.displayDarkOverlay(ctx);
        this.displayLifeCount(ctx); 
        this.displayText(ctx, "GAME OVER!", REAL_WIDTH / 2, REAL_HEIGHT / 2, STEP * 3);        

    }else if(this.scene == SCENE_LEVEL_COMPLETED){

        if(!SOUNDS.bg2.paused){
            SOUNDS.bg2.pause();
        }                

        this.drawBackground(ctx);
        this.displayText(ctx, "LEVEL COMPLETED!", REAL_WIDTH / 2, REAL_HEIGHT / 3, STEP * 2);                
        this.drawPacman(ctx, REAL_WIDTH / 2, REAL_HEIGHT / 5 * 3, STEP * 2);

        if(this.cycle % 30 < 15){
            this.displayText(ctx, "PRESS ANY KEY...", REAL_WIDTH / 2, REAL_HEIGHT - STEP * 4, STEP);        
        }

    }else if(this.scene == SCENE_WIN){

        if(!SOUNDS.bg2.paused){
            SOUNDS.bg2.pause();            
            SOUNDS.win.play();
        }                

        this.clearCanvas(ctx);
        this.displayDarkOverlay(ctx);                
        this.displayText(ctx, "CONGRATULATIONS,", REAL_WIDTH / 2, REAL_HEIGHT / 3 - STEP * 2, STEP);                
        this.displayText(ctx, "YOU HAVE COMPLETED ALL LEVELS!", REAL_WIDTH / 2, REAL_HEIGHT / 3, STEP);                
        this.displayText(ctx, "THE END", REAL_WIDTH / 2, REAL_HEIGHT / 2, STEP * 2);                
        this.drawPacman(ctx, REAL_WIDTH / 2, REAL_HEIGHT / 3 * 2, STEP * 2);
    }
}

Game.drawHeader = function(ctx){
    ctx.fillStyle = "#444"
    ctx.fillRect(0,0,REAL_WIDTH,STEP)
    this.displayText(ctx, "LEVEL "+this.currentLevelNumber+" of "+LEVELS.length+
    "        LIFES: "+this.player.lifes+
    "        PILLS: "+this.pillsCollected+" of "+this.currentLevel.pillsCount,            
        REAL_WIDTH / 2, STEP*0.4, STEP*0.8);
}

Game.drawPacman = function(ctx, x, y, scale){
    ctx.fillStyle = this.player.color;
    ctx.beginPath();    
    ctx.arc(x, y, scale, 0, Math.PI - 0.5);       
    ctx.fill();
    ctx.beginPath(); 
    ctx.arc(x, y, scale, 0, Math.PI + 0.5, true);
    ctx.fill();
}

Game.moveUp = function(){
    this.lastKeyDirection = UP;
}

Game.moveDown = function(){
    this.lastKeyDirection = DOWN;        
}

Game.moveRight = function(){
    this.lastKeyDirection = RIGHT;        
}

Game.moveLeft = function(){
    this.lastKeyDirection = LEFT;        
}

Game.continueOnKeyOrTouch = function(){    
    if(this.scene == SCENE_PRESS_ANY_KEY){
        this.scene = SCENE_GAME;
        this.resetEnemies();
        this.resetPlayer();
        this.playing = true;
        
    }

    if(this.scene == SCENE_LEVEL_COMPLETED){        
        this.nextLevel();      
    }

    if(this.scene == SCENE_INTRO){        
        this.scene = SCENE_PRESS_ANY_KEY;
    }
}

Game.resetPlayer = function(){
    this.player.x = 12 * STEP + HALF_STEP;
    this.player.y = 13 * STEP + HALF_STEP;
    this.player.state = PLAYER_MOVING;
    this.player.size = 1;
}

Game.nextLevel = function(){
    if(this.currentLevelNumber < LEVELS.length){            
        this.currentLevel = LEVELS[this.currentLevelNumber];
        this.currentLevelNumber++;
        this.resetPills();
        this.resetEnemies();
        this.resetPlayer();
        this.pillsCollected = 0;
        this.playing = true;
        this.scene = SCENE_PRESS_ANY_KEY;
    }else{
        this.scene = SCENE_WIN;
    }  
}


Game.generateCoordinateOnEmptySpace = function(){
    var x=y=0;
    do{
        x = Math.floor(Math.random() * WIDTH);
        y = Math.floor(Math.random() * HEIGHT);
    }while(this.checkObstacle(x,y) || this.checkPill(x,y) || this.checkPlayer(x,y));
    return {x:x, y:y};
}

Game.clearCanvas = function(ctx){
    this.drawBackground(ctx);
    this.drawGrid(ctx)
    this.drawMap(ctx);  
    this.drawPills(ctx);
}

Game.drawBackground = function(ctx){
    ctx.fillStyle = "black"
    ctx.fillRect(0,0,WIDTH*STEP,HEIGHT*STEP);
}

Game.drawPills = function(ctx){    
    for(var x=0; x<WIDTH; x++){
        for(var y=0; y<HEIGHT; y++){
            if(this.checkPill(x, y)){
                this.drawPill(x, y, ctx);
            }
        }
    }
}

Game.drawPill = function(x, y, ctx){       
    ctx.fillStyle = "black"
    var value = (Math.sin(this.cycle * Math.PI * 2 / FPS) / 2 + 0.5) * 0xFF | 0;        
    var grayscale = (value << 16) | (value << 8) | value;
    var color = '#' + grayscale.toString(16);

    ctx.fillStyle = color;    
    ctx.beginPath();
    ctx.arc(x*STEP+HALF_STEP, y*STEP+HALF_STEP, HALF_STEP*0.3, 0, 2*Math.PI);
    ctx.arc(x*STEP+HALF_STEP, y*STEP+HALF_STEP, HALF_STEP*0.3, 0, 2*Math.PI);
    ctx.fill();
}

Game.drawGrid = function(ctx){
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
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

Game.drawMap = function(ctx){
    for(var y=0; y<HEIGHT; y++){
        for(var x=0; x<WIDTH; x++){            
            if(this.checkObstacle(x,y)){
                ctx.fillStyle = this.currentLevel.wallsColor;
                ctx.roundRect(x*STEP,y*STEP,STEP-0.25,STEP-0.25, STEP/4);
                ctx.fill();
                ctx.fillStyle = "rgba(0,0,0,0.3)";
                ctx.roundRect(x*STEP+STEP/8,y*STEP+STEP/8,STEP*0.7,STEP*0.7, STEP/8);
                //ctx.fillRect(x*STEP,y*STEP,STEP,STEP);
                ctx.fill();
            }
        }
    }
}

Game.checkPlayer = function(x,y){    
    return this.player.gx == x && this.player.gy == y;
}

Game.checkPill = function(x,y){
    return this.pills[x] && this.pills[x][y] == 1;    
}

Game.checkObstacle = function(x, y){
    return this.currentLevel.map[y] && this.currentLevel.map[y].charAt(x) == '#';
}

Game.checkEnemies = function(x, y, enemy){
    for(var i=0; i<this.enemies.length; i++){
        var other = this.enemies[i];        
        if((enemy == undefined || enemy.id != other.id) &&
            other.gx == x && other.gy == y){
            return true;
        }
    }
}

Game.displayDarkOverlay = function(ctx){
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    ctx.fillRect(0, 0, REAL_WIDTH, REAL_HEIGHT);
}

Game.displayText = function(ctx, text, x, y, size, color){                
    ctx.font = "bold "+size+"px sans-serif";                  
    var realX = x - (ctx.measureText(text).width / 2);
    var realY = y + (size / 2);    
    
    ctx.fillStyle = color ?  color : "#FFF";
    ctx.fillText(text,realX,realY);
}

Game.displayLifeCount = function(ctx, x, y, scale){
    if(x == undefined){

        ctx.fillStyle = "red";
        ctx.font = "30px sans-serif";
        var text = "LIFE x "+this.player.lifes;
        var x = (REAL_WIDTH - ctx.measureText(text).width) / 2;
        var y = (REAL_HEIGHT) / 3;
        ctx.fillText(text, x, y)
    }
}

Game.doCycle = function(){
    this.cycle = ++this.cycle % Number.MAX_VALUE; 
    document.getElementById("cycle").innerText = ""+ this.cycle;  
}

Game.movePlayer = function(){

    var player = this.player;
    var destX, destY, gridX, gridY;

    if(this.playing){
        if(player.state == PLAYER_MOVING){

            //Changes the direction only when the player is centered on the next tile
            if((player.x + HALF_STEP) % STEP == 0 && (player.y + HALF_STEP) % STEP == 0){                            
                gridX = player.gx + DIRECTIONS[this.lastKeyDirection].dx;
                gridY = player.gy + DIRECTIONS[this.lastKeyDirection].dy;
                if(!this.checkObstacle(gridX, gridY)){
                    player.direction = this.lastKeyDirection;
                }
            }
            
            destX = player.x + DIRECTIONS[player.direction].dx * STEP / 6;
            destY = player.y + DIRECTIONS[player.direction].dy * STEP / 6;            

            gridX = parseInt((player.x + DIRECTIONS[player.direction].dx * (HALF_STEP + 0.5)) / STEP); 
            gridY = parseInt((player.y + DIRECTIONS[player.direction].dy * (HALF_STEP + 0.5)) / STEP);                                    

            if(!this.checkObstacle(gridX, gridY)){                           
                player.x = destX;
                player.y = destY;

                player.gx = gridX;
                player.gy = gridY;

                player.GHOST_STUCKED = false;                  
            }else{
                if(!player.GHOST_STUCKED){
                    SOUNDS.hit.play();
                    player.GHOST_STUCKED = true;
                }
            }              

            if(this.checkEnemies(player.gx, player.gy)){            
                SOUNDS.bg2.pause();
                player.state = PLAYER_HIT;            
                SOUNDS.die.play();               
                player.lifes -= player.lifes > 0 ? 1 : 0;            
                this.playing = false;            
            }
            
            if(this.checkPill(player.gx, player.gy)){                        
                SOUNDS.collect.currentTime = 0;
                SOUNDS.collect.volume = 0.1;
                SOUNDS.collect.play();
                this.pillsCollected++;
                this.pills[player.gx][player.gy] = undefined;

                if(this.pillsCollected >= this.currentLevel.pillsCount){                    
                    player.state = PLAYER_COMPLETED;                                                            
                    SOUNDS.win.play();
                    this.overlay.x = player.x;
                    this.overlay.y = player.y;
                }                
            }
        }        
    }

    if(player.state == PLAYER_COMPLETED){
        this.playing = false;                        
        this.overlay.size *= 0.9;                
        if(this.overlay.size <= STEP){            
            this.resetOverlay();
            this.scene = SCENE_LEVEL_COMPLETED;            
        }

    }else if(player.state == PLAYER_DEAD){
        if(player.lifes > 0){
            this.scene = SCENE_PRESS_ANY_KEY;        
        }else{
            this.scene = SCENE_GAME_OVER;        
            SOUNDS.over.play();
        }

    }else if(player.state == PLAYER_HIT){        
        player.aberturaBoca += 0.1; 
        if(player.aberturaBoca > 3){
            player.state = PLAYER_DEAD;
        }
    }
}

Game.moveEnemies = function(){            
    for(var i=0; i<this.enemies.length; i++){
        var enemy = this.enemies[i];        
        if(this.playing){
            this.randomWalk(enemy);        
        }            
    };
}

Game.drawEnemies = function(ctx){            
    for(var i=0; i<this.enemies.length; i++){
        var enemy = this.enemies[i];
        this.drawEnemy(enemy, ctx);
    };
}

Game.randomWalk = function(enemy){

    var r = Math.random();

    if((enemy.x - HALF_STEP) % STEP == 0 && (enemy.y - HALF_STEP) % STEP == 0){                                    

        var dx = this.player.gx - enemy.gx;
        var dy = this.player.gy - enemy.gy;
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
                this.nextDirection(enemy);        
            }else if(r < 0.1){
                this.previousDirection(enemy);
            }        
        }
    }

    var tries = 0;
    while(true){
        var destX = enemy.x + DIRECTIONS[enemy.direction].dx * STEP / 8;
        var destY = enemy.y + DIRECTIONS[enemy.direction].dy * STEP / 8;

        var gridX = parseInt((enemy.x + DIRECTIONS[enemy.direction].dx * (HALF_STEP + 0.5)) / STEP); 
        var gridY = parseInt((enemy.y + DIRECTIONS[enemy.direction].dy * (HALF_STEP + 0.5)) / STEP);

        if(!this.checkObstacle(gridX, gridY)){                           
            enemy.x = destX;
            enemy.y = destY; 

            enemy.gx = gridX;
            enemy.gy = gridY;       

            break;
        }else{            
            if(r < 0.5){
                this.nextDirection(enemy);
            }else{
                this.previousDirection(enemy);
            }                    
        }
        tries++;
        if(tries > 4){
            break;
        }
    }
}

Game.oppositeDirection = function(enemy){
    enemy.direction = (enemy.direction + DIRECTIONS.length/2) % DIRECTIONS.length;
}

Game.nextDirection = function(enemy){
    enemy.direction = (enemy.direction + 1) % DIRECTIONS.length;    
}

Game.previousDirection = function(enemy){
    enemy.direction = (enemy.direction - 1 + DIRECTIONS.length) % DIRECTIONS.length;            
}

Game.drawEnemy = function(enemy, ctx){        

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

Game.drawGhost = function(ctx, x, y, scale, color){
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

Game.drawPlayer = function(player, ctx){

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
        player.aberturaBoca = (Math.sin(this.cycle * Math.PI * 2 / FPS*2) / 2 + 0.5);        
    }
        
    ctx.beginPath();    
    ctx.arc(player.x, player.y, STEP/2*player.size, Math.PI * inicioArco, -player.aberturaBoca + Math.PI * fimArco);       
    ctx.fill();
    ctx.beginPath(); 
    ctx.arc(player.x, player.y, STEP/2*player.size, Math.PI * inicioArco, +player.aberturaBoca + Math.PI * fimArco, true);
    ctx.fill();          
}