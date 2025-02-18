const express = require('express');
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const logger = require('./src/config/logger');

const notificationRoutes = require('./src/routes/notificationRoutes');
const smsRoutes = require('./src/routes/smsRoutes');

const { sendtoQueue } = require('./src/services/producer');
const {
  sendNotification,
} = require('./src/controllers/notificationController');

app.use(notificationRoutes);
app.use(smsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(3000, () => logger.info(`Server is running on port ${PORT}`));
