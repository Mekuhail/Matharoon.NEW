
// Same config as before
const firebaseConfig = {
    apiKey: "AIzaSyAoQjL-To_I7o17eeVKgBii6XbuDfot2_U",
    authDomain: "matharoon-46a42.firebaseapp.com",
    databaseURL: "https://matharoon-46a42-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "matharoon-46a42",
    storageBucket: "matharoon-46a42.firebasestorage.app",
    messagingSenderId: "803993170969",
    appId: "1:803993170969:web:e4ba4451e9d755e4bf2688",
    measurementId: "G-2GH052FK0E"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);


// Create shortcuts for services
const auth = firebase.auth();
const db = firebase.database();


