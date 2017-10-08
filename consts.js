/**
 * Constants definitions file.
 * 
 * @author Rafael Odon <odon.rafael@gmail.com>
 */

var TILE=24;
var HALF_TILE=TILE/2;
var GRID_WIDTH=25;
var GRID_HEIGHT=26;
var REAL_WIDTH=TILE*GRID_WIDTH;
var REAL_HEIGHT=TILE*GRID_HEIGHT;

var Colors = {
    RED : "#F00",
    GREEN : "#0F0",
    BLUE : "#00F",
    PINK : "#F0F",
    YELLOW: "#FF0",
    CIANO : "#0FF",
    GREY : "#888"
}

var Objects = {
    PILL : 0,
    DOOR : 1,    
    KEY : 2,
    LIFE : 3    
}

var Orientations = {
    VERTICAL : 1,
    HORIZONTAL : 2
}

var Scenes = {
    INTRO : 0,
    PRE_LEVEL : 1,
    GAME : 2,
    GAME_OVER : 3,
    LEVEL_COMPLETED : 4,
    WIN : 5
}