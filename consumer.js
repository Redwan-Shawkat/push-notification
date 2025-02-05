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
  const channel = await connection.createChannel();
  const queue = 'notification_queue';

  await channel.assertQueue(queue, { durable: true });
  console.log('Waiting for messages...');

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
        channel.ack(msg);
      } catch (error) {
        console.error('Firebase Error:', error);
      }
    }
  });
}

startConsumer().catch(console.error);
