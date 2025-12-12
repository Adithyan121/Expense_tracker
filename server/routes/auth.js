const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { sendEmail, getOtpTemplate } = require('../utils/emailService');


const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        const user = await User.create({
            name,
            email,
            password,
            otp,
            otpExpires,
            isVerified: false
        });

        if (user) {
            const html = getOtpTemplate(otp);
            await sendEmail(user.email, 'Verify Your Account - Bynlora', html);

            res.status(201).json({
                message: 'OTP sent to email',
                email: user.email
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User already verified' });
        }

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = generateToken(user._id);
        res.cookie('token', token, { httpOnly: true, secure: false });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            budget: user.budget,
            token: token,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (!user.isVerified) {
                // Resend OTP if trying to login but not verified
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                user.otp = otp;
                user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
                await user.save();

                const html = getOtpTemplate(otp);
                await sendEmail(user.email, 'Verify Your Account - Bynlora', html);

                return res.status(403).json({
                    message: 'Account not verified. New OTP sent.',
                    requiresOtp: true,
                    email: user.email
                });
            }

            const token = generateToken(user._id);
            res.cookie('token', token, { httpOnly: true, secure: false });
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                budget: user.budget,
                token: token,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    res.status(200).json({ message: 'Logged out' });
});

// Get User Profile
router.get('/me', protect, async (req, res) => {
    res.json(req.user);
});

// Update Profile (Budget etc)
router.put('/profile', protect, async (req, res) => {
    try {
        console.log("📥 Incoming profile update:", req.body);
        console.log("👤 User before update:", req.user);

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.name = req.body.name ?? user.name;
        user.email = req.body.email ?? user.email;

        if (req.body.password) {
            user.password = req.body.password;
        }

        if (req.body.budget !== undefined) {
            user.budget = req.body.budget;
        }

        if (req.body.budgetRule !== undefined) {
            user.budgetRule = req.body.budgetRule;
        }

        const updatedUser = await user.save();

        console.log("✅ User after update:", updatedUser);

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            budget: updatedUser.budget,
            budgetRule: updatedUser.budgetRule,
        });

    } catch (error) {
        console.error("❌ UPDATE ERROR:", error);
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
