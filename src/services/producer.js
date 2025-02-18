const dotenv = require('dotenv');

const createConnection = require('../config/rabbitmq');
const logger = require('../config/logger');

dotenv.config();

async function sendtoQueue(notification) {
  // const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const connection = await createConnection();

  // Cconnection
  const channel = await connection.createChannel();
  const secondChannel = await connection.createChannel();

  // Queues
  const queue = 'notification_queue';
  const secondQueue = 'sms_queue';

  try {
    // Channel 1
    await channel.assertQueue(queue, { durable: true });
    console.log('_'.repeat(40) + '\n');
    // console.log('First Queue: ' + queue);
    logger.info('First Queue: ' + queue);
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(notification)));
    // console.log(
    //   `Message sent to the notification queue: \n ${JSON.stringify(
    //     notification
    //   )}`
    // );
    logger.info(
      `Message sent to the notification queue: \n ${JSON.stringify(
        notification
      )}`
    );
    console.log('_'.repeat(40) + '\n');

    // Channel 2
    await secondChannel.assertQueue(secondQueue, { durable: true });
    secondChannel.sendToQueue(
      secondQueue,
      Buffer.from(JSON.stringify(notification))
    );
    console.log('_'.repeat(40) + '\n');
    // console.log(
    //   `Message sent to the SMS queue:  \n ${JSON.stringify(notification)}`
    // );
    logger.info(
      `Message sent to the SMS queue:  \n ${JSON.stringify(notification)}`
    );
    console.log('_'.repeat(40) + '\n');
  } catch (err) {
    console.log('_'.repeat(40) + '\n');
    // console.error('Error in sending messages to queues:', err);
    logger.error('Error in sending messages to queues:', err);
    console.log('_'.repeat(40) + '\n');
  }
  await channel.close();
  await secondChannel.close();
  await connection.close();
  // console.log('Connection closed successfully');
  logger.info('Connection closed successfully');
  console.log('_'.repeat(40) + '\n');
}

module.exports = { sendtoQueue };
