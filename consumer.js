const amqp = require('amqplib');
const admin = require('firebase-admin');
// const firebaseapp = require('./consummateFold.json');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

//Initialize
const serviceAccount = JSON.parse(fs.readFileSync('./consummateFold.json'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

async function startConsumer() {
  // const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const connection = await amqp.connect(process.env.CLOUDAMQP_URL);

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

  /* 

  const token = process.env.DEVICE_TOKEN;
  if (!token) {
    console.error('Device token not found');
    return;
  }

  */

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const notification = JSON.parse(msg.content.toString());
      console.log('Inserting Notification in Queue:', notification);
      // console.log('Existing Queue:', queue);

      try {
        await admin.messaging().send({
          token: notification.deviceToken,
          // token: token,
          notification: { title: notification.title, body: notification.body },
        });
        console.log('Notification sent to Firebase');
        // console.log('Received Message:', notification);
        channel.ack(msg);
        console.log('Queue Now after processing notifications: ', notification);
      } catch (error) {
        console.error('Firebase Error:', error);
        // channel.nack(msg);
      }
    }
  });

  //Second Channel
  secondChannel.consume(secondQueue, async (msg) => {
    if (msg !== null) {
      const notification = JSON.parse(msg.content.toString());
      console.log('Inserting SMS in Queue:', notification);

      try {
        await admin.messaging().send({
          token: notification.deviceToken,
          notification: { title: notification.title, body: notification.body },
        });
        console.log('SMS sent to Firebase');
        // console.log('Received Message:', notification);
        secondChannel.ack(msg);
        console.log('Queue Now after processing sms: ', notification);
      } catch (error) {
        console.error('SMS Error:', error);
        // secondChannel.nack(msg);
      }
    }
  });
}

startConsumer().catch(console.error);
