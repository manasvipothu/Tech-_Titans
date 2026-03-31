# 🌙 AI NightBite - Late Night Food Health Analyzer

**AI NightBite** is a privacy-first Chrome Extension that analyzes late-night food ordering behavior (10 PM \u2013 4 AM) and provides AI-based insights to reduce Non-Communicable Disease (NCD) risks like obesity, diabetes, and heart disease. 

It works seamlessly on platforms like Swiggy and Zomato, intervening *before* a high-risk order is placed.

---

## 🎯 Key Selling Point
- **Universal compatibility**: Works on food delivery pages without requiring backend API access.
- **Behavior Tracking**: Tracks behavior over time locally.
- **Actionable AI**: Provides AI-based personalized advice, a visual dashboard, and real-time intervention notifications.
- **Gamification**: Gamifies healthy habits to actively reduce long-term NCD risk.

---

## 🚀 Complete Features List

### 1\uFE0F\u20E3 Real-Time Food Analysis
* **Where it works:** On any food item page (viewing menu or item details)
* **How it works:** 
  - Content script reads the food name from the webpage.
  - Runs AI-based analysis to classify as **Healthy / Moderate / High Risk**.
  - Assigns a Risk Score (0\u2013100) and shows an inline popup tooltip.
  - *Example Dashboard Insight: "Pizza \u2192 High Fat + Late Night \u2192 High Risk"*

### 2\uFE0F\u20E3 Late-Night Tracking (10 PM \u2013 4 AM)
* **Where it works:** On add-to-cart or order pages.
* **How it works:** 
  - Only tracks food added to cart between 10 PM and 4 AM.
  - Stores food name, time of order, and risk score securely in `chrome.storage` for dashboard visualization.
  - *Benefit:* Focuses specifically on the late-night dietary habits linked most heavily to NCDs.

### 3\uFE0F\u20E3 GitHub-Style Food Heatmap
* **Where it works:** Inside the extension dashboard.
* **How it works:** 
  - A 28-day grid visualizing long-term eating habits. 
  - \uD83D\uDFE9 Green \u2192 Healthy | \uD83D\uDFE8 Yellow \u2192 Moderate | \uD83D\uDFE5 Red \u2192 High Risk | \u2B1C Grey \u2192 No late-night orders.
  - Hovering shows the exact meal, time, and score.

### 4\uFE0F\u20E3 Late Night Risk Score (LNR Score)
* **Where it works:** Dashboard popup.
* **How it works:** AI calculates an ongoing score based on the frequency, risk level, and time patterns of late-night orders to quantify long-term health risk.

### 5\uFE0F\u20E3 Craving Clock
* **Where it works:** Dashboard popup.
* **How it works:** A circular gradient pie chart showing peak order times (e.g., detecting if 1:30 AM is the most frequent time for unhealthy snacks) to predict high-risk times for interventions.

### 6\uFE0F\u20E3 Real-Time OS Notifications
* **Where it works:** On Swiggy/Zomato or any food site.
* **How it works:** When a user clicks "Add to Cart", it checks the time and risk score. If high risk, it triggers a native browser notification: *\u26A0\uFE0F This is a high-risk late-night meal. Consider a healthier alternative.*

### 7\uFE0F\u20E3 Habit Insights Panel
* **Where it works:** Dashboard popup.
* **How it works:** Derives behavior insights textually, such as *"80% of your late-night meals are high-calorie"*.

### 8\uFE0F\u20E3 Streak Tracker & Gamification
* **Where it works:** Dashboard Header.
* **How it works:** Tracks healthy streaks (consecutive days with low-risk choices) to gamify behavior and motivate users.

### 9\uFE0F\u20E3 Food DNA Visualization
* **Where it works:** Dashboard popup.
* **How it works:** A flexible bar/pie chart breakdown showing the estimated proportion of Sugar, Fat, and Calories based on the user's recent ordering history.

### \uD83D\uDD1F Smart Suggestions / Alternatives
* **Where it works:** Tooltip Warning / Dashboard.
* **How it works:** AI recommends healthier alternatives to risky foods on the fly (e.g., "Swap fries for a salad!").

### 1\uFE0F\u20E31\uFE0F\u20E3 Offline / Mock Mode
* **How it works:** The background service worker acts as a mock server. If the user has a fresh install for a hackathon demo, the extension populates the last 28 days with mock varied data to ensure the heatmap, charts, and analysis are fully functional without live API access.

### 1\uFE0F\u20E32\uFE0F\u20E3 Privacy First
* **How it works:** All data processing and AI text analysis stay entirely within the browser (`chrome.storage.local`). No personal info is sent to external servers, making it incredibly safe and scalable without backend costs.

---

## \uD83D\uDD27 Installation Instructions

1. Clone or download this repository.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select this directory.
5. Pin the extension to your toolbar. Open it to view the dashboard!
