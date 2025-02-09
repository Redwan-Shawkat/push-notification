const amqp = require('amqplib');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

//Initialize
const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

async function startConsumer() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);

  //Channel
  const channel = await connection.createChannel();
  const secondChannel = await connection.createChannel();

  //Queue
  const queue = 'notification_queue';
  const secondQueue = 'sms_queue';

  //1st
  channel.assertQueue(queue, { durable: true });
  console.log('Waiting for messages (notification)...');

  //2nd
  secondChannel.assertQueue(secondQueue, { durable: true });
  console.log('Waiting for messages (SMS)...');

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const notification = JSON.parse(msg.content.toString());
      console.log('Received:', notification);

      try {
        await admin.messaging().send({
          token: notification.deviceToken,
          notification: { title: notification.title, body: notification.body },
        });
        console.log('Notification sent to Firebase');
        console.log('Received Message:', notification);
        channel.ack(msg);
        console.log('Queue Now: ', notification);
      } catch (error) {
        console.error('Firebase Error:', error);
      }
    }
  });

  //Second Channel
  secondChannel.consume(secondQueue, async (msg) => {
    if (msg !== null) {
      const notification = JSON.parse(msg.content.toString());
      console.log('Received SMS:', notification);

      try {
        await admin.messaging().send({
          notification: { title: notification.title, body: notification.body },
        });
        console.log('Notification sent to Firebase');
        console.log('Received Message:', notification);
        channel.ack(msg);
        console.log('Queue Now: ', notification);
      } catch (error) {
        console.error('SMS Error:', error);
      }
    }
  });
}

startConsumer().catch(console.error);
