const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");

const startSound = document.getElementById("startSound");
const deathSound = document.getElementById("deathSound");
const androidSound = document.getElementById("androidSound");

androidSound.loop = true; // Make the android sound loop

let gameRunning = false;
const smiley = { x: canvas.width / 2, y: canvas.height / 2, radius: 20, speed: 5 };
const carrots = [];
const poops = [];
const initialCarrotCount = 10;
let poopTimer = 0;
let score = 0;
let level = 0;
let enemies = [{ x: 100, y: 100, radius: 25, speed: 2, poopInterval: 100 }];

function randomPosition(max) {
  return Math.random() * (max - 50) + 25;
}

function drawCircle(x, y, radius, color) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

function drawEnemy(x, y, radius) {
  drawCircle(x, y, radius, "red");

  // Teeth
  const toothSize = radius / 5;
  const teethCount = 6;
  const angleStep = (Math.PI * 2) / teethCount;

  for (let i = 0; i < teethCount; i++) {
    const angle = i * angleStep;
    const toothX = x + Math.cos(angle) * radius * 0.9;
    const toothY = y + Math.sin(angle) * radius * 0.9;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(toothX, toothY);
    ctx.lineTo(
      x + Math.cos(angle + angleStep / 2) * radius * 0.8,
      y + Math.sin(angle + angleStep / 2) * radius * 0.8
    );
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.fill();
  }
}

function isCollision(x1, y1, r1, x2, y2, r2) {
  const dist = Math.hypot(x2 - x1, y2 - y1);
  return dist < r1 + r2;
}

function displayScore() {
  ctx.fillStyle = "black";
  ctx.font = "24px Arial";
  ctx.fillText(`Score: ${score}`, 20, 40);
}

function generateCarrots(count) {
  for (let i = 0; i < count; i++) {
    carrots.push({
      x: randomPosition(canvas.width),
      y: randomPosition(canvas.height),
      radius: 10,
    });
  }
}

function moveEnemy(enemy) {
  const angle = Math.atan2(smiley.y - enemy.y, smiley.x - enemy.x);
  enemy.x += enemy.speed * Math.cos(angle);
  enemy.y += enemy.speed * Math.sin(angle);
}

function dropPoop(enemy) {
  poopTimer++;
  if (poopTimer >= enemy.poopInterval) {
    poops.push({ x: enemy.x, y: enemy.y, radius: 10 });
    poopTimer = 0;
    enemy.poopInterval = Math.floor(Math.random() * 200) + 50; // New random interval for next poop
  }
}

function spawnEnemy() {
  const newEnemy = {
    x: randomPosition(canvas.width),
    y: randomPosition(canvas.height),
    radius: 25,
    speed: 2 + level, // Increase enemy speed as level increases
    poopInterval: Math.floor(Math.random() * 200) + 50
  };
  enemies.push(newEnemy);
}

function updateGame() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw smiley
  drawCircle(smiley.x, smiley.y, smiley.radius, "green");

  // Draw enemies
  enemies.forEach(enemy => {
    drawEnemy(enemy.x, enemy.y, enemy.radius);
    moveEnemy(enemy);
    dropPoop(enemy);

    // Collision with smiley
    if (isCollision(smiley.x, smiley.y, smiley.radius, enemy.x, enemy.y, enemy.radius)) {
      deathSound.play();
      androidSound.pause(); // Stop Android sound on death
      gameRunning = false;
      alert("Game Over! Your score: " + score);
      location.reload();
    }
  });

  // Draw carrots
  carrots.forEach((carrot, index) => {
    drawCircle(carrot.x, carrot.y, carrot.radius, "orange");

    if (isCollision(smiley.x, smiley.y, smiley.radius, carrot.x, carrot.y, carrot.radius)) {
      carrots.splice(index, 1);
      score++;
    }
  });

  // Draw poops
  poops.forEach((poop, index) => {
    drawCircle(poop.x, poop.y, poop.radius, "brown");

    if (isCollision(smiley.x, smiley.y, smiley.radius, poop.x, poop.y, poop.radius)) {
      poops.splice(index, 1);
      score -= 5; // Penalty for poops

      // Check for level-up
      if (score >= 10 * (level + 1)) {
        level++;
        spawnEnemy(); // Spawn new enemy on level-up
      }
    }
  });

  // Display score
  displayScore();

  // Move enemies
  enemies.forEach(moveEnemy);

  // Drop poops
  enemies.forEach(dropPoop);

  // Level up every 10 points
  if (score >= 10 * (level + 1)) {
    level++;
    spawnEnemy();
  }

  requestAnimationFrame(updateGame);
}

// Track mouse movement
canvas.addEventListener("mousemove", (event) => {
  // Update smiley position based on mouse coordinates
  smiley.x = event.clientX;
  smiley.y = event.clientY;
});

// Start game
startButton.addEventListener("click", () => {
  startScreen.style.display = "none";
  startSound.play();
  androidSound.play(); // Start looping Android sound
  gameRunning = true;
  generateCarrots(initialCarrotCount);
  updateGame();
});
</script>
</body>
</html>

