var GhostState = {
    DUMB : 0,
    CHASING : 1,
    EXPLORING: 3    
}

function Ghost(id, gx, gy, options){
    var defaults = {
        direction : Directions.RIGHT,
        color : Colors.GREY,
        state : GhostState.DUMB,
        clockwise : true,
        speed : 1,
        range: 6
    }

    options = (typeof options == "undefined") ? {} : options;
    for(var i in defaults){ 
        if(typeof options[i] == "undefined"){
           this[i] = defaults[i];
        }else{
            this[i] = options[i];
        }
    }

    this.id = id;
    this.gx = gx;
    this.gy = gy;
    this.game = undefined;
    this.initialState = JSON.parse(JSON.stringify(this));        
}

Ghost.prototype.reset = function(){
    for(var i in this.initialState){ 
        this[i] = this.initialState[i];
    }
}

Ghost.prototype.dumbWalk = function(){
    
    var tries = 0;
    while(true){                                
        var destX = this.x + Directions.DELTA[this.direction].dx * TILE / 8 * this.speed;
        var destY = this.y + Directions.DELTA[this.direction].dy * TILE / 8 * this.speed;

        var gridX = parseInt((this.x + Directions.DELTA[this.direction].dx * (HALF_TILE + 0.5)) / TILE); 
        var gridY = parseInt((this.y + Directions.DELTA[this.direction].dy * (HALF_TILE + 0.5)) / TILE);
        
        if(!this.game.checkObstacle(gridX, gridY)){
            this.x = destX;
            this.y = destY;       

            this.gx = gridX;
            this.gy = gridY;       

            break;
        }else{
            if(this.clockwise){            
                Directions.nextDirection(this);            
            }else{
                Directions.previousDirection(this);            
            }
        }
        tries++;
        if(tries > 4){
            break;
        }
    }    
}

Ghost.prototype.chaseWalk = function(){
    
    var r = Math.random();
    var destX, destY, gridX, gridY;

    if((this.x - HALF_TILE) % TILE == 0 && (this.y - HALF_TILE) % TILE == 0){                                    

        var distance = this.distanceToPlayer(this.gx, this.gy, this.game.player);
        if(distance <= this.range){                                                                                
            if(this.state != GhostState.CHASING){
                this.state = GhostState.CHASING;
                this.visitedTiles = new Grid(GRID_WIDTH, GRID_HEIGHT);                                                                      
            }
        }else{            
            if(this.state == GhostState.CHASING){
                this.visitedTiles = undefined;                
            }
            this.state = GhostState.EXPLORING;                        
        }                

        if(this.state){
            if(this.state == GhostState.EXPLORING){                        
                if(r < 0.05){
                    Directions.nextDirection(this);        
                }else if(r < 0.1){
                    Directions.previousDirection(this);
                }        
            }else if(this.state == GhostState.CHASING){
                this.setNextChasingDirection();
            }
        }
    }

    var tries = 0;
    while(true){                                
        destX = this.x + Directions.DELTA[this.direction].dx * TILE / 8 * this.speed;
        destY = this.y + Directions.DELTA[this.direction].dy * TILE / 8 * this.speed;

        gridX = parseInt((this.x + Directions.DELTA[this.direction].dx * (HALF_TILE + 0.5)) / TILE); 
        gridY = parseInt((this.y + Directions.DELTA[this.direction].dy * (HALF_TILE + 0.5)) / TILE);
        
        if(!this.game.checkObstacle(gridX, gridY)){
            this.x = destX;
            this.y = destY; 

            if(this.state == GhostState.CHASING &&
                (this.gx != gridX || this.gy != gridY)){
                var visit = this.visitedTiles.get(gridX, gridY);                                
                if(!visit){
                    this.visitedTiles.set(gridX, gridY, { count: 1, time: Loop.lastTime});
                }else{
                    this.visitedTiles.set(gridX, gridY, { count: visit.count + 1, time: Loop.lastTime});
                }                
            }
            

            this.gx = gridX;
            this.gy = gridY;       

            break;
        }else{            
            if(r < 0.5){
                Directions.nextDirection(this);
            }else{
                Directions.previousDirection(this);
            }                    
        }
        tries++;
        if(tries > 4){
            break;
        }
    }
}

    
Ghost.prototype.distanceToPlayer = function(x, y, player){
    var dx = player.gx - x;
    var dy = player.gy - y;
    return Math.sqrt(dx*dx + dy*dy);
}
    
Ghost.prototype.setNextChasingDirection = function(){
    var nextX = this.gx;
    var nextY = this.gy;
    var smallestDistance = Number.MAX_SAFE_INTEGER; 
    for(var x=-1; x<=1; x++){
        for(var y=-1; y<=1; y++){            
            if((x+y) * (x+y) != 1){ //consider only the cross
                continue;
            }            

            var ex = this.gx + x;
            var ey = this.gy + y;
            if(ex > 0 && ex > 0
                && ex < GRID_WIDTH && ey < GRID_HEIGHT
                && !this.game.checkObstacle(ex, ey)){
                var distance = this.distanceToPlayer(ex, ey, this.game.player);                            
                var visit = this.visitedTiles.get(ex, ey);
                var visitCount = visit ? visit.count : 0;                
                if(distance + visitCount < smallestDistance){
                    nextX = ex;
                    nextY = ey;
                    smallestDistance = distance;
                }                
            }
        }
    }    
    
    var dx = nextX - this.gx;
    var dy = nextY - this.gy;
    if(dx*dx > dy*dy){
        if(dx > 0){
            this.direction = Directions.RIGHT;                                        
        }else{
            this.direction = Directions.LEFT;                    
        }
    }else{
        if(dy > 0){
            this.direction = Directions.DOWN;            
        }else{
            this.direction = Directions.UP;                    
        }                
    }    
}

Ghost.prototype.draw = function(ctx, scale){        

    ctx.fillStyle = this.color;    
    ctx.beginPath();
    ctx.arc(this.x, this.y, scale/2, Math.PI, 0);
    ctx.fill();
    
    ctx.fillRect(this.x - scale/2 , this.y - 1, scale, scale/2);    

    if(this.state == GhostState.DUMB){
        ctx.fillStyle = "white";  
        ctx.beginPath();
        ctx.arc(this.x+0.70*scale - scale/2, this.y, scale/5, 0, Math.PI);        
        ctx.arc(this.x+0.30*scale - scale/2, this.y, scale/5, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = "black";    
        ctx.beginPath();
        ctx.arc(this.x+0.70*scale + scale/2*(1.0 + Directions.DELTA[this.direction].dx/5) - scale, 
            this.y-1+1*(1.0 + Directions.DELTA[this.direction].dy/5), scale/9, 0, Math.PI);
        ctx.arc(this.x+0.30*scale + scale/2*(1.0 + Directions.DELTA[this.direction].dx/5) - scale, 
            this.y-1+1*(1.0 + Directions.DELTA[this.direction].dy/5), scale/9, 0, Math.PI);
        ctx.fill();
    }else if(this.state == GhostState.EXPLORING){                
        ctx.fillStyle = "white";  
        ctx.beginPath();
        ctx.arc(this.x+0.70*scale - scale/2, this.y, scale/4, 0, 2*Math.PI);        
        ctx.arc(this.x+0.30*scale - scale/2, this.y, scale/4, 0, 2*Math.PI);
        ctx.fill();
        ctx.fillStyle = "black";    
        ctx.beginPath();
        ctx.arc(this.x+0.70*scale + scale/2*(1.0 + Directions.DELTA[this.direction].dx/5) - scale, 
            this.y+1*(1.0 + Directions.DELTA[this.direction].dy/5), scale/8, 0, 2*Math.PI);
        ctx.arc(this.x+0.30*scale + scale/2*(1.0 + Directions.DELTA[this.direction].dx/5) - scale, 
            this.y+1*(1.0 + Directions.DELTA[this.direction].dy/5), scale/8, 0, 2*Math.PI);
        ctx.fill();        
    }else if(this.state == GhostState.CHASING){
        ctx.fillStyle = "white";    
        ctx.beginPath();
        ctx.arc(this.x+0.70*scale - scale/2, this.y, scale/4, Math.PI, 1.75*Math.PI, true);       
        ctx.fill();
        ctx.beginPath(); 
        ctx.arc(this.x+0.30*scale - scale/2, this.y, scale/4, 1.25*Math.PI, 0, true);
        ctx.fill();
        ctx.fillStyle = "black";    
        ctx.beginPath();
        ctx.arc(this.x+0.70*scale + scale/2*(1.0 + Directions.DELTA[this.direction].dx/5) - scale, 
            this.y+1*(1.0 + Directions.DELTA[this.direction].dy/5), scale/12, 0, 2*Math.PI);
        ctx.arc(this.x+0.30*scale + scale/2*(1.0 + Directions.DELTA[this.direction].dx/5) - scale, 
            this.y+1*(1.0 + Directions.DELTA[this.direction].dy/5), scale/12, 0, 2*Math.PI);
        ctx.fill();    
    }

    //debug point
    //ctx.fillStyle = "red";
    //ctx.fillRect(this.x, this.y, TILE/8, TILE/8);            
}
    
//TODO: check ghost out of bounds (block or teletransport?)