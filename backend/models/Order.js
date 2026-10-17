const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  foodItem: { type: String, required: true },
  nutrition: {
    calories: Number,
    sugar: mongoose.Schema.Types.Mixed,
    fat: mongoose.Schema.Types.Mixed,
    protein: mongoose.Schema.Types.Mixed
  },
  timestamp: { type: Date, default: Date.now },
  isLateNight: { type: Boolean, default: false },
  healthScore: Number,
  riskScore: Number,
  classification: { type: String, enum: ['Healthy', 'Moderate', 'Unhealthy'] }
});

module.exports = mongoose.model('Order', OrderSchema);
