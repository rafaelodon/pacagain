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
    LIFE : 3,   
    GHOST : 4
}

var Orientations = {
    VERTICAL : 1,
    HORIZONTAL : 2
}

var Scenes = {
    INTRO : 0,    
    SELECT_LEVEL : 1,
    PRE_LEVEL : 2,
    GAME : 3,
    GAME_OVER : 4,
    LEVEL_COMPLETED : 5,
    WIN : 6
}

var OverlayType = {
    CIRCLE : 0,
    FADE_OUT : 1,
    FADE_IN : 2
}

var EasingType = {
    LINEAR: 0,
    EXP: 1,    
    LOG: 2
}