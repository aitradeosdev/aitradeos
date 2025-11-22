import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useDarkMode } from '../hooks/useDarkMode';

const Terms = () => {
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
        <h1 style={{ fontSize: '3rem', fontWeight: 300, marginBottom: '2rem', letterSpacing: '-0.025em' }}>Terms of Service</h1>
        <div style={{ fontSize: '1rem', color: colors.textMuted, lineHeight: 1.8, maxWidth: '48rem' }}>
          <p style={{ marginBottom: '1.5rem' }}>Last updated: November 22, 2025</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Acceptance of Terms</h2>
          <p style={{ marginBottom: '1.5rem' }}>By creating an account, accessing, or using Huntr AI ("the Platform," "our Service"), you ("User," "you," "your") agree to be legally bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not use our Service. Your continued use of Huntr AI constitutes your acceptance of any modifications to these Terms.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Description of Service</h2>
          <p style={{ marginBottom: '1rem' }}>Huntr AI is an advanced AI-powered trading analysis platform that provides:</p>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Chart image analysis using proprietary Huntr AI models</li>
            <li>Trading signal generation (BUY/SELL/HOLD recommendations)</li>
            <li>Technical analysis including support/resistance levels, patterns, and indicators</li>
            <li>Market context analysis with web search enhancement</li>
            <li>Analysis history tracking and performance monitoring</li>
            <li>User feedback and rating systems for analysis improvement</li>
            <li>Mobile-first application with web platform support</li>
            <li>Multiple subscription tiers with varying usage limits</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Account Registration and Management</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Account Creation</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>You must provide accurate, current, and complete information during registration</li>
            <li>You must be at least 18 years old to create an account</li>
            <li>One person may maintain only one account per device</li>
            <li>Username and email must be unique across the platform</li>
            <li>You are responsible for maintaining the security of your account credentials</li>
            <li>We use device fingerprinting to prevent multiple account creation and ensure platform security</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Account Security</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Passwords must be at least 8 characters long</li>
            <li>You are responsible for all activities under your account</li>
            <li>You must notify us immediately of any unauthorized access</li>
            <li>We implement multi-device session management for your security</li>
            <li>You may manage and revoke access from specific devices through your account settings</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Account Suspension and Termination</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>You may delete your account at any time through account settings</li>
            <li>We may suspend or terminate accounts for violations of these Terms</li>
            <li>Account deletion permanently removes all associated data</li>
            <li>We reserve the right to terminate inactive accounts after reasonable notice</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Subscription Plans and Usage Limits</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Free Plan</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Limited to 1 analysis per day, maximum 30 per month</li>
            <li>Access to basic AI analysis features</li>
            <li>Community-level support</li>
            <li>Standard processing priority</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Premium Plan</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Increased daily and monthly analysis limits</li>
            <li>Access to advanced Huntr AI models</li>
            <li>Priority processing and support</li>
            <li>Enhanced features and analytical capabilities</li>
            <li>Detailed analysis history and performance tracking</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Usage Monitoring</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Usage limits reset daily and monthly as specified in your plan</li>
            <li>Exceeding limits will prevent additional analyses until reset</li>
            <li>Usage statistics are available in your account dashboard</li>
            <li>Rate limiting applies to prevent system abuse</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Payment Terms and Billing</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Payment Processing</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Premium subscriptions are processed through secure bank transfer systems</li>
            <li>Payment requests expire after a specified timeout period</li>
            <li>All payments require manual verification and admin approval</li>
            <li>Payment references are unique and trackable through your account</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Billing and Refunds</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Subscription fees are charged according to your selected plan</li>
            <li>No refunds are provided for partial periods of unused service</li>
            <li>You may cancel your subscription at any time</li>
            <li>Cancelled subscriptions remain active until the end of the billing period</li>
            <li>Payment disputes must be reported within 30 days of the transaction</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Acceptable Use Policy</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Permitted Uses</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Upload legitimate trading charts for analysis</li>
            <li>Use analysis results for personal trading decisions</li>
            <li>Provide feedback to improve service quality</li>
            <li>Access and manage your analysis history</li>
            <li>Adjust privacy and notification settings</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Prohibited Activities</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Uploading non-trading related images or inappropriate content</li>
            <li>Attempting to reverse engineer or replicate our AI models</li>
            <li>Creating multiple accounts to circumvent usage limits</li>
            <li>Sharing account credentials with unauthorized users</li>
            <li>Using automated systems to exceed rate limits</li>
            <li>Engaging in any activity that disrupts or interferes with the Service</li>
            <li>Using the Service for market manipulation or illegal trading activities</li>
            <li>Attempting to gain unauthorized access to other user accounts</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>AI Analysis and Data Usage</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Analysis Agreement</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>You must accept our Analysis Agreement before using chart analysis features</li>
            <li>You understand that AI analysis is provided for informational purposes only</li>
            <li>Analysis results do not constitute financial advice or investment recommendations</li>
            <li>You acknowledge the inherent risks in trading and market analysis</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Data Training Participation</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>You may opt-in to contribute anonymized data for AI model improvement</li>
            <li>Data training participation is entirely voluntary and can be disabled</li>
            <li>Opt-out can be changed at any time through your privacy settings</li>
            <li>Training data is stored separately from your personal information</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Image Upload Requirements</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Accepted formats: JPEG, PNG, WebP</li>
            <li>Maximum file size: 10MB per image</li>
            <li>Images must contain legitimate trading charts</li>
            <li>Multiple images can be analyzed in a single request</li>
            <li>Images are automatically processed and optimized for analysis</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Intellectual Property Rights</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Our Intellectual Property</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Huntr AI platform, including all AI models, algorithms, and technology</li>
            <li>User interface, design elements, and platform architecture</li>
            <li>Proprietary analysis methods and trading signal generation systems</li>
            <li>All content, trademarks, and branding associated with Huntr AI</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Your Content</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>You retain ownership of images and data you upload</li>
            <li>You grant us license to process your content for analysis purposes</li>
            <li>Analysis results and AI-generated content belong to Huntr AI</li>
            <li>You may use analysis results for your personal trading decisions</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Service Availability and Performance</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Service Level</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>We strive to maintain high availability but cannot guarantee 100% uptime</li>
            <li>Maintenance windows may temporarily interrupt service</li>
            <li>Service improvements may require temporary downtime with advance notice</li>
            <li>Premium users receive priority processing during high-demand periods</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Technical Support</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Support is provided through in-app messaging and notification systems</li>
            <li>Premium users receive priority technical support</li>
            <li>We maintain detailed logs for troubleshooting and service improvement</li>
            <li>Response times vary based on subscription level and issue complexity</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Privacy and Data Protection</h2>
          <p style={{ marginBottom: '1.5rem' }}>Your privacy is governed by our comprehensive Privacy Policy, which forms part of these Terms. Key privacy features include:</p>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Dual-database architecture separating personal and training data</li>
            <li>Optional data training participation with full opt-out capability</li>
            <li>Secure data encryption and transmission protocols</li>
            <li>Right to access, correct, and delete your personal information</li>
            <li>No sale or unauthorized sharing of personal data</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Disclaimers and Limitations of Liability</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Service Disclaimers</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>The Service is provided "as is" without warranties of any kind</li>
            <li>AI analysis results are not guaranteed to be accurate or profitable</li>
            <li>We do not warrant that the Service will be error-free or uninterrupted</li>
            <li>Market conditions and external factors may affect analysis accuracy</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Limitation of Liability</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Our liability is limited to the amount you paid for the Service</li>
            <li>We are not liable for trading losses based on our analysis</li>
            <li>Indirect, incidental, or consequential damages are excluded</li>
            <li>You use trading analysis and signals at your own risk</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Indemnification</h2>
          <p style={{ marginBottom: '1.5rem' }}>You agree to indemnify and hold harmless Huntr AI, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Service, violation of these Terms, or infringement of any third-party rights.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Modification of Terms</h2>
          <p style={{ marginBottom: '1.5rem' }}>We reserve the right to modify these Terms at any time. Significant changes will be communicated through in-app notifications or email. Your continued use of the Service after modifications constitutes acceptance of the updated Terms. If you disagree with changes, you must discontinue use of the Service.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Governing Law and Dispute Resolution</h2>
          <p style={{ marginBottom: '1.5rem' }}>These Terms are governed by applicable international laws and regulations. Any disputes arising from your use of the Service will be resolved through binding arbitration or in courts of competent jurisdiction. You waive any right to participate in class action lawsuits against Huntr AI.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Severability and Entire Agreement</h2>
          <p style={{ marginBottom: '1.5rem' }}>If any provision of these Terms is found unenforceable, the remaining provisions will continue in full effect. These Terms, together with our Privacy Policy and any other referenced policies, constitute the entire agreement between you and Huntr AI regarding your use of the Service.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Contact Information</h2>
          <p style={{ marginBottom: '1.5rem' }}>We do not currently have official contact information established. For questions about these Terms of Service, please use the support features available within the application once they become available.</p>
          
          <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>These Terms of Service are effective as of November 22, 2025 and apply to all users of the Huntr AI platform.</p>
        </div>
      </section>
    </div>
  );
};

export default Terms;
