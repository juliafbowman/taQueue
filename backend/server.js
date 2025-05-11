const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');

const serviceAccount = require('./config/cs398-32c92-firebase-adminsdk-fbsvc-1c978306e4.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// app.post('/subscribeToTopic', async (req, res) => {
//   const { fcmToken, classId } = req.body;

//   if (!fcmToken || !classId) {
//     return res.status(400).send('Missing required parameters.');
//   }

//   try {
//     const response = await admin.messaging().subscribeToTopic(fcmToken, `/topics/${classId}`);
//     console.log('Successfully subscribed to topic:', response);
//     res.status(200).send('Subscribed to topic successfully.');
//   } catch (error) {
//     console.error('Error subscribing to topic:', error);
//     res.status(500).send('Error subscribing to topic.');
//   }
// });

app.post('/subscribeToTopic', async (req, res) => {
  const { fcmToken, topicId } = req.body;

  if (!fcmToken || !topicId) {
    return res.status(400).send('Missing required parameters.');
  }

  try {
    // use the document ID as the topic
    const response = await admin.messaging().subscribeToTopic(fcmToken, `/topics/${topicId}`);
    console.log('Successfully subscribed to topic:', response);
    res.status(200).send('Subscribed to topic successfully.');
  } catch (error) {
    console.error('Error subscribing to topic:', error);
    res.status(500).send('Error subscribing to topic.');
  }
});

// app.post('/removeStudentNotification', async (req, res) => {
//   const { classId, removedStudentName, removedStudentQuestion } = req.body;

//   if (!classId || !removedStudentName || !removedStudentQuestion) {
//     return res.status(400).send('Missing required parameters.');
//   }
//   const topic = `/topics/${classId}`;

//   const message = {
//     notification: {
//       title: 'Student Removed from Queue',
//       body: `${removedStudentName} has been removed from the queue. Question: ${removedStudentQuestion}`,
//     },
//     topic: topic,
//   };

//   try {
//     const response = await admin.messaging().send(message);
//     console.log('Successfully sent notification to topic:', response);
//     res.status(200).send('Notification sent to topic successfully.');
//   } catch (error) {
//     console.error('Error sending notification to topic:', error);
//     res.status(500).send('Error sending notification to topic.');
//   }
// });


app.post('/removeStudentNotification', async (req, res) => {
  const { studentId, removedStudentName, removedStudentQuestion } = req.body;

  if (!studentId || !removedStudentName) {
    return res.status(400).send('Missing required parameters.');
  }

  // make the topic string using the document ID
  const topic = `/topics/${studentId}`;

  const message = {
    notification: {
      title: 'You have been removed from the queue',
      body: `${removedStudentName}, your question has been selected for help!`,
    },
    topic: topic,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent notification to topic:', response);
    res.status(200).send('Notification sent to topic successfully.');
  } catch (error) {
    console.error('Error sending notification to topic:', error);
    res.status(500).send('Error sending notification to topic.');
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});