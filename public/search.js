
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAG5UGt-H7TveOPinBhjy8w75YSo5lb-w8",
    authDomain: "cs398-32c92.firebaseapp.com",
    projectId: "cs398-32c92",
    storageBucket: "cs398-32c92.firebasestorage.app",
    messagingSenderId: "358717382565",
    appId: "1:358717382565:web:3d4e8c07ebf0c924d3924c",
    measurementId: "G-G1WD1ZSE11"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const urlParams = new URLSearchParams(window.location.search);
const searchQuery = urlParams.get('query');
const resultsList = document.getElementById('results-list');

async function displaySearchResults() {
    try {
        const classesCollection = collection(db, "classes");
        const querySnapshot = await getDocs(classesCollection);
        const matchingClasses = [];

        querySnapshot.forEach((doc) => {
            const className = doc.id;
            if (className.toLowerCase().includes(searchQuery.toLowerCase())) {
                matchingClasses.push(doc);
            }
        });

        if (matchingClasses.length > 0) {
            matchingClasses.forEach((doc) => {
                const li = document.createElement('li');
                const link = document.createElement('a');
                link.href = `student-queue.html?classId=${doc.id}`;
                link.textContent = doc.id;
                li.appendChild(link);
                resultsList.appendChild(li);
            });
        } else {
            resultsList.innerHTML = '<p>No Results Found</p>';
        }


    } catch (error) {
        console.error("Error displaying search results:", error);
        resultsList.innerHTML = `<p style="color: red;">Error loading search results: ${error.message}</p>`;
    }
}

// check authentication state
onAuthStateChanged(auth, (user) => {
    console.log('Auth state on search page:', user ? user.email : 'No user');
    if (user && user.email && user.email.endsWith('@uic.edu')) {
        console.log('User authenticated, displaying search results.');
        if (searchQuery) {
            displaySearchResults();
        } else {
            resultsList.innerHTML = '<p>Please enter a search query.</p>';
        }
    } else {
        console.log('User not authenticated or not UIC email, redirecting to login.');
        window.location.href = 'index.html';
    }
});

console.log("search.js loaded successfully");