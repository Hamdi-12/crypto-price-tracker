# 💹 Crypto Price Tracker

Track real-time prices of 50+ cryptocurrencies with live data, interactive charts, and personalized buy/sell insights.

Built with **React**, **Firebase**, and **CoinGecko API**.
## 🚀 Live Features

- 🔐 **Authentication** – Sign in with email/password or Google
- 👤 **Personal Greeting** – See your name at the top when signed in
- 🌓 **Dark/Light Mode** – Toggle between clean light or slick dark
- 🔍 **Search & Sort** – Filter coins by name or sort by price, % change, or market cap
- 📊 **Live Price Charts** – Real-time chart of all 50+ coins in a single view
- 💡 **Buy/Sell Suggestions** – Visual indicators show when to consider buying or selling
- ⚡ **Auto Refresh** – Data updates every 20 seconds
## 🛠 Getting Started

To run this project locally:

1. Clone the repo:
   ```bash
   git clone https://github.com/Hamdi-12/crypto-price-tracker.git
cd crypto-price-tracker
npm install
npm start
### 🔐 Firebase Configuration

This app uses Firebase Authentication (Email/Password + Google Sign-In).

To run locally:

1. Create a `.env` file in the root folder  
2. Add your Firebase config values like this:

REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id


3. Save the `.env` file  
4. Run the app locally with `npm start`


