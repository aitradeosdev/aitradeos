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
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #ffffff; }
        .container { max-width: 600px; margin: 60px auto; padding: 40px; }
        .title { font-size: 48px; font-weight: 900; color: #000000; margin: 0 0 20px 0; line-height: 1.2; text-align: center; }
        .subtitle { font-size: 20px; color: #666666; margin: 0 0 40px 0; font-weight: 400; text-align: center; }
        .alert-box { background: #000000; border-radius: 12px; padding: 30px; margin: 30px 0; color: #ffffff; }
        .alert-title { font-size: 24px; font-weight: 700; margin: 0 0 20px 0; }
        .device-info { background: #1a1a1a; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; margin: 12px 0; font-size: 16px; }
        .info-label { color: #999999; }
        .info-value { color: #ffffff; font-weight: 600; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 30px 0; border-radius: 4px; }
        .warning-text { color: #856404; font-size: 16px; margin: 0; line-height: 1.6; }
        .footer { color: #999999; font-size: 14px; margin-top: 40px; text-align: center; line-height: 1.8; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="title">New Device<br>Login Alert</h1>
        <p class="subtitle">Hi ${username}, we detected a login from a new device</p>
        
        <div class="alert-box">
          <div class="alert-title">Device Information</div>
          <div class="device-info">
            <div class="info-row">
              <span class="info-label">Device Name:</span>
              <span class="info-value">${deviceInfo.name || 'Unknown'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Device Type:</span>
              <span class="info-value">${deviceInfo.type || 'Unknown'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Platform:</span>
              <span class="info-value">${deviceInfo.platform || 'Unknown'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Browser:</span>
              <span class="info-value">${deviceInfo.browser || 'Unknown'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Login Time:</span>
              <span class="info-value">${new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div class="warning">
          <p class="warning-text"><strong>Was this you?</strong><br>If you recognize this device, no action is needed. If you don't recognize this login, please secure your account immediately by changing your password.</p>
        </div>
        
        <div class="footer">
          You can manage your devices in Account Settings<br>
          Security Alert from Huntr AI<br>
          © ${new Date().getFullYear()} Huntr AI
        </div>
      </div>
    </body>
    </html>
  `;
  
  await transporter.sendMail({
    from: `"Huntr AI Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 New Device Login - Huntr AI',
    html
  });
  
  logger.log(`New device login email sent to ${email}`);
};

module.exports = { sendVerificationEmail, sendWelcomeEmail, sendNewDeviceLoginEmail };
