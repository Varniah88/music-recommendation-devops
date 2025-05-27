const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  dateOfBirth: Date,
  age: String,
  gender: String,
  bio: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  blocked: {
    type: Boolean,
    default: false  
  },
  spotify: {
    id: String,
    displayName: String,
    email: String,
    accessToken: String,
    refreshToken: String
  },
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('User', userSchema);
