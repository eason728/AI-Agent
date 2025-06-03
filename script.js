// game.js

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;

  // Colors
  const WHITE = "#fff";
  const BLUE = "#00f";
  const RED = "#f00";
  const BLACK = "#000";

  // Frame rate (Not strictly needed with requestAnimationFrame)
  const FPS = 60;

  // Player properties
  const PLAYER_WIDTH = 40;
  const PLAYER_HEIGHT = 40;
  const playerX = 100; // Constant horizontal position
  let playerY = HEIGHT - PLAYER_HEIGHT - 10; // starting vertical
  let playerVelY = 0;
  const gravity = 1;
  const jumpStrength = -15;
  let isJumping = false;
  
  // Ground position
  const groundY = HEIGHT - 10;
  
  // Obstacle properties
  const OBSTACLE_WIDTH = 40;
  const OBSTACLE_HEIGHT = 40;
  const obstacleSpeed = 5;
  let obstacles = [];
  let spawnTimer = 0;
  
  // Score
  let score = 0;
  
  // Game state
  let gameRunning = true;
  
  // Handle keyboard input
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !isJumping) {
      playerVelY = jumpStrength;
      isJumping = true;
    }
  });
  
  // Collision detection: check if two rectangles intersect.
  function rectIntersect(r1, r2) {
    return !(
      r2.x > r1.x + r1.width ||
      r2.x + r2.width < r1.x ||
      r2.y > r1.y + r1.height ||
      r2.y + r2.height < r1.y
    );
  }
  
  // Draw the player
  function drawPlayer(x, y) {
    ctx.fillStyle = BLUE;
    ctx.fillRect(x, y, PLAYER_WIDTH, PLAYER_HEIGHT);
  }
  
  // Draw obstacles
  function drawObstacles(obstacles) {
    ctx.fillStyle = RED;
    obstacles.forEach(obstacle => {
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
  }
  
  // Display the score
  function displayScore(score) {
    ctx.fillStyle = WHITE;
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);
  }
  
  // Main game loop using requestAnimationFrame
  function gameLoop() {
    if (!gameRunning) return; // stop game on collision
    
    // Clear the canvas
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // Update player mechanics
    playerVelY += gravity;
    playerY += playerVelY;
    
    // Check if player lands on the ground
    if (playerY + PLAYER_HEIGHT >= groundY) {
      playerY = groundY - PLAYER_HEIGHT;
      isJumping = false;
      playerVelY = 0;
    }
    
    // Spawn obstacles every 60 frames (~1 second at 60 FPS)
    spawnTimer++;
    if (spawnTimer > 60) {
      const obstacleX = WIDTH;
      const obstacleY = groundY - OBSTACLE_HEIGHT;
      obstacles.push({ 
        x: obstacleX, 
        y: obstacleY, 
        width: OBSTACLE_WIDTH, 
        height: OBSTACLE_HEIGHT 
      });
      spawnTimer = 0;
    }
    
    // Update obstacles: move left and check if they go off-screen
    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].x -= obstacleSpeed;
      if (obstacles[i].x + OBSTACLE_WIDTH < 0) {
        obstacles.splice(i, 1);
        score++; // Increase score when an obstacle is passed
      }
    }
    
    // Create player's rectangle for collision detection.
    const playerRect = { x: playerX, y: playerY, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
    
    // Check collisions between the player and obstacles.
    for (let obstacle of obstacles) {
      if (rectIntersect(playerRect, obstacle)) {
        console.log("Game Over!");
        gameRunning = false;
        // Optionally, you can show a Game Over message here.
        ctx.fillStyle = WHITE;
        ctx.font = "40px Arial";
        const msg = "Game Over!";
        ctx.fillText(msg, WIDTH / 2 - ctx.measureText(msg).width / 2, HEIGHT / 2);
        return;
      }
    }
    
    // Draw player, obstacles, and score.
    drawPlayer(playerX, playerY);
    drawObstacles(obstacles);
    displayScore(score);
    
    // Loop the game using requestAnimationFrame.
    requestAnimationFrame(gameLoop);
  }
  
  // Start the game loop.
  gameLoop();
});
