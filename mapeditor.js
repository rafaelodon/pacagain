window.onload = function () {             
    
    Object.keys(MapEditorTools).forEach(key => {        
        toolName = MapEditorTools[key];
        var el_tool = document.createElement("input");
        el_tool.type = "radio";
        el_tool.className = "btn-check";
        el_tool.name = "tool";
        el_tool.id = toolName;        
        el_tool.value = toolName;
        el_tool.autocomplete = "off";        
        
        var el_tool_label = document.createElement("label");
        el_tool_label.className = "btn btn-primary";
        el_tool_label.htmlFor = toolName;
        el_tool_label.innerText = toolName;
        el_tool_label.addEventListener('click', function (e) {                
            Game.setMapEditorTool(this.htmlFor);
        });

        document.getElementById("tools").appendChild(el_tool);
        document.getElementById("tools").appendChild(el_tool_label);
                                        
        //<input type="radio" class="btn-check" name="tool" id="bg" value="bg" autocomplete="off" checked>
        //<label class="btn btn-primary" for="bg">Empty</label>      
    });

    var mouseDown = 0;

    document.body.onmousedown = function() { 
        ++mouseDown;
    }

    document.body.ondragstart = function() { 
        ++mouseDown;
    }

    document.body.ondragend = function() {
        mouseDown = 0;
    }

    document.body.onmouseup = function() {
        mouseDown = 0;
    }

    document.getElementById("canvas").addEventListener('click', function (e) {
        Game.useToolOnPosition(e.offsetX, e.offsetY);
    });   

    document.getElementById("canvas").addEventListener('mousemove', function (e) {        
        if(mouseDown){
            Game.useToolOnPosition(e.offsetX, e.offsetY);
        }
    });   
    
    document.getElementById("play").addEventListener('click', function (e) {
        if(this.value == "play") {
            Game.playEditorLevel();        
            document.getElementsByName("tool").forEach(t => {
                t.disabled = true;
                t.checked = false;
            });
            this.className = "btn btn-danger";
            this.value = "stop";
        }else{
            Game.stopEditorLevel();        
            document.getElementsByName("tool").forEach(t => t.disabled = false);
            this.className = "btn btn-success";
            this.value = "play";
        }
    });   

    document.getElementById("export").addEventListener('click', function (e) {
        var text = Game.exportCurrentLevel();
        document.getElementById("levelText").value = text;
    });

    document.onkeydown = keyDown;true

    Game.setCanvas(document.getElementById("canvas"));        
    Game.resetAll();
    Game.mapEditor();
    Loop.run(Game);
}

function keyDown(e) {

    e = e || window.event;

    if (e.keyCode == '38') { //up
        window.scrollTo(0, 0);
        e.preventDefault();
        Game.moveUp();
    } else if (e.keyCode == '40') { //down
        window.scrollTo(0, 0);
        e.preventDefault();
        Game.moveDown();
    } else if (e.keyCode == '37') { //left
        window.scrollTo(0, 0);
        e.preventDefault();
        Game.moveLeft();
    } else if (e.keyCode == '39') { //right
        window.scrollTo(0, 0);
        e.preventDefault();
        Game.moveRight();
    }
}