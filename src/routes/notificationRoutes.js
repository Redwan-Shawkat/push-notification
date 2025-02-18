const express = require('express');
const { sendNotification } = require('../controllers/notificationController');

const router = express.Router();

router.post('/send-notification', sendNotification);

module.exports = router;
