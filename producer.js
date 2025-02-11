const amqp = require('amqplib');
const dotenv = require('dotenv');

dotenv.config();

async function sendtoQueue(notification) {
  // const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const connection = await amqp.connect(process.env.CLOUDAMQP_URL);

  // Cconnection
  const channel = await connection.createChannel();
  const secondChannel = await connection.createChannel();

  // Queues
  const queue = 'notification_queue';
  const secondQueue = 'sms_queue';

  try {
    // Channel 1
    await channel.assertQueue(queue, { durable: true });
    console.log('First Queue: ' + queue);
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(notification)));
    console.log(
      `Message sent to the notification queue: ${JSON.stringify(notification)}`
    );

    // Channel 2
    await secondChannel.assertQueue(secondQueue, { durable: true });
    secondChannel.sendToQueue(
      secondQueue,
      Buffer.from(JSON.stringify(notification))
    );
    console.log(
      `Message sent to the SMS queue: ${JSON.stringify(notification)}`
    );
  } catch (err) {
    console.error('Error in sending messages to queues:', err);
  }
  await channel.close();
  await secondChannel.close();
  await connection.close();
  console.log('Connection closed successfully');
}

module.exports = { sendtoQueue };
