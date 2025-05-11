// firebase stuff
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDoc, query, where, onSnapshot, orderBy, limit, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"; // Correct import for getAuth

// firebase config
const firebaseConfig = {
 apiKey: "AIzaSyAG5UGt-H7TveOPinBhjy8w75YSo5lb-w8",
 authDomain: "cs398-32c92.firebaseapp.com",
 projectId: "cs398-32c92",
 storageBucket: "cs398-32c92.firebasestorage.app",
 messagingSenderId: "358717382565",
 appId: "1:358717382565:web:3d4e8c07ebf0c924d3924c",
 measurementId: "G-G1WD1ZSE11"
};

// firebase initialize
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messaging = getMessaging(app);
const auth = getAuth(app); // Initialize Firebase Auth

const urlParams = new URLSearchParams(window.location.search);
const classId = urlParams.get('classId');

if (!classId) {
 console.error("classId not found in URL.");
}

// references to the html
const nameInput = document.getElementById('name');
const questionInput = document.getElementById('question');
const helpSelect = document.getElementById('help');
const addToQueueButton = document.getElementById('add-to-queue');
const nameList = document.getElementById('name-list');
const removeSelfButton = document.getElementById('remove-self-from-queue'); // Get the remove button

async function addStudentToQueue(name, question, help) {
 try {
   const user = auth.currentUser; // Get the current user
   if (!user) {
     console.error("User not authenticated.");
     return;
   }

   // add student to firestore and get doc ref
   const docRef = await addDoc(collection(db, "students"), {
     name: name,
     question: question,
     help: help,
     class_id: classId,
     timestamp: serverTimestamp(),
     userId: user.uid // Add the userId
   });

   console.log("Student added to queue successfully with ID:", docRef.id, "and userId:", user.uid);

   // store doc id in local storage
   localStorage.setItem(`queue_${classId}_docId`, docRef.id);
   localStorage.setItem(`queue_${classId}_inQueue`, 'true');

   toggleQueueButtons(true);

   // subscribe notifications for specific doc id
   await subscribeToIndividualTopic(docRef.id);

   return docRef.id;
 } catch (error) {
   console.error("!!! Error adding student to queue:", error);
 }
}

// individual topic subscription
async function subscribeToIndividualTopic(documentId) {
 try {
   // get fcm token
   const registration = await navigator.serviceWorker.ready;
   const token = await getToken(messaging, {
     vapidKey: 'BHZr0mSunoqO9-_DoCUqYqe5cs3gxAV2avQt-xREYqemdon6lqIv0FRTCk3lCO0QslKrDUsxRRpaoh9cKz-D2OA',
     serviceWorkerRegistration: registration
   });

   if (token) {
     // subscribe to a topic based on doc id
     await fetch('/api/subscribeToTopic', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         fcmToken: token,
         topicId: documentId, // use doc id as topic
       }),
     });
     console.log(`Subscribed to individual topic: ${documentId}`);
   }
 } catch (error) {
   console.error("!!! Error subscribing to individual topic:", error);
 }
}

async function removeSelfFromQueue() {
 try {
   const user = auth.currentUser; // Get the current user
   if (!user) {
     console.error("User not authenticated.");
     return;
   }

   // get doc id from local storage
   const docId = localStorage.getItem(`queue_${classId}_docId`);

   if (!docId) {
     console.error("No document ID found in localStorage");
     return;
   }

   // delete the document
   await deleteDoc(doc(db, "students", docId));
   console.log("Removed self from queue successfully!");

   // clear local storage
   localStorage.removeItem(`queue_${classId}_docId`);
   localStorage.removeItem(`queue_${classId}_inQueue`);

   // toggle the button
   toggleQueueButtons(false);

 } catch (error) {
   console.error("!!! Error removing self from queue:", error);
 }
}

// helper to toggle button visibility
function toggleQueueButtons(inQueue) {
 const addButton = document.getElementById('add-to-queue');
 const removeButton = document.getElementById('remove-self-from-queue');

 if (inQueue) {
   addButton.style.display = 'none';
   removeButton.style.display = 'inline-block';
 }
 else {
   addButton.style.display = 'inline-block';
   removeButton.style.display = 'none';
 }
}

async function displayQueue() {
 const q = query(collection(db, "students"), where("class_id", "==", classId), orderBy("timestamp", "asc"));
 onSnapshot(q, (querySnapshot) => {
   nameList.innerHTML = '';

   const userDocId = localStorage.getItem(`queue_${classId}_docId`);

   if (querySnapshot.empty) {
     const emptyMessage = document.createElement('li');
     emptyMessage.className = 'empty-message';
     emptyMessage.textContent = 'No students in queue';
     nameList.appendChild(emptyMessage);
     return;
   }

   querySnapshot.forEach((doc) => {
     const student = doc.data();
     const isCurrentUser = doc.id === userDocId;

     const nameLi = document.createElement('li');
     if (isCurrentUser) {
       nameLi.className = 'current-user';
       nameLi.style.fontWeight = 'bold';
       nameLi.style.backgroundColor = '#e6f7ff';
     }
     const nameSpan = document.createElement('span');
     nameSpan.textContent = student.name;
     nameLi.appendChild(nameSpan);

     if (student.timestamp) {
       const timeSpan = document.createElement('span');
       timeSpan.className = 'timestamp';
       const date = student.timestamp.toDate();
       let hours = date.getHours();
       const minutes = date.getMinutes();
       const ampm = hours >= 12 ? ' PM' : ' AM';
       hours = hours % 12;
       hours = hours ? hours : 12;
       timeSpan.textContent = `${hours}:${minutes < 10 ? '0' + minutes : minutes}${ampm}`;
       nameLi.appendChild(timeSpan);
     }
     nameList.appendChild(nameLi);
   });

   querySnapshot.docChanges().forEach((change) => {
     if (change.type === "removed") {
       console.log("Document removed:", change.doc.data());
       const removedStudent = change.doc.data();
     }
   });
 });
}

async function requestNotificationPermission() {
 try {
   const permission = await Notification.requestPermission();
   if (permission === 'granted') {
     console.log('Notification permission granted.');

     // register service worker
     if ('serviceWorker' in navigator) {
       try {
         const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
         console.log('Service Worker registered with scope:', registration.scope);

         // wait for service worker
         await navigator.serviceWorker.ready;

         // check if user already has doc id stored
         const storedDocId = localStorage.getItem('myStudentDocId');
         if (storedDocId) {
           // resubscribe to topic
           await subscribeToIndividualTopic(storedDocId);
         }

         // hide button after successful subscription
         const notifyButton = document.getElementById('enable-notifications');
         if (notifyButton) {
           notifyButton.style.display = 'none';
         }
       } catch (swError) {
         console.error('!!! Service Worker registration failed:', swError);
       }
     }
   } else {
     console.log('!!! Unable to get permission to notify.');
   }
 } catch (error) {
   console.error('!!! An error occurred while requesting permissions.', error);
 }
}

// when the queue page loads
requestNotificationPermission();

// adding to the queue
addToQueueButton.addEventListener('click', () => {
 const name = nameInput.value.trim();
 const question = questionInput.value.trim();
 const help = helpSelect.value;

 if (name && question && help) {
   addStudentToQueue(name, question, help);
   nameInput.value = '';
   questionInput.value = '';
   helpSelect.value = '';
 } else {
   alert('Please enter both a name and a question.');
 }
});

async function verifyUserInQueue() {
 try {
   const docId = localStorage.getItem(`queue_${classId}_docId`);
 
   if (docId) {
     // try to get the dec from firestore
     const docRef = doc(db, "students", docId);
     const docSnap = await getDoc(docRef);
   
     // if doc was removed 
     if (!docSnap.exists()) {
       console.log("User's document no longer exists in the queue. Resetting state.");
       // clear local storage
       localStorage.removeItem(`queue_${classId}_docId`);
       localStorage.removeItem(`queue_${classId}_inQueue`);
       // update ui
       toggleQueueButtons(false);
     }
   }
 } catch (error) {
   console.error("!!! Error verifying queue status:", error);
 }
}

// function to check if student is in waiting queue
function checkWaitingQueueStatus() {
  console.log("Checking waiting queue status...");
 
  const user = auth.currentUser;
  if (!user) {
    console.log("No authenticated user found");
    // set up a listener for auth state changes 
    // instead of returning
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("Auth state changed, user authenticated");
        setupWaitingQueueListener(user);
      }
    });
    return;
  }
 
  // if already authed, set up listener here
  setupWaitingQueueListener(user);
}

// helper to set up the actual waiting queue listener
function setupWaitingQueueListener(user) {
  console.log("Setting up waiting queue listener for user:", user.uid);
 
  const q = query(
    collection(db, "waitingQueue"),
    where("userId", "==", user.uid),
    where("class_id", "==", classId)
  );
 
  onSnapshot(q, (querySnapshot) => {
    console.log("Waiting queue snapshot received, empty:", querySnapshot.empty);
   
    const waitingIndicator = document.getElementById('waiting-indicator');
    if (!waitingIndicator) {
      console.error("Waiting indicator element not found in the DOM");
      return;
    }
   
    if (!querySnapshot.empty) {
      // user is in waiting queue
      // show indicator
      console.log('User is in waiting queue, showing indicator');
      waitingIndicator.style.display = 'block';
    } else {
      // user not in waiting queue 
      // hide indicator
      console.log('User is not in waiting queue, hiding indicator');
      waitingIndicator.style.display = 'none';
    }
  }, (error) => {
    console.error("Error in waiting queue listener:", error);
  });
}

document.addEventListener('DOMContentLoaded', () => {
 displayQueue();
 requestNotificationPermission();
 verifyUserInQueue();
 checkWaitingQueueStatus();
 // check if user in queue
 const inQueue = localStorage.getItem(`queue_${classId}_inQueue`) === 'true';
 toggleQueueButtons(inQueue);

 // event listener for remove self button
 const removeSelfButton = document.getElementById('remove-self-from-queue');
 if (removeSelfButton) {
   removeSelfButton.addEventListener('click', removeSelfFromQueue);
 }
});