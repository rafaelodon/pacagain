

var LEVELS = new Array();

LEVELS.push({        
    completed: true,
    wallsColor: "#990000",
    instruction: "Simply collect all pills.",        
    extraLife : false,    
    enemies :  [],
    map: [
        "#########################",
        "#########################",
        "#########################",
        "#########################",
        "#########################",
        "#########################",    
        "#########################",
        "#########################",    
        "#########################",    
        "#####               #####",    
        "#####               #####",    
        "#####               #####",    
        "#####    #######    #####",    
        "#####    #     #    #####",
        "#####    #  p  #    #####",
        "#####    #     #    #####",    
        "#####    ### ###    #####",   
        "#####               #####",    
        "#####       .       #####",                
        "#####               #####",    
        "#########################", 
        "#########################",    
        "#########################",    
        "#########################",
        "#########################",
        "#########################"
    ],
});

LEVELS.push({        
    completed: true,
    wallsColor: "#990000",
    instruction: "Simply collect all pills.",        
    extraLife : false,    
    enemies :  [],
    map: [
        "#########################",
        "#########################",
        "#########################",
        "#########################",
        "#########################",
        "#########################",    
        "#########################",
        "#########################",    
        "#########################",    
        "#####               #####",    
        "##### .   .   .   . #####",    
        "#####               #####",    
        "#####    #######    #####",    
        "#####    #     #    #####",
        "##### .  #  p  #  . #####",
        "#####    #     #    #####",    
        "#####    ### ###    #####",   
        "#####               #####",    
        "##### .   .   .   . #####",                
        "#####               #####",    
        "#########################", 
        "#########################",    
        "#########################",    
        "#########################",
        "#########################",
        "#########################"
    ],
});

LEVELS.push({        
    wallsColor: "#990000",
    instruction: "Avoid hitting the dumb ghosts.",    
    enemies : [
        new Ghost(1, 12, 9, { direction: Directions.RIGHT }),
        new Ghost(2, 12, 11, { direction : Directions.LEFT, clockwise: false})        
    ], 
    extraLife : false,    
    map: [
        "#########################",
        "#########################",
        "#########################",
        "#########################",
        "#########################",
        "#########################",    
        "#########################",
        "#########################",    
        "#########################",    
        "####.       .       .####",    
        "####  #############  ####",    
        "####  #.         .#  ####",    
        "####  #  ### ###  #  ####",    
        "####  #  #     #  #  ####",
        "####     #  p  #     ####",
        "####  #  #     #  #  ####",    
        "####  #  ### ###  #  ####",   
        "####  #.         .#  ####",    
        "####  #############  ####",                
        "####.       .       .####",    
        "#########################", 
        "#########################",    
        "#########################",    
        "#########################",
        "#########################",
        "#########################"
    ],
});

LEVELS.push({        
    wallsColor: "#990000",
    instruction: "Run away from smart ghosts.",    
    extraLife : false,    
    enemies: [        
        new Ghost(1, 12, 9, { color: Colors.RED, state: GhostState.EXPLORING }),
    ],
    map: [
        "#########################",
        "#########################",
        "#########################",
        "#########################",
        "#########################",
        "#########################",    
        "#########################",
        "#########################",    
        "#########################",    
        "#####               #####",    
        "##### . . . . . . . #####",    
        "#####               #####",    
        "##### .  ### ###  . #####",    
        "#####    #     #    #####",
        "##### .     p     . #####",
        "#####    #     #    #####",    
        "##### .  ### ###  . #####",   
        "#####               #####",    
        "##### . . . . . . . #####",                
        "#####               #####",    
        "#########################", 
        "#########################",    
        "#########################",    
        "#########################",
        "#########################",
        "#########################"
    ],
});

LEVELS.push({    
    instruction: "Unlock the door.",
    extraLife: true,
    enemies: [
        new Ghost(1, 21, 13, { color: Colors.RED, state: GhostState.EXPLORING})
    ],
    wallsColor: "#990000",
    map: [
        "#########################",
        "#########################",
        "#########################",
        "#########################",
        "#########################",
        "#########################",    
        "#########################",
        "#########################",    
        "#########################",    
        "#########################",    
        "#########################",    
        "## . #             # . ##",    
        "##   #  #  ###  #  #   ##",    
        "## 2    #   p   #  1 . ##",
        "##   #  #  ###  #  #   ##",    
        "## . #             # . ##",   
        "#########################",    
        "#########################",    
        "#########################",    
        "#########################",    
        "#########################", 
        "#########################",    
        "#########################",    
        "#########################",
        "#########################",
        "#########################"
    ],
    objects: {
        1 : {
            type : Objects.DOOR,
            key: 2,
            orientation: Orientations.VERTICAL,
            locked: true,                                    
            color: "red",
            opening: 1.0
        },
        2 : {
            type : Objects.KEY,
            door: 1,
            triggered: false,
            color: "red"
        }        
    }
});

LEVELS.push({    
    instruction: "Examine the map...",
    extraLife: true,
    enemies: [
        new Ghost(1, 13, 20),
        new Ghost(1, 13, 4, { direction: Directions.LEFT, clockwise: false }),
        new Ghost(1, 21, 13, { color : Colors.RED, state: GhostState.EXPLORING }),
    ],
    wallsColor: "#990000",
    map: [
        "#########################",
        "#########################",
        "#########################",
        "#########################",
        "#########       #########",                
        "#########   .   #########",    
        "######### . 4 . #########",    
        "#########       #########",    
        "############ ############",
        "############1############",
        "######             ######",        
        "## . #             # . ##",    
        "##   #  #  ###  #  #   ##",    
        "##.2    #   p   #  5 . ##",
        "##   #  #  ###  #  #   ##",    
        "## . #             # . ##",   
        "######             ######",        
        "############3############",    
        "############ ############",    
        "#########       #########",    
        "######### . 6 . #########",    
        "#########   .   #########",            
        "#########       #########",            
        "#########################",
        "#########################",
        "#########################"
    ],
    objects: {
        1 : {
            type : Objects.DOOR,
            key: 2,
            orientation: Orientations.HORIZONTAL,
            locked: true,                                    
            color: "red",
            opening: 1.0
        },
        2 : {
            type : Objects.KEY,
            door: 1,
            triggered: false,
            color: "red"
        },
        3 : {
            type : Objects.DOOR,
            key: 4,
            orientation: Orientations.HORIZONTAL,
            locked: true,                                    
            color: "lime",
            opening: 1.0
        },
        4 : {
            type : Objects.KEY,
            door: 3,
            triggered: false,
            color: "lime"
        },
        5 : {
            type : Objects.DOOR,
            key: 6,
            orientation: Orientations.VERTICAL,
            locked: true,                                    
            color: "blue",
            opening: 1.0
        },
        6 : {
            type : Objects.KEY,
            door: 5,
            triggered: false,
            color: "blue"
        }                
    }
});

LEVELS.push({
    pillsCount: 10,
    enemies: [
        new Ghost(0, 22, 8),
        new Ghost(1, 12, 12, { direction: Directions.LEFT, clockwise: false}),
        new Ghost(2, 2, 8, { color : Colors.RED, state: GhostState.EXPLORING }),
        new Ghost(3, 22, 20, { color : Colors.GREEN, state: GhostState.EXPLORING }),
    ],
    wallsColor: "#006600",
    map: [
        "#########################",
        "#########################",
        "#########################",
        "#########################",
        "#########################",
        "#########################",    
        "##                     ##",    
        "## ....  .......  .... ##",    
        "## .##.  #######  .##. ##",    
        "## .##.  .......  .##. ##",    
        "## ....           .... ##",    
        "##       ### ###       ##",    
        "## .#.   #     #   .#. ##",    
        "## .#.      p      .#. ##",    
        "## .#.   #     #   .#. ##",    
        "##       ### ###       ##",    
        "## ....           .... ##",    
        "## .##.  .......  .##. ##",    
        "## .##.  #######  .##. ##",    
        "## ....  .......  .... ##",           
        "##                     ##",    
        "#########################",    
        "#########################",    
        "#########################",
        "#########################",
        "#########################"
    ]
});

LEVELS.push({
    pillsCount: 15,
    enemies: [
        new Ghost(1, 2, 8, { color : Colors.RED, state: GhostState.EXPLORING }),
        new Ghost(2, 22, 20, { color : Colors.GREEN, state: GhostState.EXPLORING }),
        new Ghost(3, 2, 20, { color : Colors.BLUE, state: GhostState.EXPLORING }),                
    ],
    wallsColor: "#003366",
    map: [
        "#########################",
        "#########################",
        "#########################",
        "#########################",
        "#########################",
        "##                     ##",        
        "##          #          ##",    
        "##  #      ###      #  ##",    
        "##  ###  #######  ###  ##",    
        "##  #       #       #  ##",    
        "##                     ##",    
        "##       ### ###       ##",    
        "##  #    #     #    #  ##",    
        "##  ###     p     ###  ##",    
        "##  #    #     #    #  ##",    
        "##       ### ###       ##",    
        "##                     ##",    
        "##  #       #       #  ##",    
        "##  ###  #######  ###  ##",    
        "##  #      ###      #  ##",           
        "##          #          ##",    
        "##                     ##",    
        "#########################",    
        "#########################",
        "#########################",
        "#########################"
    ]
});

LEVELS.push({
    pillsCount: 20,
    enemies: [
        new Ghost(1, 2, 8, { color : Colors.RED, state: GhostState.EXPLORING }),        
        new Ghost(2, 22, 20, { color : Colors.GREEN, state: GhostState.EXPLORING }),        
        new Ghost(3, 2, 20, { color : Colors.BLUE, state: GhostState.EXPLORING }),        
        new Ghost(4, 22, 4, { color : Colors.PINK, state: GhostState.EXPLORING }),        
    ],
    wallsColor: "#660066",
    map: [
        "#########################",
        "#########################",
        "#########################",
        "#########################",
        "##                     ##",        
        "##                     ##",        
        "##  #### ####### ####  ##",        
        "##  #               #  ##",    
        "##  #               #  ##",    
        "##  #  ###########  #  ##",    
        "##  #  #         #  #  ##",    
        "##  #               #  ##",    
        "##  #  #  ## ##  #  #  ##",            
        "##  #  #  #   #  #  #  ##",    
        "##     #  # p #  #     ##",    
        "##  #  #  #   #  #  #  ##",    
        "##  #  #  ## ##  #  #  ##",    
        "##  #               #  ##",    
        "##  #  #         #  #  ##",    
        "##  #  ###########  #  ##",           
        "##  #               #  ##",    
        "##  #               #  ##",    
        "##  #### ####### ####  ##",       
        "##                     ##",    
        "##                     ##",
        "#########################"
    ]
});

LEVELS.push({
    pillsCount: 25,
    enemies: [
        new Ghost(1, 2, 8, { color : Colors.RED, state: GhostState.EXPLORING }),        
        new Ghost(2, 22, 20, { color : Colors.GREEN, state: GhostState.EXPLORING }),        
        new Ghost(3, 2, 20, { color : Colors.BLUE, state: GhostState.EXPLORING }),        
        new Ghost(4, 1, 23, { color : Colors.PINK, state: GhostState.EXPLORING }),        
        new Ghost(5, 1, 12, { color : Colors.YELLOW, state: GhostState.EXPLORING }),                
    ],
    wallsColor: "#996600",
    map: [
        "#########################",
        "#########################",
        "##                     ##",        
        "##  #### ######## ###  ##",        
        "##  #               #  ##",        
        "##  #               #  ##",        
        "##    ###### ######    ##",        
        "##  #               #  ##",    
        "##  #               #  ##",    
        "##  #  ##### #####  #  ##",    
        "##     #         #     ##",    
        "##  #  #  ## ##  #  #  ##",            
        "##  #  #  #   #  #  #  ##",    
        "##  #       p       #  ##",    
        "##  #  #  #   #  #  #  ##",    
        "##  #  #  ## ##  #  #  ##",    
        "##     #         #     ##",    
        "##  #  ##### #####  #  ##",    
        "##  #               #  ##",           
        "##  #               #  ##",    
        "##    ###### ######    ##",        
        "##  #               #  ##",    
        "##  #               #  ##",    
        "##  #### ####### ####  ##",               
        "##                     ##",
        "#########################"
    ]
});

LEVELS.push({
    pillsCount : 30,
    enemies : [
        new Ghost(1, 2, 8, { color : Colors.RED, state: GhostState.EXPLORING }),        
        new Ghost(2, 22, 20, { color : Colors.GREEN, state: GhostState.EXPLORING }),        
        new Ghost(3, 2, 20, { color : Colors.BLUE, state: GhostState.EXPLORING }),        
        new Ghost(4, 1, 23, { color : Colors.PINK, state: GhostState.EXPLORING }),        
        new Ghost(5, 1, 12, { color : Colors.YELLOW, state: GhostState.EXPLORING }),                
        new Ghost(6, 23, 12, { color : Colors.CIANO, state: GhostState.EXPLORING }),                        
    ],
    wallsColor: "#006666",
    map : [    
        "#########################",
        "#########################",
        "#           #           #",
        "#                       #",
        "#  ###  #### ####  ###  #",    
        "#                       #",    
        "#  #                 #  #",
        "#  #### ###   ### ####  #",    
        "#  #        #        #  #",    
        "#                       #",
        "#  ###   ### ###   ###  #",    
        "#       ##     ##       #",
        "#  #    #       #    #  #",
        "#  #  #     p     #  #  #",    
        "#  #    #       #    #  #",
        "#       ##     ##       #",
        "#  ###   ### ###   ###  #",    
        "#                       #",    
        "#  #        #        #  #",
        "#  #### ###   ### ####  #",    
        "#  #                 #  #",
        "#                       #",    
        "#  ###  #### ####  ###  #",    
        "#                       #",    
        "#           #           #",
        "#########################"
    ]
});

LEVELS.push({
    instruction : "The Price of Freedom...",
    enemies : [
        new Ghost(1, 2, 8, { color : Colors.RED, state: GhostState.EXPLORING }),        
        new Ghost(2, 22, 20, { color : Colors.GREEN, state: GhostState.EXPLORING }),        
        new Ghost(3, 2, 20, { color : Colors.BLUE, state: GhostState.EXPLORING }),        
        new Ghost(4, 1, 23, { color : Colors.PINK, state: GhostState.EXPLORING }),        
        new Ghost(5, 1, 12, { color : Colors.YELLOW, state: GhostState.EXPLORING }),                
        new Ghost(6, 23, 12, { color : Colors.CIANO, state: GhostState.EXPLORING }),                        
    ],
    wallsColor: "#006666",    
    map : [    
        "#########################",
        "#########################",
        "#.          .          .#",
        "#                       #",
        "#                       #",    
        "#                       #",    
        "#                       #",
        "#                       #",
        "#                       #",
        "#                       #",    
        "#                       #",    
        "#                       #",
        "#                       #",
        "#.          p          .#",
        "#                       #",    
        "#                       #",    
        "#                       #",
        "#                       #",
        "#                       #",
        "#                       #",    
        "#                       #",
        "#                       #",
        "#                       #",    
        "#                       #",    
        "#.          .          .#",
        "#########################"
    ]
});

LEVELS.push({    
    instruction: "Nostalgie...",
    extraLife: true,    
    wallsColor: "#990000",
    map: [
        "#########################",
        "#########################",        
        "##..........#..........##",    
        "##.###.####.#.####.###.##",    
        "##.###.####.#.####.###.##",                
        "##.....................##",    
        "##.###.#.#######.#.###.##",    
        "##.....#....#....#.....##",    
        "######.####.#.####.######",    
        "######.#.........#.######",    
        "######.#.### ###.#.######",    
        "######.#.#     #.#.######",    
        ".........#     #.........",        
        "######.#.#     #.#.######",        
        "######.#.#######.#.######",    
        "######.#.........#.######",    
        "######.#.#######.#.######",    
        "##..........#..........##",    
        "##.###.####.#.####.###.##",    
        "##...#......p......#...##",    
        "####.#.#.####### #.#.####",            
        "##.....#....#....#.....##",    
        "##.########.#.########.##",    
        "##.....................##",        
        "#########################",
        "#########################",
    ],    
    enemies: [        
        new Ghost(1, 12, 13, { color: Colors.RED, state: GhostState.EXPLORING }),
    ],
});

LEVELS.push({        
    completed: true,
    wallsColor: "#990000",
    instruction: "Simply collect all pills.",        
    extraLife : false,    
    enemies :  [],
    map: [
        "#########################",
        "#########################",
        "#########################",
        "#########################",
        "#########################",
        "#########################",    
        "#########################",
        "#########################",    
        "#########################",    
        "#####               #####",    
        "#####               #####",    
        "#####               #####",    
        "#####    #######    #####",    
        "#####    #     #    #####",
        "#####    #  p  #    #####",
        "#####    #     #    #####",    
        "#####    ### ###    #####",   
        "#####               #####",    
        "#####       .       #####",                
        "#####               #####",    
        "#########################", 
        "#########################",    
        "#########################",    
        "#########################",
        "#########################",
        "#########################"
    ],
});