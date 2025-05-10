let currentUserUid = null;
let currentGrade = 5;
let currentListenerRef = null;
let confettiActive = false;

window.addEventListener('DOMContentLoaded', () => {
    const gradeTabs = document.querySelectorAll('.grade-tabs button');
    const toggleBtn = document.getElementById('toggleLeaderboardBtn');
    const leaderboardList = document.querySelector('.leaderboard-list');

    // Defensive checks
    if (!toggleBtn || !leaderboardList) {
        console.error("Missing DOM elements for leaderboard toggle or list.");
        return;
    }

    // Tab interaction with animation
    gradeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            gradeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Add pulse animation to the selected tab
            tab.classList.add('pulse');
            setTimeout(() => tab.classList.remove('pulse'), 300);

            currentGrade = parseInt(tab.dataset.grade, 10);

            // Show loading state
            const loadingState = document.getElementById('loading-state');
            if (loadingState) {
                loadingState.style.display = 'flex';
            }

            // Clear current leaderboard
            clearLeaderboard();

            // Attach new listener with slight delay for animation
            setTimeout(() => {
                attachLeaderboardListener(currentGrade);
            }, 300);
        });
    });

    gradeTabs[0].classList.add('active'); // default

    // Collapse full leaderboard by default
    leaderboardList.classList.add('collapsed');
    toggleBtn.addEventListener('click', () => {
        leaderboardList.classList.toggle('collapsed');
        toggleBtn.textContent = leaderboardList.classList.contains('collapsed')
            ? 'Show Full Leaderboard ▼'
            : 'Hide Full Leaderboard ▲';

        // Play sound effect
        playSound('click');
    });

    // Firebase auth -> load scores
    firebase.auth().onAuthStateChanged(user => {
        console.log("Auth state:", user);
        if (user) {
            currentUserUid = user.uid;
        } else {
            console.warn("No user logged in. Current UID will remain null.");
        }
        attachLeaderboardListener(currentGrade);
    });

    // Initialize confetti
    initConfetti();
});

// Sound effects system
const soundEffects = {
    click: new Audio('click.mp3'),
    achievement: new Audio('achievement.mp3'),
    leaderboard: new Audio('achievement.mp3') // Using achievement sound for leaderboard
};

function playSound(sound) {
    try {
        if (soundEffects[sound]) {
            soundEffects[sound].currentTime = 0;
            soundEffects[sound].play().catch(e => {
                console.log('Sound error:', e);
            });
        }
    } catch (e) {
        console.log('Sound error:', e);
    }
}

function attachLeaderboardListener(grade) {
    if (currentListenerRef) currentListenerRef.off();

    const path = `scores/${grade}`;
    currentListenerRef = firebase.database().ref(path);

    currentListenerRef.on("value", snapshot => {
        const data = snapshot.val();
        console.log(`Leaderboard data for Grade ${grade}:`, data);

        const loader = document.getElementById("loading-state");
        if (loader) loader.style.display = "none";

        if (!data) {
            clearLeaderboard();
            return;
        }

        const players = Object.entries(data).map(([uid, { username, score }]) => ({
            uid,
            username,
            score
        })).sort((a, b) => b.score - a.score);

        updatePodium(players.slice(0, 3));
        updateList(players.slice(3));
        highlightUser(players);

        // Play leaderboard sound when data is loaded
        playSound('leaderboard');

        // Show confetti if user is in top 3
        const userIndex = players.findIndex(p => p.uid === currentUserUid);
        if (userIndex >= 0 && userIndex < 3) {
            showConfetti();
        }
    }, error => {
        console.error("Firebase listener error:", error);
    });
}

function clearLeaderboard() {
    [".rank-1", ".rank-2", ".rank-3"].forEach(rank => {
        const el = document.querySelector(rank);
        if (el) {
            el.querySelector('.username').textContent = "---";
            el.querySelector('.score').textContent = "Score: ---";
            el.classList.remove("highlight");

            // Remove any achievement icons
            const achievementIcon = el.querySelector('.achievement-icon');
            if (achievementIcon) {
                achievementIcon.remove();
            }
        }
    });

    const list = document.querySelector('.leaderboard-list');
    if (list) list.innerHTML = "";

    document.getElementById('user-rank').textContent = "N/A";
    document.getElementById('user-score').textContent = "N/A";
    document.getElementById('user-achievement').textContent = "-";
}

function updatePodium(topThree) {
    const ranks = [".rank-1", ".rank-2", ".rank-3"];
    ranks.forEach(rank => {
        const el = document.querySelector(rank);
        if (el) {
            el.querySelector('.username').textContent = "---";
            el.querySelector('.score').textContent = "Score: ---";
            el.classList.remove("highlight");

            // Remove any achievement icons
            const achievementIcon = el.querySelector('.achievement-icon');
            if (achievementIcon) {
                achievementIcon.remove();
            }
        }
    });

    topThree.forEach((player, idx) => {
        const el = document.querySelector(ranks[idx]);
        if (el) {
            el.querySelector('.username').textContent = player.username;
            el.querySelector('.score').textContent = `Score: ${player.score}`;

            // Add animation to the card
            el.classList.add('fade-in');
            setTimeout(() => el.classList.remove('fade-in'), 500);

            // Add achievement icon if it's the current user
            if (player.uid === currentUserUid) {
                const achievementIcon = document.createElement('div');
                achievementIcon.className = `achievement-icon ${idx === 0 ? 'first-place-icon' : idx === 1 ? 'second-place-icon' : 'third-place-icon'}`;
                achievementIcon.textContent = idx === 0 ? '🏆' : idx === 1 ? '🥈' : '🥉';
                el.appendChild(achievementIcon);
            }
        }
    });
}

function updateList(others) {
    const listEl = document.querySelector('.leaderboard-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    others.forEach((player, index) => {
        const li = document.createElement('li');
        li.classList.add('leaderboard-item');

        // Add animation delay based on index
        li.style.animationDelay = `${index * 0.1}s`;

        li.innerHTML = `
            <div class="player-info"><strong>#${index + 4}</strong> <span>${player.username}</span></div>
            <div class="player-score">Score: ${player.score}</div>
        `;

        // Highlight if it's the current user
        if (player.uid === currentUserUid) {
            li.classList.add('highlight');
        }

        listEl.appendChild(li);
    });
}

function highlightUser(allPlayers) {
    const userIndex = allPlayers.findIndex(p => p.uid === currentUserUid);
    const userRankEl = document.getElementById('user-rank');
    const userScoreEl = document.getElementById('user-score');
    const userAchievementEl = document.getElementById('user-achievement');

    if (userIndex === -1) {
        userRankEl.textContent = "N/A";
        userScoreEl.textContent = "N/A";
        userAchievementEl.textContent = "-";
        return;
    }

    const rank = userIndex + 1;
    const userScore = allPlayers[userIndex].score;

    userRankEl.textContent = `#${rank}`;
    userScoreEl.textContent = userScore;

    // Set achievement based on rank
    if (rank === 1) {
        userAchievementEl.textContent = "🏆";
    } else if (rank === 2) {
        userAchievementEl.textContent = "🥈";
    } else if (rank === 3) {
        userAchievementEl.textContent = "🥉";
    } else if (rank <= 10) {
        userAchievementEl.textContent = "⭐";
    } else {
        userAchievementEl.textContent = "-";
    }

    if (rank > 3) {
        const items = document.querySelectorAll('.leaderboard-item');
        const item = items[rank - 4];
        if (item) {
            item.classList.add('highlight');

            // Add animation to highlight the user's position
            setTimeout(() => {
                item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    } else {
        const podium = document.querySelector(`.rank-${rank}`);
        if (podium) {
            podium.classList.add('highlight');

            // Add animation to highlight the user's position
            setTimeout(() => {
                podium.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }
}

// Confetti animation
function initConfetti() {
    window.confettiColors = [
        '#FF7F00', // orange
        '#754979', // pink
        '#4B0082', // purple
        '#9B5DE5', // light purple
        '#FFD700', // gold
        '#C0C0C0', // silver
        '#CD7F32'  // bronze
    ];
}

function createConfetti() {
    const confettiContainer = document.getElementById('confettiContainer');
    if (!confettiContainer) return;

    const confetti = document.createElement('div');
    confetti.className = 'confetti';

    // Random position, color, size and animation duration
    const left = Math.random() * 100;
    const color = window.confettiColors[Math.floor(Math.random() * window.confettiColors.length)];
    const size = 5 + Math.random() * 10;
    const duration = 3 + Math.random() * 4;

    confetti.style.left = `${left}%`;
    confetti.style.backgroundColor = color;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.animationDuration = `${duration}s`;

    // Random shape
    if (Math.random() > 0.5) {
        confetti.style.borderRadius = '50%';
    } else {
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    }

    confettiContainer.appendChild(confetti);

    // Remove confetti after animation completes
    setTimeout(() => {
        confetti.remove();
    }, duration * 1000);
}

function showConfetti() {
    if (confettiActive) return;
    confettiActive = true;

    // Create confetti at intervals
    const confettiInterval = setInterval(() => {
        for (let i = 0; i < 5; i++) {
            createConfetti();
        }
    }, 200);

    // Stop after 5 seconds
    setTimeout(() => {
        clearInterval(confettiInterval);
        confettiActive = false;
    }, 5000);

    // Play achievement sound
    playSound('achievement');
}
