TA Queue System
A real-time Teaching Assistant queue management system designed to streamline office hours for both students and TAs at UIC.
Features

Real-time Queue Updates: Students can see their position in the queue in real-time
Push Notifications: Students receive notifications when they're removed from the queue
Firebase Integration: Leverages Firebase Firestore, Authentication, and Cloud Messaging
Domain-Restricted Access: Limits access to users with @uic.edu email addresses
TA Management Interface: TAs can view and manage students in the queue
Waiting List: Students moved from the main queue are added to a waiting list
Mobile-Responsive Design: Works on both desktop and mobile devices

Technology Stack

Frontend: HTML, CSS, JavaScript
Backend: Firebase Cloud Functions (Node.js)
Database: Firebase Firestore
Authentication: Firebase Authentication with Google Sign-In
Notifications: Firebase Cloud Messaging
Hosting: Firebase Hosting

Project Background
This project was developed as part of the CS398 Research and Design course at UIC. The system was designed to address inefficiencies in traditional office hour wait times and improve the overall experience for both students and teaching assistants.

Installation and Setup
To run this project locally:

Clone this repository
Create a Firebase project and update the configuration in the JavaScript files
Set up Firebase Authentication, Firestore, and Cloud Messaging
Install Firebase CLI: npm install -g firebase-tools
Initialize the project: firebase init
Serve locally: firebase serve
Deploy: firebase deploy

Live Demo
Access the live application at: https://cs398-32c92.web.app/
(Note: You need a UIC email address to access the system)
----------------------------------------------------------
To access the TA side of the application you need to replace the "student" part of the url with "TA" for a given class queue.
