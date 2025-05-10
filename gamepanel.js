// Enhanced game.js with multiple choice mode and Firebase integration
// Global Variables
let timer;
let timeLeft = 120;
let score = 0;
let currentQuestion = "";
let currentAnswer = null;
let questionCount = 0;
let selectedGrade = 5; // Keep track of the selected grade, default to 5
let lastQuestion = "";
let isSubmitting = false;
let streak = 0;
let maxStreak = 0;
let experience = 0;
let level = 1;
let soundEnabled = true;
let particleSystem;
let gameMode = "text"; // Default game mode: "text" or "multiple_choice"
let achievements = {
    firstCorrect: false,
    speedDemon: false,
    perfectStreak5: false,
    perfectStreak10: false,
    perfectStreak20: false,
    gradeMaster: false,
    firstPlace: false,
    secondPlace: false,
    thirdPlace: false
};

// Grade configurations
const gradeConfig = {
    5: { addSub: { min1: 0, max1: 10, min2: 0, max2: 25 }, mulDiv: { min1: 0, max1: 10, min2: 0, max2: 9 }, levelName: "Grade 5" },
    6: { addSub: { min1: 0, max1: 20, min2: 10, max2: 35 }, mulDiv: { min1: 0, max1: 10, min2: 0, max2: 9 }, levelName: "Grade 6" },
    7: { addSub: { min1: 0, max1: 30, min2: 13, max2: 90 }, mulDiv: { min1: 0, max1: 20, min2: 0, max2: 9 }, levelName: "Grade 7" },
    8: { addSub: { min1: 0, max1: 40, min2: 15, max2: 100 }, mulDiv: { min1: 0, max1: 30, min2: 0, max2: 9 }, levelName: "Grade 8" },
    9: { addSub: { min1: 0, max1: 50, min2: 17, max2: 110 }, mulDiv: { min1: 0, max1: 50, min2: 0, max2: 9 }, levelName: "Grade 9" },
    10: { addSub: { min1: 0, max1: 60, min2: 19, max2: 110 }, mulDiv: { min1: 0, max1: 60, min2: 0, max2: 9 }, levelName: "Grade 10" },
    11: { addSub: { min1: 0, max1: 80, min2: 22, max2: 120 }, mulDiv: { min1: 0, max1: 65, min2: 0, max2: 10 }, levelName: "Grade 11" },
    12: { addSub: { min1: 0, max1: 100, min2: 25, max2: 140 }, mulDiv: { min1: 0, max1: 70, min2: 0, max2: 10 }, levelName: "Grade 12" }
};

// Theme configurations (can be used if desired, currently not directly implemented for game panel theme)
const themeConfig = {
    5: { name: "Ocean Adventure", bgColor: "#1a75ff", accentColor: "#00ccff", icon: "🌊" },
    6: { name: "Jungle Explorer", bgColor: "#33cc33", accentColor: "#ffcc00", icon: "🌴" },
    7: { name: "Desert Quest", bgColor: "#ff9933", accentColor: "#cc6600", icon: "🏜️" },
    8: { name: "Mountain Climb", bgColor: "#996633", accentColor: "#99ccff", icon: "⛰️" },
    9: { name: "Space Journey", bgColor: "#3333cc", accentColor: "#cc33ff", icon: "🚀" },
    10: { name: "Arctic Expedition", bgColor: "#99ccff", accentColor: "#ffffff", icon: "❄️" },
    11: { name: "Volcanic Challenge", bgColor: "#cc3300", accentColor: "#ff9933", icon: "🌋" },
    12: { name: "Quantum Realm", bgColor: "#660066", accentColor: "#cc00cc", icon: "⚛️" }
};

/* ---------------------------
   Animation and Effects
--------------------------- */

function initParticleSystem() {
    particleSystem = {
        particles: [],
        maxParticles: 100,
        createParticle(x, y, color, size, lifespan, speedX, speedY) {
            if (this.particles.length >= this.maxParticles) return;
            this.particles.push({ x, y, color, size, lifespan, maxLifespan: lifespan, speedX, speedY, opacity: 1, rotation: Math.random() * 360 });
        },
        update() {
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.speedX; p.y += p.speedY; p.speedY += 0.1; p.lifespan--;
                p.opacity = p.lifespan / p.maxLifespan; p.rotation += 2;
                if (p.lifespan <= 0) this.particles.splice(i, 1);
            }
        },
        render() {
            const container = document.getElementById("particleContainer");
            if (!container) return; container.innerHTML = "";
            this.particles.forEach(p => {
                const particle = document.createElement("div"); particle.className = "particle";
                particle.style.left = `${p.x}px`; particle.style.top = `${p.y}px`;
                particle.style.backgroundColor = p.color; particle.style.width = `${p.size}px`;
                particle.style.height = `${p.size}px`; particle.style.opacity = p.opacity;
                particle.style.transform = `rotate(${p.rotation}deg)`; container.appendChild(particle);
            });
        },
        createBurst(x, y, count, colors) {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2; const speed = 1 + Math.random() * 3;
                const size = 5 + Math.random() * 10; const color = colors[Math.floor(Math.random() * colors.length)];
                const lifespan = 30 + Math.random() * 60;
                this.createParticle(x, y, color, size, lifespan, Math.cos(angle) * speed, Math.sin(angle) * speed);
            }
        },
        createConfetti(x, y, count) { this.createBurst(x, y, count, ["#f94144", "#f3722c", "#f8961e", "#f9c74f", "#90be6d", "#43aa8b", "#577590"]); },
        createCorrectBurst(x, y) { this.createBurst(x, y, 30, ["#90be6d", "#43aa8b", "#4d908e", "#277da1"]); },
        createStreakBurst(x, y) { this.createBurst(x, y, 50, ["#f9c74f", "#f8961e", "#f3722c", "#f94144"]); }
    };
    setInterval(() => { particleSystem.update(); particleSystem.render(); }, 16);
}

const soundEffects = {
    buttonClick: new Audio("/click.mp3"), correctAnswer: new Audio("/correct.mp3"),
    incorrectAnswer: new Audio("/incorrect.mp3"), gameStart: new Audio("/start.mp3"),
    gameOver: new Audio("/gameover.mp3"), achievement: new Audio("/achievement.mp3"),
    streak: new Audio("/new_streak_sound.mp3"), countdown: new Audio("/countdown.wav"),
    play(sound) {
        if (!soundEnabled) return;
        try { const audio = this[sound]; audio.currentTime = 0; audio.play().catch(e => console.log(`Sound error playing ${sound}:`, e)); }
        catch (e) { console.log(`Sound error for ${sound}:`, e); }
    },
    toggleSound() { soundEnabled = !soundEnabled; return soundEnabled; }
};

const animations = {
    shake(element) { element.classList.remove("shake"); void element.offsetWidth; element.classList.add("shake"); },
    pulse(element) { element.classList.remove("pulse"); void element.offsetWidth; element.classList.add("pulse"); },
    bounce(element) { element.classList.remove("bounce"); void element.offsetWidth; element.classList.add("bounce"); },
    fadeIn(element) { element.classList.remove("fade-in"); void element.offsetWidth; element.classList.add("fade-in"); },
    fadeOut(element, callback) { element.classList.add("fade-out"); setTimeout(() => { if (callback) callback(); }, 500); },
    floatAnimation(element) { element.classList.add("floating"); },
    stopFloatAnimation(element) { element.classList.remove("floating"); }
};

/* ---------------------------
   Game Logic
--------------------------- */
function generateArithmeticQuestion() {
    const operators = ["+", "-", "*", "/"];
    const op = operators[Math.floor(Math.random() * operators.length)];
    const config = (op === "+" || op === "-") ? gradeConfig[selectedGrade].addSub : gradeConfig[selectedGrade].mulDiv;
    let answer, question, choices;
    if (op === "/") {
        let divisor = Math.floor(Math.random() * (config.max2 - config.min2 + 1)) + config.min2 || 1;
        const multiple = Math.floor(Math.random() * 10) + 1;
        const dividend = divisor * multiple;
        answer = multiple; question = `${dividend} / ${divisor} = ?`;
    } else {
        let num1 = Math.floor(Math.random() * (config.max1 - config.min1 + 1)) + config.min1;
        let num2 = Math.floor(Math.random() * (config.max2 - config.min2 + 1)) + config.min2;
        if (op === "-") { if (num1 < num2) [num1, num2] = [num2, num1]; answer = num1 - num2; }
        else if (op === "+") { answer = num1 + num2; }
        else if (op === "*") { answer = num1 * num2; }
        question = `${num1} ${op} ${num2} = ?`;
    }
    if (gameMode === "multiple_choice") { choices = generateChoices(answer); }
    currentQuestion = question; currentAnswer = answer;
    return { question, answer, choices };
}

function generateChoices(correctAnswer) {
    const choices = [correctAnswer];
    while (choices.length < 4) {
        let wrongAnswer;
        const randomFactor = Math.floor(Math.random() * 3);
        if (randomFactor === 0) { wrongAnswer = correctAnswer + Math.floor(Math.random() * 5) + 1; }
        else if (randomFactor === 1) { wrongAnswer = Math.max(1, correctAnswer - (Math.floor(Math.random() * 5) + 1)); }
        else {
            if (correctAnswer >= 10) {
                const digits = correctAnswer.toString().split("");
                const i = Math.floor(Math.random() * (digits.length - 1));
                [digits[i], digits[i + 1]] = [digits[i + 1], digits[i]];
                wrongAnswer = parseInt(digits.join(""), 10);
            } else { wrongAnswer = correctAnswer + Math.floor(Math.random() * 8) + 1; }
        }
        if (!choices.includes(wrongAnswer) && wrongAnswer !== correctAnswer ) choices.push(wrongAnswer);
    }
    return shuffleArray(choices);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; }
    return array;
}

function displayNextQuestion() {
    questionCount++;
    document.getElementById("feedback").textContent = "";
    if (gameMode === "text") {
        const answerInput = document.getElementById("answerInput");
        answerInput.value = ""; answerInput.classList.remove("correct", "incorrect");
        document.getElementById("textAnswerContainer").style.display = "flex";
        document.getElementById("multipleChoiceContainer").style.display = "none";
    } else {
        document.getElementById("textAnswerContainer").style.display = "none";
        document.getElementById("multipleChoiceContainer").style.display = "flex";
        document.getElementById("choicesContainer").innerHTML = "";
    }
    let retry = 0; let questionData;
    do { questionData = generateArithmeticQuestion(); retry++; } while ((questionData.question === lastQuestion || questionData.answer <= 0) && retry < 5);
    lastQuestion = questionData.question;
    const questionDisplay = document.getElementById("questionDisplay");
    questionDisplay.style.opacity = 0; questionDisplay.textContent = questionData.question;
    setTimeout(() => { questionDisplay.style.opacity = 1; animations.bounce(questionDisplay); }, 100);
    if (gameMode === "multiple_choice" && questionData.choices) {
        const choicesContainer = document.getElementById("choicesContainer");
        questionData.choices.forEach(choice => {
            const button = document.createElement("button"); button.className = "choice-btn";
            button.textContent = choice; button.dataset.value = choice;
            button.addEventListener("click", function () { if (isSubmitting) return; checkMultipleChoiceAnswer(this.dataset.value); });
            choicesContainer.appendChild(button);
        });
    } else { document.getElementById("answerInput").focus(); }
    updateProgressBar();
}

function startTimer() {
    const timerDisplay = document.getElementById("timerDisplay");
    const timerProgressFill = document.getElementById("timerProgressFill");
    timerDisplay.textContent = formatTime(timeLeft);
    timerProgressFill.style.width = "100%";
    timerProgressFill.style.backgroundColor = "var(--primary-color)"; // Reset color
    timerDisplay.style.color = "var(--dark-color)"; // Reset color
    timerDisplay.style.animation = ""; // Reset animation

    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = formatTime(timeLeft);
        const percentage = (timeLeft / 120) * 100;
        timerProgressFill.style.width = `${percentage}%`;
        if (timeLeft <= 10) {
            timerProgressFill.style.backgroundColor = "#f94144";
            timerDisplay.style.color = "#f94144";
            timerDisplay.style.animation = "pulse 1s infinite";
            if (timeLeft <= 5 && timeLeft > 0) soundEffects.play("buttonClick");
        } else if (timeLeft <= 30) {
            timerProgressFill.style.backgroundColor = "#f9c74f";
            timerDisplay.style.color = "#f9c74f";
        }
        if (timeLeft <= 0) { clearInterval(timer); endGame(); }
    }, 1000);
}

function formatTime(seconds) { const min = Math.floor(seconds / 60); const sec = seconds % 60; return `${min}:${sec < 10 ? "0" : ""}${sec}`; }

function checkAnswer() {
    if (isSubmitting) return; isSubmitting = true;
    const input = document.getElementById("answerInput");
    const userAnswer = parseInt(input.value.trim(), 10);
    const answerTime = 120 - timeLeft;
    if (!isNaN(userAnswer) && userAnswer === currentAnswer) { handleCorrectAnswer(answerTime); }
    else { handleIncorrectAnswer(); }
    setTimeout(() => { if (timeLeft > 0) { displayNextQuestion(); isSubmitting = false; } }, 1000);
}

function checkMultipleChoiceAnswer(selectedValue) {
    if (isSubmitting) return; isSubmitting = true;
    const userAnswer = parseInt(selectedValue, 10);
    const answerTime = 120 - timeLeft;
    const buttons = document.querySelectorAll(".choice-btn");
    buttons.forEach(btn => {
        if (parseInt(btn.dataset.value, 10) === userAnswer) { btn.classList.add(userAnswer === currentAnswer ? "correct" : "incorrect"); }
        if (parseInt(btn.dataset.value, 10) === currentAnswer && userAnswer !== currentAnswer) { btn.classList.add("correct-highlight"); } // Highlight correct if user was wrong
        btn.disabled = true; // Disable all buttons after a choice
    });
    if (userAnswer === currentAnswer) { handleCorrectAnswer(answerTime); }
    else { handleIncorrectAnswer(); }
    setTimeout(() => {
        if (timeLeft > 0) {
            displayNextQuestion();
            isSubmitting = false;
            buttons.forEach(btn => btn.disabled = false); // Re-enable buttons for next question
        }
    }, 1000);
}

function handleCorrectAnswer(answerTime) {
    score += 10; streak++; maxStreak = Math.max(maxStreak, streak);
    document.getElementById("score").textContent = score;
    document.getElementById("streakCounter").textContent = streak;
    document.getElementById("streakFlame").textContent = "🔥".repeat(Math.min(5, Math.floor(streak / 3)));
    document.getElementById("feedback").textContent = "Correct!";
    document.getElementById("feedback").style.color = "var(--correct-color)";
    if (gameMode === "text") { document.getElementById("answerInput").classList.add("correct"); }
    soundEffects.play("correctAnswer");
    particleSystem.createCorrectBurst(window.innerWidth / 2, window.innerHeight / 2);
    if (streak > 0 && streak % 5 === 0) { showStreakMessage(streak); soundEffects.play("streak"); particleSystem.createStreakBurst(window.innerWidth / 2, window.innerHeight / 2);}
    checkAchievements(answerTime);
    addExperience(15);
}

function handleIncorrectAnswer() {
    streak = 0;
    document.getElementById("streakCounter").textContent = streak;
    document.getElementById("streakFlame").textContent = "";
    document.getElementById("feedback").textContent = `Incorrect. The answer was ${currentAnswer}.`;
    document.getElementById("feedback").style.color = "var(--incorrect-color)";
    if (gameMode === "text") { document.getElementById("answerInput").classList.add("incorrect"); }
    soundEffects.play("incorrectAnswer");
    animations.shake(document.querySelector(".game-panel"));
    addExperience(5);
}

function addExperience(amount) {
    experience += amount;
    const expToNextLevel = level * 100;
    if (experience >= expToNextLevel) {
        level++; experience -= expToNextLevel;
        showLevelUpMessage(level);
        soundEffects.play("achievement");
    }
    updateExpBar();
}

function updateExpBar() {
    const expToNextLevel = level * 100;
    const expPercentage = (experience / expToNextLevel) * 100;
    document.getElementById("expFill").style.width = `${expPercentage}%`;
    document.getElementById("expText").textContent = `Level ${level} - ${experience}/${expToNextLevel} XP`;
}

function updateProgressBar() {
    const progress = (questionCount / 20) * 100; // Assuming 20 questions per game session for now
    document.getElementById("progressFill").style.width = `${progress}%`;
}

function endGame() {
    soundEffects.play("gameOver");
    document.getElementById("gameArea").classList.add("hidden");
    document.getElementById("gameOverArea").classList.remove("hidden");
    document.getElementById("finalScore").textContent = score;
    document.getElementById("finalStreak").textContent = maxStreak;
    document.getElementById("finalLevel").textContent = level;
    document.getElementById("finalQuestions").textContent = questionCount;
    displayAchievements();
    saveGameStats();

    // Update leaderboard button to include grade and level (assuming level is the game mode/difficulty)
    const leaderboardBtn = document.querySelector("#gameOverArea .game-over-buttons button[onclick*=\"leaderboard.html\"]");
    if (leaderboardBtn) {
        // For now, we use 'selectedGrade' for 'g' and a placeholder '1' for 'lvl' as level/difficulty isn't fully distinct yet
        // This needs to be refined if 'level' means something other than grade or if difficulty levels are introduced per grade.
        leaderboardBtn.onclick = () => { window.location.href = `leaderboard.html?g=${selectedGrade}&lvl=1`; };
    }
}

function saveGameStats() {
    const user = auth.currentUser;
    if (user) {
        const gameData = {
            userId: user.uid,
            userName: user.displayName || "Anonymous Player",
            score: score,
            grade: selectedGrade,
            level: level, // Or gameMode if that's more relevant for level
            maxStreak: maxStreak,
            questionsAttempted: questionCount,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };
        // Save to a general leaderboard path and a user-specific history path
        const gameId = db.ref().child("gameSessions").push().key;
        const updates = {};
        updates[`/gameSessions/${gameId}`] = gameData;
        updates[`/userGameHistory/${user.uid}/${gameId}`] = gameData;
        // Also update leaderboard (example: top scores per grade)
        // This leaderboard logic might need to be more sophisticated (e.g., using Cloud Functions for aggregation)
        updates[`/leaderboards/grade${selectedGrade}/${gameId}`] = { score: score, userName: user.displayName || "Anonymous Player", timestamp: firebase.database.ServerValue.TIMESTAMP };

        db.ref().update(updates)
            .then(() => console.log("Game stats saved successfully."))
            .catch(error => console.error("Error saving game stats:", error));
    }
}

function checkAchievements(answerTime) {
    if (!achievements.firstCorrect) { achievements.firstCorrect = true; showAchievementMessage("First Correct!", "🎉"); }
    if (answerTime < 2 && !achievements.speedDemon) { achievements.speedDemon = true; showAchievementMessage("Speed Demon!", "⚡"); }
    if (streak === 5 && !achievements.perfectStreak5) { achievements.perfectStreak5 = true; showAchievementMessage("5 in a Row!", "🔥"); }
    if (streak === 10 && !achievements.perfectStreak10) { achievements.perfectStreak10 = true; showAchievementMessage("10 Streak! Flawless!", "🔥🔥"); }
    if (streak === 20 && !achievements.perfectStreak20) { achievements.perfectStreak20 = true; showAchievementMessage("20 Streak! Unstoppable!", "🔥🔥🔥"); }
    // More achievements can be added here
}

function displayAchievements() {
    const list = document.getElementById("achievementsList");
    list.innerHTML = ""; // Clear previous
    for (const key in achievements) {
        if (achievements[key]) {
            const li = document.createElement("li");
            li.textContent = formatAchievementName(key);
            list.appendChild(li);
        }
    }
    if (list.children.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No new achievements this round.";
        list.appendChild(li);
    }
}

function formatAchievementName(key) {
    return key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
}

function showAchievementMessage(message, icon = "🏆") {
    const achMessage = document.getElementById("achievementMessage");
    achMessage.innerHTML = `<span class="achievement-icon">${icon}</span> ${message}`;
    animations.fadeIn(achMessage);
    soundEffects.play("achievement");
    setTimeout(() => animations.fadeOut(achMessage, () => achMessage.style.display = "none"), 3000);
}

function showLevelUpMessage(lvl) {
    const lvlMessage = document.getElementById("levelUpMessage");
    lvlMessage.innerHTML = `<span class="achievement-icon">🌟</span> Level Up! Reached Level ${lvl}!`;
    animations.fadeIn(lvlMessage);
    setTimeout(() => animations.fadeOut(lvlMessage, () => lvlMessage.style.display = "none"), 3000);
}

function showStreakMessage(currentStreak) {
    const streakMsg = document.getElementById("streakMessage");
    streakMsg.innerHTML = `<span class="achievement-icon">🔥</span> ${currentStreak} Question Streak!`;
    animations.fadeIn(streakMsg);
    setTimeout(() => animations.fadeOut(streakMsg, () => streakMsg.style.display = "none"), 2000);
}

// Countdown Timer Functionality
function startCountdown(callback) {
    const countdownOverlay = document.getElementById("countdownOverlay");
    const countdownText = document.getElementById("countdownText");
    countdownOverlay.classList.remove("hidden");
    let count = 3;
    countdownText.textContent = count;
    soundEffects.play("countdown");

    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownText.textContent = count;
            soundEffects.play("countdown");
        } else {
            clearInterval(countdownInterval);
            countdownOverlay.classList.add("hidden");
            if (callback) callback();
        }
    }, 1000);
}

// Event Listeners and Initialization
document.addEventListener("DOMContentLoaded", () => {
    initParticleSystem();

    const gradeCards = document.querySelectorAll(".grade-card");
    const startGameBtn = document.getElementById("startGameBtn");
    const answerInput = document.getElementById("answerInput");
    const submitAnswerBtn = document.getElementById("submitAnswerBtn");
    const soundToggleBtn = document.getElementById("soundToggleBtn");
    const gameModeOptions = document.querySelectorAll(".game-mode-option");

    gradeCards.forEach(card => {
        card.addEventListener("click", () => {
            soundEffects.play("buttonClick");
            gradeCards.forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            selectedGrade = parseInt(card.dataset.grade);
            startGameBtn.disabled = false;
            // Update theme based on grade (optional)
            // const theme = themeConfig[selectedGrade];
            // document.body.style.setProperty("--primary-color", theme.bgColor);
            // document.body.style.setProperty("--accent-color", theme.accentColor);
        });
    });

    gameModeOptions.forEach(option => {
        option.addEventListener("click", () => {
            soundEffects.play("buttonClick");
            gameModeOptions.forEach(opt => opt.classList.remove("selected"));
            option.classList.add("selected");
            gameMode = option.dataset.mode;
            console.log("Game mode selected:", gameMode);
        });
    });

    startGameBtn.addEventListener("click", () => {
        soundEffects.play("gameStart");
        document.getElementById("gradeSelection").classList.add("hidden");
        startCountdown(() => {
            document.getElementById("gameArea").classList.remove("hidden");
            timeLeft = 120; score = 0; questionCount = 0; streak = 0; maxStreak = 0; experience = 0; level = 1;
            document.getElementById("score").textContent = score;
            document.getElementById("streakCounter").textContent = streak;
            document.getElementById("streakFlame").textContent = "";
            updateExpBar();
            displayNextQuestion();
            startTimer();
        });
    });

    if (answerInput) {
        answerInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                checkAnswer();
            }
        });
    }

    if (submitAnswerBtn) {
        submitAnswerBtn.addEventListener("click", checkAnswer);
    }

    if (soundToggleBtn) {
        soundToggleBtn.addEventListener("click", () => {
            const enabled = soundEffects.toggleSound();
            soundToggleBtn.textContent = enabled ? "🔊" : "🔇";
            soundToggleBtn.title = enabled ? "Sound On" : "Sound Off";
        });
    }

    // Initialize UI elements
    updateExpBar();
});

// Dark Mode Toggle (assuming it's in intro.js or a global script)
// function toggleTheme() { ... }
// Ensure theme is applied on load
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
        const themeToggleBtn = document.querySelector(".theme-toggle");
        if (themeToggleBtn) themeToggleBtn.textContent = "Dark Mode";
    } else {
        document.body.classList.remove("light-mode"); // Default to dark
        const themeToggleBtn = document.querySelector(".theme-toggle");
        if (themeToggleBtn) themeToggleBtn.textContent = "Light Mode";
    }
});

