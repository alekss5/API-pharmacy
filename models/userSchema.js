const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastName: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },

  joinedDate: {
    type: Date,
    required: true,
    default: Date.now(),
  },

  email: { type: String, required: true, unique: true},
  password: { type: String, required: true }, 

});

const User = mongoose.model('User', userSchema);
module.exports = User;
