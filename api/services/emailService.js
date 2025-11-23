const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendVerificationEmail = async (email, username, otp) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #ffffff; }
        .container { max-width: 600px; margin: 60px auto; padding: 40px; text-align: center; }
        .title { font-size: 48px; font-weight: 900; color: #000000; margin: 0 0 20px 0; line-height: 1.2; }
        .subtitle { font-size: 24px; color: #666666; margin: 0 0 50px 0; font-weight: 400; }
        .otp-box { background: #000000; border-radius: 12px; padding: 40px; margin: 40px 0; }
        .otp-label { color: #ffffff; font-size: 18px; margin: 0 0 20px 0; font-weight: 500; }
        .otp-code { font-size: 48px; font-weight: 700; color: #ffffff; letter-spacing: 12px; margin: 0; }
        .footer { color: #999999; font-size: 14px; margin-top: 40px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="title">Let's get you<br>signed in</h1>
        <p class="subtitle">Enter the code below to verify your email</p>
        
        <div class="otp-box">
          <p class="otp-label">Your Verification Code</p>
          <div class="otp-code">${otp}</div>
        </div>
        
        <p class="footer">This code expires in 10 minutes<br>© ${new Date().getFullYear()} Huntr AI</p>
      </div>
    </body>
    </html>
  `;
  
  await transporter.sendMail({
    from: `"Huntr AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - Huntr AI',
    html
  });
  
  logger.log(`Verification email sent to ${email}`);
};

const sendWelcomeEmail = async (email, username) => {
  const PaymentModel = require('../models/Payment');
  const PaymentConfig = PaymentModel.model;
  const config = await PaymentConfig.findOne({ isActive: true });
  
  const freeLimit = 1;
  const premiumLimit = config?.premiumPlan?.features?.dailyAnalyses || 5;
  const premiumPrice = config?.premiumPlan?.amount ? (config.premiumPlan.amount / 100) : 0;
  const currency = config?.premiumPlan?.currency || 'NGN';
  const currencySymbol = currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : currency;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #ffffff; }
        .container { max-width: 600px; margin: 60px auto; padding: 40px; }
        .title { font-size: 48px; font-weight: 900; color: #000000; margin: 0 0 20px 0; line-height: 1.2; text-align: center; }
        .subtitle { font-size: 20px; color: #666666; margin: 0 0 40px 0; font-weight: 400; text-align: center; }
        .section { margin: 30px 0; }
        .section-title { font-size: 24px; font-weight: 700; color: #000000; margin: 0 0 15px 0; }
        .feature { margin: 20px 0; padding: 20px; background: #f5f5f5; border-radius: 8px; }
        .feature-title { font-size: 18px; font-weight: 600; color: #000000; margin: 0 0 8px 0; }
        .feature-desc { font-size: 16px; color: #666666; margin: 0; line-height: 1.5; }
        .button { background: #000000; color: #ffffff; text-decoration: none; padding: 18px 40px; border-radius: 12px; display: inline-block; font-size: 18px; font-weight: 600; margin: 30px 0; }
        .button-container { text-align: center; }
        .tips { background: #f9f9f9; padding: 25px; border-radius: 8px; margin: 30px 0; }
        .tips-title { font-size: 20px; font-weight: 700; color: #000000; margin: 0 0 15px 0; }
        .tip { margin: 12px 0; font-size: 16px; color: #666666; line-height: 1.6; }
        .footer { color: #999999; font-size: 14px; margin-top: 50px; text-align: center; line-height: 1.8; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="title">Welcome to<br>Huntr AI</h1>
        <p class="subtitle">Hi ${username}, your account is verified and ready!</p>
        
        <div class="section">
          <h2 class="section-title">What You Can Do</h2>
          
          <div class="feature">
            <div class="feature-title">📊 AI Chart Analysis</div>
            <div class="feature-desc">Upload trading charts and get instant AI-powered analysis with BUY/SELL/HOLD signals. Our trained models analyzes patterns, trends, and technical indicators.</div>
          </div>
          
          <div class="feature">
            <div class="feature-title">🎯 Trading Signals</div>
            <div class="feature-desc">Receive precise entry points, take profit levels, and stop loss recommendations. Each signal includes risk assessment and confidence scores.</div>
          </div>
          
          <div class="feature">
            <div class="feature-title">📈 Real-Time Market Data</div>
            <div class="feature-desc">Enhanced analysis with current market data via web search integration. Stay updated with the latest market conditions.</div>
          </div>
          
          <div class="feature">
            <div class="feature-title">📜 Analysis History</div>
            <div class="feature-desc">Track all your past analyses with filtering and search. Review your trading decisions and learn from historical patterns.</div>
          </div>
        </div>
        
        <div class="tips">
          <div class="tips-title">Getting Started Tips</div>
          <div class="tip">• <strong>Free Plan:</strong> ${freeLimit} analysis per day to test the platform</div>
          <div class="tip">• <strong>Premium Plan:</strong> ${premiumLimit} analyses per day${premiumPrice > 0 ? ` for ${currencySymbol}${premiumPrice}` : ''} with priority support</div>
          <div class="tip">• <strong>Best Results:</strong> Upload clear, high-quality chart images</div>
          <div class="tip">• <strong>Privacy:</strong> Control your data training preferences in settings</div>
        </div>
        
        <div class="button-container">
          <a href="${process.env.FRONTEND_URL}" class="button">Start Analyzing Charts</a>
        </div>
        
        <div class="footer">
          Need help? Contact us anytime<br>
          AI-Powered Trading Signals<br>
          © ${new Date().getFullYear()} Huntr AI - All Rights Reserved
        </div>
      </div>
    </body>
    </html>
  `;
  
  await transporter.sendMail({
    from: `"Huntr AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Huntr AI! 🎯',
    html
  });
  
  logger.log(`Welcome email sent to ${email}`);
};

const sendNewDeviceLoginEmail = async (email, username, deviceInfo) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: #000000; padding: 40px 30px; text-align: center; }
        .title { font-size: 32px; font-weight: 900; color: #ffffff; margin: 0 0 10px 0; }
        .subtitle { font-size: 16px; color: rgba(255,255,255,0.9); margin: 0; }
        .content { padding: 40px 30px; }
        .alert-badge { background: #ff6b6b; color: #ffffff; display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 20px; }
        .message { font-size: 16px; color: #333333; line-height: 1.6; margin-bottom: 30px; }
        .info-box { background: #000000; border-radius: 8px; padding: 24px; margin: 20px 0; }
        .info-title { font-size: 18px; font-weight: 700; color: #ffffff; margin: 0 0 16px 0; }
        .info-row { display: table; width: 100%; margin: 10px 0; }
        .info-label { display: table-cell; color: #999999; font-size: 14px; padding: 6px 0; width: 40%; }
        .info-value { display: table-cell; color: #ffffff; font-size: 14px; font-weight: 600; padding: 6px 0; word-break: break-all; }
        .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 30px 0; border-radius: 4px; }
        .warning-title { font-size: 16px; font-weight: 700; color: #856404; margin: 0 0 8px 0; }
        .warning-text { color: #856404; font-size: 14px; margin: 0; line-height: 1.6; }
        .action-button { display: inline-block; background: #000000; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666666; font-size: 13px; line-height: 1.8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="title">🔐 Security Alert</div>
          <div class="subtitle">New device login detected</div>
        </div>
        
        <div class="content">
          <div class="alert-badge">⚠️ NEW DEVICE</div>
          
          <div class="message">
            Hi <strong>${username}</strong>,<br><br>
            We detected a login to your Huntr AI account from a device we haven't seen before. If this was you, you can safely ignore this email.
          </div>
          
          <div class="info-box">
            <div class="info-title">Login Details</div>
            <div class="info-row">
              <div class="info-label">Time</div>
              <div class="info-value">${deviceInfo.timestamp}</div>
            </div>
            <div class="info-row">
              <div class="info-label">IP Address</div>
              <div class="info-value">${deviceInfo.ipAddress}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Location</div>
              <div class="info-value">${deviceInfo.location}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Device Type</div>
              <div class="info-value">${deviceInfo.deviceType}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Platform</div>
              <div class="info-value">${deviceInfo.platform}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Browser</div>
              <div class="info-value">${deviceInfo.browser}</div>
            </div>
            <div class="info-row">
              <div class="info-label">User Agent</div>
              <div class="info-value" style="font-size: 12px;">${deviceInfo.userAgent}</div>
            </div>
          </div>
          
          <div class="warning-box">
            <div class="warning-title">⚠️ Don't recognize this activity?</div>
            <div class="warning-text">
              If you didn't log in from this device, your account may be compromised. Please change your password immediately and review your account activity.
            </div>
          </div>
          
          <center>
            <a href="${process.env.FRONTEND_URL}/settings" class="action-button">Manage Devices</a>
          </center>
        </div>
        
        <div class="footer">
          <strong>Security Tips:</strong><br>
          • Use a strong, unique password<br>
          • Enable two-factor authentication when available<br>
          • Don't share your login credentials<br>
          • Review your devices regularly in Settings<br><br>
          <strong>Huntr AI Security Team</strong><br>
          © ${new Date().getFullYear()} Huntr AI. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
  
  await transporter.sendMail({
    from: `"Huntr AI Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 New Device Login Detected - Huntr AI',
    html
  });
  
  logger.log(`New device login email sent to ${email}`);
}

module.exports = { sendVerificationEmail, sendWelcomeEmail, sendNewDeviceLoginEmail };
