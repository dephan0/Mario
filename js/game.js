const canvas = document.getElementById("gameScreen");
const ctx = canvas.getContext("2d");

// GLOBAL VARIABLES (or constants)
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const FIXED_X = (CANVAS_WIDTH / 2) - 15; // mario's position on the screen (NOT ON THE MAP)

// Physics
const gravity = 0.2;
const runSpeed = 4;
const friction = 0.2;


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
    x : 0, // mario's X position ON THE MAP
    y : (CANVAS_HEIGHT - ground.absoluteHeight), // mario's position ON THE MAP AND THE SCREEN
    x_velocity : 0,
    y_velocity : 0,
    jumping : false,
    falling : false,


    draw : function() {
        ctx.fillStyle = this.color;
        ctx.fillRect(FIXED_X, this.y - this.height, this.width, this.height);
    },


    doesCollideWith : function(object) {
        
        // Do mario and the object overlap in the X axis
        function doesXOverlapWith(object) {
            if( mario.x + mario.width >= object.x   &&   mario.x + mario.width <= object.x + object.width  ) 
            { return true; }
            else if (mario.x >= object.x   &&   mario.x <= object.x + object.width) 
            { return true; }
        
            return false;
        }
        
        // Does mario and the object overlap in the Y axis
        function doesYOverlapWith(object) {
            if(mario.y + mario.height >= object.y   &&   mario.y + mario.height <= object.y + object.height) 
            { return true; }
            else if(mario.y >= object.y   &&   mario.y <= object.y + object.height) 
            { return true; }

            return false;
        }

        // Take advantage of these two functions and return the final result
        if(doesXOverlapWith(object)   &&   doesYOverlapWith(object))
        { return true; } 
        else { return false; }
    },

}


/// OBJECT ///
let object = {
    width : 50,
    height : 50,
    color : "#000000",
    x : 600,
    y : 250,

    draw : function(offset) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - offset + FIXED_X, this.y - this.height, this.width, this.height);
    }

}


/// CONTROLLER ///
window.addEventListener("keydown", function move() {

        // RIGHT ARROW
        if(this.event.keyCode == 39) {
            // if mario doesn't collide with objects, advance the X parameter 
            if(!mario.doesCollideWith(object)) {
                mario.x_velocity = runSpeed;
            } 
            // If it collides but from his right side
            else if( mario.x >= object.x + object.width - 10 /* 10 for safety */) {
                mario.x_velocity = runSpeed;
            } 
            // If it collides but is on top of an object
            else if(mario.y == object.y - object.height) {
                mario.x_velocity = runSpeed;
            }
            
        }

        // LEFT ARROW
        if(this.event.keyCode == 37) {
            // if mario doesn't collide with objects, advance the X parameter 
            if(!mario.doesCollideWith(object)) {
                mario.x_velocity = -(runSpeed);
            }
            // If it collides but from the left side
            else if(mario.x + mario.width <= object.x + 10 /* 10 for safety */) {
                mario.x_velocity = -(runSpeed);
            } 
            // If it collides but is on top of an object
            else if(mario.y == object.y - object.height) {
                mario.x_velocity = -(runSpeed);
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
    // UPDATE PHYSICS
    mario.x += mario.x_velocity;
    mario.y -= mario.y_velocity;
    
    // CLEAR THE SCREEN AND DRAW EVERYTHING
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ground.draw();
    mario.draw();
    object.draw(mario.x);

    /// PHYSICS LOGIC ///

    // MARIO ABOVE GROUND
    if(CANVAS_HEIGHT - mario.y > ground.absoluteHeight) {

        // If it reaches (approximately) the minimal velocity in the course of the flight 
        if(mario.y_velocity <= 0.1   &&   mario.y_velocity >= -0.1)
        { mario.falling = true; }

        
        // If it hits the ceiling
        if(mario.doesCollideWith(object)   &&   (mario.y - mario.height >= object.y - 10)   &&   !mario.falling) {
            mario.y_velocity = 0;
            mario.falling = true;
        }
        // If it lands on a block
        else if(mario.doesCollideWith(object)   &&   (mario.y <= object.y - object.height + 5)   &&   mario.falling) {
            mario.y_velocity = 0;
            mario.y = object.y - object.height;
            mario.jumping = false;
        } 

        // Apply force of gravity to the y_velocity
        mario.y_velocity -= gravity;
        
    } 
    
    // ON THE GROUND
    if(CANVAS_HEIGHT - mario.y <= ground.absoluteHeight) {
        // Set the y velocity and y parameter back in place (for SAFETY)
        mario.y_velocity = 0;
        mario.y = CANVAS_HEIGHT - ground.absoluteHeight;
        mario.jumping = false;
        mario.falling = false;
    } 

    // FRICTION
    if(!mario.doesCollideWith(object)) {

        (mario.x_velocity > 0 ) ? mario.x_velocity -= friction: mario.x_velocity += friction;

        if(mario.x_velocity < 0.25 && mario.x_velocity > -0.25) {
            // Purely for SAFETY (so that mario doesn't slide when we stop)
            mario.x_velocity = 0;
        }
    }
    // If mario collides but only from the bottom (is standing on an object) 
    else if(mario.y == object.y - object.height) {
        (mario.x_velocity > 0 ) ? mario.x_velocity -= friction: mario.x_velocity += friction;

        if(mario.x_velocity < 0.25 && mario.x_velocity > -0.25) {
            // Purely for SAFETY (so that mario doesn't slide when we stop)
            mario.x_velocity = 0;
        }
    } else {
        mario.x_velocity = 0;
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();