/**
 * AI NightBite - Popup Dashboard Logic
 */

const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; 
    }
    return Math.abs(hash);
};

const getFoodDetails = (foodName) => {
    const name = foodName.toLowerCase();
    const seed = hashCode(name);
    
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

let globalData = [];
let currentView = 'night';

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['isExtensionActive', 'isNotificationsActive', 'nightbite_data'], (res) => {
        // Initialize Toggles
        document.getElementById('ext-toggle').checked = res.isExtensionActive !== false;
        document.getElementById('notif-toggle').checked = res.isNotificationsActive !== false;

        // Load data globally and initially render
        globalData = res.nightbite_data || [];
        refreshDashboard();
    });

    // Control listeners
    document.getElementById('ext-toggle').addEventListener('change', (e) => {
        chrome.storage.local.set({ isExtensionActive: e.target.checked });
    });
    
    document.getElementById('notif-toggle').addEventListener('change', (e) => {
        chrome.storage.local.set({ isNotificationsActive: e.target.checked });
        if (e.target.checked) chrome.runtime.sendMessage({ action: 'show_notification', title: 'Notifications Enabled 🎉', body: 'AI NightBite will now send you health alerts.' });
    });

    // Navigation to Web Dashboard
    document.getElementById('btn-detail').addEventListener('click', () => {
        chrome.tabs.create({ url: 'http://localhost:5178/' });
    });

    // Time View Segment Toggles
    document.getElementById('btn-night').addEventListener('click', () => setView('night'));
    document.getElementById('btn-day').addEventListener('click', () => setView('day'));

    // Tab Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget.getAttribute('data-target');
            
            // Update active button
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            // Update active tab
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.getElementById(target).classList.add('active');
        });
    });

    // AI Insights Generator Simulation
    document.getElementById('btn-run-ai').addEventListener('click', (e) => {
        const btn = e.target;
        btn.innerText = 'Analyzing Patterns...';
        btn.style.opacity = '0.7';
        
        setTimeout(() => {
            btn.innerText = 'Regenerate Insights';
            btn.style.opacity = '1';
            generateRealInsights(globalData);
            document.getElementById('ai-results').style.display = 'block';
        }, 1500);
    });
});

function setView(view) {
    currentView = view;
    document.getElementById('btn-night').className = `toggle-btn ${view === 'night' ? 'active' : ''}`;
    document.getElementById('btn-day').className = `toggle-btn ${view === 'day' ? 'active' : ''}`;
    
    // Update labels contextually
    document.querySelector('.risk-card .card-title').innerText = view === 'night' ? 'Late Night Risk Score (LNR)' : '24-Hour Risk Score';
    document.querySelector('.dna-subtitle').innerText = view === 'night' ? 'Average nutritional makeup of your late-night orders.' : 'Average nutritional makeup of all daily orders.';

    refreshDashboard();
}

function refreshDashboard() {
    let displayData = globalData;
    
    if (currentView === 'night') {
        displayData = globalData.filter(d => {
            const h = new Date(d.date).getHours();
            // Late night: 10 PM (22) to 4 AM (4)
            return h >= 22 || h <= 3;
        });
    }

    if (displayData.length === 0) {
        document.getElementById('score-desc').innerText = `No ${currentView === 'night' ? 'late-night ' : ''}orders yet!`;
        document.getElementById('lnr-score').innerText = "--";
        const ring = document.getElementById('score-ring');
        ring.setAttribute('stroke-dasharray', `0, 100`);
        ring.style.stroke = 'var(--color-bg-alt)';
    }

    try {
        if (displayData.length > 0) renderLNRScore(displayData);
        renderHeatmap(displayData);
        renderCravingClock(displayData);
        renderInsights(displayData);
        renderDNA(displayData);
        renderStreak(displayData);
        renderSuggestions(displayData);
        renderStatCards(displayData);
        renderRecentOrders(displayData);
        
        // Also update Challenges tab data
        renderChallenges(globalData);
    } catch (e) {
        console.error("Dashboard render error: ", e);
    }
}

// Global listener for live page changes
if (!window.hasStorageListener) {
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (changes.nightbite_data || changes.last_viewed_food) {
            chrome.storage.local.get(['nightbite_data'], (res) => {
                globalData = res.nightbite_data || [];
                refreshDashboard();
            });
        }
    });
    window.hasStorageListener = true;
}

// 1. Risk Score
function renderLNRScore(data) {
    const totalScore = data.reduce((acc, curr) => acc + curr.riskScore, 0);
    const avgScore = Math.floor(totalScore / data.length);
    
    document.getElementById('lnr-score').innerText = avgScore;
    const ring = document.getElementById('score-ring');
    ring.setAttribute('stroke-dasharray', `${avgScore}, 100`);

    let statusText = "Moderate Risk";
    if (avgScore > 75) {
        ring.style.stroke = 'var(--color-danger)';
        statusText = "High Risk Diet!";
        document.getElementById('lnr-score').style.color = 'var(--color-danger)';
    } else if (avgScore < 40) {
        ring.style.stroke = 'var(--color-success)';
        statusText = "Healthy Diet";
        document.getElementById('lnr-score').style.color = 'var(--color-success)';
    } else {
        ring.style.stroke = 'var(--color-warning)';
        document.getElementById('lnr-score').style.color = 'var(--color-warning)';
    }
    document.getElementById('score-desc').innerText = statusText;
}

// 2. Activity Heatmap
function renderHeatmap(data) {
    const grid = document.getElementById('heatmap-grid');
    grid.innerHTML = '';
    const now = new Date();
    const days = [];
    for (let i = 27; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }

    const dailyRisk = {};
    data.forEach(item => {
        const dateStr = item.date.split('T')[0];
        if (!dailyRisk[dateStr] || item.riskScore > dailyRisk[dateStr].score) {
            dailyRisk[dateStr] = { score: item.riskScore, title: `${item.foodName} (${item.category})` };
        }
    });

    days.forEach(dayStr => {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        if (dailyRisk[dayStr]) {
            const risk = dailyRisk[dayStr];
            let color = 'grey';
            if (risk.score > 75) color = 'red';
            else if (risk.score > 40) color = 'yellow';
            else color = 'green';
            cell.setAttribute('data-risk', color);
            cell.setAttribute('title', `${dayStr}: ${risk.title}`);
        } else {
            cell.setAttribute('data-risk', 'grey');
            cell.setAttribute('title', `${dayStr}: No orders`);
        }
        grid.appendChild(cell);
    });
}

// 3. Craving Clock
function renderCravingClock(data) {
    const peakTimeEl = document.getElementById('peak-time');
    if (!data || data.length === 0) {
        if (peakTimeEl) peakTimeEl.innerText = "No Data";
        return;
    }

    const hourCounts = {};
    let peakHour = 22;
    let maxCount = -1;

    data.forEach(item => {
        const date = item.date ? new Date(item.date) : new Date();
        const hr = date.getHours();
        hourCounts[hr] = (hourCounts[hr] || 0) + 1;
        if (hourCounts[hr] > maxCount) {
            maxCount = hourCounts[hr];
            peakHour = hr;
        }
    });

    // Human readable AM/PM
    const hour12 = peakHour % 12 || 12;
    const ampm = peakHour >= 12 ? 'PM' : 'AM';
    if (peakTimeEl) peakTimeEl.innerText = `You order most at ${hour12}:00 ${ampm}`;

    const totalOrders = Object.values(hourCounts).reduce((a, b) => a + b, 0);
    const clockPie = document.getElementById('clock-pie');
    if (!clockPie) return;
    
    let currentDegree = 0;
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
    const segments = Object.entries(hourCounts).map(([hr, count], i) => {
        const percent = (count / totalOrders) * 100;
        const start = currentDegree;
        currentDegree += (percent / 100) * 360;
        return `${colors[i % colors.length]} ${start}deg ${currentDegree}deg`;
    });

    if (segments.length > 0) {
        clockPie.style.background = `conic-gradient(${segments.join(', ')})`;
    } else {
        clockPie.style.background = `rgba(255,255,255,0.05)`;
    }
}

// 4. Habit Insights Generator
function renderInsights(data) {
    const list = document.getElementById('insights-list');
    list.innerHTML = '';
    
    if (data.length === 0) {
        list.innerHTML = '<li>Insufficient data for insights.</li>';
        return;
    }

    const highRiskCount = data.filter(d => d.riskScore > 75).length;
    const percentageHighRisk = Math.round((highRiskCount / data.length) * 100) || 0;
    
    const contextStr = currentView === 'night' ? 'late-night ' : 'daily ';

    if (percentageHighRisk > 50) {
        list.innerHTML += `<li>🚩 ${percentageHighRisk}% of your ${contextStr}meals are High Risk.</li>`;
    } else {
        list.innerHTML += `<li>✅ Great job keeping ${contextStr}high-risk meals under control.</li>`;
    }

    const mostCommon = [...data].sort((a,b) => 
          data.filter(v => v.foodName===a.foodName).length
        - data.filter(v => v.foodName===b.foodName).length
    ).pop().foodName;

    list.innerHTML += `<li>🍕 Your most frequent craving is <strong>${mostCommon}</strong>.</li>`;
}

// 5. Food DNA
function renderDNA(data) {
    if (data.length === 0) {
        document.getElementById('dna-sugar').style.width = '0%';
        document.getElementById('dna-fat').style.width = '0%';
        document.getElementById('dna-carb').style.width = '100%';
        return;
    }

    let totalSugar = 0, totalFat = 0, totalCals = 0;
    data.forEach(item => {
        // Use stored values if available, else derive
        const detail = item.cals ? item : getFoodDetails(item.foodName);
        totalSugar += Number(detail.sugar.toString().replace('~','').replace('g',''));
        totalFat += Number(detail.fat.toString().replace('~','').replace('g',''));
        totalCals += Number(detail.cals.toString().replace('~','').replace('kcal',''));
    });

    const avgSugar = totalSugar / data.length;
    const avgFat = totalFat / data.length;
    const avgCals = totalCals / data.length;

    // Relative ratios for visualization
    const sugarRatio = Math.min((avgSugar / 50) * 100, 45); 
    const fatRatio = Math.min((avgFat / 40) * 100, 45);
    const otherRatio = 100 - sugarRatio - fatRatio;

    document.getElementById('dna-sugar').style.width = `${sugarRatio}%`;
    document.getElementById('dna-sugar').innerHTML = `<span>Sugar ${Math.round(sugarRatio)}%</span>`;
    document.getElementById('dna-fat').style.width = `${fatRatio}%`;
    document.getElementById('dna-fat').innerHTML = `<span>Fat ${Math.round(fatRatio)}%</span>`;
    document.getElementById('dna-carb').style.width = `${otherRatio}%`;
    document.getElementById('dna-carb').innerHTML = `<span>Other ${Math.round(otherRatio)}%</span>`;
}

// 6. Streak Tracker
function renderStreak(data) {
    const badge = document.getElementById('streak-badge');
    if (!badge) return;
    
    if (data.length === 0) {
         badge.innerText = `🔥 0 Day Streak`;
         return;
    }
    
    let streak = 0;
    const sortedDesc = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
    for (let el of sortedDesc) {
        if (el.riskScore > 75) break;
        streak++;
    }

    if (streak > 0) {
        badge.innerText = `✅ ${streak} Healthy Orders`;
        badge.style.background = 'rgba(166, 227, 161, 0.15)';
        badge.style.color = 'var(--color-success)';
    } else {
        badge.innerText = `🚨 Break the cycle!`;
        badge.style.background = 'rgba(243, 139, 168, 0.15)';
        badge.style.color = 'var(--color-danger)';
    }
}

// 7. Dynamic Smart Suggestions
function renderSuggestions(data) {
    chrome.storage.local.get(['last_viewed_food'], (res) => {
        try {
            const titleEl = document.getElementById('sug-title');
            const descEl = document.getElementById('sug-desc');
            const iconEl = document.getElementById('sug-icon');

            if (!titleEl || !descEl || !iconEl) return;

            let targetFood = null;
            let context = "habit";
            
            if (res.last_viewed_food && res.last_viewed_food.time) {
                if ((Date.now() - res.last_viewed_food.time < 300000) && res.last_viewed_food.category === 'High Risk') {
                    targetFood = res.last_viewed_food.name;
                    context = "page";
                }
            } 
            
            if (!targetFood && data.length > 0) {
                const highRiskItems = data.filter(d => d.riskScore > 75).map(d => d.foodName);
                if (highRiskItems.length > 0) {
                    const counts = {};
                    let maxCount = 0;
                    for (const f of highRiskItems) {
                        counts[f] = (counts[f] || 0) + 1;
                        if (counts[f] > maxCount) { maxCount = counts[f]; targetFood = f; }
                    }
                }
            }

            if (targetFood) {
                let alternative = "a Fresh Salad";
                let calSaved = "400";
                let icon = "🥗";
                
                const lowerFood = String(targetFood).toLowerCase();
                if (lowerFood.includes("pizza")) { alternative = "a Grilled Veggie Wrap"; calSaved = "500"; icon = '🌯';}
                else if (lowerFood.includes("burger")) { alternative = "a Grilled Chicken Sandwich"; calSaved = "350"; icon = '🥪';}
                else if (lowerFood.includes("ice cream") || lowerFood.includes("shake")) { alternative = "Greek Yogurt with Berries"; calSaved = "300"; icon = '🍓';}
                else if (lowerFood.includes("fries")) { alternative = "Baked Sweet Potato Wedges"; calSaved = "250"; icon = '🍠';}
                else if (lowerFood.includes("cake") || lowerFood.includes("dessert")) { alternative = "a Fresh Fruit Bowl"; calSaved = "450"; icon = '🍎';}
                else if (lowerFood.includes("biryani")) { alternative = "Quinoa or Cauliflower Rice"; calSaved = "300"; icon = '🍲';}
                
                iconEl.innerText = icon;
                if (context === "page") {
                    titleEl.innerText = `Viewing ${targetFood}? Try ${alternative}!`;
                } else {
                    titleEl.innerText = `You often crave ${targetFood}. Try ${alternative}!`;
                }
                descEl.innerText = `This smart swap reduces your ${currentView === 'night' ? 'late-night ' : 'daily '}intake by ~${calSaved} kcal.`;
            } else {
                iconEl.innerText = '✅';
                titleEl.innerText = "You're making great choices!";
                descEl.innerText = `Keep up the healthy ${currentView === 'night' ? 'late-night ' : 'daily '}habits. No high-risk items detected.`;
            }
        } catch(e) {
            console.error("AI NightBite - Failed to render suggestions:", e);
        }
    });
}

// 8. Stat Cards
function renderStatCards(data) {
    document.getElementById('stat-val-orders').innerText = data.length;
    let totalCals = 0;
    if (data.length > 0) {
        data.forEach(item => {
            const detail = item.cals ? item : getFoodDetails(item.foodName);
            totalCals += Number(detail.cals.toString().replace('~','').replace('kcal',''));
        });
        const avgCals = Math.floor(totalCals / data.length);
        document.getElementById('stat-val-cals').innerText = avgCals;
    } else {
        document.getElementById('stat-val-cals').innerText = "0";
    }
}

// 9. Recent Orders List
function renderRecentOrders(data) {
    const list = document.getElementById('recent-orders-list');
    list.innerHTML = '';
    
    if (data.length === 0) {
        list.innerHTML = '<div class="text-muted" style="text-align:center; font-size:12px; padding: 16px;">No orders tracked yet.</div>';
        return;
    }

    const recent = [...data].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
    
    recent.forEach((order, i) => {
        const item = document.createElement('div');
        item.className = 'recent-order-item animate-in';
        item.style.animationDelay = `${i * 0.05}s`;

        let catColorClass = 'bg-moderate';
        let riskTextClass = 'text-moderate';
        let riskScore = order.riskScore || 50;
        
        if (riskScore < 40) { catColorClass = 'bg-healthy'; riskTextClass = 'text-healthy'; }
        else if (riskScore > 75) { catColorClass = 'bg-risky'; riskTextClass = 'text-risky'; }
        
        const dateObj = new Date(order.date);
        const timeStr = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const dateStrShort = dateObj.toLocaleDateString([], {month:'short', day:'numeric'});
        const isLateNight = dateObj.getHours() >= 22 || dateObj.getHours() <= 3;
        
        const detail = order.cals ? order : getFoodDetails(order.foodName);
        const displayCals = detail.cals.toString().replace('~','').replace('kcal','').trim();

        item.innerHTML = `
            <div class="recent-order-indicator ${catColorClass}"></div>
            <div class="ro-content">
                <div class="ro-header">
                    <span class="ro-name" title="${order.foodName}">${order.foodName}</span>
                    ${isLateNight ? '<span class="badge-late-night">🌙 Late Night</span>' : ''}
                </div>
                <div class="ro-meta">
                    <span>🕒 ${dateStrShort} ${timeStr}</span>
                    <span>🔥 ${displayCals} cal</span>
                </div>
            </div>
            <div class="badge-risk ${riskTextClass}">${riskScore}</div>
        `;
        list.appendChild(item);
    });
}

// 10. Challenges Logic
function renderChallenges(allData) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weekData = allData.filter(d => new Date(d.date) > weekAgo);
    const nightData = allData.filter(d => {
        const h = new Date(d.date).getHours();
        return h >= 22 || h <= 3;
    });

    // 1. No Junk Week
    const hasHighRiskInWeek = weekData.some(d => d.riskScore > 75);
    const junkBtn = document.getElementById('challenge-junk-btn');
    if (junkBtn) {
        if (!hasHighRiskInWeek && weekData.length > 0) {
            junkBtn.innerText = 'Completed';
            junkBtn.style.background = 'var(--color-success)';
        } else if (hasHighRiskInWeek) {
            junkBtn.innerText = 'Failed';
            junkBtn.style.background = 'var(--color-danger)';
        } else {
            junkBtn.innerText = 'Start';
        }
    }

    // 2. Midnight Warrior (Progress)
    const lateNightOrdersInWeek = weekData.filter(d => {
        const h = new Date(d.date).getHours();
        return h >= 22 || h <= 3;
    }).length;
    
    const warriorProgress = document.getElementById('challenge-warrior-progress');
    const warriorText = document.getElementById('challenge-warrior-label');
    if (warriorProgress && warriorText) {
        const remainingDays = Math.max(0, 7 - lateNightOrdersInWeek);
        const percent = (remainingDays / 7) * 100;
        warriorProgress.style.width = `${percent}%`;
        warriorText.innerText = `Day ${remainingDays} / 7`;
    }

    // 3. Calorie Control (Active State)
    const allOrdersUnder600 = allData.length > 0 && allData.every(d => {
        const detail = d.cals ? d : getFoodDetails(d.foodName);
        const cals = Number(detail.cals.toString().replace('~','').replace('kcal','')) || 0;
        return cals < 700; // Buffered
    });
    const calStatus = document.getElementById('challenge-cal-status');
    if (calStatus) {
        calStatus.innerText = allOrdersUnder600 ? 'Active' : 'Broken';
        calStatus.style.color = allOrdersUnder600 ? 'var(--color-success)' : 'var(--color-danger)';
    }
}

// 11. AI Insights Patterns
function generateRealInsights(data) {
    if (data.length < 5) return;

    const results = document.getElementById('ai-results');
    const conclusion = results.querySelector('p');
    const triggerVal = results.querySelector('div div:nth-child(1) span:nth-child(2)');
    const circadianVal = results.querySelector('div div:nth-child(2) span:nth-child(2)');

    // Analysis
    const hourCounts = {};
    data.forEach(d => {
        const h = new Date(d.date).getHours();
        hourCounts[h] = (hourCounts[h] || 0) + 1;
    });
    
    const peakHour = Object.keys(hourCounts).sort((a,b) => hourCounts[b] - hourCounts[a])[0];
    const highRiskCount = data.filter(d => d.riskScore > 75).length;
    const damage = Math.floor((highRiskCount / data.length) * 100);

    let conclusionText = "";
    if (damage > 60) {
        conclusionText = "High calorie density late at night heavily disrupts your circadian rhythm and increases risk of metabolic syndrome. Your patterns suggest significant insulin spikes during sleep hours.";
    } else {
        conclusionText = "Your late-night eating habits are relatively controlled. However, consistency is key to avoiding metabolic drift.";
    }

    conclusion.innerHTML = `<strong>AI Conclusion:</strong> ${conclusionText}`;
    triggerVal.innerText = peakHour >= 23 || peakHour <= 1 ? 'Fatigue / Netflix' : 'Stress / Work';
    circadianVal.innerText = `${damage > 50 ? 'Critical' : 'Moderate'} (${damage}/100)`;
}
