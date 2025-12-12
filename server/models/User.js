const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    budget: {
        type: Number,
        default: 0, // Monthly budget
    },
    budgetRule: {
        type: Boolean,
        default: false,
    },
    budgetAlerts: {
        month: { type: Number, default: new Date().getMonth() },
        year: { type: Number, default: new Date().getFullYear() },
        levels: { type: [Number], default: [] } // Stores [30, 50, 90, 100]
    },
    otp: { type: String },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false }
}, { timestamps: true });

// Password Hash Middleware
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match Password Method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
