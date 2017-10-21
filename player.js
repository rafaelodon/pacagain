var PlayerState = {
    STOPPED: 0,
    MOVING : 1,
    HIT : 2,
    DEAD : 3,
    COMPLETED : 4,
}

var Player = function(gx, gy, options){
    var defaults = {
        direction : Directions.RIGHT,
        color : Colors.YELLOW,
        state : PlayerState.MOVING,
        speed : 1,        
        stucked: false,        
    }
    
    options = (typeof options == "undefined") ? {} : options;
    for(var i in defaults){ 
        if(typeof options[i] == "undefined"){
           this[i] = defaults[i];
        }else{
            this[i] = options[i];
        }
    }

    this.x = undefined;
    this.y = undefined;
    this.gx = gx;
    this.gy = gy;        
    this.initialState = JSON.parse(JSON.stringify(this));        
}

Player.prototype.reset = function(){
    for(var i in this.initialState){ 
        this[i] = this.initialState[i];
    }
}

Player.prototype.update = function(){
            
    var destX, destY, gridX, gridY;

    if(this.game.playing){
        if(this.state == PlayerState.MOVING){

            //Only changes the direction when the player is centered on the next tile
            if(typeof this.game.lastKeyDirection != "undefined"){                
                if((this.x + HALF_TILE) % TILE == 0 && (this.y + HALF_TILE) % TILE == 0){                            
                    gridX = this.gx + Directions.DELTA[this.game.lastKeyDirection].dx;
                    gridY = this.gy + Directions.DELTA[this.game.lastKeyDirection].dy;
                    if(!this.game.checkObstacle(gridX, gridY)){
                        this.direction = this.game.lastKeyDirection;
                    }
                }
            }
            
            destX = this.x + Directions.DELTA[this.direction].dx * TILE / 6;
            destY = this.y + Directions.DELTA[this.direction].dy * TILE / 6;            

            gridX = parseInt((this.x + Directions.DELTA[this.direction].dx * (HALF_TILE + 0.5)) / TILE); 
            gridY = parseInt((this.y + Directions.DELTA[this.direction].dy * (HALF_TILE + 0.5)) / TILE);                                    

            if(!this.game.checkObstacle(gridX, gridY)){                           
                this.x = destX;
                this.y = destY;

                this.gx = gridX;
                this.gy = gridY;

                this.stucked = false;                  
            }else{
                if(!this.stucked){                    
                    SOUNDS.hit.play(0.5);
                    this.stucked = true;
                }
            }              

            if(this.game.detectPlayerGhostCollision()){            
                this.game.hitPlayerAndGhost();
            }            

            if(this.game.checkPill(this.gx, this.gy)){                                                        
                this.game.collectPill(this.gx, this.gy);
            }

            if(this.game.checkExtraLife(this.gx, this.gy)){                                
                this.game.collectExtraLife();
            }
            
            if(this.game.checkKey(this.gx, this.gy)){                                            
                this.game.triggerKey(this.gx, this.gy);
            }
        }        
    }

    if(this.state == PlayerState.COMPLETED){
        this.game.completeLevel();
    }else if(this.state == PlayerState.DEAD){
        this.game.checkPlayerDeath();
    }else if(this.state == PlayerState.HIT){        
        this.mouthOpening += 0.1; 
        if(this.mouthOpening > 3){
            this.state = PlayerState.DEAD;
        }
    }
}

Player.prototype.draw = function(ctx, scale){

    if(scale == undefined){
        scale = TILE;
    }

    ctx.fillStyle = this.color;    
    
    var archStart = 0;
    var archEnd = 0;

    if(this.direction == Directions.RIGHT){        
        archStart = 1;
        archEnd = 0;
    }

    if(this.direction == Directions.LEFT){
        archStart = 0;
        archEnd = 1;
    }

    if(this.direction == Directions.DOWN){
        archStart = 1.5;
        archEnd = 0.5;
    }

    if(this.direction == Directions.UP){
        archStart = 0.5;
        archEnd = 1.5;
    }    

    if(this.state == PlayerState.MOVING || this.state == PlayerState.STOPPED){        
        this.mouthOpening = (Math.sin(Loop.lastTime / 333 * Math.PI) / 2 + 0.5);        
    }
        
    ctx.beginPath();
    ctx.arc(this.x, this.y, scale/2, Math.PI * archStart, -this.mouthOpening + Math.PI * archEnd);    
    ctx.arc(this.x, this.y, scale/2, Math.PI * archStart, +this.mouthOpening + Math.PI * archEnd, true);
    ctx.fill();          

    //debug point
    //ctx.fillStyle = "red";
    //ctx.fillRect(this.x, this.y, TILE/8, TILE/8);            
}