import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useDarkMode } from '../hooks/useDarkMode';

const Privacy = () => {
  const navigation = useNavigation();
  const { colors } = useDarkMode();

  return (
    <div style={{ width: '100%', backgroundColor: colors.bg, color: colors.text, minHeight: '100vh' }}>
      <nav style={{ position: 'fixed', top: 0, width: '100%', zIndex: 50, backgroundColor: colors.navBg, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => navigation.navigate('Landing' as never)}>
            <div style={{ width: '2rem', height: '2rem', backgroundColor: colors.btnPrimary, borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: colors.btnPrimaryText, fontSize: '0.875rem' }}>H</div>
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Huntr AI</span>
          </div>
          <button onClick={() => navigation.navigate('Login' as never)} style={{ fontSize: '0.875rem', fontWeight: 500, padding: '0.5rem 1rem', borderRadius: '0.375rem', backgroundColor: colors.btnPrimary, color: colors.btnPrimaryText, border: 'none', cursor: 'pointer' }}>Sign in</button>
        </div>
      </nav>

      <section style={{ padding: '8rem 1rem 5rem', maxWidth: '80rem', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 300, marginBottom: '2rem', letterSpacing: '-0.025em' }}>Privacy Policy</h1>
        <div style={{ fontSize: '1rem', color: colors.textMuted, lineHeight: 1.8, maxWidth: '48rem' }}>
          <p style={{ marginBottom: '1.5rem' }}>Last updated: November 22, 2025</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Introduction</h2>
          <p style={{ marginBottom: '1.5rem' }}>At Huntr AI, we are committed to protecting your privacy and ensuring the security of your personal and trading data. This Privacy Policy explains how we collect, use, store, and protect your information when you use our AI-powered trading signal platform.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Information We Collect</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Account Information</h3>
          <p style={{ marginBottom: '1rem' }}>When you register for Huntr AI, we collect:</p>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Email address (used for account verification and login)</li>
            <li>Username (unique identifier for your account)</li>
            <li>Password (encrypted using bcrypt with 12-round salt hashing)</li>
            <li>First and last name (optional profile information)</li>
            <li>Profile preferences and settings</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Trading Analysis Data</h3>
          <p style={{ marginBottom: '1rem' }}>When you use our chart analysis features, we collect and process:</p>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Chart images you upload (JPEG, PNG, WebP formats up to 10MB)</li>
            <li>Image metadata (dimensions, format, file size)</li>
            <li>Cryptographic hashes of uploaded images (SHA-256)</li>
            <li>AI analysis results including trading signals, entry points, take profits, and stop losses</li>
            <li>Technical analysis data including support/resistance levels, detected patterns, and trend information</li>
            <li>Market context data including symbols, timeframes, and market types</li>
            <li>Your feedback and ratings on analysis accuracy</li>
            <li>Usage timestamps and analysis history</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Device and Session Information</h3>
          <p style={{ marginBottom: '1rem' }}>For security and user experience purposes, we collect:</p>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Device identifiers and types (mobile, desktop, tablet)</li>
            <li>Browser fingerprints (unique identifiers generated from browser characteristics)</li>
            <li>Browser information and platform details</li>
            <li>Session information and authentication tokens</li>
            <li>Device activity timestamps and login history</li>
          </ul>
          <p style={{ marginBottom: '1.5rem', fontStyle: 'italic', fontSize: '0.9rem' }}>
            Note: We use browser fingerprinting technology to prevent multiple account creation from the same device and ensure platform security. This fingerprint is stored locally and sent during registration to prevent abuse. We do not collect IP addresses or location data.
          </p>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Payment Information</h3>
          <p style={{ marginBottom: '1rem' }}>For premium subscriptions, we securely handle:</p>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Payment references and transaction IDs</li>
            <li>Subscription plan details and billing periods</li>
            <li>Payment confirmation and status information</li>
            <li>Bank transfer details (temporarily stored for verification)</li>
            <li>Payment history and subscription status</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>How We Use Your Information</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Core Platform Services</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Process and analyze your trading chart images using our proprietary Huntr AI models</li>
            <li>Generate trading signals, technical analysis, and market insights</li>
            <li>Maintain your analysis history and provide trend tracking</li>
            <li>Deliver real-time notifications about your account and analyses</li>
            <li>Provide personalized recommendations based on your trading patterns</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Account Management</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Authenticate your identity and secure your account access</li>
            <li>Manage your subscription plans and usage limits</li>
            <li>Process payments and handle billing inquiries</li>
            <li>Provide customer support and technical assistance</li>
            <li>Send important account updates and security notifications</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>AI Model Improvement (Optional)</h3>
          <p style={{ marginBottom: '1rem' }}>With your explicit consent (controlled via your privacy settings), we may use anonymized analysis data to:</p>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Improve the accuracy of our Huntr AI models</li>
            <li>Enhance pattern recognition and technical analysis capabilities</li>
            <li>Develop new features and analytical tools</li>
            <li>Conduct research on market trends and trading patterns</li>
          </ul>
          <p style={{ marginBottom: '1.5rem', fontStyle: 'italic' }}>Note: You can opt out of data training at any time through your account settings. When you opt out, your data will not be used for AI model training purposes.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Data Storage and Security</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Database Architecture</h3>
          <p style={{ marginBottom: '1rem' }}>We employ a dual-database system for enhanced privacy and security:</p>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>User Database:</strong> Stores personal account information, profiles, settings, and analysis history</li>
            <li><strong>Training Database:</strong> Separately stores anonymized analysis data used only for AI model improvement (only if you opt in)</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Security Measures</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>All databases hosted on MongoDB Atlas with enterprise-grade security</li>
            <li>End-to-end encryption for data transmission using HTTPS/TLS</li>
            <li>Password encryption using bcrypt with 12-round salt hashing</li>
            <li>JWT token-based authentication with configurable expiration</li>
            <li>Rate limiting to prevent abuse and unauthorized access attempts</li>
            <li>Regular security audits and monitoring</li>
            <li>Secure file handling with type and size validation</li>
            <li>Automatic token blacklisting for enhanced session security</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Data Retention</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Account data: Retained for the lifetime of your account</li>
            <li>Analysis history: Stored indefinitely unless you delete your account</li>
            <li>Session tokens: Automatically expired based on configured timeouts</li>
            <li>Training data: Retained anonymously if you opt in to data training</li>
            <li>Payment records: Retained for legal and accounting requirements</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Third-Party Integrations</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>AI Processing</h3>
          <p style={{ marginBottom: '1.5rem' }}>Your chart images are processed using our proprietary Huntr AI models and infrastructure. We do not share your trading data with unauthorized third parties.</p>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Market Data Enhancement</h3>
          <p style={{ marginBottom: '1.5rem' }}>We may use web search capabilities to enhance analysis with current market context. This data is anonymized and does not contain your personal information.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Your Privacy Rights</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Data Control</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>Access:</strong> View all your personal data through your account dashboard</li>
            <li><strong>Correction:</strong> Update your profile and account information at any time</li>
            <li><strong>Deletion:</strong> Delete your account and all associated data permanently</li>
            <li><strong>Data Training Opt-out:</strong> Control whether your data is used for AI model improvement</li>
            <li><strong>Export:</strong> Request a copy of your analysis history and account data</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Privacy Settings</h3>
          <p style={{ marginBottom: '1rem' }}>Through your account settings, you can control:</p>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Data training participation (opt-in/opt-out)</li>
            <li>Notification preferences</li>
            <li>Theme and display preferences</li>
            <li>AI model selection preferences</li>
            <li>Analysis agreement settings</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Data Sharing and Disclosure</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>We Do Not Sell Your Data</h3>
          <p style={{ marginBottom: '1.5rem' }}>Huntr AI does not sell, rent, or trade your personal information or trading data to third parties for marketing or commercial purposes.</p>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Limited Disclosure</h3>
          <p style={{ marginBottom: '1rem' }}>We may disclose your information only in the following limited circumstances:</p>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Legal compliance: When required by law, court order, or legal process</li>
            <li>Security protection: To protect our platform, users, or public safety</li>
            <li>Business transfer: In connection with a merger, acquisition, or sale of assets</li>
            <li>Consent: When you explicitly authorize us to share specific information</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>International Data Transfers</h2>
          <p style={{ marginBottom: '1.5rem' }}>Your data is primarily stored and processed in secure cloud infrastructure. We ensure appropriate safeguards are in place for any international data transfers, including encryption and contractual protections.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Children's Privacy</h2>
          <p style={{ marginBottom: '1.5rem' }}>Huntr AI is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Updates to This Policy</h2>
          <p style={{ marginBottom: '1.5rem' }}>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. We will notify you of significant changes through your account dashboard or email. Your continued use of Huntr AI constitutes acceptance of the updated policy.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Contact Information</h2>
          <p style={{ marginBottom: '1.5rem' }}>We do not currently have official contact information established. For privacy-related questions, concerns, or requests, please use the support features available within the application once they become available.</p>
          
          <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>This Privacy Policy is effective as of November 22, 2025 and governs your use of the Huntr AI trading analysis platform.</p>
        </div>
      </section>
    </div>
  );
};

export default Privacy;
