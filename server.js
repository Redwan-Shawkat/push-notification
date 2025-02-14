const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { sendtoQueue } = require('./producer');

dotenv.config();

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Server is running! Welcome to the API.');
});

app.post('/send-notification', (req, res) => {
  const { title, body, deviceToken, platform } = req.body;

  //Testing
  // console.log('Received body:', req.body);

  if (!title || !body || !deviceToken || !platform) {
    // if (!title || !body) {
    return res.status(400).send('Missing Inputs');
  }

  const notification = {
    title,
    body,
    // deviceToken: deviceToken || process.env.DEVICE_TOKEN,
    deviceToken,
    platform,
  };

  sendtoQueue(notification);

  res.send('Notification sent to queue successfully');
});

// Second queue
app.post('/send-sms', (req, res) => {
  const { title, body, deviceToken, platform } = req.body;

  if (!title || !body || !deviceToken || !platform) {
    return res.status(400).send('Missing Inputs');
  }

  const sms = {
    title,
    body,
    // deviceToken: deviceToken || process.env.DEVICE_TOKEN,
    deviceToken,
    platform,
  };

  sendtoQueue(sms);

  res.send('SMS sent to queue successfully');
});

const PORT = process.env.PORT || 3000;
app.listen(3000, () => console.log(`Server is running on port ${PORT}`));
