const Fuse = require('fuse.js');

const MOCK_FOOD_DATA = [
  { 
    name: 'Cheese Burst Pizza', 
    calories: 850, 
    type: 'Unhealthy', 
    junkRatio: 85, 
    healthyRatio: 15,
    fat: '45g', 
    sugar: '8g', 
    protein: '25g',
    image: 'https://img.icons8.com/color/96/pizza.png',
    hiddenIngredients: "High sodium levels (over 1500mg), refined wheat flour which causes insulin spikes, and trans-fats from processed cheese analogues.",
    breakdown: { carbs: '60%', fat: '30%', protein: '10%' }
  },
  { 
    name: 'Zinger Burger', 
    calories: 600, 
    type: 'Moderate', 
    junkRatio: 65, 
    healthyRatio: 35,
    fat: '30g', 
    sugar: '12g', 
    protein: '20g',
    image: 'https://img.icons8.com/color/96/hamburger.png',
    hiddenIngredients: "Preservatives in the bun, high fructose corn syrup in the sauce, and acrylamides from deep-frying the patty.",
    breakdown: { carbs: '50%', fat: '35%', protein: '15%' }
  },
  { 
    name: 'Grilled Chicken Salad', 
    calories: 250, 
    type: 'Healthy', 
    junkRatio: 10, 
    healthyRatio: 90,
    fat: '8g', 
    sugar: '4g', 
    protein: '35g',
    image: 'https://img.icons8.com/color/96/salad.png',
    hiddenIngredients: "Hidden sugars in the dressing (if preserved), but otherwise rich in micronutrients and lean protein.",
    breakdown: { carbs: '20%', fat: '20%', protein: '60%' }
  },
  { 
    name: 'Coke', 
    calories: 210, 
    type: 'Unhealthy', 
    junkRatio: 100, 
    healthyRatio: 0,
    fat: '0g', 
    sugar: '55g', 
    protein: '0g',
    image: 'https://img.icons8.com/color/96/cola.png',
    hiddenIngredients: "Phosphoric acid which leeches calcium from bones, and excessive high-fructose corn syrup leading to fatty liver risk.",
    breakdown: { carbs: '100%', fat: '0%', protein: '0%' }
  },
  { 
    name: 'Sprout Salad', 
    calories: 150, 
    type: 'Healthy', 
    junkRatio: 5, 
    healthyRatio: 95,
    fat: '2g', 
    sugar: '3g', 
    protein: '12g',
    image: 'https://img.icons8.com/color/96/sprouts.png',
    hiddenIngredients: "Nil. Naturally nutrient-dense with high bio-available enzymes and fiber.",
    breakdown: { carbs: '40%', fat: '10%', protein: '50%' }
  }
];

const fuse = new Fuse(MOCK_FOOD_DATA, { keys: ['name'], threshold: 0.4 });

const getNutritionData = async (foodItem) => {
  const result = fuse.search(foodItem);
  if (result.length > 0) return result[0].item;
  
  return { 
    name: foodItem, 
    calories: 300, 
    type: 'Moderate', 
    junkRatio: 50, 
    healthyRatio: 50,
    hiddenIngredients: "Data unavailable for this specific item, but standardized processed foods often contain emulsifiers and salt.",
    image: 'https://img.icons8.com/color/96/food.png'
  };
};

const getAllFoodItems = () => MOCK_FOOD_DATA;

module.exports = { getNutritionData, getAllFoodItems };
