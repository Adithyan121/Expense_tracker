const express = require('express');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { sendEmail, getBudgetAlertTemplate } = require('../utils/emailService');


const router = express.Router();

// Get all expenses (with filters)
router.get('/', protect, async (req, res) => {
    try {
        const { keyword, category, startDate, endDate, paymentMethod } = req.query;

        let query = { user: req.user._id };

        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { notes: { $regex: keyword, $options: 'i' } }
            ];
        }

        if (category) {
            query.category = category;
        }

        if (paymentMethod) {
            query.paymentMethod = paymentMethod;
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const expenses = await Expense.find(query).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Helper: Check Budget & Send Email
const checkBudgetAndSendEmail = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user || !user.budget || user.budget === 0) return;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const expenses = await Expense.find({
            user: userId,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
        const percentage = (totalSpent / user.budget) * 100;
        const remaining = user.budget - totalSpent;

        // Reset alerts if new month
        if (user.budgetAlerts.month !== now.getMonth() || user.budgetAlerts.year !== now.getFullYear()) {
            user.budgetAlerts = {
                month: now.getMonth(),
                year: now.getFullYear(),
                levels: []
            };
        }

        const thresholds = [30, 50, 90, 100];
        let alertToSend = null;

        // Check which highest threshold is crossed that hasn't been sent yet
        for (const t of thresholds) {
            if (percentage >= t && !user.budgetAlerts.levels.includes(t)) {
                alertToSend = t;
                // We want to send the highest crossed threshold, but we also want to mark all lower ones as "passed" 
                // so we don't spam if they jump from 20% to 95% instantly.
                // However, the requirement implies sending specific warnings. 
                // Let's send the specific alert for the highest crossed threshold this time.
            }
        }

        if (alertToSend) {
            // Mark this and all lower thresholds as sent
            thresholds.forEach(t => {
                if (percentage >= t && !user.budgetAlerts.levels.includes(t)) {
                    user.budgetAlerts.levels.push(t);
                }
            });

            await user.save();

            const html = getBudgetAlertTemplate(user.name, alertToSend, totalSpent, user.budget, remaining);
            await sendEmail(user.email, `Budget Alert: ${alertToSend}% Used`, html);
        }

    } catch (error) {
        console.error('Budget Check Error:', error);
    }
};


// Create Expense
router.post('/', protect, async (req, res) => {
    const { title, amount, category, date, paymentMethod, notes, isRecurring, frequency } = req.body;
    try {
        let nextOccurrence = null;
        if (isRecurring && frequency) {
            const start = new Date(date);
            nextOccurrence = new Date(start);
            if (frequency === 'Weekly') nextOccurrence.setDate(start.getDate() + 7);
            else if (frequency === 'Monthly') nextOccurrence.setMonth(start.getMonth() + 1);
            else if (frequency === 'Yearly') nextOccurrence.setFullYear(start.getFullYear() + 1);
        }

        const expense = new Expense({
            user: req.user._id,
            title,
            amount,
            category,
            date,
            paymentMethod,
            notes,
            isRecurring,
            frequency,
            nextOccurrence
        });
        const createdExpense = await expense.save();

        // Check budget asynchronously
        checkBudgetAndSendEmail(req.user._id);

        res.status(201).json(createdExpense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Expense
router.put('/:id', protect, async (req, res) => {
    const { title, amount, category, date, paymentMethod, notes, isRecurring, frequency } = req.body;
    try {
        const expense = await Expense.findById(req.params.id);
        if (expense) {
            if (expense.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            expense.title = title || expense.title;
            expense.amount = amount || expense.amount;
            expense.category = category || expense.category;
            expense.date = date || expense.date;
            expense.paymentMethod = paymentMethod || expense.paymentMethod;
            expense.notes = notes || expense.notes;

            // Handle recurring updates
            if (isRecurring !== undefined) expense.isRecurring = isRecurring;
            if (frequency !== undefined) expense.frequency = frequency;

            // Recalculate nextOccurrence if recurring details changed and it's active
            if (expense.isRecurring && expense.frequency) {
                // Use current date or existing date to project next? Use expense.date as anchor
                const anchor = new Date(expense.date);
                // If we passed a past date, this might schedule immediate runs. 
                // For simplicity, just set next based on expense date.
                let next = new Date(anchor);
                if (expense.frequency === 'Weekly') next.setDate(anchor.getDate() + 7);
                else if (expense.frequency === 'Monthly') next.setMonth(anchor.getMonth() + 1);
                else if (expense.frequency === 'Yearly') next.setFullYear(anchor.getFullYear() + 1);
                expense.nextOccurrence = next;
            } else {
                expense.nextOccurrence = null;
            }

            const updatedExpense = await expense.save();

            // Check budget asynchronously
            checkBudgetAndSendEmail(req.user._id);

            res.json(updatedExpense);
        } else {
            res.status(404).json({ message: 'Expense not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Delete Expense
router.delete('/:id', protect, async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (expense) {
            if (expense.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            await expense.deleteOne();
            res.json({ message: 'Expense removed' });
        } else {
            res.status(404).json({ message: 'Expense not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
