const express = require('express');
const amqp = require('amqplib');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(bodyParser.json());

async function sendtoQueue(notification) {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();
  const queue = 'notification_queue';

  await channel.assertQueue(queue, { durable: false });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(notification)));

  console.log(`Message sent to the queue: ${notification}`);
  setTimeout(() => connection.close(), 500);
}

//server checking
app.get('/', (req, res) => {
  res.send('Server is running! Welcome to the API.');
});

app.post('/send-notification', async (req, res) => {
  const { title, body, deviceToken } = req.body;

  if (!title || !body || !deviceToken) {
    return res.status(400).send('Missing Inputs');
  }

  const notification = { title, body, deviceToken };

  // await sendToQueue({ title, body, deviceToken });
  await sendToQueue(notification);
  res.send('Notification sent to queue successfully');
});

const PORT = process.env.PORT || 3000;
app.listen(3000, () => console.log(`Server is running on port ${PORT}`));
