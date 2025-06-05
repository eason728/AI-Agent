// script.js
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;

  const WHITE = "#fff", RED = "#f00", BLACK = "#000";
  const PLAYER_WIDTH = 40, PLAYER_HEIGHT = 40;
  const gravity = 1, jumpStrength = -15, obstacleSpeedStart = 5;

  const groundY = HEIGHT - 10;

  let players = [];
  let playerCount = 1;
  let obstacles = [];
  let spawnTimer = 0;
  let obstacleSpeed = obstacleSpeedStart;
  let score = 0;
  let highScore = localStorage.getItem("highScore") || 0;
  let gameRunning = false;

  const overlay = document.getElementById("gameOverlay");
  const message = document.getElementById("gameMessage");
  const scoreDisplay = document.getElementById("scoreDisplay");
  const playerCountSelect = document.getElementById("playerCountSelect");

  const playerKeys = ["Space", "KeyF", "KeyH", "KeyL"];

  function createPlayer(x) {
    return {
      x,
      y: HEIGHT - PLAYER_HEIGHT - 10,
      velY: 0,
      isJumping: false,
      jumpCount: 0,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    };
  }

  document.addEventListener("keydown", (e) => {
    if (!gameRunning && e.code === "KeyR") {
      playerCount = parseInt(playerCountSelect.value);
      startGame();
    }

    if (!gameRunning && e.code === "KeyE") {
      window.location.reload();
    }

    playerKeys.slice(0, players.length).forEach((key, index) => {
      if (e.code === key) {
        const p = players[index];
        if (!p.isJumping || (p.jumpCount < 2)) {
          p.velY = jumpStrength;
          p.isJumping = true;
          p.jumpCount++;
        }
      }
    });
  });

  function startGame() {
    overlay.classList.add("hidden");
    message.textContent = "";
    scoreDisplay.textContent = "";
    playerCountSelect.style.display = "none";
    players = Array.from({ length: playerCount }, (_, i) => createPlayer(100 + i * 60));
    obstacles = [];
    spawnTimer = 0;
    score = 0;
    obstacleSpeed = obstacleSpeedStart;
    gameRunning = true;
    gameLoop();
  }

  function rectIntersect(r1, r2) {
    return !(r2.x > r1.x + r1.width ||
             r2.x + r2.width < r1.x ||
             r2.y > r1.y + r1.height ||
             r2.y + r2.height < r1.y);
  }

  function drawPlayer(p) {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, PLAYER_WIDTH, PLAYER_HEIGHT);
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
    playerCountSelect.style.display = "block";
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

    // Update players
    players.forEach(p => {
      p.velY += gravity;
      p.y += p.velY;

      if (p.y + PLAYER_HEIGHT >= groundY) {
        p.y = groundY - PLAYER_HEIGHT;
        p.velY = 0;
        p.isJumping = false;
        p.jumpCount = 0;
      }

      drawPlayer(p);
    });

    // Spawn obstacles
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

    // Move obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].x -= obstacleSpeed;
      if (obstacles[i].x + obstacles[i].width < 0) {
        obstacles.splice(i, 1);
        score++;
        if (score % 10 === 0) {
          obstacleSpeed += 0.5;
        }
      }
    }

    // Collision detection
    for (let p of players) {
      const playerRect = { x: p.x, y: p.y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
      for (let ob of obstacles) {
        if (rectIntersect(playerRect, ob)) {
          showGameOver();
          return;
        }
      }
    }

    drawObstacles(obstacles);
    displayScore(score);
    requestAnimationFrame(gameLoop);
  }

  // Initial overlay message
  message.textContent = "Select players & Press 'R' to Start";
  scoreDisplay.textContent = "Jump keys: Space, F, H, L";
});
