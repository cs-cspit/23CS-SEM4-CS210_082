const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  place: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Place'},
  user: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
  rating: {type: Number, required: true, min: 1, max: 5},
  comment: {type: String, required: false},
}, {
  timestamps: true
});

const ReviewModel = mongoose.model('Review', reviewSchema);

module.exports = ReviewModel; 