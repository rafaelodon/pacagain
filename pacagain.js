/**
 * PAC-AGAIN
 * 
 * A pacman variation written in pure HTML5 Canvas/JavaScript (ES5) for learning purposes.
 * 
 * @author Rafael Odon <odon.rafael@gmail.com>
 */

// constants
var TILE=24;
var HALF_TILE=TILE/2;
var GRID_WIDTH=25;
var GRID_HEIGHT=26;
var REAL_WIDTH=TILE*GRID_WIDTH;
var REAL_HEIGHT=TILE*GRID_HEIGHT;

//Levels objects described in levels.js
var LEVELS = [LEVEL1, LEVEL2, LEVEL3, LEVEL4, LEVEL5, LEVEL6];

//scenes
var Scenes = {
    INTRO : 0,
    PRE_LEVEL : 1,
    GAME : 2,
    GAME_OVER : 3,
    LEVEL_COMPLETED : 4,
    WIN : 5
}

var Player = {
    //states
    MOVING : 1, HIT : 2, DEAD : 3, COMPLETED : 4,

    //attributes
    x: 0, //real x
    y: 0, //real y
    gx: 0, //grid x
    gy: 0, //grid y
    speed: 1, 
    direction: Directions.RIGHT, 
    color: "#FF0",
    lifes: 3, 
    stucked: false,
    state: this.MOVING,
    size: 1 
}

//ghosts states
var GHOST_CHASING = 1;
var GHOST_EXPLORING = 2;
var GHOST_STUCKED = 3;

var Game = {    
    ctx : undefined,
    auxCanvas : undefined,
    currentLevel : LEVELS[0],
    currentLevelNumber : 1,  
    overlay : {},
    player : Player,
    playing : true,    
    objects : new Grid(GRID_WIDTH, GRID_HEIGHT),
    pillsCollected : 0,
    lastKeyDirection : Directions.RIGHT,    
    currentScene : Scenes.INTRO,        
    extraLife : { active: false, collected: true, gx: 12, gy: 12}, //TODO: extra life    
}

Game.preRenderLevel = function(){
    console.log("pre rendering...");
    this.auxCanvas = document.createElement("canvas");
    this.auxCanvas.width = REAL_WIDTH;
    this.auxCanvas.height = REAL_HEIGHT;    
    var auxCtx = this.auxCanvas.getContext('2d');
    auxCtx.scale = this.ctx.scale;
    auxCtx.clearRect(0, 0, REAL_WIDTH, REAL_HEIGHT);
    this.drawBackground(auxCtx);
    this.drawGrid(auxCtx);
    this.drawMap(auxCtx);
}

Game.setCanvas = function(canvas){              
    var scale = 1;      
    var scaleX = window.innerWidth / (GRID_WIDTH * TILE);
    var scaleY = (window.innerHeight - 80) / (GRID_HEIGHT * TILE);
    
    if(scaleX < scaleY){
        scale = scaleX;
    }else{
        scale = scaleY;
    }

    canvas.width = GRID_WIDTH * TILE * scale;
    canvas.height = GRID_HEIGHT * TILE * scale;    

    this.ctx = canvas.getContext("2d");    
    this.ctx.scale(scale,scale);        
}

Game.resetAll = function(){
    this.resetOverlay();
    this.resetPills();  
    this.resetLevel();
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
        enemy.x = enemy.gx * TILE + HALF_TILE;
        enemy.y = enemy.gy * TILE + HALF_TILE;        
    });
}

Game.resetDoors = function(){    
    for(var y=0; y<GRID_HEIGHT; y++){
        for(var x=0; x<GRID_WIDTH; x++){            
            if(this.currentLevel.map[y].charAt(x) == "|"){ // door
                if(this.doors[x] === undefined){
                    this.doors[x] = new Array(GRID_WIDTH);
                }
                this.doors[x][y] = 1;
            }
        }
    }
}

Game.resetPills = function(){
    
    this.objects.clearAll();
    this.currentLevel.pillsCount = 0;

    for(var y=0; y<GRID_HEIGHT; y++){
        for(var x=0; x<GRID_WIDTH; x++){            
    
            var tile = this.currentLevel.map[y].charAt(x);

            if(tile == "."){ // register pills
                this.objects.set(x,y,{
                    type : Objects.PILL,
                    collected : false
                });                
                this.currentLevel.pillsCount++;

            }else if(tile >= '0' && tile <= '9'){ // register other objects
                if(this.currentLevel.objects[tile]){                    
                    var obj = this.currentLevel.objects[tile];
                    obj.x = x;
                    obj.y = y;                    
                    this.objects.set(x,y,obj);
                }
            }
        }
    }    
}

Game.update = function(){
    if(this.currentScene == Scenes.GAME){
        this.moveEnemies();
        this.movePlayer();
    }    
}

Game.draw = function(){        

    var ctx = this.ctx;
        
    if(this.auxCanvas == undefined){
        this.preRenderLevel();
    }

    ctx.clearRect(0, 0, REAL_WIDTH, REAL_HEIGHT);
    
    ctx.globalCompositeOperation='source-over';    

    ctx.beginPath();
    ctx.arc(this.overlay.x, this.overlay.y, this.overlay.size, 0, Math.PI*2);    
    ctx.fill();

    ctx.globalCompositeOperation='source-atop';

    if(this.currentScene == Scenes.INTRO){

        if(SOUNDS.bg1.paused){
            SOUNDS.bg1.play();
        }         
            
        this.drawBackground(ctx);        
        var dx = Math.sin(Loop.lastTime / 1000 * Math.PI) * TILE/2;
        this.drawPlayer({
                x: REAL_WIDTH / 2 + dx,
                y: REAL_HEIGHT / 3,                
                color: "yellow",
                direction: Directions.LEFT,
                state: Player.MOVING
            },ctx,TILE * 6);
        this.displayText(ctx, "PAC-AGAIN", REAL_WIDTH / 2, REAL_HEIGHT / 2 + TILE * 2, TILE * 3);                
        this.displayText(ctx, "by Rafael Odon", REAL_WIDTH / 2, REAL_HEIGHT / 2 + TILE * 5, TILE * 0.75 );
        this.blinkText(ctx, "PRESS ANY KEY...", REAL_WIDTH / 2, REAL_HEIGHT - TILE * 4, TILE);

    }else if(this.currentScene == Scenes.PRE_LEVEL){

        if(SOUNDS.bg1.paused){
            SOUNDS.bg2.pause();
            SOUNDS.bg1.play();
        }

        this.clearCanvas(ctx);         
        this.displayDarkOverlay(ctx);                       
        this.displayText(ctx, "LEVEL "+this.currentLevelNumber+" of "+LEVELS.length, REAL_WIDTH / 2, REAL_HEIGHT / 4, TILE * 1.5 )
        this.displayText(ctx, "LIFE x "+this.player.lifes, REAL_WIDTH / 2, REAL_HEIGHT / 3, TILE * 1.5, "red" )
        this.drawEnemy({
            x: REAL_WIDTH / 2,
            y: REAL_HEIGHT / 5 * 3, 
            state: GHOST_EXPLORING,
            direction: Directions.LEFT,            
            color: this.currentLevel.enemies[this.currentLevel.enemies.length - 1].color
        }, ctx, TILE * 5);        
        this.blinkText(ctx, "PRESS ANY KEY...", REAL_WIDTH / 2, REAL_HEIGHT - TILE * 4, TILE);                

    }else if(this.currentScene == Scenes.GAME){

        if(SOUNDS.bg2.paused){
            SOUNDS.bg1.pause();
            SOUNDS.bg2.play();
        }

        this.clearCanvas(ctx);
        this.drawEnemies(ctx); 
        this.drawExtraLife(ctx);       
        this.drawPlayer(this.player, ctx);
        this.drawHeader(ctx);

    }else if(this.currentScene == Scenes.GAME_OVER){
        
        SOUNDS.bg1.pause();
        SOUNDS.bg2.pause();
        
        this.clearCanvas(ctx);   
        this.displayDarkOverlay(ctx);
        this.displayLifeCount(ctx); 
        this.displayText(ctx, "GAME OVER!", REAL_WIDTH / 2, REAL_HEIGHT / 2, TILE * 3);        

    }else if(this.currentScene == Scenes.LEVEL_COMPLETED){

        if(!SOUNDS.bg2.paused){
            SOUNDS.bg2.pause();
        }                

        this.drawBackground(ctx);
        this.displayText(ctx, "LEVEL COMPLETED!", REAL_WIDTH / 2, REAL_HEIGHT / 3, TILE * 2);                        
        this.drawPlayer({
            x: REAL_WIDTH / 2,
            y: REAL_HEIGHT / 5 * 3,                
            color: "yellow",
            direction: Directions.LEFT,
            state: Player.MOVING
        },ctx,TILE * 4);

        this.blinkText(ctx, "PRESS ANY KEY...", REAL_WIDTH / 2, REAL_HEIGHT - TILE * 4, TILE);        

    }else if(this.currentScene == Scenes.WIN){

        if(!SOUNDS.bg2.paused){
            SOUNDS.bg2.pause();            
            SOUNDS.win.play();
        }                

        this.drawBackground(ctx);        
        this.displayText(ctx, "CONGRATULATIONS,", REAL_WIDTH / 2, REAL_HEIGHT / 3 - TILE * 2, TILE);                
        this.displayText(ctx, "YOU HAVE COMPLETED ALL LEVELS!", REAL_WIDTH / 2, REAL_HEIGHT / 3, TILE);                
        this.displayText(ctx, "THE END", REAL_WIDTH / 2, REAL_HEIGHT / 2, TILE * 2);                                
        var dx = Math.sin(Loop.lastTime / 500 * Math.PI ) * TILE/4;
        this.drawPlayer({
                x: REAL_WIDTH / 9 + dx,
                y: REAL_HEIGHT / 3 * 2,                
                color: "yellow",
                direction: Directions.LEFT,
                state: Player.MOVING
            },ctx,TILE * 2);

        for(var i=0; i<LEVELS[LEVELS.length-1].enemies.length; i++){
            var dx = Math.sin((Loop.lastTime+i*Loop.fps) / 500 * Math.PI) * TILE/2
            var enemy = LEVELS[LEVELS.length-1].enemies[i];
            enemy.state = GHOST_CHASING;
            enemy.direction = Directions.LEFT;
            enemy.x = REAL_WIDTH / 9 * (i+3) + dx;
            enemy.y = REAL_HEIGHT / 3 * 2;            
            this.drawEnemy(enemy, ctx, TILE * 2);                   
        } 
    }    
}

Game.drawHeader = function(ctx){
    ctx.fillStyle = "#444"
    ctx.fillRect(0,0,REAL_WIDTH,TILE)
    this.displayText(ctx, "LEVEL "+this.currentLevelNumber+" of "+LEVELS.length+
    "        LIFES: "+this.player.lifes+
    "        PILLS: "+this.pillsCollected+" of "+this.currentLevel.pillsCount,            
        REAL_WIDTH / 2, TILE*0.4, TILE*0.8);
}

Game.moveUp = function(){
    this.lastKeyDirection = Directions.UP;
}

Game.moveDown = function(){
    this.lastKeyDirection = Directions.DOWN;        
}

Game.moveRight = function(){
    this.lastKeyDirection = Directions.RIGHT;        
}

Game.moveLeft = function(){
    this.lastKeyDirection = Directions.LEFT;        
}

Game.continueOnKeyOrTouch = function(){    
    if(this.currentScene == Scenes.PRE_LEVEL){        
        this.currentScene = Scenes.GAME;        
        this.resetEnemies();
        this.resetPlayer();
        this.playing = true;        
    }

    if(this.currentScene == Scenes.LEVEL_COMPLETED){        
        this.nextLevel();              
    }

    if(this.currentScene == Scenes.INTRO){        
        this.currentScene = Scenes.PRE_LEVEL;        
    }
}

Game.resetLevel = function(){
    this.currentLevel = JSON.parse(JSON.stringify(LEVELS[this.currentLevelNumber - 1]));    
}

Game.resetPlayer = function(){
    this.player.x = 12 * TILE + HALF_TILE;
    this.player.y = 13 * TILE + HALF_TILE;
    this.player.state = Player.MOVING;
    this.player.size = 1;
}

Game.nextLevel = function(){
    if(this.currentLevelNumber < LEVELS.length){                                
        this.currentLevelNumber++;        
        this.resetLevel();
        this.resetPills();
        this.resetEnemies();
        this.resetPlayer();
        this.pillsCollected = 0;
        this.playing = true;
        this.preRenderLevel();
        this.extraLife.active = false;
        this.currentScene = Scenes.PRE_LEVEL;
    }else{
        this.currentScene = Scenes.WIN;
    }  
}


Game.generateCoordinateOnEmptySpace = function(){
    var x=y=0;
    do{
        x = Math.floor(Math.random() * GRID_WIDTH);
        y = Math.floor(Math.random() * GRID_HEIGHT);
    }while(this.checkObstacle(x,y) || this.checkPill(x,y) || this.checkPlayer(x,y));
    return {x:x, y:y};
}

Game.clearCanvas = function(ctx){    
    ctx.drawImage(this.auxCanvas, 0, 0); //background is pre-rendered on another canvas;-)    
    this.drawPills(ctx);
}

Game.drawBackground = function(ctx){
    ctx.fillStyle = "black"
    ctx.fillRect(0,0,GRID_WIDTH*TILE,GRID_HEIGHT*TILE);
}

Game.drawPills = function(ctx){    
    for(var x=0; x<GRID_WIDTH; x++){
        for(var y=0; y<GRID_HEIGHT; y++){
            if(this.checkPill(x, y)){
                this.drawPill(x, y, ctx);
            }else if(this.checkDoor(x, y)){
                this.drawDoor(x, y, this.objects.get(x, y), ctx);
            }else if(this.checkKey(x, y)){
                this.drawKey(x, y, this.objects.get(x, y), ctx);
            }
        }
    }
}

Game.drawPill = function(x, y, ctx){       
    ctx.fillStyle = "black"
    var value = (Math.sin(Loop.lastTime / 500 * Math.PI) / 2 + 0.5) * 0xFF | 0;        
    var grayscale = (value << 16) | (value << 8) | value;
    var color = '#' + grayscale.toString(16);

    ctx.fillStyle = color;    
    ctx.beginPath();
    ctx.arc(x*TILE+HALF_TILE, y*TILE+HALF_TILE, HALF_TILE*0.3, 0, 2*Math.PI);    
    ctx.fill();
}

Game.drawDoor = function(x, y, door, ctx){    
    if(door.orientation == Orientations.VERTICAL){
        ctx.fillStyle = "#555";
        ctx.fillRect(x*TILE + TILE/3,y*TILE,TILE/3,TILE);
    }else if(door.orientation == Orientations.HORIZONTAL){
        ctx.fillStyle = "#555";
        ctx.fillRect(x*TILE,y*TILE + TILE/3,TILE,TILE/3);
    }
}

Game.drawKey = function(x, y, key, ctx){
    ctx.fillStyle = "#444";    
    ctx.beginPath();
    ctx.arc(x*TILE+HALF_TILE/2, y*TILE+HALF_TILE, HALF_TILE/2, 0, 2*Math.PI);
    ctx.arc(x*TILE+HALF_TILE+HALF_TILE/2, y*TILE+HALF_TILE, HALF_TILE/2, 0, 2*Math.PI);
    ctx.fillRect(x*TILE+HALF_TILE/2,y*TILE+HALF_TILE/2, HALF_TILE, HALF_TILE)
    ctx.fill();
    if(!key.triggered){
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(x*TILE+HALF_TILE/2, y*TILE+HALF_TILE, HALF_TILE/3, 0, 2*Math.PI);
        ctx.fill();
    }else{
        ctx.fillStyle = "lime";
        ctx.beginPath();
        ctx.arc(x*TILE+TILE-HALF_TILE/2, y*TILE+HALF_TILE, HALF_TILE/3, 0, 2*Math.PI);
        ctx.fill();
    }    
}

Game.drawExtraLife = function(ctx){    
    if(this.extraLife.active){                
        ctx.fillStyle = "red";
        ctx.beginPath();
        var rx = this.extraLife.gx * TILE + HALF_TILE;
        var ry = this.extraLife.gy * TILE + HALF_TILE;        
        var radius = HALF_TILE/2 * 1-0.7*Math.sin(Loop.lastTime / 500 * Math.PI);
        ctx.arc(rx - radius * 0.9, ry, radius * 1.1, Math.PI, 0);    
        ctx.arc(rx + radius, ry, radius * 1.1, Math.PI, 0);                
        ctx.quadraticCurveTo(rx + radius * 1.7, ry + radius * 1.6, rx, ry + radius * 2);        
        ctx.quadraticCurveTo(rx - radius * 1.7, ry + radius * 1.6, rx - radius * 2, ry);    
        ctx.closePath();    
        ctx.fill();        
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(rx + radius*1.3, ry - radius*0.4, radius*0.2, 0, Math.PI*2);        
        ctx.closePath();
        ctx.fill();  
        ctx.beginPath();
        ctx.arc(rx - radius*0.7, ry - radius*0.4, radius*0.2, 0, Math.PI*2);        
        ctx.closePath();
        ctx.fill();                
    }    
}

Game.drawGrid = function(ctx){
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWIDTH = 1;
    ctx.beginPath();
    for(var i=0; i<GRID_WIDTH; i++){                
        ctx.moveTo(i*TILE,0);
        ctx.lineTo(i*TILE,GRID_HEIGHT*TILE);                    
    }
    for(var j=0; j<GRID_HEIGHT; j++){        
        ctx.moveTo(0, j*TILE);
        ctx.lineTo(GRID_WIDTH*TILE, j*TILE);            
    }
    ctx.stroke();
}

Game.drawMap = function(ctx){
    
    for(var y=0; y<GRID_HEIGHT; y++){
        for(var x=0; x<GRID_WIDTH; x++){            
            if(this.currentLevel.map[y].charAt(x) == "#"){ // wall
                ctx.fillStyle = this.currentLevel.wallsColor;
                ctx.roundRect(x*TILE,y*TILE,TILE-0.25,TILE-0.25, TILE/4);
                ctx.fill();
                ctx.fillStyle = "rgba(0,0,0,0.3)";
                ctx.roundRect(x*TILE+TILE/8,y*TILE+TILE/8,TILE*0.7,TILE*0.7, TILE/8);                            
                ctx.fill();
                //ctx.fillRect(x*TILE,y*TILE,TILE,TILE);
            }
        }
    }
}

Game.checkPlayer = function(x,y){    
    return this.player.gx == x && this.player.gy == y;
}

Game.checkPill = function(x,y){
    return this.objects.get(x,y) 
        && this.objects.get(x,y).type == Objects.PILL
        && this.objects.get(x,y).collected == false;    
}

Game.checkKey = function(x,y){
    return this.objects.get(x,y) 
        && this.objects.get(x,y).type == Objects.KEY;            
}

Game.checkExtraLife = function(x,y){
    return this.extraLife.active && this.extraLife.gx == x && this.extraLife.gy == y;    
}

Game.checkObstacle = function(x, y){    
    return (this.currentLevel.map[y] && this.currentLevel.map[y].charAt(x) == '#') || this.checkDoor(x, y);
}

Game.checkDoor = function(x, y){
    return this.objects.get(x, y) 
        && this.objects.get(x, y).type == Objects.DOOR
        && this.objects.get(x, y).locked == true;
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

Game.blinkText = function(ctx, text, x, y, size, color){
    if(Loop.lastTime/30 % 30 < 15){
        this.displayText(ctx, text, x, y, size, color);
    }
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

Game.movePlayer = function(){

    var player = this.player;
    var destX, destY, gridX, gridY;

    if(this.playing){
        if(player.state == Player.MOVING){

            //Only changes the direction when the player is centered on the next tile
            if((player.x + HALF_TILE) % TILE == 0 && (player.y + HALF_TILE) % TILE == 0){                            
                gridX = player.gx + Directions.DELTA[this.lastKeyDirection].dx;
                gridY = player.gy + Directions.DELTA[this.lastKeyDirection].dy;
                if(!this.checkObstacle(gridX, gridY)){
                    player.direction = this.lastKeyDirection;
                }
            }
            
            destX = player.x + Directions.DELTA[player.direction].dx * TILE / 6;
            destY = player.y + Directions.DELTA[player.direction].dy * TILE / 6;            

            gridX = parseInt((player.x + Directions.DELTA[player.direction].dx * (HALF_TILE + 0.5)) / TILE); 
            gridY = parseInt((player.y + Directions.DELTA[player.direction].dy * (HALF_TILE + 0.5)) / TILE);                                    

            if(!this.checkObstacle(gridX, gridY)){                           
                player.x = destX;
                player.y = destY;

                player.gx = gridX;
                player.gy = gridY;

                player.stucked = false;                  
            }else{
                if(!player.stucked){
                    SOUNDS.hit.volume = 0.5;
                    SOUNDS.hit.play();
                    player.stucked = true;
                }
            }              

            if(this.checkEnemies(player.gx, player.gy)){            
                SOUNDS.bg2.pause();
                player.state = Player.HIT;            
                SOUNDS.die.play();               
                player.lifes -= player.lifes > 0 ? 1 : 0;            
                this.playing = false;            
            }
            
            if(this.checkPill(player.gx, player.gy)){                        
                SOUNDS.collect.currentTime = 0;
                SOUNDS.collect.volume = 0.1;
                SOUNDS.collect.play();
                this.pillsCollected++;
                this.objects.get(player.gx,player.gy).collected = true;

                if(this.pillsCollected == this.currentLevel.pillsCount - 1){                    
                    var g = this.generateCoordinateOnEmptySpace();
                    this.extraLife.gx = g.x;
                    this.extraLife.gy = g.y;
                    this.extraLife.active = true;
                }

                if(this.pillsCollected >= this.currentLevel.pillsCount){                    
                    player.state = Player.COMPLETED;                                                            
                    SOUNDS.win.play();
                    this.overlay.x = player.x;
                    this.overlay.y = player.y;
                }                
            }

            if(this.checkExtraLife(player.gx, player.gy)){
                SOUNDS.collect.currentTime = 0;
                SOUNDS.collect.volume = 0.1;
                SOUNDS.collect.play();
                this.player.lifes++;
                this.extraLife.active = false;
                this.extraLife.collected = true;
            }

            if(this.checkKey(player.gx, player.gy)){                                            
                var key = this.objects.get(player.gx, player.gy);                
                if(!key.triggered){
                    SOUNDS.door.play();
                    key.triggered = true;                    
                    var door = this.currentLevel.objects[key.door];
                    this.objects.get(door.x, door.y).locked = false;                    
                }
            }
        }        
    }

    if(player.state == Player.COMPLETED){
        this.playing = false;                        
        this.overlay.size *= 0.9;                
        if(this.overlay.size <= TILE){            
            this.resetOverlay();
            this.currentScene = Scenes.LEVEL_COMPLETED;            
        }

    }else if(player.state == Player.DEAD){
        if(player.lifes > 0){
            this.currentScene = Scenes.PRE_LEVEL;        
        }else{
            this.currentScene = Scenes.GAME_OVER;        
            SOUNDS.over.play();
        }

    }else if(player.state == Player.HIT){        
        player.mouthOpening += 0.1; 
        if(player.mouthOpening > 3){
            player.state = Player.DEAD;
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

    if((enemy.x - HALF_TILE) % TILE == 0 && (enemy.y - HALF_TILE) % TILE == 0){                                    

        var dx = this.player.gx - enemy.gx;
        var dy = this.player.gy - enemy.gy;
        var distance = Math.sqrt(dx*dx + dy*dy);        
        if(distance <= enemy.range){                                                                                
            enemy.state = GHOST_CHASING;                        
            if(dx*dx > dy*dy){                
                if(dx > 0){
                    enemy.direction = Directions.RIGHT;                                        
                }else{
                    enemy.direction = Directions.LEFT;                    
                }
            }else{
                if(dy > 0){
                    enemy.direction = Directions.DOWN;
                    
                }else{
                    enemy.direction = Directions.UP;                    
                }                
            }          
        }else{            
            enemy.state = GHOST_EXPLORING;
        }                

        if(enemy.state && enemy.state == GHOST_EXPLORING){                        
            if(r < 0.05){
                Directions.nextDirection(enemy);        
            }else if(r < 0.1){
                Directions.previousDirection(enemy);
            }        
        }
    }

    var tries = 0;
    while(true){                        
        var destX = enemy.x + Directions.DELTA[enemy.direction].dx * TILE / 8 * enemy.speed;
        var destY = enemy.y + Directions.DELTA[enemy.direction].dy * TILE / 8 * enemy.speed;

        var gridX = parseInt((enemy.x + Directions.DELTA[enemy.direction].dx * (HALF_TILE + 0.5)) / TILE); 
        var gridY = parseInt((enemy.y + Directions.DELTA[enemy.direction].dy * (HALF_TILE + 0.5)) / TILE);

        if(!this.checkObstacle(gridX, gridY)){                           
            enemy.x = destX;
            enemy.y = destY; 

            enemy.gx = gridX;
            enemy.gy = gridY;       

            break;
        }else{            
            if(r < 0.5){
                Directions.nextDirection(enemy);
            }else{
                Directions.previousDirection(enemy);
            }                    
        }
        tries++;
        if(tries > 4){
            break;
        }
    }
}

Game.drawEnemy = function(enemy, ctx, scale){        

    if(scale == undefined){
        scale = TILE;
    }

    ctx.fillStyle = enemy.color;    
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, scale/2, Math.PI, 0);
    ctx.fill();
    
    ctx.fillRect(enemy.x - scale/2 , enemy.y - 1, scale, scale/2);    
            
    if(enemy.state == GHOST_EXPLORING){                
        ctx.fillStyle = "white";  
        ctx.beginPath();
        ctx.arc(enemy.x+0.70*scale - scale/2, enemy.y, scale/4, 0, 2*Math.PI);        
        ctx.arc(enemy.x+0.30*scale - scale/2, enemy.y, scale/4, 0, 2*Math.PI);
        ctx.fill();
        ctx.fillStyle = "black";    
        ctx.beginPath();
        ctx.arc(enemy.x+0.70*scale + scale/2*(1.0 + Directions.DELTA[enemy.direction].dx/5) - scale, 
            enemy.y+1*(1.0 + Directions.DELTA[enemy.direction].dy/5), scale/8, 0, 2*Math.PI);
        ctx.arc(enemy.x+0.30*scale + scale/2*(1.0 + Directions.DELTA[enemy.direction].dx/5) - scale, 
            enemy.y+1*(1.0 + Directions.DELTA[enemy.direction].dy/5), scale/8, 0, 2*Math.PI);
        ctx.fill();        
    }else if(enemy.state == GHOST_CHASING){
        ctx.fillStyle = "white";    
        ctx.beginPath();
        ctx.arc(enemy.x+0.70*scale - scale/2, enemy.y, scale/4, Math.PI, 1.75*Math.PI, true);       
        ctx.fill();
        ctx.beginPath(); 
        ctx.arc(enemy.x+0.30*scale - scale/2, enemy.y, scale/4, 1.25*Math.PI, 0, true);
        ctx.fill();
        ctx.fillStyle = "black";    
        ctx.beginPath();
        ctx.arc(enemy.x+0.70*scale + scale/2*(1.0 + Directions.DELTA[enemy.direction].dx/5) - scale, 
            enemy.y+1*(1.0 + Directions.DELTA[enemy.direction].dy/5), scale/12, 0, 2*Math.PI);
        ctx.arc(enemy.x+0.30*scale + scale/2*(1.0 + Directions.DELTA[enemy.direction].dx/5) - scale, 
            enemy.y+1*(1.0 + Directions.DELTA[enemy.direction].dy/5), scale/12, 0, 2*Math.PI);
        ctx.fill();    
    }    
}

Game.drawPlayer = function(player, ctx, scale){

    if(scale == undefined){
        scale = TILE;
    }

    ctx.fillStyle = player.color;    
    
    var archStart = 0;
    var archEnd = 0;

    if(player.direction == Directions.RIGHT){        
        archStart = 1;
        archEnd = 0;
    }

    if(player.direction == Directions.LEFT){
        archStart = 0;
        archEnd = 1;
    }

    if(player.direction == Directions.DOWN){
        archStart = 1.5;
        archEnd = 0.5;
    }

    if(player.direction == Directions.UP){
        archStart = 0.5;
        archEnd = 1.5;
    }    

    if(player.state == Player.MOVING){        
        player.mouthOpening = (Math.sin(Loop.lastTime / 333 * Math.PI) / 2 + 0.5);        
    }
        
    ctx.beginPath();
    ctx.arc(player.x, player.y, scale/2, Math.PI * archStart, -player.mouthOpening + Math.PI * archEnd);    
    ctx.arc(player.x, player.y, scale/2, Math.PI * archStart, +player.mouthOpening + Math.PI * archEnd, true);
    ctx.fill();          
}