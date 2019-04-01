/**
 * An Audio wrapper for Game purposes.
 * 
 * @param {*} file A string indicating the path of the audio file
 * @param {*} background A boolean indicating wheter is this a background track
 */
function GameSound(file, isSoundtrack) {
    this.audio = new Audio(file);
    this.isSoundtrack = isSoundtrack;
    this.hasPlayed = false;

    if (this.isSoundtrack) {
        this.audio.addEventListener('ended', function () {
            this.currentTime = 0.09;
            this.play();
        }, false);
    }
}

GameSound.prototype.play = function (volume) {
    if (volume) {
        this.audio.volume = volume;
    }
    if (this.isSoundtrack) {
        if (Soundtrack.audio != this.audio) {
            Soundtrack.pause();
            Soundtrack.audio = this.audio;
            this.audio.play();
        }
    } else {
        this.audio.currentTime = 0;
        this.audio.play();
    }
}

GameSound.prototype.playOnce = function (volume) {
    if (!this.hasPlayed) {
        this.play(volume);
        this.hasPlayed = true;
    }
}

/**
 * Soundtrack: a 'singleton' audio looping forever
 *
 */
var Soundtrack = {
    audio: undefined
}

Soundtrack.pause = function () {
    if (this.audio) {
        this.audio.pause();
        this.audio = undefined;
    }
}


/**
 * Constants representing the avaiable sounds
 */
var SOUNDS = {
    beep: new GameSound("sound/beep.wav"),
    hit: new GameSound("sound/hit.wav"),
    hit2: new GameSound("sound/hit2.wav"),
    jump: new GameSound("sound/jump.wav"),
    collect: new GameSound("sound/collect.wav"),
    nibble: new GameSound("sound/nibble.wav"),
    die: new GameSound("sound/die.wav"),
    over: new GameSound("sound/over.wav"),
    win: new GameSound("sound/win.wav"),
    door: new GameSound("sound/door.wav"),
    bg1: new GameSound("sound/bg1.wav", true),
    bg2: new GameSound("sound/bg2.wav", true),
    bg3: new GameSound("sound/bg3.wav", true),
}