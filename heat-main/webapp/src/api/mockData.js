/**
 * AI NightBite - Mock Data Engine
 * Provides structured historical data for the dashboard demo.
 */

const FOODS = [
    { name: "Double Cheese Pizza", category: "High Risk", baseScore: 88, cals: 850 },
    { name: "Zinger Burger", category: "High Risk", baseScore: 82, cals: 650 },
    { name: "Garden Salad", category: "Healthy", baseScore: 12, cals: 180 },
    { name: "Grilled Chicken Wrap", category: "Moderate", baseScore: 45, cals: 380 },
    { name: "Chocolate Brownie", category: "High Risk", baseScore: 92, cals: 450 },
    { name: "Quinoa Bowl", category: "Healthy", baseScore: 15, cals: 220 },
    { name: "Paneer Tikka Roll", category: "Moderate", baseScore: 55, cals: 420 },
    { name: "French Fries", category: "High Risk", baseScore: 85, cals: 500 },
    { name: "Moong Dal Khichdi", category: "Healthy", baseScore: 10, cals: 250 },
    { name: "Oreo Milkshake", category: "High Risk", baseScore: 89, cals: 600 }
];

export const generateMockHistory = (days = 91) => {
    const history = [];
    const now = new Date();

    for (let i = 0; i < days; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Randomly decide if there's an order (80% chance)
        if (Math.random() > 0.2) {
            const food = FOODS[Math.floor(Math.random() * FOODS.length)];
            // Add some variance to the score
            const variance = Math.floor(Math.random() * 10) - 5;
            
            // Set time to be late night (10 PM to 3 AM)
            const hour = Math.random() > 0.5 ? (22 + Math.floor(Math.random() * 2)) : Math.floor(Math.random() * 4);
            date.setHours(hour, Math.floor(Math.random() * 60));

            history.push({
                id: `mock-${i}`,
                foodName: food.name,
                category: food.category,
                riskScore: Math.min(100, Math.max(0, food.baseScore + variance)),
                cals: food.cals,
                date: date.toISOString()
            });
        }
    }
    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const mockHistory = generateMockHistory();

export default mockHistory;
