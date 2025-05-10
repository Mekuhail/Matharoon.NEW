// RoonRun Game Logic
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("roonRunCanvas");
    const ctx = canvas.getContext("2d");
    const gameArea = document.getElementById("roonRunGameArea");
    const scoreDisplay = document.getElementById("roonRunScore");
    const difficultySelectorOverlay = document.getElementById("difficultySelectorOverlay");
    const difficultyButtons = document.querySelectorAll(".difficulty-btn");
    const gameOverOverlay = document.getElementById("roonRunGameOverOverlay");
    const finalScoreDisplay = document.getElementById("roonRunFinalScore");
    const restartButton = document.getElementById("restartRoonRunBtn");

    // Game dimensions - match canvas CSS or set dynamically
    canvas.width = 800;
    canvas.height = 400;

    // Game state variables
    let gameRunning = false;
    let score = 0;
    let gameSpeed = 5; // Initial speed, can be adjusted by difficulty
    let obstacles = [];
    let frameCount = 0;
    let player;
    let currentDifficulty = "medium"; // Default difficulty

    // Asset paths (ensure these are correct and files are in the specified location)
    const playerSpriteSheetPath = "/roonrun_sprite.png";
    const playerDeadFramesPath = [
        "/roonrun_dead_f0.png",
        "/roonrun_dead_f1.png",
        "/roonrun_dead_f2.png",
        "/roonrun_dead_f3.png"
    ];
    const obstacleImagePaths = {
        cube: "/obstacle_cube.png",
        cone: "/obstacle_cone.png",
        sphere: "/obstacle_sphere.png",
        pyramid: "/obstacle_pyramid.png"
    };

    let playerImage = new Image();
    let deadPlayerImages = [];
    let obstacleImages = {};
    let assetsLoaded = 0;
    const totalAssets = 1 + playerDeadFramesPath.length + Object.keys(obstacleImagePaths).length;

    function assetLoaded() {
        assetsLoaded++;
        if (assetsLoaded === totalAssets) {
            console.log("All RoonRun assets loaded.");
            // Enable UI or show difficulty selector once assets are ready
            difficultySelectorOverlay.classList.remove("hidden");
        }
    }

    function loadAssets() {
        playerImage.onload = assetLoaded;
        playerImage.src = playerSpriteSheetPath;

        playerDeadFramesPath.forEach((path, index) => {
            deadPlayerImages[index] = new Image();
            deadPlayerImages[index].onload = assetLoaded;
            deadPlayerImages[index].src = path;
        });

        for (const type in obstacleImagePaths) {
            obstacleImages[type] = new Image();
            obstacleImages[type].onload = assetLoaded;
            obstacleImages[type].src = obstacleImagePaths[type];
        }
    }

    // Player class
    class Player {
        constructor() {
            this.width = 64; // Sprite frame width
            this.height = 64; // Sprite frame height
            this.x = 50;
            this.y = canvas.height - this.height - 20; // Start on the ground (20px buffer)
            this.velocityY = 0;
            this.gravity = 1;
            this.jumpPower = 20;
            this.isJumping = false;
            this.groundY = canvas.height - this.height - 20;

            // Animation
            this.spriteSheet = playerImage;
            this.frameCount = 8; // Number of frames in the running animation
            this.currentFrame = 0;
            this.frameSpeed = 5; // Lower is faster animation
            this.framesElapsed = 0;
            this.isDead = false;
            this.deadFrameCount = playerDeadFramesPath.length;
            this.currentDeadFrame = 0;
            this.deadAnimationSpeed = 10;
        }

        jump() {
            if (!this.isJumping) {
                this.isJumping = true;
                this.velocityY = -this.jumpPower;
            }
        }

        update() {
            // Apply gravity
            this.y += this.velocityY;
            this.velocityY += this.gravity;

            // Ground collision
            if (this.y > this.groundY) {
                this.y = this.groundY;
                this.velocityY = 0;
                this.isJumping = false;
            }
            
            // Animation update for running
            if (!this.isDead) {
                this.framesElapsed++;
                if (this.framesElapsed % this.frameSpeed === 0) {
                    this.currentFrame = (this.currentFrame + 1) % this.frameCount;
                }
            } else {
                // Animation update for dead state
                this.framesElapsed++;
                if (this.framesElapsed % this.deadAnimationSpeed === 0 && this.currentDeadFrame < this.deadFrameCount -1) {
                    this.currentDeadFrame++;
                }
            }
        }

        draw() {
            if (!this.isDead) {
                ctx.drawImage(
                    this.spriteSheet,
                    this.currentFrame * this.width, // Source x
                    0, // Source y
                    this.width, // Source width
                    this.height, // Source height
                    this.x, // Destination x
                    this.y, // Destination y
                    this.width, // Destination width
                    this.height // Destination height
                );
            } else {
                if (deadPlayerImages[this.currentDeadFrame]) {
                     ctx.drawImage(
                        deadPlayerImages[this.currentDeadFrame],
                        this.x,
                        this.y,
                        this.width,
                        this.height
                    );
                }
            }
        }
        
        die() {
            this.isDead = true;
            this.currentDeadFrame = 0;
            this.framesElapsed = 0; // Reset for dead animation timing
        }
    }

    // Obstacle class
    class Obstacle {
        constructor(type) {
            this.image = obstacleImages[type];
            this.width = 32; // Obstacle sprite width
            this.height = 32; // Obstacle sprite height
            this.x = canvas.width;
            this.y = canvas.height - this.height - 20; // Ground level (20px buffer)
            // Potentially vary y for flying obstacles or different heights
        }

        update() {
            this.x -= gameSpeed;
        }

        draw() {
            if (this.image && this.image.complete) {
                ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            }
        }
    }

    function spawnObstacle() {
        const obstacleTypes = Object.keys(obstacleImagePaths);
        const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        obstacles.push(new Obstacle(type));
    }

    function handleCollisions() {
        for (let i = 0; i < obstacles.length; i++) {
            const obs = obstacles[i];
            // Simple AABB collision detection
            if (
                player.x < obs.x + obs.width &&
                player.x + player.width > obs.x &&
                player.y < obs.y + obs.height &&
                player.y + player.height > obs.y
            ) {
                // Collision detected
                gameOver();
                return;
            }
        }
    }

    function updateGame() {
        if (!gameRunning) return;

        frameCount++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw player
        player.update();
        player.draw();

        // Spawn obstacles periodically
        // Adjust spawn rate based on difficulty/gameSpeed
        let spawnInterval = 120; // Default for medium
        if (currentDifficulty === "easy") spawnInterval = 150;
        if (currentDifficulty === "hard") spawnInterval = 90;

        if (frameCount % Math.floor(spawnInterval / (gameSpeed / 5)) === 0) { // Adjust spawn rate with game speed
            spawnObstacle();
        }

        // Update and draw obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].update();
            obstacles[i].draw();
            // Remove off-screen obstacles
            if (obstacles[i].x + obstacles[i].width < 0) {
                obstacles.splice(i, 1);
                score += 10; // Score for passing an obstacle
                scoreDisplay.textContent = `Score: ${score}`;
            }
        }

        // Handle collisions
        if (!player.isDead) {
             handleCollisions();
        }
       
        // Increase game speed over time (optional, for harder difficulties)
        if (currentDifficulty === "hard" && frameCount % 600 === 0) { // Every 10 seconds approx
            gameSpeed += 0.5;
        }

        requestAnimationFrame(updateGame);
    }

    function startGame(difficulty) {
        currentDifficulty = difficulty;
        gameRunning = true;
        score = 0;
        frameCount = 0;
        obstacles = [];
        player = new Player();
        scoreDisplay.textContent = `Score: ${score}`;
        gameOverOverlay.classList.add("hidden");
        difficultySelectorOverlay.classList.add("hidden");
        gameArea.focus(); // For keyboard input if any

        // Adjust game speed based on difficulty
        switch (difficulty) {
            case "easy":
                gameSpeed = 4;
                break;
            case "medium":
                gameSpeed = 6;
                break;
            case "hard":
                gameSpeed = 8;
                break;
        }
        
        // Ensure player is not dead at start
        player.isDead = false;
        player.currentDeadFrame = 0;

        updateGame();
    }

    function gameOver() {
        gameRunning = false;
        player.die(); // Trigger dead animation
        // Wait for dead animation to play out a bit before showing overlay
        setTimeout(() => {
            finalScoreDisplay.textContent = score;
            gameOverOverlay.classList.remove("hidden");
            // Here, instead of just showing an overlay, we might redirect to gameEnd.html
            // For now, we show the overlay. The spec says: "On a wrong answer, trigger a death() function which then redirects to gameEnd.html"
            // This runner game doesn't have "wrong answers" in the math sense, but obstacle collision is a form of "death".
            // We can adapt this. For now, let's keep the overlay and consider the redirect for a later refinement or if math questions are integrated.
            // If we need to redirect: window.location.href = `gameEnd.html?score=${score}&game=roonrun`; (example)
        }, player.deadAnimationSpeed * player.deadFrameCount * (1000/60) + 500); // Wait for animation + buffer
    }

    // Event Listeners
    difficultyButtons.forEach(button => {
        button.addEventListener("click", () => {
            const difficulty = button.dataset.difficulty;
            startGame(difficulty);
        });
    });

    restartButton.addEventListener("click", () => {
        gameOverOverlay.classList.add("hidden");
        difficultySelectorOverlay.classList.remove("hidden"); // Show difficulty selection again
    });

    // Keyboard controls for jumping
    document.addEventListener("keydown", (e) => {
        if (e.code === "Space" || e.key === " " || e.key === "ArrowUp") {
            if (gameRunning && player && !player.isDead) {
                player.jump();
                e.preventDefault(); // Prevent space from scrolling page
            }
        }
    });
    canvas.addEventListener("touchstart", (e) => {
        if (gameRunning && player && !player.isDead) {
            player.jump();
            e.preventDefault();
        }
    });

    // Initial asset load
    loadAssets();
});

