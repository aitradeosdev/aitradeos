import React from 'react';
import { useNavigation } from '@react-navigation/native';

const About = () => {
  const navigation = useNavigation();

  return (
    <div style={{ width: '100%', backgroundColor: 'white', color: 'black', minHeight: '100vh' }}>
      <nav style={{ position: 'fixed', top: 0, width: '100%', zIndex: 50, backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => navigation.navigate('Landing' as never)}>
            <div style={{ width: '2rem', height: '2rem', backgroundColor: 'black', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', fontSize: '0.875rem' }}>H</div>
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Huntr AI</span>
          </div>
          <button onClick={() => navigation.navigate('Login' as never)} style={{ fontSize: '0.875rem', fontWeight: 500, padding: '0.5rem 1rem', borderRadius: '0.375rem', backgroundColor: 'black', color: 'white', border: 'none', cursor: 'pointer' }}>Sign in</button>
        </div>
      </nav>

      <section style={{ padding: '8rem 1rem 5rem', maxWidth: '80rem', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 300, marginBottom: '2rem', letterSpacing: '-0.025em' }}>About Huntr AI</h1>
        <div style={{ fontSize: '1rem', color: '#4b5563', lineHeight: 1.8, maxWidth: '64rem' }}>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Our Mission</h2>
          <p style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Huntr AI revolutionizes trading analysis by democratizing access to professional-grade AI-powered market insights. We empower traders of all experience levels with advanced artificial intelligence that transforms complex chart patterns into actionable trading signals, helping you make informed decisions in an increasingly dynamic financial landscape.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Platform Overview</h2>
          <p style={{ marginBottom: '1.5rem' }}>Huntr AI is designed to address the challenges modern traders face in analyzing complex market patterns quickly and accurately. The platform combines artificial intelligence with chart analysis to provide actionable trading insights.</p>
          <p style={{ marginBottom: '1.5rem' }}>Our technology focuses on pattern recognition, technical analysis, and risk management to help traders make more informed decisions across various market conditions and timeframes.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Technology Innovation</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Proprietary Huntr AI Models</h3>
          <p style={{ marginBottom: '1rem' }}>At the core of our platform are proprietary artificial intelligence models specifically designed for trading chart analysis:</p>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>Advanced Pattern Recognition:</strong> Our models can identify complex chart patterns, trend reversals, and continuation signals across multiple timeframes</li>
            <li><strong>Multi-Modal Analysis:</strong> Integration of price action, volume analysis, and technical indicators for comprehensive market assessment</li>
            <li><strong>Real-Time Processing:</strong> Lightning-fast analysis that processes charts within seconds of upload</li>
            <li><strong>Continuous Learning:</strong> Models that improve accuracy through user feedback and market evolution</li>
            <li><strong>Cross-Market Expertise:</strong> Trained on diverse asset classes including cryptocurrencies, forex, stocks, and commodities</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Platform Architecture</h3>
          <p style={{ marginBottom: '1rem' }}>Our robust technical infrastructure ensures reliability, security, and scalability:</p>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>Cloud-Native Design:</strong> Built on enterprise-grade cloud infrastructure for maximum reliability and global accessibility</li>
            <li><strong>Mobile-First Approach:</strong> Native mobile applications with seamless web integration for trading on-the-go</li>
            <li><strong>Dual Database Architecture:</strong> Separate systems for user data and AI training data to ensure privacy and security</li>
            <li><strong>Real-Time Synchronization:</strong> Instant updates across all devices and platforms</li>
            <li><strong>Advanced Security:</strong> Military-grade encryption, JWT authentication, and comprehensive rate limiting</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Image Processing Pipeline</h3>
          <p style={{ marginBottom: '1rem' }}>Our sophisticated image processing system ensures optimal analysis accuracy:</p>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>Multi-Format Support:</strong> Accept JPEG, PNG, and WebP formats up to 10MB</li>
            <li><strong>Intelligent Optimization:</strong> Automatic image compression and enhancement for AI processing</li>
            <li><strong>Quality Validation:</strong> Ensures uploaded charts meet minimum quality standards for accurate analysis</li>
            <li><strong>Batch Processing:</strong> Capability to analyze multiple charts simultaneously</li>
            <li><strong>Secure Handling:</strong> Cryptographic hashing and secure storage of all uploaded content</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Core Features and Capabilities</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Comprehensive Trading Analysis</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>Signal Generation:</strong> Clear BUY, SELL, or HOLD recommendations with confidence levels</li>
            <li><strong>Entry Points:</strong> Precise price levels for optimal trade entry</li>
            <li><strong>Risk Management:</strong> Calculated stop-loss levels and take-profit targets</li>
            <li><strong>Support and Resistance:</strong> Identification of key price levels and breakout points</li>
            <li><strong>Trend Analysis:</strong> Multi-timeframe trend direction and strength assessment</li>
            <li><strong>Market Context:</strong> Enhanced analysis with current market conditions and sentiment</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>User Experience Excellence</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>Intuitive Interface:</strong> Clean, professional design optimized for mobile and desktop use</li>
            <li><strong>Analysis History:</strong> Comprehensive tracking of all past analyses with performance metrics</li>
            <li><strong>Feedback System:</strong> Rate and comment on analysis accuracy to improve AI models</li>
            <li><strong>Personalization:</strong> Customizable themes, notifications, and AI model preferences</li>
            <li><strong>Multi-Device Sync:</strong> Seamless experience across all your devices</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Advanced Account Management</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>Flexible Subscription Plans:</strong> Free and premium tiers to suit different trading needs</li>
            <li><strong>Usage Analytics:</strong> Detailed statistics on your analysis patterns and performance</li>
            <li><strong>Device Management:</strong> Monitor and control access from multiple devices</li>
            <li><strong>Privacy Controls:</strong> Granular settings for data usage and AI training participation</li>
            <li><strong>Security Features:</strong> Two-factor authentication, session management, and device tracking</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Privacy and Security Commitment</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Data Protection Philosophy</h3>
          <p style={{ marginBottom: '1rem' }}>We believe that privacy is a fundamental right, especially when handling sensitive trading information:</p>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>Privacy by Design:</strong> Built-in privacy protections at every level of our platform</li>
            <li><strong>User Control:</strong> Complete control over your data with easy opt-out capabilities</li>
            <li><strong>Transparency:</strong> Clear communication about how we collect, use, and protect your information</li>
            <li><strong>Minimal Collection:</strong> We only collect data necessary for platform functionality</li>
            <li><strong>No Data Sales:</strong> We never sell or share your personal trading information</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Security Infrastructure</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>Enterprise Encryption:</strong> Advanced encryption for all data transmission and storage</li>
            <li><strong>Secure Authentication:</strong> JWT tokens with configurable expiration and blacklisting</li>
            <li><strong>Rate Limiting:</strong> Sophisticated protection against abuse and unauthorized access</li>
            <li><strong>Regular Security Audits:</strong> Continuous monitoring and improvement of security measures</li>
            <li><strong>Compliance Standards:</strong> Adherence to international data protection regulations</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Subscription Plans and Accessibility</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Free Plan Benefits</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>1 chart analysis per day (up to 30 per month)</li>
            <li>Access to core AI analysis features</li>
            <li>Basic analysis history tracking</li>
            <li>Community support forums</li>
            <li>Mobile and web platform access</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Premium Plan Features</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>5 chart analyses per day (up to 150 per month)</li>
            <li>Priority customer support with faster response times</li>
            <li>Extended analysis history with detailed performance tracking</li>
            <li>Access to all available AI models and features</li>
            <li>30-day subscription duration with auto-renewal options</li>
            <li>Enhanced account management and usage analytics</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Global Reach and Community</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Worldwide Trading Support</h3>
          <p style={{ marginBottom: '1rem' }}>Huntr AI serves traders across the globe with support for multiple markets and trading styles:</p>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>Multi-Asset Coverage:</strong> Cryptocurrency, forex, stocks, commodities, and derivatives</li>
            <li><strong>Global Market Hours:</strong> 24/7 availability to match international trading schedules</li>
            <li><strong>Multiple Currencies:</strong> Support for various fiat currencies and cryptocurrency payments</li>
            <li><strong>Localized Experience:</strong> Platform optimization for different regions and trading preferences</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Community and Education</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>Active User Community:</strong> Thousands of traders sharing insights and experiences</li>
            <li><strong>Educational Resources:</strong> Comprehensive guides on AI-assisted trading</li>
            <li><strong>Best Practices:</strong> Regular updates on optimal platform usage and risk management</li>
            <li><strong>Feedback Integration:</strong> Community input directly influences platform development</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Innovation and Development</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Continuous Improvement</h3>
          <p style={{ marginBottom: '1rem' }}>Our commitment to innovation drives constant platform enhancement:</p>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>Regular AI Model Updates:</strong> Continuous improvement of analysis accuracy and capabilities</li>
            <li><strong>Feature Enhancement:</strong> Monthly platform updates with new functionality</li>
            <li><strong>User-Driven Development:</strong> Feature requests and feedback shape our roadmap</li>
            <li><strong>Technology Integration:</strong> Adoption of latest AI and fintech innovations</li>
            <li><strong>Performance Optimization:</strong> Ongoing improvements to speed and reliability</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Research and Development</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>AI Research Team:</strong> Dedicated scientists working on next-generation trading algorithms</li>
            <li><strong>Market Analysis:</strong> Continuous study of market evolution and pattern changes</li>
            <li><strong>Technology Partnerships:</strong> Collaboration with leading AI and fintech companies</li>
            <li><strong>Academic Cooperation:</strong> Partnerships with universities for cutting-edge research</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Responsible AI and Ethics</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Ethical AI Principles</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>Transparency:</strong> Clear communication about AI capabilities and limitations</li>
            <li><strong>User Empowerment:</strong> Tools that enhance rather than replace human decision-making</li>
            <li><strong>Bias Prevention:</strong> Continuous monitoring and correction of algorithmic biases</li>
            <li><strong>Educational Focus:</strong> Emphasis on learning and understanding rather than blind following</li>
            <li><strong>Risk Awareness:</strong> Constant reminders about trading risks and responsible use</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Responsible Trading Advocacy</h3>
          <p style={{ marginBottom: '1rem' }}>We promote responsible trading practices through:</p>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Comprehensive risk disclaimers and educational content</li>
            <li>Built-in reminders about proper risk management</li>
            <li>Encouragement of diversified analysis approaches</li>
            <li>Support for gradual learning and skill development</li>
            <li>Integration with professional financial advice resources</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Customer Support and Service</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Comprehensive Support System</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>In-App Messaging:</strong> Direct communication through the platform interface</li>
            <li><strong>Real-Time Notifications:</strong> Instant updates on account status and important information</li>
            <li><strong>Comprehensive Documentation:</strong> Detailed guides and FAQs for all platform features</li>
            <li><strong>Video Tutorials:</strong> Step-by-step instructions for optimal platform usage</li>
            <li><strong>Community Forums:</strong> Peer-to-peer support and knowledge sharing</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Premium Support Benefits</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Priority response times for technical issues</li>
            <li>Direct access to platform specialists</li>
            <li>Personalized onboarding and training sessions</li>
            <li>Advanced troubleshooting and optimization guidance</li>
            <li>Early access to new features and capabilities</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Future Vision</h2>
          <p style={{ marginBottom: '1.5rem' }}>Looking ahead, Huntr AI continues to evolve with ambitious plans to revolutionize trading analysis further. We envision a future where artificial intelligence seamlessly integrates with human expertise, creating unprecedented opportunities for traders to succeed in dynamic markets while maintaining full control over their trading decisions.</p>
          
          <p style={{ marginBottom: '1.5rem' }}>Our roadmap includes advanced multi-asset analysis, real-time market sentiment integration, enhanced mobile capabilities, and expanded educational resources. Through continuous innovation and unwavering commitment to user success, we're building the next generation of intelligent trading tools.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Get Started Today</h2>
          <p style={{ marginBottom: '1.5rem' }}>Whether you're a beginner looking to understand chart patterns or an experienced trader seeking to enhance your analysis capabilities, Huntr AI provides the tools and insights you need to navigate today's complex financial markets with confidence.</p>
          
          <p style={{ marginBottom: '2rem' }}>Experience the power of AI-driven trading insights with Huntr AI. Start with our free plan and discover how artificial intelligence can enhance your market analysis capabilities.</p>
          
          <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>
            Huntr AI - Where artificial intelligence meets trading excellence.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
