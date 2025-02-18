const amqp = require('amqplib');
require('dotenv').config();

async function createConnection() {
  try {
    const connection = await amqp.connect(process.env.CLOUDAMQP_URL);
    return connection;
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
    throw error;
  }
}

module.exports = createConnection;
