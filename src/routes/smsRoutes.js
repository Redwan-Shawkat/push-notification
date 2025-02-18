const express = require('express');
const { sendSMS } = require('../controllers/smsController');

const router = express.Router();

router.post('/send-sms', sendSMS);

module.exports = router;
