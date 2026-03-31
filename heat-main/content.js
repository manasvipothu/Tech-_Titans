/**
 * AI NightBite - Content Script
 * Hardened Universal Scanner v4.5
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

    let riskScore, category, fat, sugar, cals, msg, rec;

    if (isUnhealthy) {
        category = 'High Risk';
        riskScore = (seed % 15) + 85; 
        fat = (seed % 15) + 25; 
        sugar = (seed % 20) + 15;
        cals = (seed % 300) + 600;
        msg = 'High risk detected. Late-night heavy meals spike insulin and disrupt circadian rhythms.';
        rec = `Grilled Veggie ${name.includes('pizza') ? 'Pizza' : 'Sandwich'}`;
    } else if (isHealthy) {
        category = 'Healthy';
        riskScore = (seed % 10) + 10;
        fat = (seed % 5) + 2;
        sugar = (seed % 5) + 1;
        cals = (seed % 100) + 120;
        msg = 'Safe choice. Nutrient-dense item with low glycemic impact. Ideal for late-night satiety.';
        rec = 'Pair with a small Greek yogurt.';
    } else {
        category = 'Moderate';
        riskScore = (seed % 20) + 40;
        fat = (seed % 10) + 8;
        sugar = (seed % 10) + 5;
        cals = (seed % 200) + 300;
        msg = 'Moderate impact on metabolic health. Ensure portion control and stay hydrated.';
        rec = 'Try a half-portion if ordering after 11 PM.';
    }

    return { 
        category, score: riskScore, riskMsg: msg, suggestion: `AI Recommendation: ${rec}`, altFood: rec,
        fat: `~${fat}g`, sugar: `~${sugar}g`, cals: `~${cals} kcal`
    };
};

let lastScannedElement = null;
let scanTimer = null;

const attachHoverListener = () => {
    // High-performance move tracking
    document.addEventListener('mousemove', (e) => {
        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (!target || target === lastScannedElement) return;
        
        // Skip extension UI
        if (target.closest('#nb-health-bar') || target.closest('#nb-hover-tooltip') || target.closest('#nightbite-warning-overlay') || target.closest('#nb-chatbot-container')) {
            if (target.closest('#nb-chatbot-container') || target.closest('#nb-health-bar')) {
                const tooltip = document.getElementById('nb-hover-tooltip');
                if (tooltip) tooltip.remove();
            }
            return;
        }

        lastScannedElement = target;
        
        // 1. HARD ZONE FILTER: Skip UI chrome
        if (target.closest('nav, header, footer, aside, [class*="navigation"], [class*="sidebar"], [class*="menu-bar"], [class*="filter"]')) {
            const tooltip = document.getElementById('nb-hover-tooltip');
            if (tooltip) tooltip.remove();
            return;
        }

        const foodWhitelist = [
            'pizza', 'burg', 'piza', 'roll', 'shawarma', 'pasta', 'momo', 'sandwich', 'salad', 'biryani', 'curry', 'tikka', 'kebab',
            'paneer', 'chicken', 'roti', 'rice', 'dal', 'soup', 'bowl', 'thali', 'platter', 'tiffin', 'meal', 'dessert', 'cake', 'ice cream',
            'shake', 'juice', 'smoothie', 'dosa', 'idli', 'vada', 'pulao', 'gravy', 'masala', 'fry', 'oats', 'omelette', 'egg', 'fish', 'meat',
            'noodle', 'manchurian', 'fried', 'baked', 'grilled', 'steamed', 'tandoori', 'kofta', 'korma', 'naan', 'paratha', 'kulcha', 'pav', 
            'vada pav', 'misal', 'chaat', 'pani puri', 'samosa', 'pakora', 'bhaji', 'upma', 'poha', 'pancake', 'waffle', 'brownie', 'donut', 
            'pastry', 'cookie', 'milkshake', 'lassi', 'coffee', 'tea', 'chai', 'wrap', 'taco', 'burrito', 'nachos', 'pasta', 'lasagna'
        ];

        // 2. DIRECT TARGET CHECK: Must be an image OR contain a food word directly
        const targetText = (target.innerText || "").trim().split('\n')[0].toLowerCase();
        const isImage = target.tagName === 'IMG';
        const isFoodAtMouse = foodWhitelist.some(word => targetText.includes(word));

        if (!isImage && !isFoodAtMouse) {
            const tooltip = document.getElementById('nb-hover-tooltip');
            if (tooltip) tooltip.remove();
            return; 
        }
        
        let text = "";
        let current = target;
        let depth = 0;

        // 3. IDENTIFICATION: Bubble up to find the full dish name if we hit an image or partial text
        while (current && depth < 8) {
            const raw = (
                current.innerText || 
                current.getAttribute('aria-label') || 
                current.title || 
                current.alt || ""
            ).trim();

            if (raw) {
                const lines = raw.split('\n');
                const firstLine = lines[0].trim();
                const lowerLine = firstLine.toLowerCase();
                
                const isKnownDish = foodWhitelist.some(word => lowerLine.includes(word));
                if (isKnownDish && firstLine.length > 3 && firstLine.length < 50) {
                    text = firstLine;
                    break;
                }
            }
            current = current.parentElement;
            depth++;
        }

        if (text && text.length > 2) {
            showHoverTooltip(target, text, e.clientX, e.clientY);
        } else {
            const tooltip = document.getElementById('nb-hover-tooltip');
            if (tooltip) tooltip.remove();
        }
    });

    // Global clean up on scroll
    window.addEventListener('scroll', () => {
        const tooltip = document.getElementById('nb-hover-tooltip');
        if (tooltip) tooltip.remove();
        lastScannedElement = null;
    }, { passive: true });
};

const showHoverTooltip = (element, foodName, mX, mY) => {
    let tooltip = document.getElementById('nb-hover-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'nb-hover-tooltip';
        document.body.appendChild(tooltip);
    }
    
    const data = categorizeFood(foodName);
    let color = data.category === 'High Risk' ? '#dc2626' : (data.category === 'Healthy' ? '#166534' : '#d97706');
    let accent = data.category === 'High Risk' ? '#fee2e2' : (data.category === 'Healthy' ? '#f0fdf4' : '#fff7ed');

    tooltip.style.cssText = `
        position: fixed;
        top: ${mY - 20}px;
        left: ${mX}px;
        transform: translate(-50%, -100%);
        background: #ffffff;
        color: #0c0a09;
        padding: 16px;
        border-radius: 12px;
        border: 2px solid ${color};
        box-shadow: 0 40px 80px -15px rgba(0,0,0,0.4);
        z-index: 2147483647;
        font-family: 'Outfit', 'Inter', sans-serif;
        width: 270px;
        pointer-events: none;
        display: block !important;
        animation: tooltipFloat 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        transition: top 0.1s ease-out, left 0.1s ease-out;
    `;

    tooltip.innerHTML = `
        <div style="font-size: 10px; font-weight: 800; color: ${color}; text-transform: uppercase; margin-bottom: 6px; display:flex; justify-content:space-between; align-items:center;">
            <mark style="background:${accent}; color:${color}; border-radius:4px; padding:2px 6px; border:1px solid ${color}40;">HEALTH SCAN</mark>
            <span style="font-size:14px;">${data.category === 'High Risk' ? '🚨' : (data.category === 'Healthy' ? '✅' : '⚖️')}</span>
        </div>
        <div style="font-size: 18px; font-weight: 800; color: #000; margin-bottom: 12px; line-height: 1.1; letter-spacing: -0.3px;">
            ${foodName}
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; background: #fafaf9; padding: 10px; border-radius: 10px; border: 1px solid #e7e5e4;">
            <div style="text-align: center;">
                <div style="font-size: 8px; color: #78716c; font-weight: 700;">FAT</div>
                <div style="font-size: 13px; font-weight: 800; color: #1c1917;">${data.fat}</div>
            </div>
            <div style="text-align: center; border-left: 1px solid #e7e5e4; border-right: 1px solid #e7e5e4;">
                <div style="font-size: 8px; color: #78716c; font-weight: 700;">SUGAR</div>
                <div style="font-size: 13px; font-weight: 800; color: #1c1917;">${data.sugar}</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 8px; color: #78716c; font-weight: 700;">ENERGY</div>
                <div style="font-size: 13px; font-weight: 800; color: #1c1917;">${data.cals}</div>
            </div>
        </div>
        <div style="font-size: 11px; color:#57534e; margin-bottom: 12px; line-height: 1.5; font-weight: 500;">
            ${data.riskMsg}
        </div>
        <div style="background: #171717; color: #ffffff; padding: 10px; border-radius: 8px; font-size: 11px; font-weight: 700; border: 1px solid #262626; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            💡 AI: ${data.suggestion}
        </div>
        <style>
            @keyframes tooltipFloat {
                from { opacity: 0; transform: translate(-50%, -90%) scale(0.96); }
                to { opacity: 1; transform: translate(-50%, -100%) scale(1); }
            }
        </style>
    `;
};



function injectChatbot() {
    if (document.getElementById('nb-chatbot-container')) return;

    const DISEASE_ADVICE_MAP = {
        'heart': {
            avoid: 'High saturated fats (Burgers, Fries, Ghee-rich curries, Heavy Cheese).',
            caution: 'Limit extra salt (Sodium) to reduce vascular pressure.',
            precaution: 'Focus on high-fiber items, grilled lean proteins, and omega-3 rich foods like seeds/walnuts.',
            safe_menu: ['🥗 Grilled Chicken Salad', '🥗 Walnut & Spinach Bowl', '🥣 Oats with Berries', '🥕 Hummus with Carrots', '🥦 Steamed Vegetable Platter']
        },
        'bp': {
            avoid: 'Highly processed salty snacks, caffeine, and heavy deep-fried items.',
            caution: 'For Low BP, ensure consistent hydration and balanced electrolytes.',
            precaution: 'Opt for light, nutrient-dense meals like Moong Dal Chilla or Sprouts.',
            safe_menu: ['🥛 Salted Buttermilk (Electrolytes)', '🥜 Handful of Salted Peanuts', '🥣 Vegetable Broth / Soup', '🥚 Boiled Egg Whites (with salt)', '🥤 Pomegranate Juice']
        },
        'fever': {
            avoid: 'Heavy dairy, oily food, cold items, and spicy dishes.',
            caution: 'Avoid "Heavy" digestion loads late at night.',
            precaution: 'Stick to Clear Soups, Khichdi, Coconut Water, and boiled light vegetables.',
            safe_menu: ['🥣 Clear Tomato Soup', '🥥 Fresh Coconut Water', '🍚 Plain Khichdi (Less spice)', '🥤 Rice Water (Kanji)', '🥦 Boiled Sprouts (Steamed)']
        },
        'dvt': {
            avoid: 'High-fat foods that increase inflammatory markers.',
            caution: 'Avoid excessive Vitamin K if on specific blood thinners (consult doctor).',
            precaution: 'Increase anti-inflammatory foods like berries, leafy greens, and fatty fish.',
            safe_menu: ['🥛 Turmeric Spiced Milk', '🍓 Berry Smoothie Bowl', '🐟 Grilled Fatty Fish (Omega-3)', '🥦 Garlic-sautéed Greens', '🍫 Dark Chocolate (Small portion)']
        }
    };

    const HEALTHY_15 = [
        "1. Grilled Lemon Chicken", "2. Paneer Tikka (Less Oil)", "3. Moong Dal Khichdi", "4. Steamed Momos (Veg/Chicken)",
        "5. Clear Vegetable Soup", "6. Sprouted Bean Salad", "7. Greek Yogurt with Walnuts", "8. Boiled Egg White Bowl",
        "9. Quinoa Vegetable Pulao", "10. Roasted Makhana (Foxnuts)", "11. Hummus with Cucumber", "12. Masala Oats (Low salt)",
        "13. Sautéed Broccoli & Tofu", "14. Baked Sweet Potato", "15. Fresh Fruit Medley (Low GI)"
    ];

    const container = document.createElement('div');
    container.id = 'nb-chatbot-container';
    
    const style = document.createElement('style');
    style.innerHTML = `
        #nb-chatbot-container { position: fixed; bottom: 24px; right: 24px; z-index: 2147483647; font-family: 'Outfit', 'Inter', sans-serif; display: flex; flex-direction: column; align-items: flex-end; }
        #nb-chatbot-bubble { width: 60px; height: 60px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; cursor: pointer; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4); transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1); animation: nbBubbleFloat 3s ease-in-out infinite; }
        #nb-chatbot-bubble-badge { position:absolute; top:-4px; right:-4px; background:#ef4444; color:white; font-size:10px; font-weight:800; padding:4px 8px; border-radius:10px; border:2px solid white; display:none; }
        #nb-chatbot-window { width: 350px; height: 500px; background: #ffffff; border-radius: 20px; margin-bottom: 16px; box-shadow: 0 40px 80px -15px rgba(0,0,0,0.3); display: none; flex-direction: column; overflow: hidden; border: 1px solid #e2e8f0; transform-origin: bottom right; animation: nbWindowIn 0.4s cubic-bezier(0.19, 1, 0.22, 1); }
        #nb-chatbot-header { background: #0c0c0e; padding: 18px 24px; color: #fff; display: flex; align-items: center; justify-content: space-between; }
        #nb-chatbot-messages { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: #f8fafc; }
        .nb-msg { max-width: 80%; padding: 10px 14px; border-radius: 14px; font-size: 13px; line-height: 1.5; word-wrap: break-word; }
        .nb-msg-user { align-self: flex-end; background: #10b981; color: white; border-bottom-right-radius: 2px; }
        .nb-msg-bot { align-self: flex-start; background: #e2e8f0; color: #0f172a; border-bottom-left-radius: 2px; white-space: pre-line; }
        #nb-chatbot-input-area { padding: 16px; background: #fff; border-top: 1px solid #e2e8f0; display: flex; gap: 10px; }
        #nb-chatbot-input { flex: 1; border: 1px solid #cbd5e1; border-radius: 10px; padding: 10px 14px; font-size: 13px; outline: none; }
        #nb-chatbot-send { background: #10b981; color: white; border: none; border-radius: 10px; padding: 0 16px; font-weight: 700; cursor: pointer; }
        @keyframes nbBubbleFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes nbWindowIn { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    `;
    document.head.appendChild(style);

    container.innerHTML = `
        <div id="nb-chatbot-window">
            <div id="nb-chatbot-header">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="width:10px; height:10px; background:#10b981; border-radius:50%;"></div>
                    <span style="font-weight:800; font-size:15px;">NightBite AI Assistant</span>
                </div>
                <button id="nb-chatbot-close" style="background:transparent; border:none; color:#64748b; cursor:pointer; font-size:20px;">&times;</button>
            </div>
            <div id="nb-chatbot-messages"></div>
            <div id="nb-chatbot-input-area">
                <input type="text" id="nb-chatbot-input" placeholder="Type your message..." />
                <button id="nb-chatbot-send">Send</button>
            </div>
        </div>
        <div style="position:relative;">
            <div id="nb-chatbot-bubble">💬</div>
            <div id="nb-chatbot-bubble-badge">1</div>
        </div>
    `;

    document.body.appendChild(container);

    const bubble = document.getElementById('nb-chatbot-bubble');
    const win = document.getElementById('nb-chatbot-window');
    const close = document.getElementById('nb-chatbot-close');
    const input = document.getElementById('nb-chatbot-input');
    const send = document.getElementById('nb-chatbot-send');
    const msgArea = document.getElementById('nb-chatbot-messages');
    const badge = document.getElementById('nb-chatbot-bubble-badge');

    const appendMessage = (text, sender) => {
        const m = document.createElement('div');
        m.className = `nb-msg nb-msg-${sender}`;
        m.innerText = text;
        msgArea.appendChild(m);
        msgArea.scrollTop = msgArea.scrollHeight;
        
        const history = JSON.parse(sessionStorage.getItem('nb_chat_history') || '[]');
        history.push({ text, sender });
        sessionStorage.setItem('nb_chat_history', JSON.stringify(history));
    };

    // Load history or show initial prompt
    const savedHistory = JSON.parse(sessionStorage.getItem('nb_chat_history') || '[]');
    if (savedHistory.length > 0) {
        savedHistory.forEach(msg => {
            const m = document.createElement('div');
            m.className = `nb-msg nb-msg-${msg.sender}`;
            m.innerText = msg.text;
            msgArea.appendChild(m);
        });
    } else {
        setTimeout(() => {
            appendMessage("Welcome! Before we start, do you have any health conditions (e.g. Heart problems, Low BP, Fever, DVT)? This helps me provide safer advice. 🩺", "bot");
            badge.style.display = 'block';
        }, 2000);
    }

    bubble.onclick = () => {
        const isVisible = win.style.display === 'flex';
        win.style.display = isVisible ? 'none' : 'flex';
        badge.style.display = 'none';
        if (!isVisible) {
            input.focus();
            msgArea.scrollTop = msgArea.scrollHeight;
        }
    };

    close.onclick = () => { win.style.display = 'none'; };

    const handleSend = () => {
        const txt = input.value.trim();
        if (!txt) return;
        appendMessage(txt, 'user');
        input.value = '';

        setTimeout(async () => {
            const botResponse = await getAIResponse(txt);
            appendMessage(botResponse, 'bot');
        }, 800);
    };

    send.onclick = handleSend;
    input.onkeypress = (e) => { if(e.key === 'Enter') handleSend(); };

    const getAIResponse = async (query) => {
        const q = query.toLowerCase();
        const userCondition = sessionStorage.getItem('nb_user_health_info') || "";

        // 1. Health Condition Intake
        if (q.includes('yes') || q.includes('heart') || q.includes('bp') || q.includes('fever') || q.includes('dvt') || q.includes('problem')) {
            let found = null;
            if (q.includes('heart')) found = 'heart';
            else if (q.includes('bp') || q.includes('pressure')) found = 'bp';
            else if (q.includes('fever') || q.includes('temperature')) found = 'fever';
            else if (q.includes('dvt') || q.includes('clot')) found = 'dvt';
            
            if (found) {
                sessionStorage.setItem('nb_user_health_info', found);
                const a = DISEASE_ADVICE_MAP[found];
                const menu = a.safe_menu.join('\n');
                return `I've noted that you have ${found.toUpperCase()} concerns. \n🚫 Avoid: ${a.avoid} \n⚠️ Precaution: ${a.precaution} \n✅ Recommended Safe Menu (Top 5):\n${menu}\n\nI will tailor all future scans to your health!`;
            }
        }

        // 2. 15 Dish List
        if (q.includes('15') || q.includes('list') || q.includes('menu')) {
            return "Here are 15 healthy late-night dishes tailored for low GI and balanced nutrition: \n\n" + HEALTHY_15.join("\n");
        }

        // 3. Analyze / Report Logic
        if (q.includes('analyze') || q.includes('report') || q.includes('history')) {
            const data = await new Promise(r => chrome.storage.local.get(['nightbite_data'], r));
            const list = data.nightbite_data || [];
            if (list.length === 0) return "I don't have any order history to analyze yet! Try scanning some food on the page first.";
            
            const avgCals = Math.round(list.reduce((acc, curr) => acc + (Number(curr.cals?.toString().replace(/\D/g,'')) || 0), 0) / list.length);
            const highRiskCount = list.filter(o => o.riskScore > 75).length;
            
            return `--- YOUR NIGHTBITE REPORT --- \n📊 Total Orders: ${list.length} \n🔥 Avg Calories: ${avgCals} kcal \n🚨 High Risk Items: ${highRiskCount} \n💡 Observation: ${highRiskCount > 2 ? 'You are frequently ordering high-risk meals. Try switching to my "Smart Swaps"!' : 'Great job! You are keeping your late-night risks under control.'}`;
        }

        // 4. Standard Food Logic (Health-Aware)
        if (q.includes('pizz') || q.includes('piza')) {
            const stats = categorizeFood("Pizza");
            let extra = "";
            if (userCondition === 'heart') extra = "\n⚠️ Warning: Due to your heart condition, the sodium in pizza is particularly high-risk.";
            return `🍕 Pizza is ${stats.category} (${stats.cals}). Try to stick to 2 slices Max! ${extra}`;
        }

        if (q.includes('burg') || q.includes('bugg')) {
            const stats = categorizeFood("Burger");
            let extra = "";
            if (userCondition === 'heart') extra = "\n⚠️ Caution: The saturated fats in burgers are not ideal for heart health.";
            return `🍔 A ${stats.category} burger has ${stats.cals}. Try a grilled wrap instead! ${extra}`;
        }

        if (q.includes('spic') || q.includes('chili') || q.includes('hot') || q.includes('masala')) {
            return "🌶 Spicy food late at night can trigger ACID REFLUX and disrupt your sleep cycle. If you have Heart or BP issues, the high sodium in masala is risky! Try a 'Clear Soup' instead.";
        }

        if (q.includes('dosa') || q.includes('idli') || q.includes('wada') || q.includes('south')) {
            return "🍚 South Indian food like Idli is great! ✅ Plain Idli is safe and easy to digest. ⚠️ But avoid Masala Dosa or Oil-Fried Wada after 11 PM to prevent heartburn.";
        }

        if (q.includes('biryani') || q.includes('rice') || q.includes('pulao')) {
            return "🍚 Biryani and Rice are high-GI foods. Ordering them after 11 PM causes massive INSULIN SPIKES before you sleep. Try to limit yourself to a half-portion!";
        }

        if (q.includes('dinner') || q.includes('eat') || q.includes('suggest')) {
            return "For tonight, I suggest: \n1. Grilled Chicken/Paneer (Smart Swap) \n2. Clear Veggie Soup \n3. Moong Dal Khichdi. \nWhich one should I give you details for?";
        }

        if (q.includes('thanks') || q.includes('thank')) return "You're welcome! Stay healthy and stay analyzed. 🌙";

        return "🌙 NightBite Tip: After 11 PM, try to stay under 400 calories and avoid high-sodium foods. \n\nAsk me about 'Is Pizza healthy?' or 'South Indian food' for specific advice!";
    };
};

// Start logic
const init = () => {
    if (document.body) {
        injectChatbot();
        console.log("🌙 NightBite AI: Startup Success");
    } else {
        setTimeout(init, 100);
    }
};

init();

// Persistent Observer for SPAs (Swiggy/Zomato)
const observer = new MutationObserver((mutations) => {
    if (!document.getElementById('nb-chatbot-container')) {
        init();
    }
});

// Start observing and heartbeat check
setTimeout(() => {
    if (document.body) {
        attachHoverListener();
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Heartbeat: Check every 3 seconds
        setInterval(() => {
            if (!document.getElementById('nb-chatbot-container')) {
                init();
            }
        }, 3000);
    }
}, 1000);
