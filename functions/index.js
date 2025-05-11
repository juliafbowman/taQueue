const functions = require("firebase-functions/v2");
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const serviceAccount = require('./config/cs398-32c92-firebase-adminsdk-fbsvc-7a8ff61aff.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();

app.use(cors({ origin: true }));
app.use(bodyParser.json());

// Routes
app.post('/api/subscribeToTopic', async (req, res) => {
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

app.post('/api/removeStudentNotification', async (req, res) => {
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

// app.post('/api/removeStudentNotification', async (req, res) => {
//   // Log the request to check if it's reaching the function
//   console.log('Received notification request:', req.body);
  
//   // Simply return a success response
//   res.status(200).send('Function reached successfully');
// });

// Export the Express app as a Firebase Function
// exports.api = functions.https.onRequest(app);

exports.api = functions.https.onRequest({
  invoker: 'public'  
}, app);