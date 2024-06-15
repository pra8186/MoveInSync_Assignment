const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  driverName: {
    type: String,
    required: true
  },
  driverPhoneNumber: {
    type: String,
    required: true
  },
  cabNumber: {
    type: String,
    required: true
  },
  travelCompanions: {
    type: [String],
    default: []
  },
  feedbacks: {
    type: [
      {
        username: String,
        feedback: String
      }
    ],
    default: []
  },
  status: {
    type: String,
    enum: ['ongoing', 'completed'],
    default: 'ongoing'
  },
  reachedNearL:{
    type: Boolean,
    default: false
  },
  pickupLat: {
    type: Number,
    required: true
  },
  pickupLong: {
    type: Number,
    required: true
  },
  dropLat: {
    type: Number,
    required: true
  },
  dropLong: {
    type: Number,
    required: true
  },
  curLat: {
    type: Number,
    required: true
  },
  curLong: {
    type: Number,
    required: true
  }
});

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
