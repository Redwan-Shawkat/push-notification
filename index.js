const express = require('express');
// const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const amqp = require('amqp');
const admin = require('firebase-admin');
const amqp = require('amqplib/callback_api');
const admin = require('firebase-admin');

const postModel = require('./model/PostModel');

// //Firebase Setup
// const serviceAccout

const app = express();
app.use(express.json());

mongoose
  .connect(
    'mongodb+srv://red:2335555@redcluster.f1cfy.mongodb.net/post?retryWrites=true&w=majority&appName=redCluster'
  )
  .then(() => console.log('MongoDB is working properly'))
  .catch((e) => console.log('Error connecting to MongoDB', e));

admin.initializeApp({
  credential: admin.credential.cert(
    require('./config/firebase-service-account.json.json')
  ),
});

app.post('/', async (req, res) => {
  try {
    const post = new postModel(req.body);
    await post.save();
    amqp.connect('amqp://localhost', function (error0, connection) {
      if (error0) {
        throw error0;
      }
      connection.createChannel(function (error1, channel) {
        if (error1) {
          throw error1;
        }

        const queue = 'posts';
        const msg = JSON.stringify(post);

        channel.assertQueue(queue, {
          durable: false,
        });

        channel.sendToQueue(queue, Buffer.from(msg));
        console.log(' [x] sent RabbitMQ', msg);

        setTimeout(() => {
          channel.close();
          connection.close();
        }, 500);
      });
    });

    res.status(201).json(post);
  } catch (e) {
    res
      .status(404)
      .json({ message: 'Error while creating new post', error: e });
  }
});

app.get('/', async (req, res) => {
  try {
    const posts = await postModel.find();
    amqp.connect('amqp://localhose', function (error0, channel1) {
      if (error0) {
        throw error0;
      }
    });
    res.status(200).json(posts);
  } catch (e) {
    res.status(500).json({ message: 'Error retrieving posts', error: e });
  }
});

amqp.connect('amqp://localhost', function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }

    const queue = 'posts';

    channel.assertQueue(queue, {
      durable: false,
    });

    console.log(`Waiting for message in queue: ${queue}`);

    channel.consume(
      queue,
      function (msg) {
        console.log(
          `Received message from RabbitMQ: ${msg.content.toString()}`
        );
      },
      { noAck: true }
    );
  });
});

const sendNotification = (deviceToken, type) => {
  const message = {
    notification: {
      title: 'New Post',
      body: `A new post has been created`,
    },
    token: deviceToken,
  };

  if (type === 'android') {
    message.android = { priority: 'high' };
  } else if (type === 'ios') {
    message.apns = { priority: 'high' };
  }
};

admin
  .messaging()
  .send(message)
  .then((response) => console.log('Notification sent successfully', response))
  .catch((error) => console.log('Error sending notification', error));

sendNotification();
const PORT = process.env.PORT || 5000;
app.listen(PORT, (e) => console.log(`MongoDB is working on port ${PORT}`));
