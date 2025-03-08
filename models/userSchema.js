const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number, required: true },
  salary: { type: Number, required: true },
  jobSector: { type: String, required: true },
  passTheSetup: { type: Boolean, default: false },

  isPremium: { type: Boolean, default: false },
  isUsedTheTrial: { type: Boolean, default: false },
  premiumExpiresAt: { type: Date, default: null },
  premiumAutoRenew: { type: Boolean, default: false },
  subscriptionType: { type: String, enum: ['year', 'month','none'], default: 'none' },

  joinedDate: {
    type: Date,
    required: true,
    default: Date.now(),
  },

  email: { type: String, required: true, unique: true},
  password: { type: String, required: true }, 

  stripeCustomerId: { type: String, default: null },
  stripeSubscriptionId: { type: String },

});

const User = mongoose.model('User', userSchema);
module.exports = User;
