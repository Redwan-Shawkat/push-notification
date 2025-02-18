const dotenv = require('dotenv');
dotenv.config();

//Config Imports
const createConnection = require('../config/rabbitmq');
const initializeFirebase = require('../config/firebase');
const initializeAPN = require('../config/apn');
//logger
const logger = require('../config/logger');

//Initialize
const admin = initializeFirebase();
const { apn, apnProvider } = initializeAPN();

async function startConsumer() {
  // const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const connection = await createConnection();

  //Channel
  const channel = await connection.createChannel();
  const secondChannel = await connection.createChannel();

  //Queue
  const queue = 'notification_queue';
  const secondQueue = 'sms_queue';

  //1st
  channel.assertQueue(queue, { durable: true });
  // console.log('Waiting for messages (notification)...');
  logger.info('Waiting for messages (notification)...');

  //2nd
  secondChannel.assertQueue(secondQueue, { durable: true });
  // console.log('Waiting for messages (SMS)...');
  logger.info('Waiting for messages (SMS)...');

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const notification = JSON.parse(msg.content.toString());
      // console.log('Inserting Notification in Queue:', notification);
      logger.info(`Inserting Notification in queue: ${notification.title}`);
      // console.log('Existing Queue:', queue);

      try {
        if (notification.platform === 'android') {
          await admin.messaging().send({
            token: notification.deviceToken,
            // token: token,
            notification: {
              title: notification.title,
              body: notification.body,
            },
          });
          console.log('_'.repeat(40) + '\n');
          // console.log(' Android notification sent to Firebase');
          logger.info('Android Notification is sent to firebase');
          console.log('_'.repeat(40) + '\n');
        } else if (notification.platform === 'ios') {
          const apnsNotification = new apn.Notification();
          apnsNotification.alert = {
            title: notification.title,
            body: notification.body,
          };
          apnsNotification.topic = 'com.btracsl.carcopolo';

          //Sending Notification
          const responseNotification = await apnProvider.send(
            apnsNotification,
            notification.deviceToken
          );
          console.log('_'.repeat(40) + '\n');
          // console.log('APNs Notification Response:', responseNotification);
          logger.info('APNs Notification Response:', responseNotification);
          console.log('_'.repeat(40) + '\n');

          console.log('_'.repeat(40) + '\n');
          // console.log('iOS notification sent successfully');
          logger.info('iOS notification is sent successfully');
          console.log('_'.repeat(40) + '\n');
        } else {
          console.log('_'.repeat(40) + '\n');
          // console.error('Invalid Platform', notification.platform);
          logger.error('Invalid Platform', notification.platform);
          console.log('_'.repeat(40) + '\n');
          return;
        }
        channel.ack(msg);
        console.log('_'.repeat(40) + '\n');
        logger.info('Queue Now after processing notifications: ', notification);
        // console.log('Queue Now after processing notifications: ', notification);
        console.log('_'.repeat(40) + '\n');
      } catch (error) {
        console.log('_'.repeat(40) + '\n');
        // console.error('Firebase Error:', error);
        logger.error('Firebase Error:', error);
        // channel.nack(msg);
        console.log('_'.repeat(40) + '\n');
      }
    }
  });

  //Second Channel
  secondChannel.consume(secondQueue, async (msg) => {
    if (msg !== null) {
      const notification = JSON.parse(msg.content.toString());
      // console.log('Inserting SMS in Queue:', notification);
      logger.info('Inserting SMS in Queue:', notification);

      try {
        if (notification.platform === 'android') {
          await admin.messaging().send({
            token: notification.deviceToken,
            notification: {
              title: notification.title,
              body: notification.body,
            },
          });
          console.log('_'.repeat(40) + '\n');
          // console.log('Android SMS sent to Firebase');
          logger.info('Android SMS is sent to firebase');
          console.log('_'.repeat(40) + '\n');
        } else if (notification.platform === 'ios') {
          const apns_SMS_Notification = new apn.Notification();
          apns_SMS_Notification.alert = {
            title: notification.title,
            body: notification.body,
          };
          apns_SMS_Notification.topic = 'com.btracsl.carcopolo';

          //Sending SMS
          const smsResponce = await apnProvider.send(
            apns_SMS_Notification,
            notification.deviceToken
          );
          console.log('_'.repeat(40) + '\n');
          // console.log('APNs SMS Response:', smsResponce);
          logger.info('APNs SMS Response:', smsResponce);
          console.log('_'.repeat(40) + '\n');

          console.log('_'.repeat(40) + '\n');
          // console.log('iOS SMS sent successfully');
          logger.info('iOS SMS is sent successfully');
          console.log('_'.repeat(40) + '\n');
        } else {
          console.log('_'.repeat(40) + '\n');
          logger.error('Invalid Platform', notification.platform);
          // console.error('Invalid Platform', notification.platform);
          console.log('_'.repeat(40) + '\n');
          return;
        }
        secondChannel.ack(msg);
        console.log('_'.repeat(40) + '\n');
        logger.info('Queue Now after processing sms: ', notification);
        // console.log('Queue Now after processing sms: ', notification);
        console.log('_'.repeat(40) + '\n');
      } catch (error) {
        console.log('_'.repeat(40) + '\n');
        logger.error('SMS Error: ', error);
        // console.error('SMS Error:', error);
        console.log('_'.repeat(40) + '\n');
      }
    }
  });
}

startConsumer().catch(console.error);
