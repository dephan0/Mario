const canvas = document.getElementById("gameScreen");
const ctx = canvas.getContext("2d");

// GLOBAL VARIABLES (or constants)
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const FIXED_X = (CANVAS_WIDTH / 2) - 15;

// Physics
let gravity = 0.2;
const startFallVelocity = 8;
let fallVelocity = startFallVelocity;
let runSpeed = 4;
let friction = 0.15;

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
    x : 0,
    y : (CANVAS_HEIGHT - ground.absoluteHeight),
    x_velocity : 0,
    y_velocity : 0,
    jumping : false,

    draw : function() {
        ctx.fillStyle = this.color;
        ctx.fillRect(FIXED_X, this.y - this.height, this.width, this.height);
    },
    
    // check if mario collides with an object in the X axis, from the LEFT side
    doesXCollideLeft : function(object) {
        if( (this.x + this.width >= object.x) && ( this.x <= object.x)) 
        { return true; } 

        return false;
    },
    // check if mario collides with an object in the X axis, from the RIGHT side
    doesXCollideRight : function(object) {
        if( (this.x <= object.x + object.width) && (this.x + this.width >= object.x + object.width) ) 
        { return true; }

        return false;
    },
    // check if mario is currently under or over the object (if mario and the object overlap each other in the X axis)
    doesXOverlap : function(object) {
        if( this.x + this.width >= object.x && this.x + this.width <= object.x + object.width  ) 
        { return true; }

        else if (this.x >= object.x && this.x <= object.x + object.width) 
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
    x : 600,
    y : 200,

    draw : function(offset) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - offset + FIXED_X, this.y - this.height, this.width, this.height);
    }

}

/// CONTROLLER ///
window.addEventListener("keydown", function move() {

        // RIGHT ARROW
        if(this.event.keyCode == 39) {
            // if mario doesn't collide with objects, advance the frameXpos 

            if( !mario.doesXCollideLeft(object) && !mario.doesYCollideDown(object) ) {
                mario.x_velocity = runSpeed;
            } else if( mario.doesXCollideLeft(object) ^ mario.doesYCollideDown(object) ) {
                mario.x_velocity = runSpeed;
            } 
           
        }

        // LEFT ARROW
        if(this.event.keyCode == 37) {
            // if mario doesn't collide with objects, decrease the frameXpos 

            if( !mario.doesXCollideRight(object) && !mario.doesYCollideDown(object) ) {
                mario.x_velocity = -(runSpeed);
            } else if ( mario.doesXCollideRight(object) ^ mario.doesYCollideDown(object) ) {
                mario.x_velocity = -(runSpeed);
            } else {
                mario.x_velocity = 0;
            }
        }   

        // UP ARROW    
        if(this.event.keyCode == 38) {
            if(!mario.jumping) {
                mario.y_velocity = 8;
                mario.jumping = true;
            }
        }
});


function gameLoop() {
    // Update Physics
    mario.x += mario.x_velocity;
    mario.y -= mario.y_velocity;
    
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ground.draw();
    mario.draw();
    object.draw(mario.x);

    if(CANVAS_HEIGHT - mario.y > ground.absoluteHeight) {
        // In air
        
        if(mario.doesYCollideDown(object) && mario.doesXOverlap(object) && mario.y_velocity != 0) {
            mario.y_velocity = 0;
        } else {
            mario.y_velocity -= gravity;
        }
    } 
    
    if(CANVAS_HEIGHT - mario.y <= ground.absoluteHeight) {
        // Set the y velocity and y parameter back in place (for SAFETY)
        mario.y_velocity = 0;
        mario.y = CANVAS_HEIGHT - ground.absoluteHeight;
        mario.jumping = false;
    } 

    // Update Physics

    // Add friction
    (mario.x_velocity > 0 ) ? mario.x_velocity -= friction: mario.x_velocity += friction;
    if(mario.x_velocity < 0.25 && mario.x_velocity > -0.25) {
        // Purely for safety (so that mario doesn't slide when we stop)
        mario.x_velocity = 0;
    }
    mario.x_velocity = 0;
    requestAnimationFrame(gameLoop);
}

gameLoop();