const axios = require('axios');
const nutritionService = require('./nutritionService');
const aiService = require('./aiAnalysisService');
const Order = require('../models/Order');

const NLP_SERVICE_URL = process.env.NLP_SERVICE_URL || 'http://127.0.0.1:8000';

/**
 * Sends text to the Python NLP microservice for intent classification and entity extraction.
 */
const parseWithNLPService = async (text, userContext = {}) => {
  try {
    const response = await axios.post(`${NLP_SERVICE_URL}/parse`, {
      text,
      user_context: userContext
    }, { timeout: 4000 });
    return response.data;
  } catch (error) {
    console.warn('NLP Microservice unreachable or timed out. Using fallback parser:', error.message);
    return fallbackNLPParser(text);
  }
};

/**
 * Fallback parser in case Python microservice is offline
 */
const fallbackNLPParser = (text) => {
  const low = text.toLowerCase();
  let intent = 'general_nutrition';

  const clean = low.replace(/[^a-z\s]/g, '').trim();
  const greetingWords = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings', 'namaste', 'hey there', 'hi there', 'hello there'];
  if (greetingWords.includes(clean) || clean.startsWith('hi ') || clean.startsWith('hello ') || clean.startsWith('hey ')) {
    intent = 'greeting';
  } else if (low.includes('calorie') || low.includes('kcal') || low.includes('how many cal')) {
    intent = 'calorie_lookup';
  } else if (low.includes('alternative') || low.includes('substitute') || low.includes('instead of') || low.includes('replace')) {
    intent = 'food_substitution';
  } else if (low.includes('recommend') || low.includes('suggest') || low.includes('what should i eat')) {
    intent = 'food_recommendation';
  } else if (low.includes('habit') || low.includes('crave') || low.includes('binge') || low.includes('balance') || low.includes('stop ordering')) {
    intent = 'habit_advice';
  } else if (low.includes('order') || low.includes('history') || low.includes('what did i eat') || low.includes('how often did i')) {
    intent = 'order_history';
  } else if (low.includes('nutrition') || low.includes('protein') || low.includes('sugar') || low.includes('fat') || low.includes('sodium')) {
    intent = 'nutrition_info';
  }

  // Detect simple food items
  const foods = [];
  const known = ['pizza', 'burger', 'salad', 'coke', 'fries', 'sprout', 'pasta', 'biryani'];
  for (const f of known) {
    if (low.includes(f)) {
      if (f === 'pizza') foods.push('Cheese Burst Pizza');
      else if (f === 'burger') foods.push('Zinger Burger');
      else if (f === 'salad') foods.push('Grilled Chicken Salad');
      else if (f === 'coke') foods.push('Coke');
      else if (f === 'sprout') foods.push('Sprout Salad');
      else if (f === 'fries') foods.push('French Fries');
      else foods.push(f.charAt(0).toUpperCase() + f.slice(1));
    }
  }

  return {
    intent,
    confidence: 0.60,
    all_scores: { [intent]: 0.60 },
    entities: {
      food_items: foods,
      foods_detailed: foods.map(name => ({ raw_text: name, matched_catalog_item: name, is_in_catalog: true, confidence: 0.8 })),
      quantity: (low.includes('two') || low.includes('2')) ? 2 : (low.includes('three') || low.includes('3') ? 3 : 1),
      meal_type: low.includes('dinner') ? 'dinner' : (low.includes('lunch') ? 'lunch' : (low.includes('breakfast') ? 'breakfast' : null)),
      time_reference: low.includes('last night') ? 'last night' : (low.includes('yesterday') ? 'yesterday' : (low.includes('this week') ? 'this week' : null)),
      nutrition_terms: []
    }
  };
};

/**
 * Dispatches to domain services based on NLP intent and entities.
 */
const processNLPQuery = async (message, userId = 'test_user_123') => {
  const nlpResult = await parseWithNLPService(message, { userId });
  const { intent, confidence, entities } = nlpResult;
  const food = entities.food_items && entities.food_items.length > 0 ? entities.food_items[0] : null;
  const quantity = entities.quantity || 1;

  let responseText = '';
  let structuredData = null;

  switch (intent) {
    case 'greeting': {
      responseText = "Hello! 👋 I'm your Nutrify AI assistant. I'm here to help you optimize your diet and mitigate late-night cravings. You can ask me:\n• 'How many calories are in a pizza?'\n• 'Suggest a healthier alternative to a burger.'\n• 'What did I eat most frequently this week?'\n• 'Give me a healthy dinner suggestion.'\n\nHow can I help you today?";
      structuredData = { type: 'greeting' };
      break;
    }

    case 'calorie_lookup': {
      if (food) {
        const nutData = await nutritionService.getNutritionData(food);
        const totalCal = nutData.calories * quantity;
        const qtyText = quantity > 1 ? ` (${quantity} portions × ${nutData.calories} kcal)` : '';
        responseText = `${food} contains approximately ${totalCal} kcal${qtyText}. Classified as ${nutData.type} (${nutData.junkRatio || 0}% junk ratio). ${nutData.hiddenIngredients || ''}`;
        structuredData = {
          food: nutData.name,
          quantity,
          calories_per_unit: nutData.calories,
          total_calories: totalCal,
          classification: nutData.type,
          macronutrients: {
            protein: nutData.protein || 'N/A',
            fat: nutData.fat || 'N/A',
            sugar: nutData.sugar || 'N/A'
          }
        };
      } else {
        responseText = "Which food item would you like a calorie lookup for? (e.g. 'How many calories are in a pizza or burger?')";
      }
      break;
    }

    case 'nutrition_info': {
      if (food) {
        const nutData = await nutritionService.getNutritionData(food);
        responseText = `Nutritional breakdown for ${food}:\n• Calories: ${nutData.calories} kcal\n• Protein: ${nutData.protein || '20g'}\n• Fat: ${nutData.fat || '30g'}\n• Sugar: ${nutData.sugar || '8g'}\n• Health Classification: ${nutData.type}\n• Note: ${nutData.hiddenIngredients || 'Standardized food item.'}`;
        structuredData = { food: nutData.name, nutrition: nutData };
      } else {
        responseText = "I can break down protein, fat, carbohydrates, and sugar for any food. Which item would you like to inspect?";
      }
      break;
    }

    case 'food_substitution': {
      const targetFood = food || 'Pizza';
      const alts = aiService.getAlternatives(targetFood);
      const originalNut = await nutritionService.getNutritionData(targetFood);
      const recommendedAlt = alts[0] || 'Sprout Salad';
      const altNut = await nutritionService.getNutritionData(recommendedAlt);

      const savedCalories = Math.max(0, originalNut.calories - altNut.calories);
      responseText = `Looking to replace ${targetFood}? Healthier alternatives:\n• ${alts.join(', ')}\n\n💡 Nutritional Comparison:\n${targetFood}: ${originalNut.calories} kcal (${originalNut.type})\n${recommendedAlt}: ${altNut.calories} kcal (${altNut.type})\nChoosing ${recommendedAlt} saves ${savedCalories} kcal and substantially lowers NCD risk!`;
      
      structuredData = {
        original: { name: originalNut.name, calories: originalNut.calories, type: originalNut.type },
        alternative: { name: altNut.name, calories: altNut.calories, type: altNut.type },
        calories_saved: savedCalories,
        all_alternatives: alts
      };
      break;
    }

    case 'food_recommendation': {
      const healthyItems = nutritionService.getAllFoodItems().filter(i => i.type === 'Healthy');
      const meal = entities.meal_type || 'meal';
      if (healthyItems.length > 0) {
        const item1 = healthyItems[0];
        const item2 = healthyItems[1] || healthyItems[0];
        responseText = `Here are clean, high-nutrition recommendations for your ${meal}:\n1. ${item1.name} (~${item1.calories} kcal, ${item1.protein} protein) - ${item1.hiddenIngredients}\n2. ${item2.name} (~${item2.calories} kcal, ${item2.protein} protein) - High enzyme and fiber content.\nBoth keep you in the Healthy Green zone!`;
        structuredData = { recommended_items: healthyItems.map(h => ({ name: h.name, calories: h.calories, protein: h.protein })) };
      } else {
        responseText = `For a healthy ${meal}, I recommend a high-protein bowl, sprout salad, or grilled chicken salad with lemon dressing to avoid blood sugar spikes.`;
      }
      break;
    }

    case 'habit_advice': {
      const qtyText = quantity > 1 ? `${quantity} servings of ` : '';
      const foodMentioned = food ? `after having ${qtyText}${food}` : 'to balance your diet';
      responseText = `Here is your personalized habit guidance ${foodMentioned}:\n1. Drink 500ml of water right now to reduce cellular dehydration and false hunger cues.\n2. Prioritize high-fiber and lean protein in your next meal to stabilize blood sugar.\n3. Late-Night Rule: The danger window is 10 PM - 4 AM. If midnight cravings strike, swap high-glycemic carbs for Greek yogurt or herbal tea.\n4. Remember: One cheat meal does not define your progress—consistency over the next 48 hours resets your habit drift!`;
      structuredData = {
        category: 'behavioral_intervention',
        action_steps: ['Hydrate with 500ml water', 'Focus on fiber/protein in next meal', 'Enforce 10 PM guardian shield']
      };
      break;
    }

    case 'order_history': {
      // Connect to MongoDB Order collection
      try {
        const orders = await Order.find({ userId }).sort({ timestamp: -1 });
        const timeRef = entities.time_reference || 'this week';

        // Filter by time reference
        let filteredOrders = orders;
        const now = Date.now();
        if (timeRef.includes('today') || timeRef.includes('earlier')) {
          filteredOrders = orders.filter(o => (now - new Date(o.timestamp)) < 24 * 60 * 60 * 1000);
        } else if (timeRef.includes('yesterday') || timeRef.includes('last night')) {
          filteredOrders = orders.filter(o => {
            const diff = now - new Date(o.timestamp);
            return diff >= 12 * 60 * 60 * 1000 && diff <= 48 * 60 * 60 * 1000;
          });
        } else {
          // Default to past 7 days / this week
          filteredOrders = orders.filter(o => (now - new Date(o.timestamp)) < 7 * 24 * 60 * 60 * 1000);
        }

        const totalOrders = filteredOrders.length;
        const lateNightOrders = filteredOrders.filter(o => o.isLateNight).length;
        const unhealthyOrders = filteredOrders.filter(o => o.classification === 'Unhealthy' || o.foodType === 'Unhealthy').length;

        // Count most frequent food
        const freqMap = {};
        filteredOrders.forEach(o => { freqMap[o.foodItem] = (freqMap[o.foodItem] || 0) + 1; });
        let topFood = 'None recorded';
        let maxCount = 0;
        for (const [item, count] of Object.entries(freqMap)) {
          if (count > maxCount) { topFood = item; maxCount = count; }
        }

        if (totalOrders > 0) {
          responseText = `Order History Summary (${timeRef}):\n• Total orders recorded: ${totalOrders}\n• Late-night orders (10 PM - 4 AM): ${lateNightOrders}\n• High-risk junk meals: ${unhealthyOrders}\n• Most frequent order: ${topFood} (${maxCount} times)\n${lateNightOrders > 1 ? '⚠️ Warning: Frequent late-night orders detected. Activate Guardian Shield in the app to prevent habit drift!' : '✅ Good job! Your recent ordering pattern shows low late-night activity.'}`;
        } else {
          responseText = `I checked your order logs for ${timeRef}. No orders are currently recorded in this timeframe for your account. You can log meals from the Home or Plate tab!`;
        }

        structuredData = {
          time_frame: timeRef,
          total_orders: totalOrders,
          late_night_count: lateNightOrders,
          unhealthy_count: unhealthyOrders,
          most_frequent_food: topFood,
          recent_items: filteredOrders.slice(0, 5).map(o => ({ food: o.foodItem, time: o.timestamp, risk: o.riskScore }))
        };
      } catch (dbErr) {
        console.error('Order history query failed:', dbErr);
        responseText = `I attempted to retrieve your order history for ${entities.time_reference || 'this week'}, but the database query could not be completed at this moment.`;
      }
      break;
    }

    case 'general_nutrition': {
      const low = message.toLowerCase();
      if (low.includes('water') || low.includes('hydration')) {
        responseText = "Optimal daily hydration is typically 2.5 to 3.5 liters for adults. Drinking 500ml of water before meals can curb appetite by up to 13% and helps prevent late-night dehydration headaches that feel like hunger.";
      } else if (low.includes('protein')) {
        responseText = "Protein provides essential amino acids necessary for muscle repair, enzyme production, and satiety. Eating 1.2g - 1.6g of protein per kg of body weight minimizes cravings and supports metabolic health.";
      } else if (low.includes('trans fat') || low.includes('saturated')) {
        responseText = "Trans fats (often in hydrogenated oils and deep-fried fast foods) raise LDL ('bad') cholesterol, lower HDL ('good') cholesterol, and increase vascular inflammation and cardiovascular NCD risk.";
      } else if (low.includes('metabolism') || low.includes('late night')) {
        responseText = "Digestion and insulin sensitivity naturally drop after 10 PM as the body releases melatonin. High-carb, high-fat foods eaten late at night stay in the digestive tract longer and are preferentially stored as visceral fat.";
      } else {
        responseText = "Nutrify AI Nutrition Science Insight: Focusing on whole foods, unrefined carbohydrates, and consistent meal timing is the most reliable strategy to prevent metabolic syndrome and non-communicable diseases (NCDs).";
      }
      structuredData = { topic: 'educational_nutrition' };
      break;
    }

    case 'unsupported':
    default: {
      responseText = "I specialize specifically in nutrition science, food calorie lookups, healthy substitutions, and late-night eating habit mitigation. Try asking:\n• 'How many calories are in a pizza?'\n• 'Suggest a healthier alternative to a burger.'\n• 'How often did I order junk food this week?'";
      break;
    }
  }

  return {
    intent,
    confidence,
    entities: {
      food: entities.food_items,
      quantity: entities.quantity,
      meal_type: entities.meal_type,
      time_reference: entities.time_reference,
      nutrition_terms: entities.nutrition_terms
    },
    response: responseText,
    data: structuredData
  };
};

module.exports = {
  parseWithNLPService,
  fallbackNLPParser,
  processNLPQuery
};
