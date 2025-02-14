const amqp = require('amqplib');
const admin = require('firebase-admin');
// const firebaseapp = require('./consummateFold.json');
const dotenv = require('dotenv');
const fs = require('fs');
const apn = require('apn');

dotenv.config();

//Initialize
const serviceAccount = JSON.parse(fs.readFileSync('./consummateFold.json'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

//APN Setup
const apnProvider = new apn.Provider({
  cert: './CertificatesCarcopoloPush.pem',
  key: './CertificatesCarcopoloPush.pem',
  passphrase: 'carcopolo2024' || '',
  production: true,
});

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

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const notification = JSON.parse(msg.content.toString());
      console.log('Inserting Notification in Queue:', notification);
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
          console.log(' Android notification sent to Firebase');
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
          console.log('APNs Notification Response:', responseNotification);

          /*
           With Firebase Notification
          const apnsPayload = {
            payload: {
              aps: {
                alert: {
                  title: notification.title,
                  body: notification.body,
                },
              },
            },
          };

          await admin.messaging().send({
            token: notification.deviceToken,
            apns: apnsPayload,
          });
          */

          console.log('iOS notification sent successfully');
        } else {
          console.error('Invalid Platform', notification.platform);
          return;
        }
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
        if (notification.platform === 'android') {
          await admin.messaging().send({
            token: notification.deviceToken,
            notification: {
              title: notification.title,
              body: notification.body,
            },
          });
          console.log('Android SMS sent to Firebase');
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
          console.log('APNs SMS Response:', smsResponce);

          console.log('iOS SMS sent successfully');
        } else {
          console.error('Invalid Platform', notification.platform);
          return;
        }
        secondChannel.ack(msg);
        console.log('Queue Now after processing sms: ', notification);
      } catch (error) {
        console.error('SMS Error:', error);
      }
    }
  });
}

startConsumer().catch(console.error);
