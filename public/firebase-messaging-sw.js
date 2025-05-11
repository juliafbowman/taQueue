// for the service workers
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

console.log('Firebase scripts imported in service worker...');

const firebaseConfig = {
  apiKey: "AIzaSyAG5UGt-H7TveOPinBhjy8w75YSo5lb-w8",
  authDomain: "cs398-32c92.firebaseapp.com",
  projectId: "cs398-32c92",
  storageBucket: "cs398-32c92.firebasestorage.app",
  messagingSenderId: "358717382565",
  appId: "1:358717382565:web:3d4e8c07ebf0c924d3924c",
  measurementId: "G-G1WD1ZSE11"
};

console.log('Firebase initialized in service worker!');

// firebase init 
const firebaseApp = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();
console.log('Messaging initialized in service worker');

// background messages
messaging.onBackgroundMessage(function (payload) {
 console.log('Received background message:', payload);

 const notificationTitle = payload.notification.title;
 const notificationOptions = {
   body: payload.notification.body,
   icon: '/iconx.png' // might change this later !!
 };


 return self.registration.showNotification(notificationTitle, notificationOptions);
});

// for service worker
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
});


self.addEventListener('activate', event => {
  console.log('Service Worker activating..!');
});


self.addEventListener('push', function (event) {
  console.log('Push message received:', event);
 
  // only if theres data there
  if (event.data) {
    try {
      const data = event.data.json();
      const title = data.notification ? data.notification.title : 'Notification';
      const options = {
        body: data.notification ? data.notification.body : 'New message received',
        icon: '/iconx.png' // !!
      };
     
      event.waitUntil(
        self.registration.showNotification(title, options)
      );
    } catch (e) {
      console.error('Error processing push notification:', e);
     
      // fallback
      const testTitle = 'New Notification';
      const testOptions = {
        body: 'New notification received',
        icon: '/iconx.png' // !!
      };
     
      event.waitUntil(
        self.registration.showNotification(testTitle, testOptions)
      );
    }
  }
});