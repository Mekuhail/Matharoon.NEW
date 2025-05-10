// Firebase Integration Module for Enhanced Matharoon Game
// This file ensures all new features properly connect with Firebase

// Firebase configuration is loaded from firebase.js

// Functions for Firebase integration
const firebaseIntegration = {
    // Initialize Firebase listeners and connections
    init() {
        // Check if Firebase is initialized
        if (!firebase || !firebase.apps.length) {
            console.error("Firebase not initialized. Make sure firebase.js is loaded.");
            return false;
        }
        
        console.log("Firebase integration module initialized");
        
        // Set up auth state listener
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                console.log("User logged in:", user.uid);
                this.loadUserData(user.uid);
                this.loadUserAchievements(user.uid);
            } else {
                console.log("No user logged in");
            }
        });
        
        return true;
    },
    
    // Save game score to Firebase
    saveScore(grade, score) {
        const user = firebase.auth().currentUser;
        if (!user) {
            console.warn("User not logged in, score not saved");
            return Promise.reject("User not logged in");
        }
        
        // Get username from database
        return firebase.database().ref(`users/${user.uid}/username`).once('value')
            .then(snapshot => {
                const username = snapshot.val() || user.displayName || "Anonymous";
                
                // Save score to the leaderboard
                const scoreRef = firebase.database().ref(`scores/${grade}/${user.uid}`);
                return scoreRef.once('value').then(snapshot => {
                    const currentScore = snapshot.exists() ? snapshot.val().score : 0;
                    
                    // Only update if new score is higher
                    if (score > currentScore) {
                        return scoreRef.set({
                            username: username,
                            score: score,
                            timestamp: firebase.database.ServerValue.TIMESTAMP
                        }).then(() => {
                            console.log("Score saved successfully");
                            return this.checkLeaderboardPosition(user.uid, grade);
                        });
                    } else {
                        console.log("Current score not higher than previous best");
                        return Promise.resolve(null);
                    }
                });
            });
    },
    
    // Check user's position on leaderboard
    checkLeaderboardPosition(uid, grade) {
        const leaderboardRef = firebase.database().ref(`scores/${grade}`);
        
        return leaderboardRef.orderByChild('score').once('value').then(snapshot => {
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
            console.log(`User position on leaderboard: ${position + 1}`);
            
            // Return position (0-indexed)
            return position;
        });
    },
    
    // Save achievements to Firebase
    saveAchievements(achievements) {
        const user = firebase.auth().currentUser;
        if (!user) {
            console.warn("User not logged in, achievements not saved");
            return Promise.reject("User not logged in");
        }
        
        const achievementsRef = firebase.database().ref(`users/${user.uid}/achievements`);
        
        // Convert achievements object to Firebase-friendly format
        const achievementsToSave = {};
        Object.entries(achievements).forEach(([key, value]) => {
            if (value === true) {
                achievementsToSave[key] = true;
            }
        });
        
        return achievementsRef.update(achievementsToSave)
            .then(() => {
                console.log("Achievements saved to Firebase");
                return achievementsToSave;
            });
    },
    
    // Load user achievements from Firebase
    loadUserAchievements(uid) {
        if (!uid) {
            const user = firebase.auth().currentUser;
            if (!user) {
                console.warn("No user ID provided and no user logged in");
                return Promise.reject("No user ID");
            }
            uid = user.uid;
        }
        
        const achievementsRef = firebase.database().ref(`users/${uid}/achievements`);
        
        return achievementsRef.once('value')
            .then(snapshot => {
                const savedAchievements = snapshot.val() || {};
                console.log("Loaded achievements:", savedAchievements);
                return savedAchievements;
            });
    },
    
    // Load user data from Firebase
    loadUserData(uid) {
        if (!uid) {
            const user = firebase.auth().currentUser;
            if (!user) {
                console.warn("No user ID provided and no user logged in");
                return Promise.reject("No user ID");
            }
            uid = user.uid;
        }
        
        const userRef = firebase.database().ref(`users/${uid}`);
        
        return userRef.once('value')
            .then(snapshot => {
                const userData = snapshot.val() || {};
                console.log("Loaded user data:", userData);
                return userData;
            });
    },
    
    // Update user settings in Firebase
    updateUserSettings(settings) {
        const user = firebase.auth().currentUser;
        if (!user) {
            console.warn("User not logged in, settings not saved");
            return Promise.reject("User not logged in");
        }
        
        const settingsRef = firebase.database().ref(`users/${user.uid}/settings`);
        
        return settingsRef.update(settings)
            .then(() => {
                console.log("Settings saved to Firebase");
                return settings;
            });
    },
    
    // Load user settings from Firebase
    loadUserSettings() {
        const user = firebase.auth().currentUser;
        if (!user) {
            console.warn("User not logged in, settings not loaded");
            return Promise.reject("User not logged in");
        }
        
        const settingsRef = firebase.database().ref(`users/${user.uid}/settings`);
        
        return settingsRef.once('value')
            .then(snapshot => {
                const settings = snapshot.val() || {};
                console.log("Loaded user settings:", settings);
                return settings;
            });
    },
    
    // Handle game completion and update all relevant data
    handleGameCompletion(gameData) {
        const { grade, score, achievements, gameMode } = gameData;
        const user = firebase.auth().currentUser;
        
        if (!user) {
            console.warn("User not logged in, game completion not saved");
            return Promise.reject("User not logged in");
        }
        
        // Save score first
        return this.saveScore(grade, score)
            .then(position => {
                // Check if user is in top 3 and update achievements accordingly
                if (position === 0 && !achievements.firstPlace) {
                    achievements.firstPlace = true;
                } else if (position === 1 && !achievements.secondPlace) {
                    achievements.secondPlace = true;
                } else if (position === 2 && !achievements.thirdPlace) {
                    achievements.thirdPlace = true;
                }
                
                // Save updated achievements
                return this.saveAchievements(achievements);
            })
            .then(() => {
                // Update game statistics
                const statsRef = firebase.database().ref(`users/${user.uid}/stats`);
                return statsRef.once('value').then(snapshot => {
                    const stats = snapshot.val() || {};
                    
                    // Update games played count
                    stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
                    
                    // Update high score if needed
                    if (!stats.highScore || score > stats.highScore) {
                        stats.highScore = score;
                    }
                    
                    // Track game mode usage
                    stats.gameModes = stats.gameModes || {};
                    stats.gameModes[gameMode] = (stats.gameModes[gameMode] || 0) + 1;
                    
                    // Save updated stats
                    return statsRef.update(stats);
                });
            })
            .then(() => {
                console.log("Game completion fully processed");
                return true;
            });
    }
};

// Export for use in other modules
window.firebaseIntegration = firebaseIntegration;

// Initialize when document is ready
document.addEventListener("DOMContentLoaded", () => {
    // Initialize after a short delay to ensure Firebase is loaded
    setTimeout(() => {
        firebaseIntegration.init();
    }, 500);
});
