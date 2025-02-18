const { sendtoQueue } = require('../services/producer');

const sendSMS = (req, res) => {
  const { title, body, platform, deviceToken } = req.body;

  if (!title || !body || !platform || !deviceToken) {
    return res.status(400).send('Missing Inputs');
  }

  const sms = {
    title,
    body,
    platform,
    deviceToken,
  };

  sendtoQueue(sms);

  res.send('SMS sent to queue successfully');
};

module.exports = { sendSMS };
