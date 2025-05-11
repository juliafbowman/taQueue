// Firebase configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, where, query } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const classList = document.getElementById('class-list');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-btn');
const signOutButton = document.getElementById('signOutButton');
const userInfo = document.getElementById('user-info');

// display user info
function displayUserInfo(user) {
    if (userInfo && user) {
        userInfo.textContent = `Logged in as: ${user.email}`;
    }
}

// display classes
async function displayClasses() {
    try {
        // clear content
        if (classList) {
            classList.innerHTML = '';
        }

        const q = query(collection(db, "classes"), where("active", "==", true));
        const querySnapshot = await getDocs(q);

        console.log("Query returned! Empty?", querySnapshot.empty);

        if (querySnapshot.empty) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = 'No classes found.';
            classList.appendChild(emptyMessage);

            // debug
            const testClass = document.createElement('li');
            const testLink = document.createElement('a');
            testLink.href = `student-queue.html?classId=CS398`;
            testLink.textContent = 'CS398 (Test Class)';
            testClass.appendChild(testLink);
            classList.appendChild(testClass);

            return;
        }

        querySnapshot.forEach((doc) => {
            console.log("Class found:", doc.id);
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = `student-queue.html?classId=${doc.id}`;
            link.textContent = doc.id;
            li.appendChild(link);
            classList.appendChild(li);
        });
    } 
    catch (error) {
        console.error(":( Error displaying classes:", error);
        if (classList) {
            const errorMessage = document.createElement('li');
            errorMessage.textContent = 'Error loading classes. ' + error.message;
            errorMessage.style.color = 'red';
            classList.appendChild(errorMessage);
        }
    }
}

// event listeners
function setupEventListeners() {
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            if (searchInput) {
                const searchQuery = searchInput.value.trim();
                if (searchQuery) {
                    window.location.href = `search.html?query=${encodeURIComponent(searchQuery)}`;
                }
            }
        });
    }

    if (signOutButton) {
        signOutButton.addEventListener('click', () => {
            console.log('Sign out button clicked');
            signOut(auth).then(() => {
                console.log('User signed out');
                window.location.href = 'login.html';
            }).catch((error) => {
                console.error('Sign out error:', error);
                alert('Error signing out: ' + error.message);
            });
        });
    }
}

// check the authentication state
onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed:', user ? user.email : 'No user');

    if (user && user.email && user.email.endsWith('@uic.edu')) {
        console.log('User authenticated with UIC email');
        displayUserInfo(user);
        displayClasses();
        setupEventListeners();
    } else {
        console.log('User not authenticated or not UIC email');
        window.location.href = 'login.html';
    }
});

// log that the script has loaded
console.log("menu.js loaded successfully");