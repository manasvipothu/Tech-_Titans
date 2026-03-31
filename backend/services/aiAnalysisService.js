const getClassification = (nut) => {
  if (!nut) return 'Moderate';
  if (nut.calories < 300 && nut.sugar < 10 && nut.fat < 10) return 'Healthy';
  if (nut.calories > 700 || nut.sugar > 30 || nut.fat > 25) return 'Unhealthy';
  return 'Moderate';
};

const calculateRiskScore = (order, history = []) => {
  let score = 0;
  const hour = new Date(order.timestamp).getHours();
  
  // Late night factor (10 PM - 4 AM)
  const isLateNight = hour >= 22 || hour < 4;
  if (isLateNight) score += 40;

  // Nutrition factor
  if (order.classification === 'Unhealthy') score += 30;
  if (order.classification === 'Moderate') score += 15;

  // Frequency factor (past 7 days)
  const last7Days = history.filter(h => (Date.now() - new Date(h.timestamp)) < 7 * 24 * 60 * 60 * 1000);
  const lateNightCount = last7Days.filter(h => h.isLateNight).length;
  score += Math.min(30, lateNightCount * 5);

  return Math.min(100, score);
};

const getAlternatives = (foodItem) => {
  const alts = {
    'pizza': ['Whole Wheat Wrap', 'Salad Bowl', 'Quinoa Bowl'],
    'burger': ['Grilled Chicken Salad', 'Veggie Bowl'],
    'fries': ['Baked Sweet Potato', 'Roasted Chickpeas'],
    'coke': ['Green Tea', 'Lemon Water', 'Kombucha']
  };
  const key = Object.keys(alts).find(k => foodItem.toLowerCase().includes(k));
  return alts[key] || ['Sprout Salad', 'Fruit Platter', 'Yogurt'];
};

const analyzeHabitDrift = (currentWeekHistory, previousWeekHistory) => {
  const currentLateNight = currentWeekHistory.filter(h => h.isLateNight).length;
  const previousLateNight = previousWeekHistory.filter(h => h.isLateNight).length;

  if (previousLateNight === 0) return currentLateNight > 0 ? 50 : 0;
  
  const drift = ((currentLateNight - previousLateNight) / previousLateNight) * 100;
  return Math.max(-100, Math.min(100, drift));
};

const predictTrigger = (history) => {
  const lateNightOrders = history.filter(h => h.isLateNight);
  if (lateNightOrders.length < 3) return 'Insufficient Data';

  const times = lateNightOrders.map(o => new Date(o.timestamp).getHours());
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

  if (avgTime >= 23 || avgTime < 1) return 'High Susceptibility (Midnight Craving)';
  if (avgTime >= 1 && avgTime < 3) return 'Extreme Risk (Insomnia Trigger)';
  
  return 'Moderate Risk (Post-Work Stress)';
};

module.exports = { getClassification, calculateRiskScore, getAlternatives, analyzeHabitDrift, predictTrigger };
