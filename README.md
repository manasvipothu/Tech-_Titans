# Nutrify AI - Setup Instructions

Nutrify is an AI-powered health monitoring system that tracks late-night food ordering and provides real-time interventions.

## Prerequisites
- Node.js (v16+)
- MongoDB (running locally or a connection string)
- Expo Go app on your mobile device (for testing)

## Backend Setup
1. Navigate to `/backend`
2. Create/Update `.env` with your API keys:
   ```env
   MONGO_URI=mongodb://localhost:27017/nutrify
   EDAMAM_APP_ID=...
   EDAMAM_APP_KEY=...
   SPOONACULAR_API_KEY=...
   USDA_API_KEY=...
   ```
3. Run `npm install`
4. Run `npm start` (Server will run on port 5000)

## Frontend Setup
1. Navigate to `/frontend`
2. Update `src/services/api.js` with your computer's local IP address (if testing on a physical device).
3. Run `npm install`
4. Run `npm start`
5. Scan the QR code with Expo Go.

## How to Test
1. Open the app and go to the **Order** tab.
2. Select a "High Risk" item like **Cheese Burst Pizza**.
3. If it is after 10 PM, you will see an immediate **AI Intervention Modal** with health scores and alternatives.
4. Check the **Insights** tab to see your behavior heatmap update in real-time.
5. Watch the app theme transform to **Dark/Risky** if you place too many unhealthy late-night orders.
