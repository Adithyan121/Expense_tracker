const cron = require('node-cron');
const User = require('../models/User');
const { sendEmail, getMonthlyReminderTemplate } = require('../utils/emailService');

const startMonthlyReminders = () => {
    // Run at 09:00 AM on the 1st day of every month
    cron.schedule('0 9 1 * *', async () => {
        console.log('📅 Running Monthly Budget Reminder Job...');
        try {
            const users = await User.find({});
            console.log(`Found ${users.length} users to remind.`);

            for (const user of users) {
                if (user.email) {
                    const html = getMonthlyReminderTemplate(user.name);
                    await sendEmail(user.email, 'Set Your Budget for the New Month! 🎯', html);

                    // Optional: Reset budget alerts for the new month
                    user.budgetAlerts = {
                        month: new Date().getMonth(),
                        year: new Date().getFullYear(),
                        levels: []
                    };
                    await user.save();
                }
            }
            console.log('✅ Monthly reminders sent successfully.');
        } catch (error) {
            console.error('❌ Error sending monthly reminders:', error);
        }
    });
};

module.exports = startMonthlyReminders;
