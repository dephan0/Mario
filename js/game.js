const canvas = document.getElementById("gameScreen");
const ctx = canvas.getContext("2d");

// GLOBAL VARIABLES (or constants)
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
let frameXpos = 0; // frame x position (the position will change as mario moves)
// Physics
let gravity = 0.2;
const startFallVelocity = 8;
let fallVelocity = startFallVelocity;
let runSpeed = 5;


/// GROUND ///
let ground = {
    // ground is divided into 2 parts - grass and soil
    grassHeight : 15,
    grassColor : "#43a047",
    soilHeight : 55,
    soilColor : "#5d4037",
    absoluteHeight: 70,
    draw : function() {
        ctx.fillStyle = this.grassColor;
        ctx.fillRect(0, CANVAS_HEIGHT - (this.grassHeight + this.soilHeight), CANVAS_WIDTH, this.grassHeight);
        ctx.fillStyle = this.soilColor;
        ctx.fillRect(0, CANVAS_HEIGHT - this.soilHeight, CANVAS_WIDTH, this.soilHeight)
    }
}


/// MARIO ///
let mario = {

    width : 30,
    height : 50,
    color : "#c62828",
    x : (CANVAS_WIDTH / 2) - 15,
    y : (CANVAS_HEIGHT - ground.absoluteHeight),
    jumping : false,
    falling : false,

    draw : function() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y - this.height, this.width, this.height);
    },

    // check if mario collides with an object in the X axis, from the LEFT side
    doesXCollideLeft : function(object) {
        if( (this.x + this.width + frameXpos >= object.x) && ( this.x + frameXpos <= object.x)) 
        { return true; } 

        return false;
    },
    // check if mario collides with an object in the X axis, from the RIGHT side
    doesXCollideRight : function(object) {
        if( (this.x + frameXpos <= object.x + object.width) && (this.x + this.width + frameXpos >= object.x + object.width) ) 
        { return true; }

        return false;
    },
    // check if mario is currently under the object
    isUnder : function(object) {
        if( this.x + this.width +frameXpos >= object.x && this.x + this.width +frameXpos <= object.x + object.width  ) 
        { return true; }

        else if (this.x +frameXpos >= object.x && this.x +frameXpos <= object.x + object.width) 
        { return true; }
        
        return false;
    },
    // check if mario collides with an object in the Y axis, from the DOWN side
    doesYCollideDown : function(object) {
        if( (this.y + this.height >= object.y + object.height) && (this.y <= object.y + object.height )) 
        { return true; }

        return false;
    }
}


/// OBJECT ///
let object = {
    width : 50,
    height : 50,
    color : "#000000",
    x : 800,
    y : 200,

    draw : function(offset) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - offset, this.y - this.height, this.width, this.height);
    }

}

/// CONTROLLER ///
window.addEventListener("keydown", function move() {
    switch (this.event.keyCode) {

        // RIGHT ARROW
        case 39:
            // if mario doesn't collide with objects, advance the frameXpos 

            if( !mario.doesXCollideLeft(object) && !mario.doesYCollideDown(object) ) {
                frameXpos += runSpeed;
            } else if( mario.doesXCollideLeft(object) ^ mario.doesYCollideDown(object) ) {
                frameXpos += runSpeed;
            } 
            break;

        // LEFT ARROW
        case 37:
            // if mario doesn't collide with objects, decrease the frameXpos 
            if( !mario.doesXCollideRight(object) && !mario.doesYCollideDown(object) ) {
                frameXpos -= runSpeed;
            } else if ( mario.doesXCollideRight(object) ^ mario.doesYCollideDown(object) ) {
                frameXpos -= runSpeed;
            }
            break;
        // UP ARROW    
        case 38:
            if(!mario.falling) {
                mario.jumping = true;
            }
            break;
        
    }
});


function gameLoop() {
    
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ground.draw();
    mario.draw();
    object.draw(frameXpos);

    if(mario.jumping) {
        // Jumping
        mario.y -= fallVelocity;
        fallVelocity -= gravity;
        if( fallVelocity <= 0.1  ||  ( mario.doesYCollideDown(object) && mario.isUnder(object) ) ) {
            mario.jumping = false;
            fallVelocity = 0.4;
        }
    } else if( CANVAS_HEIGHT - mario.y > ground.absoluteHeight ) {
        // Falling
        if(!mario.falling) {mario.falling = true;} // set the 'falling' flag to true
        mario.y += fallVelocity;
        fallVelocity += gravity;
    } 
    if(CANVAS_HEIGHT - mario.y <= ground.absoluteHeight) {
        // Landing
        mario.falling = false; // set the 'falling' flag to false 
        fallVelocity = startFallVelocity; // set the fall velocity back to default
        mario.y = CANVAS_HEIGHT - ground.absoluteHeight; // set the y parameter back in place (for safety)
    }


    

    requestAnimationFrame(gameLoop);
}

gameLoop();