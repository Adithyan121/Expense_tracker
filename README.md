# AI-Powered Expense Tracker

A comprehensive personal finance management application built with the MERN stack (MongoDB, Express.js, React, Node.js). This application goes beyond simple tracking by integrating AI to provide personalized financial insights, budget recommendations, and a conversational financial coach.

## 🚀 Features

### Core Functionality
- **Expense Tracking**: Easily add, edit, and delete expenses with categorization (Food, Travel, Bills, etc.).
- **Dashboard**: Visual overview of your spending, including monthly breakdowns, recent transactions, and savings trends.
- **Budget Management**: Set monthly budgets and optionally enable the **50/30/20 rule** analysis (Needs, Wants, Savings).
- **Secure Authentication**: 
    - **Email OTP Verification**: 2-step signup process with a 10-minute countdown timer to verify email addresses.
    - **JWT Security**: Secure login sessions using JSON Web Tokens.
- **Smart Notifications**: 
    - **Budget Alerts**: Receive email warnings when you reach **30%, 50%, 90%, or 100%** of your budget.
    - **Rich Email Templates**: Beautiful, dark-themed emails showing your total spent and available balance.
- **PWA Support (Offline Mode)**: 
    - **Installable**: Can be installed as a native app on mobile and desktop.
    - **Offline Access**: View your dashboard and reports even without an internet connection (cached data).
- **Privacy Policy**: Dedicated privacy policy page accessible from the footer.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.
- **Theming**: Support for Light and Dark modes (with custom themes like Yellow/Black).

### 🤖 AI Integration (Powered by LLaMA 3.3 & Groq)
- **AI Financial Coach**: A chat interface where you can ask questions like "Analyze my food spending" or "How can I save more?" and get personalized advice based on your actual data.
- **Localized Currency**: All AI insights and advice are strictly localized to **Indian Rupees (₹)**.
- **Smart Insights**: Automatically detects anomalies in your spending (e.g., unusually high transactions).
- **Subscription Detection**: Identifies potential recurring subscriptions from your transaction history.
- **Savings Strategy**: Generates actionable savings tips tailored to your spending habits.
- **Auto-Categorization**: AI assists in categorizing expenses based on descriptions.

## 🛠️ Tech Stack

- **Frontend**: 
    - **React.js**: Component-based UI library.
    - **Vite**: Fast build tool and development server.
    - **VitePWA**: Progressive Web App integration for offline capabilities.
    - **Recharts**: For interactive data visualization (charts and graphs).
    - **Lucide React**: Modern, clean icon set.
    - **Framer Motion**: For smooth animations and transitions.
- **Backend**: 
    - **Node.js & Express.js**: Robust server-side runtime and framework.
    - **Nodemailer**: For sending OTPs and budget alert emails.
    - **MongoDB & Mongoose**: NoSQL database for flexible data storage.
    - **JWT**: Secure user authentication.
- **AI/ML**: 
    - **Groq SDK**: High-performance inference engine.
    - **LLaMA 3.3**: Advanced large language model for financial analysis.

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd expense-tracker
    ```

2.  **Install Dependencies**
    
    *Server:*
    ```bash
    cd server
    npm install
    ```
    
    *Client:*
    ```bash
    cd ../client
    npm install
    ```

3.  **Environment Configuration**

    Create a `.env` file in the `server` directory with the following variables:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    GROQ_API_KEY=your_groq_api_key
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_app_password
    ```

4.  **Run the Application**

    *Start Backend:*
    ```bash
    cd server
    npm run dev
    ```

    *Start Frontend:*
    ```bash
    cd client
    npm run dev
    ```

## © Copyright

**Copyright (c) 2025 [Your Name/Company Name]. All Rights Reserved.**

This source code and application are the proprietary property of the copyright holder. 
Unauthorized copying, distribution, modification, or use of this file, via any medium, is strictly prohibited. 
This software is **NOT** open source and is **NOT** free licensed.
