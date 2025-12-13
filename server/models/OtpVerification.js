const mongoose = require('mongoose');

const otpVerificationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600, // Document automatically deletes after 10 minutes (600 seconds)
    }
});

module.exports = mongoose.model('OtpVerification', otpVerificationSchema);
