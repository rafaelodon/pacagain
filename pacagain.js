/**
 * PAC-AGAIN
 * 
 * A pacman variation written in pure HTML5 Canvas/JavaScript (ES5) for learning purposes.
 * 
 * @author Rafael Odon <odon.rafael@gmail.com>
 */
var Game = {
    ctx: undefined,
    auxCanvas: undefined,
    currentLevelNumber: 1,
    currentLevel: LEVELS[0],
    nextAvaiableLevel: 1,
    overlay: {},
    player: new Player(12, 13),
    playing: true,
    escaping: false,
    objects: new Grid(GRID_WIDTH, GRID_HEIGHT),
    pillsCollected: 0,
    lastKeyDirection: undefined,
    currentScene: undefined,
    lifeCount: 3,
    extraLife: { active: false, collected: true, gx: 12, gy: 12 }, //TODO: extra life    
    selectedLevel: 0,
    targetLevel: 0,
    levelsMap: undefined
}

Game.preRenderLevel = function () {
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

Game.setCanvas = function (canvas) {
    var scale = 1;
    var scaleX = window.innerWidth / (GRID_WIDTH * TILE);
    var scaleY = (window.innerHeight - (window.innerHeight / 4)) / (GRID_HEIGHT * TILE);

    if (scaleX < scaleY) {
        scale = scaleX;
    } else {
        scale = scaleY;
    }

    canvas.width = GRID_WIDTH * TILE * scale;
    canvas.height = GRID_HEIGHT * TILE * scale;

    this.ctx = canvas.getContext("2d");
    this.ctx.scale(scale, scale);
}

Game.resetAll = function () {
    this.resetOverlay();
    this.resetMapObjects();
    this.resetLevel();
    this.resetEnemies();
    this.resetPlayer();
}

Game.resetOverlay = function () {
    this.overlay = {
        active: false,
        x: undefined,
        y: undefined,
        startTime: undefined,
        size: REAL_WIDTH,
        alpha: 1.0,
        duration: 1000
    };
}

Game.updateOverlay = function () {

    if (this.overlay.active) {

        if (typeof this.overlay.startTime == "undefined") {
            this.overlay.startTime = Loop.lastTime;
        }

        var loopCount = (Loop.lastTime - this.overlay.startTime) / (this.overlay.duration / Loop.fps);
        if (this.overlay.easing == EasingType.LOG) {
            var percent = Math.log10(1 + (loopCount / Loop.fps) * (9));

        } else if (this.overlay.easing == EasingType.EXP) {
            var percent = Math.exp(loopCount * Math.E / Loop.fps - 1) / (Math.E - 1);

        } else {
            //LINEAR            
            var percent = loopCount / Loop.fps;
        }

        //var percent = 1 - (Math.pow((Loop.lastTime - this.overlay.startTime + 1), 0.99)/1000);            

        if (this.overlay.type == OverlayType.CIRCLE) {
            this.overlay.size = REAL_WIDTH - (REAL_WIDTH * percent);
        } else if (this.overlay.type == OverlayType.FADE_OUT) {
            this.overlay.alpha = 1 - percent;
        } else if (this.overlay.type == OverlayType.FADE_IN) {
            this.overlay.alpha = percent;
        }

        if (percent >= 0.9999) {
            this.overlay.active = false;
            if (this.overlay.oncomplete) {
                console.log(Loop.lastTime - this.overlay.startTime);
                this.overlay.oncomplete(this);
            }
        }
    }
}

Game.resetEnemies = function () {
    this.currentLevel.enemies.forEach(function (enemy) {
        enemy.reset();
        enemy.x = enemy.gx * TILE + HALF_TILE;
        enemy.y = enemy.gy * TILE + HALF_TILE;
    });
}

Game.resetDoors = function () {
    for (var y = 0; y < GRID_HEIGHT; y++) {
        for (var x = 0; x < GRID_WIDTH; x++) {
            if (this.currentLevel.map[y].charAt(x) == "|") { // door
                if (this.doors[x] === undefined) {
                    this.doors[x] = new Array(GRID_WIDTH);
                }
                this.doors[x][y] = 1;
            }
        }
    }
}

Game.resetMapObjects = function () {

    this.objects.clearAll();

    if (typeof this.currentLevel.pillsCount == "undefined") {
        for (var i = 0; i < this.currentLevel.pillsCount; i++) {
            var p = this.generateCoordinateOnEmptySpace();
            this.objects.set(p.x, p.y, {
                type: Objects.PILL,
                collected: false
            });
        }
    }
    this.currentLevel.pillsCount = 0;


    for (var y = 0; y < GRID_HEIGHT; y++) {
        for (var x = 0; x < GRID_WIDTH; x++) {

            var tile = this.currentLevel.map[y].charAt(x);

            if (tile == "p") { // register player position
                this.player.ix = x;
                this.player.iy = y;
            } else if (tile == ".") { // register pills
                this.objects.set(x, y, {
                    type: Objects.PILL,
                    collected: false
                });
                this.currentLevel.pillsCount++;

            } else if (tile >= '0' && tile <= '9' ||
                tile >= 'A' && tile <= 'Z') { // register other objects
                if (this.currentLevel.objects[tile]) {
                    var obj = this.currentLevel.objects[tile];
                    obj.x = x;
                    obj.y = y;
                    this.objects.set(x, y, obj);
                }
            }
        }
    }
}

Game.update = function () {

    this.updateOverlay();

    if (this.currentScene == undefined) {
        this.currentScene = Scenes.INTRO;
        this.displayFadeOutOverlay();
    }

    if (this.currentScene == Scenes.GAME) {
        this.updateGhosts();
        this.player.update();
        this.updateDoors();
    } else if (this.currentScene == Scenes.SELECT_LEVEL) {
        this.updateLevelsMap();
    }
}

Game.updateLevelsMap = function () {

    if (typeof this.levelsMap == "undefined") {
        this.levelsMap = new Array();
        var that = this;
        this.levelsMapLoop(function (i, x, y) {
            that.levelsMap.push({
                levelNumber: i,
                x: x,
                y: y
            });
        });
        this.selectedLevel = this.currentLevelNumber - 1;
        this.targetLevel = this.selectedLevel;
        this.player.x = this.levelsMap[this.selectedLevel].x;
        this.player.y = this.levelsMap[this.selectedLevel].y;
        this.player.state = PlayerState.STOPPED;
    }

    var level = this.levelsMap[this.selectedLevel];
    if (this.player.state == PlayerState.STOPPED) {
        this.player.x = level.x;
        this.player.y = level.y;

        if (typeof this.lastKeyDirection != "undefined") {

            var currentX = this.levelsMap[this.selectedLevel].x;
            var currentY = this.levelsMap[this.selectedLevel].y;

            if (this.selectedLevel < LEVELS.length - 1) {
                var nextX = this.levelsMap[this.selectedLevel + 1].x;
                var nextY = this.levelsMap[this.selectedLevel + 1].y;

            }

            if (this.selectedLevel > 0) {
                var prevX = this.levelsMap[this.selectedLevel - 1].x;
                var prevY = this.levelsMap[this.selectedLevel - 1].y;

            }            

            if (this.lastKeyDirection == Directions.RIGHT) {
                if (nextX && nextX > currentX) {
                    this.targetLevel = this.selectedLevel + 1;
                    this.player.state = PlayerState.MOVING;
                } else if (prevX && prevX > currentX) {
                    this.targetLevel = this.selectedLevel - 1;
                    this.player.state = PlayerState.MOVING;
                }

            } else if (this.lastKeyDirection == Directions.LEFT) {
                if (nextX && nextX < currentX) {
                    this.targetLevel = this.selectedLevel + 1;
                    this.player.state = PlayerState.MOVING;
                } else if (prevX && prevX < currentX) {
                    this.targetLevel = this.selectedLevel - 1;
                    this.player.state = PlayerState.MOVING;
                }

            } else if (this.lastKeyDirection == Directions.DOWN) {
                if (nextY && nextY > currentY) {
                    this.targetLevel = this.selectedLevel + 1;
                    this.player.state = PlayerState.MOVING;
                }
            } else if (this.lastKeyDirection == Directions.UP) {                
                if (prevY && prevY < currentY) {                    
                    this.targetLevel = this.selectedLevel - 1;
                    this.player.state = PlayerState.MOVING;
                }
            }

            if(this.targetLevel > this.nextAvaiableLevel){
                this.player.state = PlayerState.STOPPED;
                this.targetLevel = this.selectedLevel;
            }

            if (this.player.state == PlayerState.MOVING) {
                SOUNDS.jump.play(0.25);
            }

            this.player.direction = this.lastKeyDirection;
            this.lastKeyDirection = undefined;            
        }
    }

    if (this.player.state == PlayerState.MOVING) {

        var x1 = this.player.x;
        var y1 = this.player.y;

        var x2 = this.levelsMap[this.targetLevel].x;
        var y2 = this.levelsMap[this.targetLevel].y;

        var dx = x2 - x1;
        var dy = y2 - y1;

        if (dx) {
            if (dx > 0) {
                this.player.x += TILE / 4;
            }
            if (dx < 0) {
                this.player.x -= TILE / 4;
            }
        } else if (dy) {
            if (dy > 0) {
                this.player.y += TILE / 4;
            }
            if (dy < 0) {
                this.player.y -= TILE / 4;
            }
        }

        if ((dx && dx * dx < TILE) || (dy && dy * dy < TILE)) {
            this.player.x = x2;
            this.player.y = y2;
            this.player.state = PlayerState.STOPPED;
            this.selectedLevel = this.targetLevel;
            this.lastKeyDirection = undefined;
        }

    }
}

Game.levelsMapLoop = function (callback) {
    var maxcols = 3;
    var col = 0;
    var row = 0;
    var x, y;
    for (var i = 0; i < LEVELS.length; i++) {
        var x = (col + 1) * REAL_WIDTH / maxcols - REAL_WIDTH / maxcols / 2;
        var y = REAL_HEIGHT / 5 * (row + 1);

        callback(i, x, y);

        if (row % 2 == 1) {
            col--;
        } else {
            col++;
        }

        if (col == maxcols) {
            row++;
            col = 2;
        }

        if (col < 0) {
            row++;
            col = 0;
        }
    }
}

Game.draw = function () {

    var ctx = this.ctx;

    if (this.auxCanvas == undefined) {
        this.preRenderLevel();
    }

    ctx.clearRect(0, 0, REAL_WIDTH, REAL_HEIGHT);

    this.drawOverlayBefore(ctx);

    if (this.currentScene == Scenes.INTRO) {

        SOUNDS.bg1.play();
        this.drawBackground(ctx);
        var dx = Math.sin(Loop.lastTime / 1000 * Math.PI) * TILE / 2;

        this.player.state = PlayerState.MOVING;
        this.player.x = REAL_WIDTH / 2 + dx;
        this.player.y = REAL_HEIGHT / 3;
        this.player.direction = Directions.LEFT;
        this.player.draw(ctx, TILE * 6);

        this.displayText(ctx, "PAC-AGAIN", REAL_WIDTH / 2, REAL_HEIGHT / 2 + TILE * 2, TILE * 3);
        this.displayText(ctx, "by Rafael Odon", REAL_WIDTH / 2, REAL_HEIGHT / 2 + TILE * 5, TILE * 0.75);
        this.blinkText(ctx, "PRESS ANY KEY...", REAL_WIDTH / 2, REAL_HEIGHT - TILE * 4, TILE);

    } else if (this.currentScene == Scenes.SELECT_LEVEL) {

        SOUNDS.bg3.play();
        this.drawLevelsMap(ctx);

    } else if (this.currentScene == Scenes.PRE_LEVEL) {

        SOUNDS.bg1.play();
        this.clearCanvas(ctx);
        this.displayDarkOverlay(ctx);
        this.displayText(ctx, "LEVEL " + this.currentLevelNumber + " of " + LEVELS.length, REAL_WIDTH / 2, REAL_HEIGHT / 4, TILE * 1.5)
        this.displayText(ctx, "LIFE x " + this.lifeCount, REAL_WIDTH / 2, REAL_HEIGHT / 3, TILE * 1.5, "red")
        if (this.currentLevel.enemies.length > 0) {
            var ghost = this.currentLevel.enemies[this.currentLevel.enemies.length - 1];
            ghost.state = ghost.initialState.state;
            ghost.x = REAL_WIDTH / 2;
            ghost.y = REAL_HEIGHT / 5 * 3;
            ghost.draw(ctx, TILE * 5);
        } else {
            this.player.state = PlayerState.MOVING;
            this.player.x = REAL_WIDTH / 2;
            this.player.y = REAL_HEIGHT / 5 * 3;
            this.player.direction = Directions.LEFT;
            this.player.draw(ctx, TILE * 5);
        }
        if (this.currentLevel.instruction) {
            this.displayText(ctx, "TIP: " + this.currentLevel.instruction, REAL_WIDTH / 2, (REAL_HEIGHT / 4) * 3, TILE, Colors.CIANO);
        }
        this.blinkText(ctx, "PRESS ANY KEY...", REAL_WIDTH / 2, REAL_HEIGHT - TILE * 4, TILE);

    } else if (this.currentScene == Scenes.GAME) {
        SOUNDS.bg2.play();
        this.clearCanvas(ctx);
        this.drawEnemies(ctx);
        this.drawExtraLife(ctx);
        this.player.draw(ctx, TILE);
        this.drawHeader(ctx);

        if (this.escaping) {
            this.displayDarkOverlay(ctx);
            this.blinkText(ctx, "Push ESC to return to the map.", REAL_WIDTH / 2, (REAL_HEIGHT / 4) * 2, TILE, Colors.RED);
            this.blinkText(ctx, "Push SPACE to continue playing.", REAL_WIDTH / 2, (REAL_HEIGHT / 4) * 2 + TILE * 2, TILE, Colors.GREEN);
        }

    } else if (this.currentScene == Scenes.GAME_OVER) {
        Soundtrack.pause();
        this.clearCanvas(ctx);
        this.displayDarkOverlay(ctx);
        this.displayLifeCount(ctx);
        this.displayText(ctx, "GAME OVER!", REAL_WIDTH / 2, REAL_HEIGHT / 2, TILE * 3);

    } else if (this.currentScene == Scenes.LEVEL_COMPLETED) {
        Soundtrack.pause();
        this.drawBackground(ctx);
        this.displayText(ctx, "LEVEL COMPLETED!", REAL_WIDTH / 2, REAL_HEIGHT / 3, TILE * 2);

        this.player.state = PlayerState.MOVING;
        this.player.x = REAL_WIDTH / 2;
        this.player.y = REAL_HEIGHT / 5 * 3;
        this.player.direction = Directions.LEFT;
        this.player.draw(ctx, TILE * 5);

        this.blinkText(ctx, "PRESS ANY KEY...", REAL_WIDTH / 2, REAL_HEIGHT - TILE * 4, TILE);

    } else if (this.currentScene == Scenes.WIN) {

        SOUNDS.bg3.play();

        this.drawBackground(ctx);
        this.displayText(ctx, "CONGRATULATIONS,", REAL_WIDTH / 2, REAL_HEIGHT / 3 - TILE * 2, TILE);
        this.displayText(ctx, "YOU HAVE COMPLETED ALL LEVELS!", REAL_WIDTH / 2, REAL_HEIGHT / 3, TILE);
        this.displayText(ctx, "THE END", REAL_WIDTH / 2, REAL_HEIGHT / 2, TILE * 2);

        var dx = Math.sin(Loop.lastTime / 500 * Math.PI) * TILE / 4;

        this.player.state = PlayerState.MOVING;
        this.player.x = REAL_WIDTH / 9 + dx;
        this.player.y = REAL_HEIGHT / 3 * 2;
        this.player.direction = Directions.LEFT;
        this.player.draw(ctx, TILE * 2);

        for (var i = 0; i < LEVELS[LEVELS.length - 1].enemies.length; i++) {
            var dx = Math.sin((Loop.lastTime + i * Loop.fps) / 500 * Math.PI) * TILE / 2
            var enemy = LEVELS[LEVELS.length - 1].enemies[i];
            enemy.state = GhostState.CHASING;
            enemy.direction = Directions.LEFT;
            enemy.x = REAL_WIDTH / 9 * (i + 3) + dx;
            enemy.y = REAL_HEIGHT / 3 * 2;
            enemy.draw(ctx, TILE * 2);
        }
    }

    this.drawOverlayAfter(ctx);
}

Game.drawLevelsMap = function (ctx) {

    ctx.fillStyle = "rgb(51, 102, 0)";
    ctx.fillRect(0, 0, REAL_WIDTH, REAL_HEIGHT);

    if (this.player.y > REAL_HEIGHT * 0.5) {
        if (!this.lastTranslateY) {
            this.lastTranslateY = 0;
        }

        this.lastTranslateY = REAL_HEIGHT * 0.5 - this.player.y;
        ctx.translate(0, this.lastTranslateY);
    } else {
        this.lastTranslateY = 0;
    }

    if (this.levelsMap) {        
        
        for (var i = 0; i < this.levelsMap.length; i++) {

            var level = this.levelsMap[i];                        

            if (this.selectedLevel == this.targetLevel
                && this.selectedLevel == i) {
                var grd = ctx.createRadialGradient(level.x, level.y, 0, level.x, level.y, TILE * 1.5);
                grd.addColorStop(0, "white");
                grd.addColorStop(1, "rgb(51, 102, 0)");

                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.ellipse(level.x, level.y, TILE * 2, TILE * 2, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = "rgb(204, 153, 0)";

            // draw the levels map "vertex"
            if (i > 0){
                if(i <= this.nextAvaiableLevel){
                    ctx.strokeStyle = "rgb(204, 153, 0)";                
                }else{
                    ctx.strokeStyle = "rgba(204, 153, 0, 0.2)";                
                }
                ctx.lineWidth = TILE;
                ctx.beginPath();
                ctx.moveTo(this.levelsMap[i - 1].x, this.levelsMap[i - 1].y);
                ctx.lineTo(level.x, level.y);
                ctx.stroke();
            }

            ctx.fillStyle = "rgb(204, 153, 0)";
            ctx.beginPath();
            ctx.ellipse(level.x, level.y, TILE, TILE, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        for (var i = 0; i < this.levelsMap.length; i++) {
            var level = this.levelsMap[i];

            if (!LEVELS[i].completed) {
                var dx = Math.sin((Loop.lastTime + i * Loop.fps * i * Loop.fps) / 1000 * Math.PI) * HALF_TILE;

                ctx.fillStyle = "rgba(0,0,0,0.3)";
                ctx.beginPath();
                ctx.ellipse(level.x + dx, level.y - HALF_TILE, HALF_TILE, HALF_TILE / 3, 0, 0, Math.PI * 2);
                ctx.fill();

                this.displayText(ctx, i + 1, level.x, level.y, TILE, "rgba(255,255,255,0.5)");
            } else {
                this.displayText(ctx, i + 1, level.x, level.y, TILE, "rgba(0,0,0,0.2)");
            }

        }

        for (var i = 0; i < this.levelsMap.length; i++) {
            var level = this.levelsMap[i];

            if (!LEVELS[i].completed) {
                var dx = Math.sin((Loop.lastTime + i * Loop.fps * i * Loop.fps) / 1000 * Math.PI) * HALF_TILE;

                var levelGhost = LEVELS[i].enemies[LEVELS[i].enemies.length - 1];
                var ghost = new Ghost(0, 1, 1);
                ghost.state = levelGhost.state;
                ghost.color = levelGhost.color;
                ghost.x = level.x + dx;
                ghost.y = level.y - TILE - HALF_TILE;
                ghost.draw(ctx, TILE);
            }

            if ((this.targetLevel >= this.selectedLevel && this.selectedLevel == i) ||
                (this.targetLevel < this.selectedLevel && this.targetLevel == i)) {
                ctx.fillStyle = "rgba(0,0,0,0.3)";
                ctx.beginPath();
                ctx.ellipse(this.player.x, this.player.y + HALF_TILE, HALF_TILE, HALF_TILE / 3, 0, 0, Math.PI * 2);
                ctx.fill();

                this.player.draw(ctx, TILE);
            }
        }

    }

    if (this.lastTranslateY) {
        ctx.translate(0, -this.lastTranslateY);
    }

    this.displayTextWidthShadow(ctx, "SELECT A LEVEL", REAL_WIDTH / 2, TILE, TILE * 2);
    this.displayTextWidthShadow(ctx, "Use arrows to navigate. Push space to select...", REAL_WIDTH / 2, REAL_HEIGHT - TILE * 2, TILE * 0.75);
}

Game.drawOverlayBefore = function (ctx) {
    if (this.overlay.active) {
        if (this.overlay.type == OverlayType.CIRCLE) {
            ctx.globalCompositeOperation = 'source-over';
            ctx.beginPath();
            ctx.arc(this.overlay.x, this.overlay.y, this.overlay.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-atop';
        }
    } else {
        ctx.globalCompositeOperation = 'source-over';
    }
}

Game.drawOverlayAfter = function (ctx) {
    if (this.overlay.active) {
        if (this.overlay.type == OverlayType.FADE_IN
            || this.overlay.type == OverlayType.FADE_OUT) {

            ctx.fillStyle = "rgba(0,0,0," + this.overlay.alpha + ")";
            ctx.fillRect(0, 0, REAL_WIDTH, REAL_HEIGHT);
        }
    }
}

Game.drawHeader = function (ctx) {
    ctx.fillStyle = "#444"
    ctx.fillRect(0, 0, REAL_WIDTH, TILE)
    this.displayText(ctx, "LEVEL " + this.currentLevelNumber + " of " + LEVELS.length +
        "        LIFES: " + this.lifeCount +
        "        PILLS: " + this.pillsCollected + " of " + this.currentLevel.pillsCount,
        REAL_WIDTH / 2, TILE * 0.4, TILE * 0.8);
}

Game.select = function () {
    if (this.currentScene == Scenes.SELECT_LEVEL) {
        if (this.selectedLevel == this.targetLevel) {
            SOUNDS.hit.play();
            this.currentLevelNumber = this.selectedLevel + 1;
            this.currentLevel = LEVELS[this.currentLevelNumber - 1];
            var that = this;
            this.displayFadeInOverlay(function (that) {
                that.prepareLevel();
            });
        }
    } else if (this.currentScene == Scenes.GAME) {
        if (this.escaping) {
            this.escaping = false;
            this.playing = true;
        }
    }
}

Game.moveUp = function () {
    this.lastKeyDirection = Directions.UP;    
}

Game.moveDown = function () {
    this.lastKeyDirection = Directions.DOWN;
}

Game.moveRight = function () {
    this.lastKeyDirection = Directions.RIGHT;
}

Game.moveLeft = function () {
    this.lastKeyDirection = Directions.LEFT;
}

Game.continueOnKeyOrTouch = function () {
    if (this.currentScene == Scenes.PRE_LEVEL) {
        this.currentScene = Scenes.GAME;
        this.resetEnemies();
        this.resetPlayer();
        this.playing = true;

        return true;

    } else if (this.currentScene == Scenes.LEVEL_COMPLETED) {
        if(this.currentLevelNumber >= LEVELS.length){
            this.currentScene = Scenes.WIN;
        }else{
            this.goToLevelsMap();        
        }
        return true;

    } else if (this.currentScene == Scenes.INTRO) {
        this.currentScene = Scenes.SELECT_LEVEL;

        return true;
    }

    return false;
}

Game.resetLevel = function () {
    this.currentLevel = LEVELS[this.currentLevelNumber - 1];
}

Game.resetPlayer = function () {
    this.player.reset();
    this.player.game = Game;
    this.player.x = this.player.ix * TILE + HALF_TILE;
    this.player.y = this.player.iy * TILE + HALF_TILE;
    if(this.currentLevel.initialDirection){
        this.player.direction = this.currentLevel.initialDirection;
    }else{
        this.player.direction = Directions.LEFT;
    }
}

Game.nextLevel = function () {
    if (this.currentLevelNumber < LEVELS.length) {
        this.currentLevelNumber++;        
        this.prepareLevel();    
    } else {
        this.currentScene = Scenes.WIN;
    }
}

Game.prepareLevel = function () {
    this.resetLevel();
    this.resetMapObjects();
    this.resetEnemies();
    this.resetPlayer();
    this.pillsCollected = 0;
    this.playing = true;
    this.preRenderLevel();
    this.extraLife.active = false;
    this.currentScene = Scenes.PRE_LEVEL;
    this.displayFadeOutOverlay(function () { });
}

Game.generateCoordinateOnEmptySpace = function () {
    var x = y = 0;
    do {
        x = Math.floor(Math.random() * GRID_WIDTH);
        y = Math.floor(Math.random() * GRID_HEIGHT);
    } while (this.checkObstacle(x, y) || this.checkPill(x, y) || this.checkPlayer(x, y));
    return { x: x, y: y };
}

Game.clearCanvas = function (ctx) {
    ctx.drawImage(this.auxCanvas, 0, 0); //background is pre-rendered on another canvas;-)    
    this.drawPills(ctx);
}

Game.drawBackground = function (ctx) {
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, GRID_WIDTH * TILE, GRID_HEIGHT * TILE);
}

Game.drawPills = function (ctx) {
    for (var x = 0; x < GRID_WIDTH; x++) {
        for (var y = 0; y < GRID_HEIGHT; y++) {
            if (this.checkPill(x, y)) {
                this.drawPill(x, y, ctx);
            } else if (this.checkDoor(x, y)) {
                this.drawDoor(x, y, this.objects.get(x, y), ctx);
            } else if (this.checkKey(x, y)) {
                this.drawKey(x, y, this.objects.get(x, y), ctx);
            }
        }
    }
}

Game.drawPill = function (x, y, ctx) {
    ctx.fillStyle = "black"
    var value = (Math.sin(Loop.lastTime / 500 * Math.PI) / 2 + 0.5) * 0xFF | 0;
    var grayscale = (value << 16) | (value << 8) | value;
    var color = '#' + grayscale.toString(16);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x * TILE + HALF_TILE, y * TILE + HALF_TILE, HALF_TILE * 0.3, 0, 2 * Math.PI);
    ctx.fill();
}

Game.drawDoor = function (x, y, door, ctx) {
    if (door.orientation == Orientations.VERTICAL) {
        ctx.fillStyle = door.color;
        ctx.fillRect(x * TILE + TILE / 3, y * TILE, TILE / 3, TILE * door.opening);
    } else if (door.orientation == Orientations.HORIZONTAL) {
        ctx.fillStyle = door.color;
        ctx.fillRect(x * TILE, y * TILE + TILE / 3, TILE * door.opening, TILE / 3);
    }
}

Game.drawKey = function (x, y, key, ctx) {
    ctx.fillStyle = "#444";
    ctx.beginPath();
    ctx.arc(x * TILE + HALF_TILE / 2, y * TILE + HALF_TILE, HALF_TILE / 2, 0, 2 * Math.PI);
    ctx.arc(x * TILE + HALF_TILE + HALF_TILE / 2, y * TILE + HALF_TILE, HALF_TILE / 2, 0, 2 * Math.PI);
    ctx.fillRect(x * TILE + HALF_TILE / 2, y * TILE + HALF_TILE / 2, HALF_TILE, HALF_TILE)
    ctx.fill();
    if (!key.triggered) {
        ctx.fillStyle = key.color;
        ctx.beginPath();
        ctx.arc(x * TILE + HALF_TILE / 2, y * TILE + HALF_TILE, HALF_TILE / 3, 0, 2 * Math.PI);
        ctx.fill();
    } else {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(x * TILE + TILE - HALF_TILE / 2, y * TILE + HALF_TILE, HALF_TILE / 3, 0, 2 * Math.PI);
        ctx.fill();
    }
}

Game.drawExtraLife = function (ctx) {
    if (this.extraLife.active) {
        ctx.fillStyle = "red";
        ctx.beginPath();
        var rx = this.extraLife.gx * TILE + HALF_TILE;
        var ry = this.extraLife.gy * TILE + HALF_TILE;
        var radius = HALF_TILE / 2 * 1 - 0.7 * Math.sin(Loop.lastTime / 500 * Math.PI);
        ctx.arc(rx - radius * 0.9, ry, radius * 1.1, Math.PI, 0);
        ctx.arc(rx + radius, ry, radius * 1.1, Math.PI, 0);
        ctx.quadraticCurveTo(rx + radius * 1.7, ry + radius * 1.6, rx, ry + radius * 2);
        ctx.quadraticCurveTo(rx - radius * 1.7, ry + radius * 1.6, rx - radius * 2, ry);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(rx + radius * 1.3, ry - radius * 0.4, radius * 0.2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rx - radius * 0.7, ry - radius * 0.4, radius * 0.2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
}

Game.drawGrid = function (ctx) {
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWIDTH = 1;
    ctx.beginPath();
    for (var i = 0; i < GRID_WIDTH; i++) {
        ctx.moveTo(i * TILE, 0);
        ctx.lineTo(i * TILE, GRID_HEIGHT * TILE);
    }
    for (var j = 0; j < GRID_HEIGHT; j++) {
        ctx.moveTo(0, j * TILE);
        ctx.lineTo(GRID_WIDTH * TILE, j * TILE);
    }
    ctx.stroke();
}

Game.drawMap = function (ctx) {

    for (var y = 0; y < GRID_HEIGHT; y++) {
        for (var x = 0; x < GRID_WIDTH; x++) {
            if (this.currentLevel.map[y].charAt(x) == "#") { // wall
                ctx.fillStyle = this.currentLevel.wallsColor;
                ctx.roundRect(x * TILE, y * TILE, TILE - 0.25, TILE - 0.25, TILE / 4);
                ctx.fill();
                ctx.fillStyle = "rgba(0,0,0,0.3)";
                ctx.roundRect(x * TILE + TILE / 8, y * TILE + TILE / 8, TILE * 0.7, TILE * 0.7, TILE / 8);
                ctx.fill();
                //ctx.fillRect(x*TILE,y*TILE,TILE,TILE);
            }
        }
    }
}

Game.checkPlayer = function (x, y) {
    return this.player.gx == x && this.player.gy == y;
}

Game.checkPill = function (x, y) {
    return this.objects.get(x, y)
        && this.objects.get(x, y).type == Objects.PILL
        && this.objects.get(x, y).collected == false;
}

Game.checkKey = function (x, y) {
    return this.objects.get(x, y)
        && this.objects.get(x, y).type == Objects.KEY;
}

Game.checkExtraLife = function (x, y) {
    return this.extraLife.active && this.extraLife.gx == x && this.extraLife.gy == y;
}

Game.checkObstacle = function (x, y) {
    return (this.currentLevel.map[y] && this.currentLevel.map[y].charAt(x) == '#') || this.checkDoor(x, y);
}

Game.checkDoor = function (x, y) {
    return this.objects.get(x, y)
        && this.objects.get(x, y).type == Objects.DOOR
        && this.objects.get(x, y).locked == true;
}

Game.checkEnemies = function (x, y, enemy) {
    for (var i = 0; i < this.currentLevel.enemies.length; i++) {
        var other = this.currentLevel.enemies[i];
        if ((enemy == undefined || enemy.id != other.id) &&
            other.gx == x && other.gy == y) {
            return true;
        }
    }
}

Game.detectPlayerGhostCollision = function () {
    var ghost, dx, dy;
    for (var i = 0; i < this.currentLevel.enemies.length; i++) {
        ghost = this.currentLevel.enemies[i];
        dx = ghost.gx - this.player.gx;
        dy = ghost.gy - this.player.gy;
        //only check if it's one tile around
        if (dx * dx <= 1 && dy * dy <= 1) {
            if (this.player.x >= ghost.x - HALF_TILE &&
                this.player.x <= ghost.x + HALF_TILE &&
                this.player.y >= ghost.y - HALF_TILE &&
                this.player.y <= ghost.y + HALF_TILE) {
                return true;
            }
        }
    }
    return false;
}

Game.displayDarkOverlay = function (ctx) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    ctx.fillRect(0, 0, REAL_WIDTH, REAL_HEIGHT);
}

Game.displayText = function (ctx, text, x, y, size, color) {
    ctx.font = "bold " + size + "px Dosis";
    var realX = x - (ctx.measureText(text).width / 2);
    var realY = y + (size / 2);

    ctx.fillStyle = color ? color : "#FFF";
    ctx.fillText(text, realX, realY);
}

Game.displayTextWidthShadow = function (ctx, text, x, y, size, color) {
    this.displayText(ctx, text, x - size / 16, y + size / 16, size, "rgba(0,0,0,0.5)");
    this.displayText(ctx, text, x, y, size, color);
}

Game.blinkText = function (ctx, text, x, y, size, color) {
    if (Loop.lastTime / 30 % 30 < 15) {
        this.displayText(ctx, text, x, y, size, color);
    }
}

Game.displayLifeCount = function (ctx, x, y, scale) {
    if (x == undefined) {

        ctx.fillStyle = "red";
        ctx.font = "30px sans-serif";
        var text = "LIFE x " + this.lifeCount;
        var x = (REAL_WIDTH - ctx.measureText(text).width) / 2;
        var y = (REAL_HEIGHT) / 3;
        ctx.fillText(text, x, y)
    }
}

Game.updateDoors = function () {
    this.objects.each(function (obj) {
        if (obj.type == Objects.DOOR && obj.opening < 1.0) {
            obj.opening -= 0.01;
            if (obj.opening <= 0) {
                obj.opening = 0;
                obj.locked = false;
            }
        }
    });
}

Game.completeLevel = function () {
    if (this.playing) {
        this.playing = false;
        this.currentLevel.completed = true;
        if(this.currentLevelNumber - 1 == this.nextAvaiableLevel){
            this.nextAvaiableLevel++;                        
        }
        var that = this;
        this.displayCircleOverlay(this.player.x, this.player.y, function (that) {            
            that.currentScene = Scenes.LEVEL_COMPLETED;            
        });
    }
}

Game.displayCircleOverlay = function (x, y, oncomplete) {
    this.resetOverlay();
    this.overlay.x = x;
    this.overlay.y = y;
    this.overlay.easing = EasingType.LOG;
    this.overlay.active = true;
    this.overlay.duration = 1000;
    this.overlay.type = OverlayType.CIRCLE;
    this.overlay.oncomplete = oncomplete;
}

Game.displayFadeInOverlay = function (oncomplete) {
    this.resetOverlay();
    this.overlay.active = true;
    this.overlay.type = OverlayType.FADE_IN;
    this.overlay.oncomplete = oncomplete;
}

Game.displayFadeOutOverlay = function (oncomplete) {
    this.resetOverlay();
    this.overlay.active = true;
    this.overlay.type = OverlayType.FADE_OUT;
    this.overlay.oncomplete = oncomplete;
}

Game.checkPlayerDeath = function () {
    if (this.lifeCount > 0) {
        this.currentScene = Scenes.PRE_LEVEL;
    } else {
        this.currentScene = Scenes.GAME_OVER;
        SOUNDS.over.play();
    }
}

Game.triggerKey = function (x, y) {
    var key = this.objects.get(x, y);
    if (!key.triggered) {
        SOUNDS.door.play();
        key.triggered = true;
        var refDoor = this.currentLevel.objects[key.door];
        var door = this.objects.get(refDoor.x, refDoor.y);
        door.opening -= 0.1;
    }
}

Game.collectPill = function (x, y) {
    SOUNDS.collect.play(0.1);
    this.pillsCollected++;
    this.objects.get(x, y).collected = true;

    if (this.currentLevel.extraLife) {
        if (this.pillsCollected == this.currentLevel.pillsCount - 1) {
            var g = this.generateCoordinateOnEmptySpace();
            this.extraLife.gx = g.x;
            this.extraLife.gy = g.y;
            this.extraLife.active = true;
        }
    }

    if (this.pillsCollected >= this.currentLevel.pillsCount) {
        this.player.state = PlayerState.COMPLETED;
        SOUNDS.win.play();
        this.overlay.x = this.player.x;
        this.overlay.y = this.player.y;
    }
}

Game.collectExtraLife = function () {
    SOUNDS.collect.play(0.1);
    this.lifeCount++;
    this.extraLife.active = false;
    this.extraLife.collected = true;
}

Game.hitPlayerAndGhost = function () {
    Soundtrack.pause();
    SOUNDS.die.play();
    this.player.state = PlayerState.HIT;
    this.lifeCount -= this.lifeCount > 0 ? 1 : 0;
    this.playing = false;
}

Game.updateGhosts = function () {
    for (var i = 0; i < this.currentLevel.enemies.length; i++) {
        var ghost = this.currentLevel.enemies[i];
        ghost.game = Game;
        if (this.playing) {
            if (ghost.state == GhostState.DUMB) {
                ghost.dumbWalk();
            } else {
                ghost.chaseWalk();
            }
        }
    };
}

Game.drawEnemies = function (ctx) {
    for (var i = 0; i < this.currentLevel.enemies.length; i++) {
        var ghost = this.currentLevel.enemies[i];
        ghost.draw(ctx, TILE);
    };
}

Game.escape = function () {
    if (this.currentScene == Scenes.GAME) {
        if (!this.escaping) {
            this.playing = false;
            this.escaping = true;
        } else {
            this.escaping = false;
            this.goToLevelsMap();
        }
    }
}

Game.goToLevelsMap = function () {
    this.playing = false
    this.levelsMap = undefined;
    this.player.state == PlayerState.STOPPED;
    this.lastKeyDirection = undefined;
    this.currentScene = Scenes.SELECT_LEVEL;
    this.displayFadeOutOverlay();
}