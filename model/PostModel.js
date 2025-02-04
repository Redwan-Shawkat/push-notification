const mongoose = require('mongoose');
const postSchema = require('../Schema/PostSchema');

const postModel = mongoose.model('postModel', postSchema);

module.exports = postModel;
