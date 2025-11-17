// -------------------------------------
// VARIABLES
// -------------------------------------
let ball = null;
let hoop = null;
let scoreUI = null;
let highscoreUI = null;

let score = 0;
let streak = 0;
let highscore = localStorage.getItem("ultimateHS") || 0;

let dragging = false;
let startX = 0, startY = 0;

let ballX = 100, ballY = 0;
let vx = 0, vy = 0;
let gravity = 0.6;
let wind = 0;
let floor = 0;

let ballSkin = "orange";
let difficulty = "normal";

// Sounds
const swishSound = new Audio("assets/swish.mp3");
const bounceSound = new Audio("assets/bounce.mp3");
const streakSound = new Audio("assets/streak.mp3");

// -------------------------------------
// START GAME
// -------------------------------------
function startGame() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("game").style.display = "block";

    ball = document.getElementById("ball");
    hoop = document.getElementById("hoop");
    scoreUI = document.getElementById("scoreUI");
    highscoreUI = document.getElementById("highscoreUI");

    floor = window.innerHeight - 100;
    ballY = floor;

    ballSkin = document.getElementById("ballSkin").value;
    difficulty = document.getElementById("difficulty").value;

    setBallSkin(ballSkin);
    applyDifficulty(difficulty);

    highscoreUI.innerText = "High Score: " + highscore;

    resetBall();
    startHoopMovement();
    physics();
}

// -------------------------------------
// FULLSCREEN BUTTON
// -------------------------------------
function openFullscreen() {
    document.documentElement.requestFullscreen();
}

// -------------------------------------
// SKINS
// -------------------------------------
function setBallSkin(skin) {
    ball.className = "";
    if (skin === "orange") ball.classList.add("ball-orange");
    if (skin === "blue") ball.classList.add("ball-blue");
    if (skin === "gold") ball.classList.add("ball-gold");
    if (skin === "fire") ball.classList.add("ball-fire");
}

// -------------------------------------
// DIFFICULTY CHANGES
// -------------------------------------
function applyDifficulty(level) {
    if (level === "easy") gravity = 0.4;
    if (level === "normal") gravity = 0.6;
    if (level === "hard") gravity = 0.85;

    wind = level === "hard" ? (Math.random() * 1.4 - 0.7) : 0;
}

// -------------------------------------
// RESET BALL
// -------------------------------------
function resetBall() {
    ballX = 100;
    ballY = floor - 40;
    vx = 0;
    vy = 0;
}

// -------------------------------------
// HOOP MOVEMENT
// -------------------------------------
function startHoopMovement() {
    hoop.style.animation = "moveHoop 3.5s ease-in-out infinite alternate";
}

// -------------------------------------
// DRAG SYSTEM
// -------------------------------------
document.addEventListener("mousedown", startDrag);
document.addEventListener("mousemove", drag);
document.addEventListener("mouseup", endDrag);

document.addEventListener("touchstart", startDrag);
document.addEventListener("touchmove", drag);
document.addEventListener("touchend", endDrag);

function getPos(e) {
    if (e.touches) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
}

function startDrag(e) {
    const pos = getPos(e);
    dragging = true;
    startX = pos.x - ballX;
    startY = pos.y - ballY;
}

function drag(e) {
    if (!dragging) return;
    const pos = getPos(e);

    ballX = pos.x - startX;
    ballY = pos.y - startY;
}

function endDrag(e) {
    if (!dragging) return;
    dragging = false;

    streakSound.pause();
    streakSound.currentTime = 0;

    vx = (Math.random() * 4) - 2; // slight randomness
    vy = -15 - Math.random() * 10;
}

// -------------------------------------
// SCORE DETECTION
// -------------------------------------
function checkScore() {
    let b = ball.getBoundingClientRect();
    let h = hoop.getBoundingClientRect();

    if (vy > 0 && 
        b.right > h.left && b.left < h.right &&
        b.top < h.bottom && b.bottom > h.top) {

        swishSound.play();

        score++;
        streak++;
        scoreUI.innerText = "Score: " + score;

        if (streak >= 3) {
            streakSound.play();
            ball.classList.add("ball-fire");
        }

        if (score > highscore) {
            highscore = score;
            localStorage.setItem("ultimateHS", highscore);
            highscoreUI.innerText = "High Score: " + highscore;
        }

        spawnParticles(ballX + 40, ballY + 40);
        resetBall();
    }
}

// -------------------------------------
// PARTICLES
// -------------------------------------
function spawnParticles(x, y) {
    for (let i = 0; i < 20; i++) {
        let p = document.createElement("div");
        p.className = "particle";
        document.body.appendChild(p);

        let angle = Math.random() * Math.PI * 2;
        let speed = 3 + Math.random() * 4;
        let vx = Math.cos(angle) * speed;
        let vy = Math.sin(angle) * speed;

        let life = 30;

        function animate() {
            vx *= 0.95;
            vy *= 0.95;
            x += vx;
            y += vy;
            life--;

            p.style.left = x + "px";
            p.style.top = y + "px";
            p.style.opacity = life / 30;

            if (life > 0) requestAnimationFrame(animate);
            else p.remove();
        }

        animate();
    }
}

// -------------------------------------
// PHYSICS LOOP
// -------------------------------------
function physics() {
    if (!dragging) {
        vy += gravity;
        vx += wind / 50;

        ballX += vx;
        ballY += vy;

        if (ballY > floor) {
            bounceSound.play();
            ballY = floor;
            vy *= -0.45;
            vx *= 0.6;
            if (Math.abs(vy) < 1) resetBall();
        }

        if (ballX < -200 || ballX > window.innerWidth + 200) resetBall();
        if (ballY < -200 || ballY > window.innerHeight + 200) resetBall();
    }

    ball.style.left = ballX + "px";
    ball.style.top = ballY + "px";

    checkScore();
    requestAnimationFrame(physics);
}
