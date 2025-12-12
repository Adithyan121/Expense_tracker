const cron = require('node-cron');
const Expense = require('../models/Expense');

const processRecurringExpenses = () => {
    // Run every day at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Running recurring expense check...');
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Find due recurring expenses
            const dueExpenses = await Expense.find({
                isRecurring: true,
                nextOccurrence: { $lte: today }
            });

            for (const expense of dueExpenses) {
                // Create the new expense occurrence
                const newExpense = new Expense({
                    user: expense.user,
                    title: expense.title, // or `${expense.title} (Recurring)`
                    amount: expense.amount,
                    category: expense.category,
                    date: today, // Today is the payment date
                    paymentMethod: expense.paymentMethod,
                    notes: `Auto-generated recurring payment (from ${expense.date.toISOString().split('T')[0]})`,
                    isRecurring: false, // The copy is not the master recurring trigger
                });
                await newExpense.save();

                // Calculate next occurrence for the master expense
                const nextDate = new Date(expense.nextOccurrence);
                if (expense.frequency === 'Weekly') {
                    nextDate.setDate(nextDate.getDate() + 7);
                } else if (expense.frequency === 'Monthly') {
                    nextDate.setMonth(nextDate.getMonth() + 1);
                } else if (expense.frequency === 'Yearly') {
                    nextDate.setFullYear(nextDate.getFullYear() + 1);
                }

                // Update the master expense
                expense.nextOccurrence = nextDate;
                await expense.save();

                console.log(`Processed recurring expense: ${expense.title}`);
            }
        } catch (error) {
            console.error('Error processing recurring expenses:', error);
        }
    });
};

module.exports = processRecurringExpenses;
