/**
 * AI NightBite - Background Script
 */

const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; 
    }
    return Math.abs(hash);
};

const categorizeFood = (foodName) => {
    const name = foodName.toLowerCase();
    const seed = hashCode(name);
    
    // Core categorization logic
    const highRiskKeywords = ['pizza', 'burger', 'fries', 'cake', 'ice cream', 'coke', 'dessert', 'brownie', 'shake', 'biryani', 'roll', 'shawarma', 'pasta', 'momo', 'sandwich', 'fried', 'extra cheese', 'loaded', 'paneer', 'butter', 'masala', 'curry', 'oily', 'creamy', 'sugar', 'cheese', 'butter', 'ghee'];
    const healthyKeywords = ['salad', 'grilled', 'fruit', 'oats', 'soup', 'vegan', 'sprouts', 'juice', 'falafel', 'bowl', 'steamed', 'boiled', 'fresh', 'green', 'sprouting', 'organic', 'protein', 'low', 'boiled', 'diet', 'roasted'];
    
    const isUnhealthy = highRiskKeywords.some(kw => name.includes(kw));
    const isHealthy = healthyKeywords.some(kw => name.includes(kw));

    let riskScore, category, fat, sugar, cals;

    if (isUnhealthy) {
        category = 'High Risk';
        riskScore = (seed % 15) + 85; 
        fat = (seed % 15) + 25; 
        sugar = (seed % 20) + 15;
        cals = (seed % 300) + 600;
    } else if (isHealthy) {
        category = 'Healthy';
        riskScore = (seed % 10) + 10;
        fat = (seed % 5) + 2;
        sugar = (seed % 5) + 1;
        cals = (seed % 100) + 120;
    } else {
        category = 'Moderate';
        riskScore = (seed % 20) + 40;
        fat = (seed % 10) + 8;
        sugar = (seed % 10) + 5;
        cals = (seed % 200) + 300;
    }

    return { category, score: riskScore, fat, sugar, cals };
};

const generateMockData = () => {
    const data = [];
    const foodItems = ['Paneer Tikka Pizza', 'Oats Idli', 'Chocolate Shake', 'Greek Salad', 'Chicken Biryani', 'Veggie Burger', 'Fruit Bowl', 'French Fries', 'Grilled Chicken', 'Brownie with Ice Cream'];
    const now = new Date();
    
    // Generate 40 orders spanning all hours of the day
    for (let i = 0; i < 40; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const hour = Math.floor(Math.random() * 24); // Full 24 Hours
        const minutes = Math.floor(Math.random() * 60);

        const orderDate = new Date(now);
        orderDate.setDate(now.getDate() - daysAgo);
        orderDate.setHours(hour, minutes, 0, 0);

        const food = foodItems[Math.floor(Math.random() * foodItems.length)];
        const { category, score, fat, sugar, cals } = categorizeFood(food);

        data.push({ 
            id: Date.now() + i, 
            date: orderDate.toISOString(), 
            foodName: food, 
            category, 
            riskScore: score, 
            is_late_night: hour < 5 || hour > 21,
            fat, 
            sugar, 
            cals
        });
    }
    return data.sort((a, b) => new Date(a.date) - new Date(b.date));
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['nightbite_data'], (result) => {
        if (!result.nightbite_data || result.nightbite_data.length === 0) {
            chrome.storage.local.set({ nightbite_data: generateMockData() });
        }
    });
});

// Listener for logging and notifications
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    
    if (message.action === 'show_notification') {
        chrome.storage.local.get(['isNotificationsActive', 'isExtensionActive'], (res) => {
            if (res.isExtensionActive === false || res.isNotificationsActive === false) return;
            
            chrome.notifications.create('notif_' + Date.now(), {
                type: 'basic',
                iconUrl: 'icon.png', 
                title: message.title || 'Late-Night Snack Alert 🍟',
                message: message.body,
                priority: 2
            });
        });
        sendResponse({status: 'ok'});
        return true;
    }

    if (message.action === 'open_dashboard') {
        chrome.tabs.create({ url: 'http://localhost:5178/' });
        sendResponse({status: 'ok'});
        return true;
    }

    if (message.action === 'log_order') {
        chrome.storage.local.get(['isExtensionActive', 'nightbite_data'], (res) => {
            if (res.isExtensionActive === false) {
                sendResponse({ status: 'Ignored', reason: 'Extension disabled' });
                return;
            }

            const orderTime = new Date();
            const { category, score, fat, sugar, cals } = categorizeFood(message.foodName);
            const hour = orderTime.getHours();
            const newOrder = {
                id: Date.now(),
                date: orderTime.toISOString(),
                foodName: message.foodName,
                category,
                riskScore: score,
                is_late_night: hour < 5 || hour > 21,
                fat,
                sugar,
                cals
            };

            const existingData = res.nightbite_data || [];
            existingData.push(newOrder);
            chrome.storage.local.set({ nightbite_data: existingData }, () => {
                sendResponse({ status: 'Logged', order: newOrder });
            });
        });
        return true;
    }
});

// Data Sync Bridge for External Web Apps (base44.app / localhost)
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (message.action === 'GET_DATA') {
        chrome.storage.local.get(['nightbite_data', 'last_viewed_food'], (res) => {
            sendResponse({
                success: true,
                data: res.nightbite_data || [],
                lastScanned: res.last_viewed_food || null
            });
        });
        return true; 
    }
});
