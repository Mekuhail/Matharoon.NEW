document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const passwordError = document.getElementById("password-error");
    const feedback = document.getElementById("login-feedback");

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Basic check for password length
        if (password.length < 8) {
            passwordError.style.display = "block";
            return;
        } else {
            passwordError.style.display = "none";
        }

        // Sign in with email and password using Firebase Authentication
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                // Fetch the user's profile from the Realtime Database
                return db.ref("users/" + user.uid).once("value")
                    .then((snapshot) => {
                        if (snapshot.exists()) {
                            const userData = snapshot.val();
                            console.log("Welcome, " + userData.fullName);
                        } else {
                            console.log("No profile data found.");
                        }
                    })
                    .then(() => {
                        // Show success feedback and redirect
                        feedback.style.color = "purple";
                        feedback.textContent = "Login success!";
                        setTimeout(() => {
                            window.location.href = "index.html";
                        }, 2000);
                    });
            })
            .catch((error) => {
                // Handle login errors
                feedback.style.color = "red";
                feedback.textContent = "Login failed: " + error.message;
            });
    });
});

// Google Sign-In callbacks
function onSuccess(googleUser) {
    // Retrieve basic profile information.
    var profile = googleUser.getBasicProfile();
    console.log('Logged in as: ' + profile.getName());

    // Sign in with Firebase using the Google credential.
    var id_token = googleUser.getAuthResponse().id_token;
    var credential = firebase.auth.GoogleAuthProvider.credential(id_token);
    auth.signInWithCredential(credential)
        .then(function (result) {
            console.log("Firebase Google sign-in successful");
            // Redirect directly to intro.html when using Google Sign-In on the login page
            window.location.href = "index.html";
        })
        .catch(function (error) {
            console.error("Firebase Google sign-in error:", error);
        });
}

function onFailure(error) {
    console.error("Google sign-in error:", error);
}

// Render the Google Sign-In button.
function renderButton() {
    gapi.signin2.render('my-signin2', {
        'scope': 'profile email',
        'width': 240,
        'height': 50,
        'longtitle': true,
        'theme': 'dark',
        'onsuccess': onSuccess,
        'onfailure': onFailure
    });
}
