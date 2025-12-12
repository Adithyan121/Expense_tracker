const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true, // e.g., 'Food', 'Travel'
    },
    date: {
        type: Date,
        default: Date.now,
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'UPI', 'Card', 'Bank'],
        default: 'Cash',
    },
    notes: {
        type: String,
    },
    isRecurring: {
        type: Boolean,
        default: false,
    },
    frequency: {
        type: String,
        enum: ['Weekly', 'Monthly', 'Yearly', null],
        default: null,
    },
    nextOccurrence: {
        type: Date,
        default: null,
    },
    budgetCategory: {
        type: String,
        enum: ['Needs', 'Wants', 'Savings', null],
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
