const express = require('express');
const Groq = require('groq-sdk');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_key' });

// Smart Categorization
router.post('/categorize', protect, async (req, res) => {
    try {
        const { title } = req.body;
        if (!process.env.GROQ_API_KEY) {
            return res.status(503).json({ message: 'Groq API Key not configured' });
        }

        const categories = ['Food', 'Travel', 'Bills', 'Shopping', 'Medical', 'Entertainment', 'Other'];

        const prompt = `Categorize the expense title "${title}" into exactly one of these categories: ${categories.join(', ')}. Return ONLY the category name. If unsure, return "Other". Do not add any explanation or preamble.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
        });

        const category = completion.choices[0]?.message?.content?.trim() || 'Other';
        const finalCategory = categories.includes(category) ? category : 'Other';

        res.json({ category: finalCategory });
    } catch (error) {
        console.error('AI Categorization Error:', error);
        res.status(500).json({ message: 'AI processing failed' });
    }
});

// Insights & Prediction
router.get('/insights', protect, async (req, res) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            return res.status(503).json({ message: 'Groq API Key not configured' });
        }

        const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });

        if (expenses.length === 0) {
            return res.json({
                insight: "Start adding expenses to get AI-powered insights!",
                prediction: 0,
                recommendation: "Keep tracking!"
            });
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

        const currentMonthExpenses = expenses.filter(e => new Date(e.date).getMonth() === currentMonth);
        const lastMonthExpenses = expenses.filter(e => new Date(e.date).getMonth() === lastMonth);

        const currentTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
        const lastTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

        const dataSummary = {
            currentMonthTotal: currentTotal,
            lastMonthTotal: lastTotal,
            recentExpenses: expenses.slice(0, 20).map(e => ({
                item: e.title,
                cat: e.category,
                amt: e.amount,
                date: e.date.toISOString().split('T')[0]
            }))
        };

        const prompt = `
        Analyze these personal expense statistics:
        Current Month Total: ${currentTotal}
        Last Month Total: ${lastTotal}
        Recent Transactions: ${JSON.stringify(dataSummary.recentExpenses)}
        
        Provide a JSON response with exactly these fields:
        1. "insight": A short, personalized observation (max 20 words).
        2. "prediction": A number estimating next month's total expense.
        3. "recommendation": A specific, actionable 1-sentence tip.
        
        IMPORTANT: Return ONLY the JSON object. Do not wrap it in markdown code blocks like \`\`\`json. Just the raw JSON string.
        NOTE: Use Indian Rupees (₹) for any currency symbols in text fields.
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
        });

        let text = completion.choices[0]?.message?.content?.trim();

        // Cleanup if the model still adds markdown
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            data = {
                insight: "Spending looks consistent.",
                prediction: currentTotal,
                recommendation: "Review your recurring bills."
            };
        }

        res.json(data);
    } catch (error) {
        console.error('AI Insights Error Detail:', error.message);
        res.json({
            insight: `AI Error: ${error.message}`,
            prediction: 0,
            recommendation: "Check server logs for details."
        });
    }
});

// 10. AI Financial Coach Mode
router.post('/coach', protect, async (req, res) => {
    try {
        const { message } = req.body;
        if (!process.env.GROQ_API_KEY) {
            return res.status(503).json({ message: 'Groq API Key not configured' });
        }

        const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 }).limit(50);

        // Summarize data for context to avoid hitting token limits
        const expenseContext = expenses.map(e => `${e.date.toISOString().split('T')[0]}: ${e.title} - ${e.amount} (${e.category})`).join('\n');

        const prompt = `
        You are an expert personal finance coach. The user asks: "${message}"

        Here is their recent expense context (last 50 transactions):
        ${expenseContext}

        Provide a helpful, encouraging, and actionable response. 
        If they ask for advice, use their data to back it up. 
        Keep it concise and conversational.
        IMPORTANT: Always use the Indian Rupee symbol (₹) for all monetary values. Do not use the dollar sign ($).
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
        });

        res.json({ message: completion.choices[0]?.message?.content?.trim() });
    } catch (error) {
        console.error('AI Coach Error:', error);
        res.status(500).json({ message: 'AI Coach is currently unavailable.' });
    }
});

// Comprehensive Analysis for AI Page
router.get('/analyze', protect, async (req, res) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            return res.status(503).json({ message: 'Groq API Key not configured' });
        }

        const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });

        if (expenses.length < 5) {
            return res.json({
                anomalies: [],
                suggestedBudget: { "Needs": 0, "Wants": 0, "Savings": 0 },
                savingsTips: ["Start tracking more expenses to unlock AI insights!", "Try to save 20% of your income."],
                potentialSubscriptions: []
            });
        }

        // Prepare data summary
        const simplifiedExpenses = expenses.slice(0, 100).map(e => ({
            d: e.date.toISOString().split('T')[0],
            t: e.title,
            a: e.amount,
            c: e.category
        }));

        const prompt = `
        Analyze these expenses: ${JSON.stringify(simplifiedExpenses)}

        Perform the following 4 tasks and return a strictly valid JSON object:

        1. **Anomaly Detection**: Identify up to 3 unusual transactions (high amount, wrong category, or spike).
        2. **Budget Generation**: Suggest a monthly budget for categories based on spending habits.
        3. **Savings Recommendation**: Give 3 distinct actionable tips (short, medium, long term).
        4. **Subscription Detection**: Identify potential recurring subscriptions based on repeated merchants/amounts.

        IMPORTANT: Use Indian Rupees (₹) for any currency symbols in text descriptions.

        Output Format (JSON ONLY, no markdown):
        {
            "anomalies": [{ "title": "...", "amount": 0, "reason": "..." }],
            "suggestedBudget": { "Food": 0, "Travel": 0, ... },
            "savingsTips": ["Tip 1", "Tip 2", "Tip 3"],
            "potentialSubscriptions": [{ "service": "...", "amount": 0, "frequency": "..." }]
        }
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const data = JSON.parse(completion.choices[0]?.message?.content);
        res.json(data);

    } catch (error) {
        console.error('AI Analysis Error:', error);
        res.status(500).json({ message: 'Failed to generate analysis' });
    }
});

module.exports = router;
