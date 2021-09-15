/**
 * Constants definitions file.
 * 
 * @author Rafael Odon <odon.rafael@gmail.com>
 */

var TILE = 24;
var HALF_TILE = TILE / 2;
var GRID_WIDTH = 25;
var GRID_HEIGHT = 26;
var REAL_WIDTH = TILE * GRID_WIDTH;
var REAL_HEIGHT = TILE * GRID_HEIGHT;

var Colors = {
    RED: "#F00",
    GREEN: "#0F0",
    BLUE: "#00F",
    PINK: "#F0F",
    YELLOW: "#FF0",
    CIANO: "#0FF",
    ORANGE: "#FFA500",
    INDIGO: "#4B0082",
    GREY: "#888",
    //levels map colors
    PATH: "#D09A37",
    BLOCKED_PATH: "#467821",
}

var Objects = {
    PILL: 0,
    DOOR: 1,
    KEY: 2,
    LIFE: 3,
    GHOST: 4,
    NIBBLE: 5,
}

var Orientations = {
    VERTICAL: 1,
    HORIZONTAL: 2
}

var Scenes = {
    INTRO: 0,
    SELECT_LEVEL: 1,
    PRE_LEVEL: 2,
    GAME: 3,
    GAME_OVER: 4,
    LEVEL_COMPLETED: 5,
    WIN: 6,
    MAP_EDITOR: -1
}

var OverlayType = {
    CIRCLE: 0,
    FADE_OUT: 1,
    FADE_IN: 2
}

var EasingType = {
    LINEAR: 0,
    EXP: 1,
    LOG: 2
}

var MapEditorTools = {
    EMPTY: "empty",
    WALL: "wall",
    DOT: "dot",
    PAC: "pac",
    GHOST: "ghost",    
    NIBBLE: "nibble"
}