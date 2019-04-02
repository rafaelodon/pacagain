var PlayerState = {
    STOPPED: 0,
    MOVING: 1,
    HIT: 2,
    DEAD: 3,
    COMPLETED: 4,
}

var Player = function (gx, gy, options) {
    var defaults = {
        direction: Directions.RIGHT,
        color: Colors.YELLOW,
        state: PlayerState.MOVING,
        speed: 1,
        stucked: false,
        body: [],
        bodyDirections: [],
        bodySize: 0,
        firstTile: true,
        recovering: 0
    }

    options = (typeof options == "undefined") ? {} : options
    for (var i in defaults) {
        if (typeof options[i] == "undefined") {
            this[i] = defaults[i]
        } else {
            this[i] = options[i]
        }
    }

    this.x = undefined
    this.y = undefined
    this.gx = gx
    this.gy = gy
    this.initialState = JSON.parse(JSON.stringify(this))
}

Player.prototype.reset = function () {
    for (var i in this.initialState) {
        this[i] = this.initialState[i]
    }
    this.bodySize = 0
    this.body = []
    this.bodyDirections = []
}

Player.prototype.moveTo = function (gx, gy) {
    this.gx = gx
    this.gy = gy
    this.x = this.gx * TILE + HALF_TILE
    this.y = this.gy * TILE + HALF_TILE
}

Player.prototype.update = function () {

    var destX, destY, gridX, gridY

    if (this.game.playing) {

        if (this.recovering > 0) {
            this.recovering -= 0.01
        } else {
            this.recovering = 0            
        }        

        if (this.state === PlayerState.MOVING) {

            this.lastDirection = this.direction

            if ((this.x + HALF_TILE) % TILE == 0 && (this.y + HALF_TILE) % TILE == 0) {
                if (typeof this.game.lastKeyDirection != "undefined") {
                    gridX = this.gx + Directions.DELTA[this.game.lastKeyDirection].dx
                    gridY = this.gy + Directions.DELTA[this.game.lastKeyDirection].dy
                    if (!this.game.checkObstacle(gridX, gridY)) {
                        this.direction = this.game.lastKeyDirection
                    }
                }
            }

            destX = this.x + Directions.DELTA[this.direction].dx * TILE / 6
            destY = this.y + Directions.DELTA[this.direction].dy * TILE / 6

            gridX = parseInt((this.x + Directions.DELTA[this.direction].dx * (HALF_TILE + 0.5)) / TILE)
            gridY = parseInt((this.y + Directions.DELTA[this.direction].dy * (HALF_TILE + 0.5)) / TILE)
            
            while (this.body.length > this.bodySize) {
                this.body.pop()
                this.bodyDirections.pop()
            }

            if (!this.game.checkObstacle(gridX, gridY)) {

                //push or shifts the pac-nibble body
                if (gridX != this.gx || gridY != this.gy) {                                        

                    if (this.bodySize > 0) {
                        //push/pop elements from the pac-nibble body
                        this.bodyDirections.unshift(this.lastDirection)
                        if (this.bodyDirections.length > this.bodySize) {
                            this.bodyDirections.pop()
                            //the last body element only starts moving when the body has shifted
                            if (this.body.length > 0) {
                                this.body[this.body.length - 1].moving = true
                            }
                        }
                    }

                    if (this.body.length < this.bodySize) {                        
                        //the first body element clones the pac head position
                        if (this.bodySize == 1) {
                            ngx = this.gx
                            ngy = this.gy
                            this.body.unshift({
                                gx: ngx,
                                gy: ngy,
                                x: ngx * TILE + HALF_TILE,
                                y: ngy * TILE + HALF_TILE,
                                moving: false
                            })
                        } else {                                   
                            //the next body elements, clones the body tail position
                            last = this.body.length - 1
                            ngx = this.body[last].gx
                            ngy = this.body[last].gy                            
                            this.body.push({
                                gx: ngx,
                                gy: ngy,
                                x: ngx * TILE + HALF_TILE,
                                y: ngy * TILE + HALF_TILE,
                                moving: false
                            })                            
                        }                        
                    }
                    
                    //keep track of the body elements grid position every tile change                    
                    for (i = 0; i < this.body.length; i++) {                            
                        if(this.body[i].moving){                                                            
                            this.body[i].gx += Directions.DELTA[this.bodyDirections[i]].dx
                            this.body[i].gy += Directions.DELTA[this.bodyDirections[i]].dy                                                        
                        }
                    }                    
                }                

                //moves the pac-nibble body elements inside the tiles
                for (i = 0; i < this.body.length; i++) {
                    b = this.body[i]
                    if (b.moving) { //the new elements stay still until the body is completely shifted
                        b.x += Directions.DELTA[this.bodyDirections[i]].dx * TILE / 6
                        b.y += Directions.DELTA[this.bodyDirections[i]].dy * TILE / 6
                    }
                }

                this.x = destX
                this.y = destY

                this.gx = gridX
                this.gy = gridY

                this.stucked = false
            } else {
                if (!this.stucked) {
                    SOUNDS.hit.play(0.5)
                    this.stucked = true
                }
            }

            this.detectOutOfBounds()

            this.game.detectPlayerGhostCollision()

            if (this.game.checkPill(this.gx, this.gy)) {
                this.game.collectPill(this.gx, this.gy)
            }

            if (this.game.checkNibble(this.gx, this.gy)) {
                this.bodySize += 1
                this.game.collectNibble(this.gx, this.gy)
            }

            if (this.game.checkExtraLife(this.gx, this.gy)) {
                this.game.collectExtraLife()
            }

            if (this.game.checkKey(this.gx, this.gy)) {
                this.game.triggerKey(this.gx, this.gy)
            }
        }
    }

    if (this.state == PlayerState.COMPLETED) {
        this.game.completeLevel()
    } else if (this.state == PlayerState.DEAD) {
        this.game.checkPlayerDeath()
    } else if (this.state == PlayerState.HIT) {
        this.mouthOpening += 0.1
        if (this.mouthOpening > 3) {
            this.state = PlayerState.DEAD
        }
    }
}

Player.prototype.onHitGhost = function () {
    if (this.recovering == 0) {
        if (this.bodySize > 0) {
            this.bodySize -= 1            
            this.recovering = 1
            SOUNDS.hit2.play()
        }
    }
}

Player.prototype.draw = function (ctx, scale) {

    if (scale == undefined) {
        scale = TILE
    }

    if (this.game.playing && this.recovering > 0) {
        ctx.fillStyle = "rgba(255,255,0,0.5)"
    } else {
        ctx.fillStyle = this.color
    }

    var archStart = 0
    var archEnd = 0

    if (this.direction == Directions.RIGHT) {
        archStart = 1
        archEnd = 0
    }

    if (this.direction == Directions.LEFT) {
        archStart = 0
        archEnd = 1
    }

    if (this.direction == Directions.DOWN) {
        archStart = 1.5
        archEnd = 0.5
    }

    if (this.direction == Directions.UP) {
        archStart = 0.5
        archEnd = 1.5
    }

    if (this.state == PlayerState.MOVING || this.state == PlayerState.STOPPED) {
        this.mouthOpening = (Math.sin(Loop.lastTime / 333 * Math.PI) / 2 + 0.5)
    }

    if (this.game.playing) {
        //draw the pac-nibble body
        this.body.forEach(b => {
            ctx.beginPath()
            ctx.arc(b.x, b.y, scale / 2, 0, Math.PI * 2)
            ctx.fill()
        })
    }

    ctx.beginPath()
    ctx.arc(this.x, this.y, scale / 2, Math.PI * archStart, -this.mouthOpening + Math.PI * archEnd)
    ctx.arc(this.x, this.y, scale / 2, Math.PI * archStart, +this.mouthOpening + Math.PI * archEnd, true)
    ctx.fill()

    //debug point
    //ctx.fillStyle = "red"
    //ctx.fillRect(this.x, this.y, TILE/8, TILE/8);            
}

Player.prototype.detectOutOfBounds = function () {
    //TODO: manage pac-nibble body when teleporting

    if (this.gx < 0) {
        this.moveTo(GRID_WIDTH, this.gy)        
        return
    }

    if (this.gx > GRID_WIDTH) {
        this.moveTo(-1, this.gy)
        return
    }

    if (this.gy < 1) { // the first grid line is occupied by the status bar in the level scene
        this.moveTo(this.gx, GRID_HEIGHT)
        return
    }

    if (this.gy > GRID_HEIGHT) {
        this.moveTo(this.gx, 0)
        return
    }
}