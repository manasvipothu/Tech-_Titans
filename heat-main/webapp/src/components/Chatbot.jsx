import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import mockHistory from '../api/mockData';

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
    }
};

const HEALTHY_15 = [
    "1. Grilled Lemon Chicken", "2. Paneer Tikka (Less Oil)", "3. Moong Dal Khichdi", "4. Steamed Momos (Veg/Chicken)",
    "5. Clear Vegetable Soup", "6. Sprouted Bean Salad", "7. Greek Yogurt with Walnuts", "8. Boiled Egg White Bowl",
    "9. Quinoa Vegetable Pulao", "10. Roasted Makhana (Foxnuts)", "11. Hummus with Cucumber", "12. Masala Oats (Low salt)",
    "13. Sautéed Broccoli & Tofu", "14. Baked Sweet Potato", "15. Fresh Fruit Medley (Low GI)"
];

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState(() => JSON.parse(sessionStorage.getItem('nb_webapp_chat') || '[]'));
    const [inputValue, setInputValue] = useState('');
    const [badge, setBadge] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (messages.length === 0) {
            const welcomeTimeout = setTimeout(() => {
                setMessages([{ text: "Welcome to NightBite AI! Do you have any health conditions (Heart, BP, Fever)? I can tailor my advice for you. 🩺", sender: 'bot' }]);
                setBadge(true);
            }, 1000);
            return () => clearTimeout(welcomeTimeout);
        }
    }, [messages.length]);


    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
        if (messages.length > 0) {
            sessionStorage.setItem('nb_webapp_chat', JSON.stringify(messages));
        }
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;
        const userMsg = { text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        const query = inputValue.toLowerCase();
        setInputValue('');

        setTimeout(() => {
            const botResponse = getResponse(query);
            setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
        }, 800);
    };

    const getResponse = (q) => {
        const userCondition = sessionStorage.getItem('nb_user_health_info') || "";

        if (q.includes('heart') || q.includes('bp') || q.includes('fever')) {
            let found = q.includes('heart') ? 'heart' : (q.includes('bp') ? 'bp' : 'fever');
            sessionStorage.setItem('nb_user_health_info', found);
            const a = DISEASE_ADVICE_MAP[found];
            return `Noted: ${found.toUpperCase()}. Avoid: ${a.avoid}. Safe options: ${a.safe_menu.slice(0,3).join(', ')}.`;
        }

        if (q.includes('list') || q.includes('15') || q.includes('menu')) {
            return "Here are some healthy options: " + HEALTHY_15.slice(0, 5).join("\n");
        }

        if (q.includes('report') || q.includes('analyze')) {
            const highRisk = mockHistory.filter(o => o.riskScore > 75).length;
            return `Analysis: You had ${highRisk} high-risk orders recently. ${highRisk > 2 ? 'Try swapping them for salads!' : 'Great job staying healthy!'}`;
        }

        if (q.includes('thanks')) return "You're welcome! Stay healthy. 🌙";
        
        let healthContext = "";
        if (userCondition) {
            healthContext = ` Considering your ${userCondition} condition, `;
        }

        return `NightBite AI Tip:${healthContext} Try to stay under 400 calories for late-night meals. What else can I help with?`;
    };

    return (
        <div className="fixed bottom-6 right-6 z-9999 font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-[350px] h-[500px] mb-4 glass-card border-white/10 flex flex-col overflow-hidden shadow-2xl"
                    >
                        <div className="p-4 bg-indigo-600/20 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="font-bold text-sm tracking-tight">NightBite AI Assistant</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 scroll-smooth">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                                        m.sender === 'user' 
                                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                                            : 'bg-white/10 text-slate-200 rounded-tl-none border border-white/5'
                                    }`}>
                                        <div className="flex items-center gap-2 mb-1 opacity-50">
                                            {m.sender === 'bot' ? <Bot size={12} /> : <User size={12} />}
                                            <span className="text-[10px] font-black uppercase tracking-tighter">{m.sender}</span>
                                        </div>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-black/20 border-t border-white/5 flex gap-2">
                            <input 
                                type="text" 
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about health or food..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-500/50 transition-all"
                            />
                            <button 
                                onClick={handleSend}
                                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all flex items-center justify-center shrink-0"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button 
                onClick={() => { setIsOpen(!isOpen); setBadge(false); }}
                className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all relative"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
                {badge && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-[#0c0c0e] flex items-center justify-center text-[10px] font-black animate-bounce">
                        1
                    </span>
                )}
            </button>
        </div>
    );
}
