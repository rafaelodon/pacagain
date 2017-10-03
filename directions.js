/**
 * A 4-direction notation.
 * 
 * @author Rafael Odon <odon.rafael@gmail.com>
 * 
 */
var Directions = {
    RIGHT : 0,
    DOWN : 1,
    LEFT : 2,
    UP : 3,
    DELTA : [
        { dx: 1, dy: 0}, // right    
        { dx: 0, dy: 1}, // down    
        { dx: -1, dy: 0}, // left        
        { dx: 0, dy: -1}, // up    
    ]
}

Directions.oppositeDirection = function(obj){
    obj.direction = (obj.direction + 2) % 4;
}

Directions.nextDirection = function(obj){
    obj.direction = (obj.direction + 1) % 4;    
}

Directions.previousDirection = function(obj){
    obj.direction = (obj.direction + 3) % 4;            
}