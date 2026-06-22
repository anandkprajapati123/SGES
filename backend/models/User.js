const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  profilePicture: {
    type: String,
    default: function() {
      return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.name || 'User')}&backgroundColor=4f46e5,06b6d4,10b981,f59e0b`;
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
