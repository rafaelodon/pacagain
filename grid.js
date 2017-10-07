/**
 * A simple two-dimensional grid.
 * 
 * @param {*} width The grid width
 * @param {*} height The grid height
 * @author Rafael Odon <odon.rafael@gmail.com>
 */
function Grid(width, height){
    this.width = width;
    this.height = height;
    this.objects = [];   
}

Grid.prototype.set = function(x, y, obj){
    if(this.objects[x] === undefined){
        this.objects[x] = new Array(this.width);
    }
    this.objects[x][y] = obj;
}

Grid.prototype.get = function(x,y){
    if(this.objects[x]){    
        return this.objects[x][y];
    }else{
        return undefined;
    }
}

Grid.prototype.clearPosition = function(x,y){
    if(this.objects[x] && this.objects[x][y]){
        this.objects[x][y] = undefined;
    }
}

Grid.prototype.clearAll = function(){
    this.objects = [];    
}

Grid.prototype.each = function(callBack){
    for(var y=0; y<this.height; y++){
        for(var x=0; x<this.width; x++){
            if(this.objects[x] && this.objects[x][y]){
                callBack(this.objects[x][y]);
            }
        }
    }
}