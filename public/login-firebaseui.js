// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAG5UGt-H7TveOPinBhjy8w75YSo5lb-w8",
    authDomain: "cs398-32c92.firebaseapp.com",
    projectId: "cs398-32c92",
    storageBucket: "cs398-32c92.firebasestorage.app",
    messagingSenderId: "358717382565",
    appId: "1:358717382565:web:3d4e8c07ebf0c924d3924c",
    measurementId: "G-G1WD1ZSE11"
   };
   
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const ui = new firebaseui.auth.AuthUI(firebase.auth());

// Function to redirect to right page
function redirectAfterLogin() {
    // Get the URL parameter for class id
    const urlParams = new URLSearchParams(window.location.search);
    const classId = urlParams.get('classId');

    console.log('Authentication successful, redirecting');

    // Redirect to index.html by default if no classId
    if (!classId) {
        window.location.href = 'index.html';
        return;
    }

    // If classId, redirect to student-queue
    window.location.href = `student-queue.html?classId=${classId}`;
}

// Configure FirebaseUI
const uiConfig = {
    signInFlow: 'popup',
    signInOptions: [
        {
            provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            customParameters: {
                // Restrict to UIC domain
                hd: 'uic.edu'
            },
        }
    ],
    callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            // User successfully signed in.
            const user = authResult.user;
            console.log('User signed in:', user.email);

            // Check if user has UIC email
            if (user.email.endsWith('@uic.edu')) {
                console.log('UIC email verified, redirecting');
                window.location.href = 'menu.html';
            } else {
                // sign them out
                console.log('Non-UIC email, signing out');
                firebase.auth().signOut().then(() => {
                    alert('Only @uic.edu accounts are allowed to access this system.');
                });
            }

            // avoid default redirect
            return false;
        },
        uiShown: function() {
            console.log('Login UI shown');
        }
    },
    tosUrl: '#',
    privacyPolicyUrl: '#'
};

// Check if user is already logged in
firebase.auth().onAuthStateChanged((user) => {
    console.log('Auth state changed:', user ? user.email : 'No user');

    if (user) {
        // Check if user has UIC email
        if (user.email.endsWith('@uic.edu')) {
            console.log('User already authenticated with UIC email, redirecting');
            window.location.href = 'menu.html';
        } else {
            // User no have UIC email
            console.log('Non-UIC email detected, signing out');
            firebase.auth().signOut().then(() => {
                // Show UI
                ui.start('#firebaseui-auth-container', uiConfig);
                alert('Only @uic.edu accounts are allowed to access this system.');
            });
        }
    } else {
        // Start the widget
        ui.start('#firebaseui-auth-container', uiConfig);
    }
});