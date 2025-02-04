const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: 'String',
    required: true,
    unique: true,
  },
  body: {
    type: 'String',
    required: true,
  },
  type: {
    type: 'String',
    required: true,
    enum: ['android', 'ios', 'both'],
  },
  device_token: {
    type: 'String',
    default: function () {
      return Date.now().toString() + Math.random().toString(36).substring(7);
    },
    required: true,
    unique: true,
  },
});

module.exports = postSchema;
