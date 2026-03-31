const mongoose = require('mongoose');

const FoodCacheSchema = new mongoose.Schema({
  queryName: { type: String, required: true, unique: true },
  matchedName: { type: String },
  nutrition: {
    calories: Number,
    sugar: Number,
    fat: Number,
    protein: Number
  },
  sources: [String],
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FoodCache', FoodCacheSchema);
