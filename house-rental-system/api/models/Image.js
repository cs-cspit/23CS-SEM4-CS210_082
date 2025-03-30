const mongoose = require('mongoose');

// Image schema to store the image URL and related info
const ImageSchema = new mongoose.Schema({
  url: String,
  name: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Image = mongoose.model('Image', ImageSchema);

module.exports = Image;