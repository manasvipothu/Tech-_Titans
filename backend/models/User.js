const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, default: 'Nutrify User' },
  healthTier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' },
  linkedAccounts: {
    swiggy: { type: Boolean, default: false },
    zomato: { type: Boolean, default: false },
    uberEats: { type: Boolean, default: false }
  },
  preferences: {
    notifications: { type: Boolean, default: true },
    themeAuto: { type: Boolean, default: true }
  },
  gamification: {
    streak: { type: Number, default: 0 },
    badges: [{ type: String }],
    points: { type: Number, default: 0 },
    activeChallenges: [{ type: String }]
  },
  community: {
    city: { type: String, default: 'Delhi' },
    college: { type: String, default: 'IIT Delhi' },
    rank: { type: Number, default: 42 }
  },
  insights: {
    habitDrift: { type: Number, default: 0 }, // -100 to 100
    triggerPrediction: { type: String, default: 'Low Risk' }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
