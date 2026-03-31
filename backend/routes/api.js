const express = require('express');
const router = express.Router();
const nutritionService = require('../services/nutritionService');
const aiService = require('../services/aiAnalysisService');
const Order = require('../models/Order');
const User = require('../models/User');

router.post('/add-order', async (req, res) => {
  const { userId, foodItem } = req.body;
  const now = new Date();
  const hour = now.getHours();
  const isLateNight = hour >= 22 || hour < 4;

  const nutrition = await nutritionService.getNutritionData(foodItem);
  const classification = aiService.getClassification(nutrition);

  // Fetch history for risk score
  let history = [];
  try {
    history = await Order.find({ userId });
  } catch (e) {
    console.warn('DB Find failed, using empty history');
  }
  
  const riskScore = aiService.calculateRiskScore({ timestamp: now, classification, isLateNight }, history);

  const order = new Order({
    userId,
    foodItem,
    nutrition,
    isLateNight,
    classification,
    riskScore,
    timestamp: now
  });

  try {
    await order.save();
  } catch (e) {
    console.warn('DB Save failed, order not persisted');
  }
  
  res.json({
    success: true,
    order,
    alert: (isLateNight && classification === 'Unhealthy') ? "High Risk Late-Night Order Detected!" : null,
    alternatives: aiService.getAlternatives(foodItem)
  });
});

router.get('/get-heatmap', async (req, res) => {
  const { userId } = req.query;
  let orders = [];
  try {
    orders = await Order.find({ userId });
  } catch (e) {
    console.warn('DB Find failed for heatmap, returning empty');
  }
  
  // Group by date for heatmap (simulating GitHub 7x5 or similar)
  const heatmap = {};
  orders.forEach(o => {
    const date = o.timestamp.toISOString().split('T')[0];
    if (!heatmap[date]) heatmap[date] = { count: 0, health: 0 };
    heatmap[date].count++;
    heatmap[date].health += o.classification === 'Healthy' ? 1 : (o.classification === 'Moderate' ? 0 : -1);
  });

  res.json(heatmap);
});

router.get('/get-risk-score', async (req, res) => {
  const { userId } = req.query;
  try {
    const lastOrder = await Order.findOne({ userId }).sort({ timestamp: -1 });
    res.json({ riskScore: lastOrder ? lastOrder.riskScore : 0 });
  } catch (e) {
    console.warn('DB Find failed for risk score, returning 0');
    res.json({ riskScore: 0 });
  }
});

router.get('/get-profile', async (req, res) => {
  const { userId } = req.query;
  try {
    let user = await User.findOne({ userId });
    if (!user) {
      user = new User({ userId, name: 'Manasvi Pothu', healthTier: 'Bronze' });
      await user.save();
    }
    res.json(user);
  } catch (e) {
    console.warn('DB Fetch profile failed, returning mock user');
    res.json({
      userId,
      name: 'Manasvi Pothu',
      healthTier: 'Bronze',
      linkedAccounts: { swiggy: false, zomato: false, uberEats: false },
      insights: { habitDrift: 15, triggerPrediction: 'High Susceptibility (Midnight Craving)' }
    });
  }
});

router.post('/link-account', async (req, res) => {
  const { userId, appName } = req.body;
  try {
    const update = {};
    update[`linkedAccounts.${appName.toLowerCase()}`] = true;
    const user = await User.findOneAndUpdate({ userId }, { $set: update }, { new: true });
    res.json({ success: true, user });
  } catch (e) {
    console.warn('DB Link account failed, returning mock success');
    res.json({ success: true, message: 'Simulated linking success' });
  }
});

router.get('/get-behavioral-insights', async (req, res) => {
  const { userId } = req.query;
  try {
    const history = await Order.find({ userId });
    const now = Date.now();
    const currentWeek = history.filter(h => (now - new Date(h.timestamp)) < 7 * 24 * 60 * 60 * 1000);
    const previousWeek = history.filter(h => {
      const diff = now - new Date(h.timestamp);
      return diff >= 7 * 24 * 60 * 60 * 1000 && diff < 14 * 24 * 60 * 60 * 1000;
    });

    const drift = aiService.analyzeHabitDrift(currentWeek, previousWeek);
    const trigger = aiService.predictTrigger(history);

    res.json({ habitDrift: drift, triggerPrediction: trigger });
  } catch (e) {
    console.warn('DB Insights fetch failed, returning mock insights');
    res.json({ habitDrift: 15, triggerPrediction: 'Moderate Risk (Post-Work Stress)' });
  }
});

// --- v2.0 NEW ENDPOINTS ---

router.get('/get-home-data', async (req, res) => {
  const { userId } = req.query;
  res.json({
    welcomeMessage: "Welcome back, Manasvi!",
    summary: { riskScore: 24, calories: 1850, junkItems: 2 },
    recentActivity: ["Ordered Salad @ 8 PM", "Viewed Pizza @ 11 PM"],
    suggestion: "Try a high-protein bowl tonight to stay in the green zone."
  });
});

router.get('/get-heatmap', async (req, res) => {
  const { userId } = req.query;
  try {
    const orders = await Order.find({ userId }).sort({ timestamp: -1 });
    const heatmap = {};
    orders.forEach(o => {
      const date = new Date(o.timestamp).toISOString().split('T')[0];
      if (!heatmap[date]) heatmap[date] = { count: 0, health: 0 };
      heatmap[date].count += 1;
      heatmap[date].health += o.foodType === 'Healthy' ? 1 : (o.foodType === 'Unhealthy' ? -1 : 0);
    });
    res.json({ heatmap, rawLogs: orders.slice(0, 10) }); // Top 10 recent orders as raw data
  } catch (e) {
    console.warn('DB Heatmap fetch failed, returning empty');
    res.json({ heatmap: {}, rawLogs: [] });
  }
});

router.get('/get-all-food', (req, res) => {
  res.json(nutritionService.getAllFoodItems());
});

router.post('/create-goal', async (req, res) => {
  const { userId, goalTitle } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { userId }, 
      { $addToSet: { 'gamification.activeChallenges': goalTitle } }, 
      { new: true }
    );
    res.json({ success: true, user });
  } catch (e) {
    res.json({ success: true, message: "Simulated goal creation success" });
  }
});

router.post('/ai-chat', async (req, res) => {
  const { message } = req.body;
  const responses = [
    "Based on your profile, you should avoid the Burger now. Try a Greek Yogurt instead.",
    "Your late-night risk is high today. I suggest drinking 500ml of water first.",
    "Great choice on the Sprout Salad! That matches your Silver tier goals."
  ];
  res.json({ response: responses[Math.floor(Math.random() * responses.length)] });
});

router.get('/get-community', async (req, res) => {
  res.json({
    cityRank: 42,
    collegeTrends: { topFood: "Maggi", healthyRatio: "35%" },
    globalComparison: "You are healthier than 78% of Delhi users."
  });
});

module.exports = router;
