const { sendtoQueue } = require('../services/producer');

const sendNotification = (req, res) => {
  const { title, body, platform, deviceToken } = req.body;

  if (!title || !body || !platform || !deviceToken) {
    return res.status(400).send('Missing Inputs');
  }

  const notification = {
    title,
    body,
    platform,
    deviceToken,
  };

  sendtoQueue(notification);

  res.send('Notification sent to queue successfully');
};

module.exports = { sendNotification };
