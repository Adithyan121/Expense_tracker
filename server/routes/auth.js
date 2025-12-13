const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { sendEmail, getOtpTemplate } = require('../utils/emailService');
const OtpVerification = require('../models/OtpVerification');



const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Register
// Register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Check if there is an existing OTP and delete it
        await OtpVerification.deleteMany({ email });

        // Store OTP and details in temporary collection
        await OtpVerification.create({
            name,
            email,
            password,
            otp
        });

        const html = getOtpTemplate(otp);
        await sendEmail(email, 'Verify Your Account - Bynlora', html);

        res.status(201).json({
            message: 'OTP sent to email',
            email: email
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
    const { email } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Find existing temporary record to get name and password
        const existingRecord = await OtpVerification.findOne({ email });
        if (!existingRecord) {
            return res.status(400).json({ message: 'Session expired. Please register again.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Delete any existing OTP immediately
        await OtpVerification.deleteMany({ email });

        // Create new OTP with preserved details
        await OtpVerification.create({
            name: existingRecord.name,
            email: existingRecord.email,
            password: existingRecord.password,
            otp
        });

        const html = getOtpTemplate(otp);
        await sendEmail(email, 'Resend: Verify Your Account - Bynlora', html);

        res.status(200).json({
            message: 'New OTP sent to email',
            email: email
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Verify OTP
// Verify OTP
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const otpRecord = await OtpVerification.findOne({ email });

        if (!otpRecord) {
            return res.status(400).json({ message: 'OTP expired or invalid' });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Check if user exists (double check)
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create User using details from DB
        const user = await User.create({
            name: otpRecord.name,
            email: otpRecord.email,
            password: otpRecord.password, // Password will be hashed by User model pre-save hook
            isVerified: true
        });

        // Clear OTP
        await OtpVerification.deleteOne({ _id: otpRecord._id });

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
