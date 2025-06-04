// script.js
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;

  const WHITE = "#fff", BLUE = "#00f", RED = "#f00", BLACK = "#000";
  const PLAYER_WIDTH = 40, PLAYER_HEIGHT = 40;
  const gravity = 1, jumpStrength = -15, obstacleSpeedStart = 5;

  let playerX = 100, playerY = HEIGHT - PLAYER_HEIGHT - 10;
  let playerVelY = 0, isJumping = false, jumpCount = 0, doubleJump = true;
  const groundY = HEIGHT - 10;
  let obstacles = [], spawnTimer = 0, obstacleSpeed = obstacleSpeedStart;
  let score = 0, highScore = localStorage.getItem("highScore") || 0;
  let gameRunning = false;

  const overlay = document.getElementById("gameOverlay");
  const message = document.getElementById("gameMessage");
  const scoreDisplay = document.getElementById("scoreDisplay");

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      if (!isJumping || (doubleJump && jumpCount < 2)) {
        playerVelY = jumpStrength;
        isJumping = true;
        jumpCount++;
      }
    }
    if (e.code === "KeyR" && !gameRunning) startGame();
    if (e.code === "KeyE" && !gameRunning) window.location.reload();
  });

  function startGame() {
    overlay.classList.add("hidden");
    playerY = HEIGHT - PLAYER_HEIGHT - 10;
    playerVelY = 0;
    isJumping = false;
    jumpCount = 0;
    obstacles = [];
    spawnTimer = 0;
    score = 0;
    obstacleSpeed = obstacleSpeedStart;
    gameRunning = true;
    gameLoop();
  }

  function rectIntersect(r1, r2) {
    return !(r2.x > r1.x + r1.width || r2.x + r2.width < r1.x || r2.y > r1.y + r1.height || r2.y + r2.height < r1.y);
  }

  function drawPlayer(x, y) {
    ctx.fillStyle = BLUE;
    ctx.fillRect(x, y, PLAYER_WIDTH, PLAYER_HEIGHT);
  }

  function drawObstacles(obstacles) {
    ctx.fillStyle = RED;
    obstacles.forEach(ob => {
      ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
    });
  }

  function displayScore(score) {
    ctx.fillStyle = WHITE;
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);
    ctx.fillText("High Score: " + highScore, 10, 60);
  }

  function showGameOver() {
    gameRunning = false;
    overlay.classList.remove("hidden");
    message.textContent = "Game Over!";
    scoreDisplay.textContent = `Your Score: ${score} | High Score: ${highScore}`;
    if (score > highScore) {
      localStorage.setItem("highScore", score);
      highScore = score;
    }
  }

  function gameLoop() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    playerVelY += gravity;
    playerY += playerVelY;

    if (playerY + PLAYER_HEIGHT >= groundY) {
      playerY = groundY - PLAYER_HEIGHT;
      isJumping = false;
      jumpCount = 0;
      playerVelY = 0;
    }

    spawnTimer++;
    if (spawnTimer > 60) {
      let heightOffset = Math.random() * 20;
      obstacles.push({
        x: WIDTH,
        y: groundY - 40 - heightOffset,
        width: 40,
        height: 40 + heightOffset
      });
      spawnTimer = 0;
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].x -= obstacleSpeed;
      if (obstacles[i].x + obstacles[i].width < 0) {
        obstacles.splice(i, 1);
        score++;
        if (score % 10 === 0) obstacleSpeed += 0.5;
      }
    }

    const playerRect = { x: playerX, y: playerY, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
    for (let ob of obstacles) {
      if (rectIntersect(playerRect, ob)) {
        showGameOver();
        return;
      }
    }

    drawPlayer(playerX, playerY);
    drawObstacles(obstacles);
    displayScore(score);
    requestAnimationFrame(gameLoop);
  }

  // Initial overlay
  message.textContent = "Press Space to Jump";
  scoreDisplay.textContent = "Press 'R' to Start";
});
