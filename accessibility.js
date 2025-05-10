// Accessibility enhancements for Matharoon game
// This script adds accessibility features to the game

// Accessibility settings
const accessibilitySettings = {
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    gameSpeed: 1.0, // Normal speed
    screenReaderSupport: true,
    keyboardNavigation: true
};

// Initialize accessibility features
function initAccessibility() {
    // Create accessibility toggle button
    createAccessibilityToggle();
    
    // Create accessibility controls panel
    createAccessibilityControls();
    
    // Load saved settings
    loadAccessibilitySettings();
    
    // Add keyboard navigation
    setupKeyboardNavigation();
    
    // Add ARIA labels
    addAriaLabels();
    
    console.log("Accessibility features initialized");
}

// Create accessibility toggle button
function createAccessibilityToggle() {
    const toggle = document.createElement('div');
    toggle.className = 'accessibility-toggle';
    toggle.innerHTML = '♿';
    toggle.setAttribute('aria-label', 'Open accessibility options');
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('tabindex', '0');
    
    toggle.addEventListener('click', toggleAccessibilityPanel);
    toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            toggleAccessibilityPanel();
            e.preventDefault();
        }
    });
    
    document.body.appendChild(toggle);
}

// Create accessibility controls panel
function createAccessibilityControls() {
    const panel = document.createElement('div');
    panel.className = 'accessibility-controls';
    panel.setAttribute('aria-label', 'Accessibility options');
    panel.setAttribute('role', 'region');
    
    panel.innerHTML = `
        <h3>Accessibility Options</h3>
        
        <div class="accessibility-option">
            <input type="checkbox" id="highContrastToggle" aria-label="Enable high contrast mode">
            <label for="highContrastToggle">High Contrast</label>
        </div>
        
        <div class="accessibility-option">
            <input type="checkbox" id="largeTextToggle" aria-label="Enable large text mode">
            <label for="largeTextToggle">Large Text</label>
        </div>
        
        <div class="accessibility-option">
            <input type="checkbox" id="reducedMotionToggle" aria-label="Enable reduced motion mode">
            <label for="reducedMotionToggle">Reduced Motion</label>
        </div>
        
        <div class="game-speed-controls">
            <label for="gameSpeedSlider">Game Speed</label>
            <input type="range" id="gameSpeedSlider" min="0.5" max="1.5" step="0.1" value="1.0" class="game-speed-slider" aria-label="Adjust game speed">
            <span id="gameSpeedValue">Normal (1.0x)</span>
        </div>
    `;
    
    document.body.appendChild(panel);
    
    // Add event listeners
    document.getElementById('highContrastToggle').addEventListener('change', toggleHighContrast);
    document.getElementById('largeTextToggle').addEventListener('change', toggleLargeText);
    document.getElementById('reducedMotionToggle').addEventListener('change', toggleReducedMotion);
    document.getElementById('gameSpeedSlider').addEventListener('input', adjustGameSpeed);
}

// Toggle accessibility panel
function toggleAccessibilityPanel() {
    const panel = document.querySelector('.accessibility-controls');
    panel.classList.toggle('open');
    
    const isOpen = panel.classList.contains('open');
    const toggle = document.querySelector('.accessibility-toggle');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    
    // Play sound effect if available
    if (typeof soundEffects !== 'undefined' && soundEffects.buttonClick) {
        soundEffects.play('buttonClick');
    }
}

// Toggle high contrast mode
function toggleHighContrast(e) {
    const enabled = e ? e.target.checked : !accessibilitySettings.highContrast;
    accessibilitySettings.highContrast = enabled;
    
    if (enabled) {
        document.body.classList.add('high-contrast');
    } else {
        document.body.classList.remove('high-contrast');
    }
    
    // Update checkbox state if not triggered by checkbox
    if (!e) {
        document.getElementById('highContrastToggle').checked = enabled;
    }
    
    // Save settings
    saveAccessibilitySettings();
    
    // Announce change to screen readers
    announceToScreenReader(`High contrast mode ${enabled ? 'enabled' : 'disabled'}`);
}

// Toggle large text mode
function toggleLargeText(e) {
    const enabled = e ? e.target.checked : !accessibilitySettings.largeText;
    accessibilitySettings.largeText = enabled;
    
    if (enabled) {
        document.body.classList.add('large-text');
    } else {
        document.body.classList.remove('large-text');
    }
    
    // Update checkbox state if not triggered by checkbox
    if (!e) {
        document.getElementById('largeTextToggle').checked = enabled;
    }
    
    // Save settings
    saveAccessibilitySettings();
    
    // Announce change to screen readers
    announceToScreenReader(`Large text mode ${enabled ? 'enabled' : 'disabled'}`);
}

// Toggle reduced motion mode
function toggleReducedMotion(e) {
    const enabled = e ? e.target.checked : !accessibilitySettings.reducedMotion;
    accessibilitySettings.reducedMotion = enabled;
    
    if (enabled) {
        document.body.classList.add('reduced-motion');
    } else {
        document.body.classList.remove('reduced-motion');
    }
    
    // Update checkbox state if not triggered by checkbox
    if (!e) {
        document.getElementById('reducedMotionToggle').checked = enabled;
    }
    
    // Save settings
    saveAccessibilitySettings();
    
    // Announce change to screen readers
    announceToScreenReader(`Reduced motion mode ${enabled ? 'enabled' : 'disabled'}`);
}

// Adjust game speed
function adjustGameSpeed(e) {
    const speed = parseFloat(e.target.value);
    accessibilitySettings.gameSpeed = speed;
    
    // Update display
    const speedText = speed === 1.0 ? 'Normal (1.0x)' : 
                     speed < 1.0 ? `Slower (${speed.toFixed(1)}x)` : 
                     `Faster (${speed.toFixed(1)}x)`;
    
    document.getElementById('gameSpeedValue').textContent = speedText;
    
    // Apply speed to timer if game is active
    if (typeof timeLeft !== 'undefined' && typeof timer !== 'undefined') {
        // Clear existing timer
        clearInterval(timer);
        
        // Start new timer with adjusted speed
        const timerInterval = 1000 / speed;
        timer = setInterval(() => {
            timeLeft--;
            document.getElementById("timerDisplay").textContent = formatTime(timeLeft);
            
            // Update timer progress bar
            const percentage = (timeLeft / 120) * 100;
            document.getElementById("timerProgressFill").style.width = `${percentage}%`;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                endGame();
            }
        }, timerInterval);
    }
    
    // Save settings
    saveAccessibilitySettings();
    
    // Announce change to screen readers
    announceToScreenReader(`Game speed set to ${speedText}`);
}

// Save accessibility settings to localStorage
function saveAccessibilitySettings() {
    try {
        localStorage.setItem('matharoonAccessibility', JSON.stringify(accessibilitySettings));
        
        // Save to Firebase if available
        if (window.firebaseIntegration && firebase.auth().currentUser) {
            window.firebaseIntegration.updateUserSettings({
                accessibility: accessibilitySettings
            });
        }
    } catch (e) {
        console.error('Error saving accessibility settings:', e);
    }
}

// Load accessibility settings from localStorage
function loadAccessibilitySettings() {
    try {
        // Try to load from localStorage first
        const savedSettings = localStorage.getItem('matharoonAccessibility');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            Object.assign(accessibilitySettings, settings);
        }
        
        // Try to load from Firebase if available
        if (window.firebaseIntegration && firebase.auth().currentUser) {
            window.firebaseIntegration.loadUserSettings()
                .then(settings => {
                    if (settings && settings.accessibility) {
                        Object.assign(accessibilitySettings, settings.accessibility);
                        applyAccessibilitySettings();
                    }
                })
                .catch(error => {
                    console.error('Error loading settings from Firebase:', error);
                });
        }
        
        // Apply settings
        applyAccessibilitySettings();
    } catch (e) {
        console.error('Error loading accessibility settings:', e);
    }
}

// Apply loaded settings to UI
function applyAccessibilitySettings() {
    // Update UI elements
    document.getElementById('highContrastToggle').checked = accessibilitySettings.highContrast;
    document.getElementById('largeTextToggle').checked = accessibilitySettings.largeText;
    document.getElementById('reducedMotionToggle').checked = accessibilitySettings.reducedMotion;
    document.getElementById('gameSpeedSlider').value = accessibilitySettings.gameSpeed;
    
    // Apply settings
    if (accessibilitySettings.highContrast) {
        document.body.classList.add('high-contrast');
    }
    
    if (accessibilitySettings.largeText) {
        document.body.classList.add('large-text');
    }
    
    if (accessibilitySettings.reducedMotion) {
        document.body.classList.add('reduced-motion');
    }
    
    // Update game speed display
    const speed = accessibilitySettings.gameSpeed;
    const speedText = speed === 1.0 ? 'Normal (1.0x)' : 
                     speed < 1.0 ? `Slower (${speed.toFixed(1)}x)` : 
                     `Faster (${speed.toFixed(1)}x)`;
    
    document.getElementById('gameSpeedValue').textContent = speedText;
}

// Setup keyboard navigation
function setupKeyboardNavigation() {
    // Make all interactive elements focusable
    const interactiveElements = document.querySelectorAll('button, input, select, a, [role="button"]');
    interactiveElements.forEach(el => {
        if (!el.getAttribute('tabindex')) {
            el.setAttribute('tabindex', '0');
        }
    });
    
    // Add keyboard support for grade cards
    const gradeCards = document.querySelectorAll('.grade-card');
    gradeCards.forEach(card => {
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Select ${card.textContent}`);
        
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                card.click();
                e.preventDefault();
            }
        });
    });
    
    // Add keyboard support for game mode options
    const gameModeOptions = document.querySelectorAll('.game-mode-option');
    gameModeOptions.forEach(option => {
        option.setAttribute('role', 'button');
        option.setAttribute('tabindex', '0');
        option.setAttribute('aria-label', `Select ${option.querySelector('.mode-name').textContent} mode`);
        
        option.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                option.click();
                e.preventDefault();
            }
        });
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Alt + A to toggle accessibility panel
        if (e.altKey && e.key === 'a') {
            toggleAccessibilityPanel();
            e.preventDefault();
        }
        
        // Alt + H to toggle high contrast
        if (e.altKey && e.key === 'h') {
            toggleHighContrast();
            e.preventDefault();
        }
        
        // Alt + L to toggle large text
        if (e.altKey && e.key === 'l') {
            toggleLargeText();
            e.preventDefault();
        }
        
        // Alt + M to toggle reduced motion
        if (e.altKey && e.key === 'm') {
            toggleReducedMotion();
            e.preventDefault();
        }
    });
}

// Add ARIA labels for screen readers
function addAriaLabels() {
    // Add labels to game elements
    const elements = [
        { selector: '.timer', role: 'timer', label: 'Time remaining' },
        { selector: '.score-container', role: 'status', label: 'Current score' },
        { selector: '.streak-container', role: 'status', label: 'Current streak' },
        { selector: '.progress-container', role: 'progressbar', label: 'Game progress' },
        { selector: '.exp-container', role: 'progressbar', label: 'Experience progress' },
        { selector: '.question', role: 'status', label: 'Current question' },
        { selector: '.feedback', role: 'alert', label: 'Answer feedback' }
    ];
    
    elements.forEach(({ selector, role, label }) => {
        const element = document.querySelector(selector);
        if (element) {
            element.setAttribute('role', role);
            element.setAttribute('aria-label', label);
        }
    });
}

// Announce messages to screen readers
function announceToScreenReader(message) {
    // Create or use existing live region
    let announcer = document.getElementById('a11y-announcer');
    
    if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = 'a11y-announcer';
        announcer.className = 'sr-only';
        announcer.setAttribute('aria-live', 'polite');
        document.body.appendChild(announcer);
    }
    
    // Set the message
    announcer.textContent = message;
    
    // Clear after a delay
    setTimeout(() => {
        announcer.textContent = '';
    }, 3000);
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', initAccessibility);

// Export accessibility functions
window.accessibilityFeatures = {
    toggleHighContrast,
    toggleLargeText,
    toggleReducedMotion,
    adjustGameSpeed,
    announceToScreenReader
};
