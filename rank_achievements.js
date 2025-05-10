// JavaScript for handling rank achievements
// This code should be integrated with the existing game code

// Achievement definitions for ranks
const rankAchievements = {
    firstPlace: {
        id: "firstPlace",
        name: "First Place Champion",
        icon: "🥇",
        description: "Reach the #1 position on the leaderboard",
        unlocked: false
    },
    secondPlace: {
        id: "secondPlace",
        name: "Silver Medalist",
        icon: "🥈",
        description: "Reach the #2 position on the leaderboard",
        unlocked: false
    },
    thirdPlace: {
        id: "thirdPlace",
        name: "Bronze Achiever",
        icon: "🥉",
        description: "Reach the #3 position on the leaderboard",
        unlocked: false
    }
};

// Function to create achievement icons in the game over screen
function createRankAchievementIcons() {
    const achievementsContainer = document.getElementById("rankAchievementsContainer");
    if (!achievementsContainer) return;
    
    // Clear previous content
    achievementsContainer.innerHTML = '';
    
    // Create row for rank achievements
    const achievementsRow = document.createElement("div");
    achievementsRow.className = "rank-achievements-row";
    
    // Add each rank achievement
    Object.values(rankAchievements).forEach(achievement => {
        const container = document.createElement("div");
        container.className = "achievement-icon-container";
        
        const achievementIcon = document.createElement("div");
        achievementIcon.className = `rank-achievement rank-achievement-${achievement.id === "firstPlace" ? "1" : achievement.id === "secondPlace" ? "2" : "3"}`;
        
        // Check if achievement is unlocked
        if (!achievement.unlocked) {
            achievementIcon.classList.add("locked");
            const lockIcon = document.createElement("span");
            lockIcon.className = "rank-achievement-lock";
            lockIcon.textContent = "🔒";
            achievementIcon.appendChild(lockIcon);
        }
        
        // Add the medal icon
        const medalIcon = document.createElement("span");
        medalIcon.textContent = achievement.icon;
        achievementIcon.appendChild(medalIcon);
        
        // Add label
        const label = document.createElement("div");
        label.className = "rank-achievement-label";
        label.textContent = achievement.name;
        
        // Add tooltip
        const tooltip = document.createElement("div");
        tooltip.className = "achievement-tooltip";
        tooltip.textContent = achievement.description;
        
        container.appendChild(achievementIcon);
        container.appendChild(label);
        container.appendChild(tooltip);
        achievementsRow.appendChild(container);
    });
    
    achievementsContainer.appendChild(achievementsRow);
}

// Function to update rank achievements based on leaderboard position
function updateRankAchievements(position) {
    if (position === 0) { // First place (0-indexed)
        rankAchievements.firstPlace.unlocked = true;
        unlockAchievement("firstPlace", "🥇 First Place Champion! You're at the top of the leaderboard!");
    } else if (position === 1) { // Second place
        rankAchievements.secondPlace.unlocked = true;
        unlockAchievement("secondPlace", "🥈 Silver Medalist! Almost at the top!");
    } else if (position === 2) { // Third place
        rankAchievements.thirdPlace.unlocked = true;
        unlockAchievement("thirdPlace", "🥉 Bronze Achiever! You're on the podium!");
    }
    
    // Save achievements to user profile
    saveAchievementsToFirebase();
}

// Function to save achievements to Firebase
function saveAchievementsToFirebase() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    const achievementsRef = firebase.database().ref(`users/${user.uid}/achievements`);
    
    // Only save unlocked achievements
    const unlockedAchievements = {};
    Object.entries(rankAchievements).forEach(([key, achievement]) => {
        if (achievement.unlocked) {
            unlockedAchievements[key] = true;
        }
    });
    
    achievementsRef.update(unlockedAchievements)
        .then(() => console.log("Achievements saved to Firebase"))
        .catch(error => console.error("Error saving achievements:", error));
}

// Function to load achievements from Firebase
function loadAchievementsFromFirebase() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    const achievementsRef = firebase.database().ref(`users/${user.uid}/achievements`);
    
    achievementsRef.once('value')
        .then(snapshot => {
            const savedAchievements = snapshot.val() || {};
            
            // Update local achievements
            Object.keys(savedAchievements).forEach(key => {
                if (rankAchievements[key]) {
                    rankAchievements[key].unlocked = true;
                }
            });
            
            // Update UI if needed
            if (document.getElementById("rankAchievementsContainer")) {
                createRankAchievementIcons();
            }
        })
        .catch(error => console.error("Error loading achievements:", error));
}

// Function to check leaderboard position and update achievements
function checkLeaderboardPosition(uid, grade) {
    const leaderboardRef = firebase.database().ref(`scores/${grade}`);
    
    leaderboardRef.orderByChild('score').once('value').then(snapshot => {
        const players = [];
        snapshot.forEach(childSnapshot => {
            players.push({
                uid: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        // Sort by score (descending)
        players.sort((a, b) => b.score - a.score);
        
        // Find user's position
        const position = players.findIndex(player => player.uid === uid);
        
        // Update achievements based on position
        if (position >= 0 && position <= 2) {
            updateRankAchievements(position);
        }
    });
}

// Add this to the game's initialization
document.addEventListener("DOMContentLoaded", () => {
    // Load achievements when user logs in
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            loadAchievementsFromFirebase();
        }
    });
    
    // Add rank achievements container to game over screen if not already present
    const gameOverArea = document.getElementById("gameOverArea");
    if (gameOverArea && !document.getElementById("rankAchievementsContainer")) {
        const achievementsSection = document.createElement("div");
        achievementsSection.className = "achievements-container";
        achievementsSection.innerHTML = `
            <div class="achievements-title">Rank Achievements</div>
            <div id="rankAchievementsContainer"></div>
        `;
        
        // Insert before game over buttons
        const gameOverButtons = gameOverArea.querySelector(".game-over-buttons");
        if (gameOverButtons) {
            gameOverArea.insertBefore(achievementsSection, gameOverButtons);
        } else {
            gameOverArea.appendChild(achievementsSection);
        }
    }
});
