document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("signup-form");
    if (!form) return; // Prevents JS crash if form is missing

    // Get form elements
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");
    const termsCheckbox = document.getElementById("terms");
    const registerButton = document.querySelector("button[type=\"submit\"]");

    // Error spans
    const nameError = document.getElementById("name-error");
    const emailError = document.getElementById("email-error");
    const passwordError = document.getElementById("password-error");
    const confirmPasswordError = document.getElementById("confirm-password-error");
    const termsError = document.getElementById("terms-error");

    // Basic profanity filter (expand as needed)
    const blockedUsernames = [
        "admin", "administrator", "root", "superuser", "moderator",
        "test", "guest", "info", "support", "contact", "help",
        // Add more offensive or inappropriate terms here, be mindful of context and over-filtering
        "fuck", "shit", "bitch", "asshole", "cunt", "dick"
        // Consider using a more comprehensive library or regex for better filtering if needed
    ];

    // Regex for general username validation (e.g., no special characters other than underscore/hyphen, not starting/ending with them)
    const usernameRegex = /^[a-zA-Z0-9_\-]+$/; // Allows alphanumeric, underscore, hyphen
    const startsEndsWithHyphenUnderscore = /^[_-]|[_-]$/;

    function showError(element, condition, message = "!") {
        element.textContent = message;
        element.style.display = condition ? "inline" : "none";
    }

    function validateUsername(username) {
        const lowerCaseUsername = username.toLowerCase();
        for (const blocked of blockedUsernames) {
            if (lowerCaseUsername.includes(blocked)) {
                return "Username contains a blocked word.";
            }
        }
        if (!usernameRegex.test(username)) {
            return "Username can only contain letters, numbers, underscores, and hyphens.";
        }
        if (startsEndsWithHyphenUnderscore.test(username)){
            return "Username cannot start or end with an underscore or hyphen.";
        }
        if (username.length < 3 || username.length > 15) {
            return "Username must be 3-15 characters.";
        }
        return null; // No error
    }

    function validateForm() {
        let isValid = true;

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        const usernameValidationError = validateUsername(name);
        if (usernameValidationError) {
            showError(nameError, true, usernameValidationError);
            isValid = false;
        } else {
            showError(nameError, false);
        }

        showError(emailError, email === "", "Email is required.");
        if (email === "") isValid = false;
        // Basic email format check (can be more robust)
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
            showError(emailError, true, "Invalid email format.");
            isValid = false;
        } else {
            showError(emailError, false);
        }


        showError(passwordError, password.length < 8, "Password must be at least 8 characters.");
        if (password.length < 8) isValid = false;

        showError(confirmPasswordError, confirmPassword !== password, "Passwords do not match.");
        if (confirmPassword !== password) isValid = false;

        showError(termsError, !termsCheckbox.checked, "You must agree to the terms.");
        if (!termsCheckbox.checked) isValid = false;

        registerButton.disabled = !isValid;
        return isValid;
    }

    // Listen for input changes
    [nameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input =>
        input.addEventListener("input", validateForm)
    );
    termsCheckbox.addEventListener("change", validateForm);

    // Handle form submission
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!validateForm()) {
            alert("Please correct the errors in the form.");
            return;
        }

        const fullName = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                const user = userCredential.user;
                return user.updateProfile({
                    displayName: fullName
                }).then(() => {
                    const userRefRTDB = db.ref("users/" + user.uid);
                    const dbFirestore = firebase.firestore();
                    const userDocRefFirestore = dbFirestore.collection("users").doc(user.uid);

                    const userData = {
                        fullName: fullName,
                        displayName: fullName,
                        email: user.email,
                        uid: user.uid,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    
                    const rtdbPromise = userRefRTDB.set(userData); // For RTDB
                    const firestorePromise = userDocRefFirestore.set(userData, { merge: true }); // For Firestore
                    return Promise.all([rtdbPromise, firestorePromise]);
                });
            })
            .then(() => {
                alert("Account created successfully! You are now logged in.");
                window.location.href = "index.html"; // Redirect to main page after auto-login
            })
            .catch(error => {
                console.error("Error creating user:", error);
                if (error.code === "auth/email-already-in-use") {
                    alert("An account already exists with this email address. Please log in or use a different email.");
                } else if (error.code === "auth/invalid-email") {
                    alert("The email address is not valid. Please enter a valid email.");
                } else if (error.code === "auth/weak-password") {
                    alert("The password is too weak. Please choose a stronger password (at least 8 characters).");
                } else {
                    alert("Signup failed: " + error.message);
                }
            });
    });

    validateForm(); // Initial state
});

// Google Sign-In Callbacks
function onSuccess(googleUser) {
    const profile = googleUser.getBasicProfile();
    const googleFullName = profile.getName();
    const googleEmail = profile.getEmail();
    console.log("Google User Profile:", profile);

    const id_token = googleUser.getAuthResponse().id_token;
    const credential = firebase.auth.GoogleAuthProvider.credential(id_token);

    auth.signInWithCredential(credential)
        .then((result) => {
            const user = result.user;
            console.log("Firebase Google sign-in successful for user:", user);
            
            let updateAuthProfilePromise = Promise.resolve();
            if (!user.displayName || user.displayName !== googleFullName) {
                updateAuthProfilePromise = user.updateProfile({
                    displayName: googleFullName
                });
            }

            return updateAuthProfilePromise.then(() => {
                const userRefRTDB = db.ref("users/" + user.uid);
                const dbFirestore = firebase.firestore();
                const userDocRefFirestore = dbFirestore.collection("users").doc(user.uid);

                const userData = {
                    fullName: googleFullName, 
                    displayName: googleFullName, 
                    email: user.email, 
                    uid: user.uid,
                    photoURL: user.photoURL || profile.getImageUrl(),
                    provider: "google.com",
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                };

                const rtdbPromise = userRefRTDB.set(userData); // For RTDB
                const firestorePromise = userDocRefFirestore.set(userData, { merge: true }); // For Firestore
                return Promise.all([rtdbPromise, firestorePromise]);
            });
        })
        .then(() => {
            console.log("User profile updated in Firebase Auth and Database(s).");
            alert("Successfully signed in with Google!");
            window.location.href = "index.html"; // Redirect to main page
        })
        .catch(error => {
            console.error("Firebase Google sign-in or profile update error:", error);
            const currentUser = auth.currentUser;
            if (currentUser && currentUser.providerData.some(provider => provider.providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID)) {
                auth.signOut().then(() => {
                    var auth2 = gapi.auth2.getAuthInstance();
                    if (auth2) {
                        auth2.disconnect();
                    }
                });
            }
            alert("Google sign-in failed: " + error.message + ". Please try again.");
        });
}

function onFailure(error) {
    console.error("Google sign-in API error:", error);
    alert("Google sign-in failed. Error: " + JSON.stringify(error, undefined, 2));
}

function renderButton() {
    if (typeof gapi !== 'undefined' && gapi.signin2) {
        gapi.signin2.render('my-signin2', {
            scope: 'profile email',
            width: 240,
            height: 50,
            longtitle: true,
            theme: 'dark',
            onsuccess: onSuccess,
            onfailure: onFailure
        });
    } else {
        console.error("Google API not loaded, cannot render sign-in button.");
        setTimeout(renderButton, 1000); 
    }
}

if (typeof gapi !== 'undefined') {
    gapi.load('auth2', function() {
        if (!gapi.auth2.getAuthInstance()) {
            gapi.auth2.init({
                client_id: '469147461208-t8qvufef54kiq7jch2v390db28v3ebck.apps.googleusercontent.com'
            }).then(renderButton, onFailure);
        } else {
            renderButton();
        }
    });
} else {
    console.warn("Google Platform Library (platform.js) might not be loaded yet.");
}

