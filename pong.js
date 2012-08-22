var game = ( function () {

    //------variables ---------------
    var canvas = document.getElementById("canvas"),
        width = canvas.width,
        height = canvas.height,
        gLoop, // calls game loop
        fps = 20,
        slowfps = 10000000,
        currentfps = 20,
        game_started = false,
        ctx = canvas.getContext("2d");

    var UP_ARROW_KEY = 38,
        DOWN_ARROW_KEY = 40,
        W_KEY = 87,
        S_KEY = 83,
        NO_COLLISION = -1,
        TOP_WALL = 0,
        RIGHT_WALL = 1,
        BOTTOM_WALL = 2,
        LEFT_WALL = 3,
        PADDLE = BALL = 4;
        


    //------objects   ---------------
    // ball object
    var ball = new (
        function() {
            var that = this;    // new context for all functions
            // --attributes ---
            // TODO: make ball shoot off in a random direction at the beginning
            that.X = 600;
            that.Y = 400;
            that.radius = 12;
            that.horizontal_speed = 5;
            that.vertical_speed = 5;
            that.past_collision;

            // --methods ---
            // change position
            that.setPosition = function(x,y) {
                that.X = x;
                that.Y = y;
            }

            // when ball hits paddle, go the other way
            that.bounce = function() {
                that.horizontal_speed = -(that.horizontal_speed);
            }

            // check for collision
            that.collide = function() {
                var collided = NO_COLLISION;

                if ((that.X+that.radius) >= width)
                    collided = RIGHT_WALL;
                if ((that.X+that.radius) <= 2*that.radius)
                    collided = LEFT_WALL;
                
                if ((that.Y+that.radius) >= height)
                    collided = BOTTOM_WALL;
                if ((that.Y+that.radius) <= 2*that.radius)
                    collided = TOP_WALL;

                /*
                var hit_paddle_side = beneath_paddle_top = above_paddle_bottom = false;
                if (((that.X-that.radius) <= (player.X+player.width))) hit_paddle_side = true;
                if ((that.Y >= player.Y)) beneath_paddle_top = true;
                if ((that.Y < (player.Y+player.height))) above_paddle_bottom = true;

                if (hit_paddle_side && beneath_paddle_top && above_paddle_bottom)
                    collided = PADDLE;
                */

                return collided;
            }
            
            // redraw ball
            that.draw = function() {
                // ball movement
                // check if ball has hit walls or paddle;
                // if so, reverse direction
                // PS. only change direction if a new/different collision occurred
                var collision = that.collide();
                if (collision != that.past_collision) {
                    if (collision == LEFT_WALL ||
                        collision == RIGHT_WALL ||
                        collision == PADDLE)
                        that.horizontal_speed = -(that.horizontal_speed);
                    if (collision == TOP_WALL ||
                        collision == BOTTOM_WALL)
                        that.vertical_speed = -(that.vertical_speed);

                    that.past_collision = collision;
                }
                        
                // move ball position
                that.setPosition(that.X+that.horizontal_speed,
                                 that.Y+that.vertical_speed);
                
                // draw circle
                ctx.fillStyle = "#b37278";
                ctx.beginPath();
                ctx.arc(that.X, that.Y, that.radius, Math.PI*2, 0, true);
                ctx.closePath();
                ctx.fill();

                /*ctx.fillStyle = "black";
                ctx.fillRect(that.X-that.radius, that.Y, 2, 2);
                ctx.fillStyle = "red";
                ctx.fillRect(that.X-that.radius, that.Y, 2, 2);
                */
                
            }
        }
    )();

    // player object
    function Player(numplayer, start_x, start_y)
    {
        var that = this;    // new context for all functions

        // --attributes ---
        that.width = 20;
        that.height = 90;
        that.X = start_x;
        that.Y = start_y;
        that.keyDown = false; // keep track of whether input key is pressed
        that.speed = 10; // constant 
        that.vertical_speed; // speed/direction paddle is going
        that.direction= -1;
        that.player_number = numplayer;

        // --methods ---
        // change position
        that.setPosition = function(x,y) {
            that.X = x;
            that.Y = y;
        }

        // check for collision
        that.collide = function() {
            var collided = NO_COLLISION;

            if (that.Y <= 0)
                collided = TOP_WALL;
            else if ((that.Y+that.height) > height)
                collided = BOTTOM_WALL;

            // check collision with ball
            var hit_paddle_side = beneath_paddle_top = above_paddle_bottom = false;
            if (that.player_number == 1 &&
               ((ball.X-ball.radius) <= (that.X+that.width))) hit_paddle_side = true;
            else if (that.player_number == 2 &&
               ( (ball.X + ball.radius) >= that.X)) hit_paddle_side = true;
            if ((ball.Y >= that.Y)) beneath_paddle_top = true;
            if ((ball.Y < (that.Y+that.height))) above_paddle_bottom = true;

            if (hit_paddle_side && beneath_paddle_top && above_paddle_bottom)
                collided = BALL;

            return collided;
        }
        
        // redraw paddle
        that.draw = function() {
            // if key is held down and not heading out of bounds,
            // continue moving
            var collision = that.collide();
            if (collision == BALL) ball.bounce();
            if (that.keyDown &&
                !( (collision == TOP_WALL) && that.vertical_speed < 0) &&
                !( (collision == BOTTOM_WALL) && that.vertical_speed > 0) )
                that.setPosition(that.X, that.Y+that.vertical_speed);

            ctx.fillStyle = numplayer == 1 ? "#b2cfb1" : "#a7938a";
            ctx.fillRect(that.X, that.Y, that.width, that.height);

            /*
            ctx.fillStyle = "black";
            ctx.fillRect(that.X+that.width, that.Y, 2, 2);
            ctx.fillStyle = "red";
            ctx.fillRect(that.X+that.width, that.Y+that.height, 2, 2);
            */
        }

        // address player input 
        that.key_pressed = function(e) {
            if ( (that.player_number == 1 && e.keyCode == W_KEY) ||
                 (that.player_number == 2 && e.keyCode == UP_ARROW_KEY)) {
                that.vertical_speed = -that.speed;
                that.keyDown = true;
            }
            else if ( (that.player_number == 1 && e.keyCode == S_KEY) ||
                 (that.player_number == 2 && e.keyCode == DOWN_ARROW_KEY)) {
                that.vertical_speed = that.speed;
                that.keyDown = true;
            }
        }

        that.key_released = function(e) {
            that.keyDown = false;
        }
    }


    //------functions ---------------
    // clear canvas
    var clear = function() {
        ctx.fillStyle = "#f0e0d0";
        ctx.beginPath();
        ctx.rect(0,0,width,height);
        ctx.closePath();
        ctx.fill();
    };

    // create players and check for key presses 
    var player = new Player(1, 30, 150);
    var player2 = new Player(2, 650, 150);
    window.addEventListener("keydown", player.key_pressed);
    window.addEventListener("keyup", player.key_released);
    window.addEventListener("keydown", player2.key_pressed);
    window.addEventListener("keyup", player2.key_released);

    // game loop
    var gameloop = function() {
        clear();

        ctx.fillStyle = "#a7938a";
        ctx.font = "20pt Courier New";
        ctx.fillText("pongu!", width / 2 - 168, 25);
        /*
        ctx.fillText("ball: " + ball.X + "," + ball.Y, 168, 100);
        ctx.fillText("player: " + player.X + ",(" + player.Y + "," + (player.Y+player.height) + ")", 168, 150);
        ctx.fillText("ball.Y >= player.Y: " + (ball.Y >= player.Y), 148, 170);
        ctx.fillText("ball.Y >= player.Y: " + (ball.Y >= player.Y), 148, 190);
        ctx.fillText("ball.Y < player.Y+player.height: " + (ball.Y < (player.Y+player.height)), 148, 210);
        */

        player.draw();
        player2.draw();
        ball.draw();
        gLoop = setTimeout(gameloop, currentfps);
    };

    // player input: start game when player clicks on canvas
    canvas.onmousedown = function(e) {
        if (currentfps == fps)
            currentfps = slowfps;
        else if (currentfps == slowfps)
            currentfps = fps;
        /*
        if (!game_started) {
            game_started = true;
            gameloop();
        }
        */
    };

    gameloop();

})();
