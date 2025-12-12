const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, htmlContent) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Bynlora Expense Tracker" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const getBudgetAlertTemplate = (userName, percentage, totalSpent, budgetLimit, remaining) => {
    const isCritical = percentage >= 90;
    const color = isCritical ? '#ff0000' : '#fff500';
    const textColor = isCritical ? '#ffffff' : '#000000';

    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000000; color: #ffffff; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #333;">
            <h1 style="color: #fff500; margin: 0;">Bynlora</h1>
            <p style="color: #888; margin: 5px 0;">Financial Intelligence</p>
        </div>
        
        <div style="padding: 30px 0; text-align: center;">
            <div style="display: inline-block; background-color: ${color}; color: ${textColor}; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 50px; margin-bottom: 20px;">
                ${percentage}% Budget Used
            </div>
            
            <h2 style="margin-bottom: 10px;">Hello ${userName},</h2>
            <p style="color: #ccc; line-height: 1.6;">
                You have used <strong>${percentage}%</strong> of your monthly budget. 
                Here is a quick snapshot of your finances:
            </p>
            
            <div style="background-color: #111; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 10px;">
                    <span style="color: #888;">Total Budget</span>
                    <span style="font-weight: bold;">₹${budgetLimit.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 10px;">
                    <span style="color: #888;">Total Spent</span>
                    <span style="font-weight: bold; color: ${color};">₹${totalSpent.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #888;">Available Balance</span>
                    <span style="font-weight: bold; color: #00ff00;">₹${remaining.toLocaleString()}</span>
                </div>
            </div>

            <p style="color: #888; font-size: 12px; margin-top: 30px;">
                Keep tracking to stay on top of your goals!<br>
                - Your AI Financial Coach
            </p>
        </div>
        
        <div style="text-align: center; border-top: 1px solid #333; padding-top: 20px; color: #555; font-size: 10px;">
            &copy; ${new Date().getFullYear()} Bynlora Expense Tracker. All rights reserved.
        </div>
    </div>
    `;
};

const getOtpTemplate = (otp) => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000000; color: #ffffff; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #333;">
            <h1 style="color: #fff500; margin: 0;">Bynlora</h1>
            <p style="color: #888; margin: 5px 0;">Verify Your Account</p>
        </div>
        
        <div style="padding: 30px 0; text-align: center;">
            <h2 style="margin-bottom: 10px;">Your OTP Code</h2>
            <p style="color: #ccc;">Use the code below to complete your registration.</p>
            
            <div style="background-color: #fff500; color: #000000; font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 15px; border-radius: 8px; display: inline-block; margin: 20px 0;">
                ${otp}
            </div>

            <p style="color: #888; font-size: 12px; margin-top: 20px;">
                This code expires in 10 minutes.<br>
                If you didn't request this, please ignore this email.
            </p>
        </div>
    </div>
    `;
};

const getMonthlyReminderTemplate = (userName) => {
    const monthName = new Date().toLocaleString('default', { month: 'long' });
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000000; color: #ffffff; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #333;">
            <h1 style="color: #fff500; margin: 0;">Bynlora</h1>
            <p style="color: #888; margin: 5px 0;">New Month, New Goals</p>
        </div>
        
        <div style="padding: 30px 0; text-align: center;">
            <h2 style="margin-bottom: 10px;">Welcome to ${monthName}!</h2>
            <p style="color: #ccc; line-height: 1.6;">
                Hello ${userName}, it's the start of a new month. 
                This is the perfect time to review your financial goals and set your budget for <strong>${monthName}</strong>.
            </p>
            
            <div style="margin: 30px 0;">
                <a href="https://bynlora-app.com" style="background-color: #fff500; color: #000000; text-decoration: none; font-weight: bold; padding: 15px 30px; border-radius: 5px; display: inline-block;">
                    Set Budget Now
                </a>
            </div>

            <p style="color: #888; font-size: 12px; margin-top: 20px;">
                "A budget is telling your money where to go instead of wondering where it went."
            </p>
        </div>
        
        <div style="text-align: center; border-top: 1px solid #333; padding-top: 20px; color: #555; font-size: 10px;">
            &copy; ${new Date().getFullYear()} Bynlora Expense Tracker. All rights reserved.
        </div>
    </div>
    `;
};

module.exports = { sendEmail, getBudgetAlertTemplate, getOtpTemplate, getMonthlyReminderTemplate };
