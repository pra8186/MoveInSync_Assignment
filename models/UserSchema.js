const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  phoneNo:{
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: '{VALUE} is not a valid email',
    },
  },
  password: {
    type: String,
    required: true,
  },
  isTraveler:{
    type: Boolean,
    default: false 
  },
  isAdmin:{
    type: Boolean,
    default: false 
  },
  isCompanion:{
    type: Boolean,
    default: false 
  },
  notifications: {
    type: [String],
    default: []
  },
});

module.exports = mongoose.model('User', userSchema);
