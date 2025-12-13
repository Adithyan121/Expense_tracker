const axios = require('axios');

/**
 * Send email using EmailJS
 */
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const data = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: {
        to_email: to,
        subject: subject,
        message_html: htmlContent
      }
    };

    const response = await axios.post(
      'https://api.emailjs.com/api/v1.0/email/send',
      data,
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log(`📩 Email sent to ${to}`);
    return response.data;
  } catch (error) {
    console.error(
      '❌ Email sending failed:',
      error.response?.data || error.message
    );
    throw error;
  }
};

/* =========================================================
   OTP EMAIL TEMPLATE
========================================================= */

const getOtpTemplate = (otp) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Bynlora OTP</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">

  <div style="max-width:600px; margin:40px auto; background-color:#000000; color:#ffffff;
              border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.2);">

    <!-- Header -->
    <div style="background-color:#111; padding:30px 20px; text-align:center; border-bottom:2px solid #333;">
      <h1 style="color:#fff500; margin:0; font-size:28px; font-weight:800; text-transform:uppercase;">
        Bynlora
      </h1>
      <p style="color:#888; margin:5px 0 0; font-size:12px; letter-spacing:2px;">
        Where your spending finds clarity.
      </p>
    </div>

    <!-- Body -->
    <div style="padding:40px 30px; text-align:center;">
      <h2 style="margin-bottom:15px;">Verify Your Account</h2>

      <p style="color:#ccc; line-height:1.6; font-size:16px;">
        Use the One-Time Password (OTP) below to complete your registration.
      </p>

      <div style="background-color:#fff500; color:#000; display:inline-block;
                  padding:15px 40px; border-radius:8px;
                  font-size:32px; font-weight:bold; letter-spacing:8px; margin:30px 0;">
        ${otp}
      </div>

      <p style="color:#666; font-size:13px;">
        This code expires in <strong>10 minutes</strong>.<br/>
        If you did not request this, please ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color:#111; padding:20px; text-align:center; border-top:1px solid #222;">
      <p style="color:#444; font-size:11px; margin:0;">
        &copy; ${new Date().getFullYear()} Bynlora Expense Tracker. All rights reserved.
      </p>
    </div>

  </div>

</body>
</html>
`;
};

/* =========================================================
   BUDGET ALERT EMAIL TEMPLATE
========================================================= */

const getBudgetAlertTemplate = (
  userName,
  percentage,
  totalSpent,
  budgetLimit,
  remaining
) => {
  const isCritical = percentage >= 90;
  const color = isCritical ? '#ff0000' : '#fff500';
  const textColor = isCritical ? '#ffffff' : '#000000';

  return `
<div style="font-family:Arial, sans-serif; max-width:600px; margin:40px auto;
            background-color:#000; color:#fff; padding:20px; border-radius:10px;">

  <div style="text-align:center; border-bottom:1px solid #333; padding-bottom:20px;">
    <h1 style="color:#fff500; margin:0;">Bynlora</h1>
    <p style="color:#888; margin:5px 0;">Financial Intelligence</p>
  </div>

  <div style="padding:30px 0; text-align:center;">
    <div style="display:inline-block; background:${color}; color:${textColor};
                padding:10px 25px; border-radius:50px; font-size:22px; font-weight:bold;">
      ${percentage}% Budget Used
    </div>

    <h2 style="margin:20px 0 10px;">Hello ${userName},</h2>

    <p style="color:#ccc;">
      Here’s a quick snapshot of your monthly budget:
    </p>

    <div style="background:#111; padding:20px; border-radius:8px; margin-top:20px; text-align:left;">
      <p><strong>Total Budget:</strong> ₹${budgetLimit.toLocaleString()}</p>
      <p style="color:${color};"><strong>Total Spent:</strong> ₹${totalSpent.toLocaleString()}</p>
      <p style="color:#00ff00;"><strong>Available:</strong> ₹${remaining.toLocaleString()}</p>
    </div>

    <p style="color:#888; font-size:12px; margin-top:30px;">
      Stay in control with Bynlora 💛
    </p>
  </div>

  <div style="border-top:1px solid #333; padding-top:15px; text-align:center; font-size:10px; color:#555;">
    &copy; ${new Date().getFullYear()} Bynlora Expense Tracker
  </div>
</div>
`;
};

/* =========================================================
   MONTHLY REMINDER EMAIL TEMPLATE
========================================================= */

const getMonthlyReminderTemplate = (userName) => {
  const monthName = new Date().toLocaleString('default', { month: 'long' });

  return `
<div style="font-family:Arial, sans-serif; max-width:600px; margin:40px auto;
            background:#000; color:#fff; padding:20px; border-radius:10px;">

  <div style="text-align:center; border-bottom:1px solid #333; padding-bottom:20px;">
    <h1 style="color:#fff500; margin:0;">Bynlora</h1>
    <p style="color:#888;">New Month, New Goals</p>
  </div>

  <div style="padding:30px 0; text-align:center;">
    <h2>Welcome to ${monthName}!</h2>

    <p style="color:#ccc;">
      Hello ${userName}, it’s the perfect time to plan your finances for this month.
    </p>

    <a href="https://bynlora-app.com"
       style="display:inline-block; margin-top:25px;
              background:#fff500; color:#000; padding:14px 30px;
              text-decoration:none; border-radius:6px; font-weight:bold;">
      Set Budget Now
    </a>
  </div>

  <div style="border-top:1px solid #333; padding-top:15px; text-align:center; font-size:10px; color:#555;">
    &copy; ${new Date().getFullYear()} Bynlora Expense Tracker
  </div>
</div>
`;
};

module.exports = {
  sendEmail,
  getOtpTemplate,
  getBudgetAlertTemplate,
  getMonthlyReminderTemplate
};
