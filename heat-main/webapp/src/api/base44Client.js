export const base44 = {
    entities: {
        FoodOrder: {
            list: async () => [], // Mocks for now
            create: async (data) => data,
            delete: async (id) => true
        },
        Challenge: {
            list: async () => [],
            create: async (data) => data
        }
    },
    auth: {
        me: async () => ({ id: "1", name: "Guest User", role: "user" }),
        updateMe: async (data) => data
    },
    integrations: {
        Core: {
            InvokeLLM: async (prompt) => {
                // Mock LLM response block
                return {
                    risk_score: 85,
                    category: "High Risk",
                    healthier_alternative: "Grilled Chicken Salad",
                    ai_analysis: "High calorie density late at night increases risk of metabolic syndrome."
                };
            }
        }
    }
};

export default base44;
