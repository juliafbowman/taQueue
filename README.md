# TA Queue  
*A real-time queue management system built for University of Illinois Chicago (UIC) office hours as a CS938: Undergraduate Research course*

<img width="1185" height="770" alt="Screenshot 2025-11-19 at 4 09 25 PM" src="https://github.com/user-attachments/assets/7e48c9ed-796b-4585-959d-1516b9ab5971" />

## Overview

TA Queue is a real-time office hours management system designed to streamline the experience for both students and teaching assistants at the University of Illinois Chicago (UIC).

**📚 Students can:**
- Join a queue
- See their position update in real time
- Receive push notifications when their status changes

**🍎 TAs can:**
- View and manage the live queue
- Mark students as being helped or completed
- Move students to a waiting list

This project was developed as part of **CS 398: Research and Design** at UIC to address inefficiencies in traditional office hour wait times and improve the overall experience for both students and TAs.

---

## Project Background

Traditional office hour processes often:
- **Waste time**
- **Cause confusion** about order
- Require **manual oversight**

💡 TA Queue was created to provide:
- A **structured, digital, real-time** queue
- **Automatic notifications**
- A **clean, centralized interface** for TAs
- **Reduced congestion** and fewer repeated questions

Development originally took place here:  
✧ https://github.com/basiltiongson0/TA-Queue-Project

*It was later migrated to this repository for hosting and deployment.*

---

## Features

### 📚 Student-Facing
- **Real-time queue updates** powered by Firebase  
- **Push notifications** via Firebase Cloud Messaging  
- **Waiting list support**  
- **Mobile-responsive design**  
- **@uic.edu domain-restricted authentication**  

### 🍎 TA-Facing
- **TA management interface**  
- **View and manage queue entries**  
- **Mark students as helping / done**  
- **Move students to/from waiting list**  
- **Instant real-time synchronization**

<img width="844" height="379" alt="Screenshot 2025-11-20 at 9 43 26 AM" src="https://github.com/user-attachments/assets/20c99ed0-bac3-4e2c-9d0e-58a60e72dccf" />
*TA Class View*

---

## Tech Stack

### Frontend  
- HTML, CSS, JavaScript
- Mobile-first styling  

### Backend  
- **Firebase Firestore** (database)  
- **Firebase Authentication** (Google Sign-In, domain restriction)  
- **Firebase Cloud Messaging** (push notifications)  
- **Firebase Hosting**  
- **Firebase Cloud Functions** 

### Real-Time Features  
- Firestore listeners  
- Immediate UI updates  
- Zero refresh required  

---

## Project Structure
```
TAQUEUE/
│
├── .vscode/
│   └── settings.json
│
├── functions/
│   └── backend/
│       ├── package.json
│       ├── server.js
│   └── .eslintrc.js
│   └── index.js
|   └── package.json
│
├── public/
│   ├── images/
│   ├── 404.html
│   ├── firebase-messaging-sw.js
│   ├── header.css
│   ├── header.html
│   ├── header.js
│   ├── index.html
│   ├── login-firebaseui.js
│   ├── login.html
│   ├── menu.css
│   ├── menu.html
│   ├── menu.js
│   ├── search.css
│   ├── search.html
│   ├── search.js
│   ├── student-queue-js.js
│   ├── student-queue.css
│   ├── student-queue.html
│   ├── ta-queue-js.js
│   ├── ta-queue.css
│   └── ta-queue.html
│
├── .firebaserc
├── .gitignore
├── discord-notification-webhook.js
├── firebase.json
├── firestore.rules
├── iconx.png
└── README.md
```

---

## Data Model

The system uses Firebase Firestore with the following collections:

### `student` Collection
Each student entry in the queue:
```json
{
  "class_id": "CS111",
  "help": "Yes",
  "name": "Julia",
  "question": "Can you help me debug recursion?",
  "timestamp": 1713900000000
}
```

### `class` Collection
Each class queue configuration:
```json
{
  "active": true,
  "class_id": "CS111"
}
```

### `ta` Collection
Authorized teaching assistants:
```json
{
  "email": "ta@uic.edu"
}
```

### `waitingList` Collection
Students in the waiting list (stored as document UUIDs with no additional fields)

This structure supports:
- Ordering students by `timestamp`
- Class-specific queue management
- TA authorization via email
- Waiting list tracking

---

## Installation & Setup

To run this project locally:

### 1. Clone the repository
```bash 
git clone https://github.com/juliafbowman/taQueue.git
cd ta-queue
```

### 2. Create a Firebase project
Update the Firebase config inside the JS files.

### 3. Enable Firebase Services
- Firebase Authentication (Google Sign-In, domain restriction)
- Firestore Database
- Firebase Cloud Messaging

### 4. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 5. Initialize Firebase in the project
```bash
firebase init
```

### 6. Serve locally
```bash
firebase serve
```

### 7. Deploy
```bash
firebase deploy
```

---
## Mobile UI

### Add Yourself to a Queue
<img src="https://github.com/user-attachments/assets/144ce1dc-af24-40e3-99a6-2e33eb7aead8" width="250">

### Add and Remove Yourself From a Queue
<img src="https://github.com/user-attachments/assets/ffc4cdb2-9296-49d4-a60d-25f28c7e2cb1" width="250">

## Live Demo

Access the live application:  
⟡ https://cs398-32c92.web.app/

*(A UIC email address is required to log in.)*

---

## Full Report
[Read the full report (PDF)](https://github.com/user-attachments/files/23657747/398ForGitHub.pdf)


## Contributors
*CS 398: Undergraduate Research, Spring 2025*

- **Julia Bowman**
- **Basil Tiongson**

### Faculty Advisors

**Professor Adam Koehler**  
*Primary advisor that led our one-on-one CS398 course throughout the semester to develop and refine this system.*

**Professor Chris Kanich**  
*Provided project approval and guidance on security features and best practices.*
