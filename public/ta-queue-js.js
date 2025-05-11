// firebase stuff
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, onSnapshot, orderBy, limit, deleteDoc, updateDoc, doc, getDoc, addDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"; // Import getAuth

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
const auth = getAuth(app); 

// ge the class id from url
const urlParams = new URLSearchParams(window.location.search);
const classId = urlParams.get('classId');

if (!classId) {
 console.error("classId not found in URL.");
}

// references to the html
// const nameList = document.getElementById('name-list');
// const questionList = document.getElementById('question-list');
// const helpList = document.getElementById('help-list');
const combinedList = document.getElementById('combined-list');

const removeStudentButton = document.getElementById('remove-student');
const toggleActiveButton = document.getElementById('toggle-active-status');

// display queue of a certain class
async function displayQueue() {
 const q = query(
   collection(db, "students"),
   where("class_id", "==", classId),
   orderBy("timestamp", "asc")
 );

 const queueBody = document.getElementById('queue-data');

 onSnapshot(q, (querySnapshot) => {
   queueBody.innerHTML = '';

   if (querySnapshot.empty) {
     const emptyRow = document.createElement('tr');
     const emptyCell = document.createElement('td');
     emptyCell.colSpan = 4;
     emptyCell.className = 'empty-message';
     emptyCell.textContent = 'No students in queue';
     emptyRow.appendChild(emptyCell);
     queueBody.appendChild(emptyRow);
     return;
   }

   querySnapshot.forEach((doc) => {
     const student = doc.data();

     // format time
     let formattedTime = '';
     if (student.timestamp) {
       const date = student.timestamp.toDate();
       let hours = date.getHours();
       const minutes = date.getMinutes();
       const ampm = hours >= 12 ? 'PM' : 'AM';
       hours = hours % 12 || 12;
       formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
     }

     // find out help type class
     const helpTypeClass = {
       project: 'project',
       homework: 'homework',
       lab: 'lab',
     }[student.help?.toLowerCase()] || 'other';

     // create row
     const tr = document.createElement('tr');
     tr.innerHTML = `
       <td>
         <div class="student-name">
           <span class="student-status"></span>
           ${student.name}
         </div>
       </td>
       <td><span class="help-type ${helpTypeClass}">${student.help}</span></td>
       <td class="question-text">${student.question}</td>
       <td class="timestamp">${formattedTime}</td>
     `;

     queueBody.appendChild(tr);
   });
 });
}

async function removeOldestStudent() {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error("TA not authenticated.");
      alert("You must be logged in as a TA to remove students.");
      return;
    }

    const taDoc = await getDocs(query(collection(db, "TAs"), where("email", "==", user.email)));
    if (taDoc.empty) {
      console.log("Current user is not a recognized TA.");
      alert("You are not authorized to remove students.");
      return;
    }

    const q = query(collection(db, "students"), where("class_id", "==", classId), orderBy("timestamp", "asc"), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // get doc reference
      const docToRemove = querySnapshot.docs[0].ref;
      const removedStudent = querySnapshot.docs[0].data();
      const removedStudentId = querySnapshot.docs[0].id;

      // add to waiting queue BEFORE deleting the doc
      try {
        // add to waiting queue collect 
        await addDoc(collection(db, "waitingQueue"), {
          ...removedStudent,
          originalDocId: removedStudentId,
          waitingTimestamp: new Date() 
        });
       
        console.log("Student added to waiting queue");

        // send notification that ur moved to waiting
        try {
          const response = await fetch('/api/removeStudentNotification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              studentId: removedStudentId,
              removedStudentName: removedStudent.name,
              removedStudentQuestion: removedStudent.question,
            }),
          });

          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
          }

          console.log('Notification sent successfully');

          // delete original document 
          // after adding to waiting queue
          await deleteDoc(docToRemove, { queryParams: { classId: classId } });
          console.log("Oldest student moved to waiting queue successfully!");
        } catch (fetchError) {
          console.error("Error sending notification:", fetchError);
        }
      } catch (addError) {
        console.error("Error adding to waiting queue:", addError);
      }
    } else {
      console.log("Queue is empty.");
      alert("Queue is empty");
    }
  } catch (error) {
    console.error("Error removing student:", error);
  }
}

async function toggleClassActiveStatus() {
 try {
   // make sure user is a TA
   const user = auth.currentUser;
   if (!user) {
     alert("You must be logged in to change class status.");
     return;
   }

   console.log("Current user email:", user.email);
 
   // for docs where email field matches user email
   const taQuery = query(collection(db, "TAs"), where("email", "==", user.email));
   const taSnapshot = await getDocs(taQuery);
 
   console.log("TA query result empty?", taSnapshot.empty);
 
   if (taSnapshot.empty) {
     console.error("Current user is not a recognized TA.");
     alert("You are not authorized to change class status.");
     return;
   }
 
   // any match will assume TA here
   console.log("User is a TA, proceeding to update class");
 
   // get current class doc
   const classDocRef = doc(db, "classes", classId);
   const classDoc = await getDoc(classDocRef);
 
   if (!classDoc.exists()) {
     alert("Class not found in database.");
     return;
   }
 
   // toggle the active status
   const currentStatus = classDoc.data().active || false;
   const newStatus = !currentStatus;
 
   // update the document
   await updateDoc(classDocRef, {
     active: newStatus
   });
 
   console.log(`Class ${classId} active status changed to: ${newStatus}`);
   alert(`Class is now ${newStatus ? 'ACTIVE' : 'INACTIVE'} and will ${newStatus ? 'appear in' : 'be hidden from'} the menu.`);
 
 } 
 catch (error) {
   console.error("Error toggling class status:", error);
   alert("Error changing class status: " + error.message);
 }
}

// function to display waiting queue
function displayWaitingQueue() {
  const q = query(
    collection(db, "waitingQueue"),
    where("class_id", "==", classId),
    orderBy("waitingTimestamp", "asc")
  );

  const waitingQueueBody = document.getElementById('waiting-queue-data');

  onSnapshot(q, (querySnapshot) => {
    waitingQueueBody.innerHTML = '';

    if (querySnapshot.empty) {
      const emptyRow = document.createElement('tr');
      const emptyCell = document.createElement('td');
      emptyCell.colSpan = 4;
      emptyCell.className = 'empty-message';
      emptyCell.textContent = 'No students waiting';
      emptyRow.appendChild(emptyCell);
      waitingQueueBody.appendChild(emptyRow);
      return;
    }

    querySnapshot.forEach((doc) => {
      const student = doc.data();

      // format time
      let formattedTime = '';
      if (student.waitingTimestamp) {
        const date = student.waitingTimestamp.toDate();
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
      }

      // find out what help type class
      const helpTypeClass = {
        project: 'project',
        homework: 'homework',
        lab: 'lab',
      }[student.help?.toLowerCase()] || 'other';

      // create row
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="student-name">
            <span class="student-status waiting"></span>
            ${student.name}
          </div>
        </td>
        <td><span class="help-type ${helpTypeClass}">${student.help}</span></td>
        <td class="question-text">${student.question}</td>
        <td class="timestamp">${formattedTime}</td>
        <td>
          <button class="btn btn-sm btn-danger remove-waiting-btn" data-id="${doc.id}">
            Remove
          </button>
        </td>
      `;

      // add event listener to the remove button
      tr.querySelector('.remove-waiting-btn').addEventListener('click', function() {
        removeFromWaitingQueue(this.getAttribute('data-id'));
      });

      waitingQueueBody.appendChild(tr);
    });
  });
}

// function to remove from waiting queue
async function removeFromWaitingQueue(docId) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error("TA not authenticated.");
      alert("You must be logged in as a TA to remove students.");
      return;
    }
    // check to see if user is TA
    const taDoc = await getDocs(query(collection(db, "TAs"), where("email", "==", user.email)));
    if (taDoc.empty) {
      console.log("Current user is not a recognized TA.");
      alert("You are not authorized to remove students.");
      return;
    }

    // remove from waiting queue
    await deleteDoc(doc(db, "waitingQueue", docId));
    console.log("Student removed from waiting queue");
  } catch (error) {
    console.error("Error removing from waiting queue:", error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
 displayQueue();
 displayWaitingQueue();
 removeStudentButton.addEventListener('click', removeOldestStudent);

 if (toggleActiveButton) {
   toggleActiveButton.addEventListener('click', toggleClassActiveStatus);
 }
 console.log('TA Queue interface initialized for class:', classId);
});
