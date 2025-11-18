import React from 'react';
import { useNavigation } from '@react-navigation/native';

const Disclaimer = () => {
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
        <h1 style={{ fontSize: '3rem', fontWeight: 300, marginBottom: '2rem', letterSpacing: '-0.025em' }}>Disclaimer</h1>
        <div style={{ fontSize: '1rem', color: '#4b5563', lineHeight: 1.8, maxWidth: '48rem' }}>
          <p style={{ marginBottom: '1.5rem', fontWeight: 600, color: '#ef4444', fontSize: '1.125rem', border: '2px solid #ef4444', padding: '1rem', borderRadius: '0.5rem', backgroundColor: '#fef2f2' }}>
            ⚠️ CRITICAL DISCLAIMER: This is not financial advice. Trading involves substantial risk of loss. Please read this disclaimer in its entirety before using Huntr AI.
          </p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Financial Risk Disclosure</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>High Risk of Financial Loss</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>Total Loss Risk:</strong> You can lose your entire trading capital. Never invest money you cannot afford to lose completely.</li>
            <li><strong>Leverage Amplification:</strong> If you use margin or leveraged trading, losses can exceed your initial investment.</li>
            <li><strong>Market Volatility:</strong> Cryptocurrency and financial markets are extremely volatile and unpredictable.</li>
            <li><strong>No Guarantee of Profits:</strong> Past performance is not indicative of future results. Profitable analysis results do not guarantee future success.</li>
            <li><strong>Rapid Market Changes:</strong> Market conditions can change instantly, making analysis obsolete within minutes or seconds.</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Trading-Specific Risks</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>Execution Risk:</strong> Price slippage, order delays, and technical failures can impact trade execution</li>
            <li><strong>Liquidity Risk:</strong> Some markets may have low liquidity, making it difficult to enter or exit positions</li>
            <li><strong>Gap Risk:</strong> Markets can gap up or down, bypassing stop-loss orders</li>
            <li><strong>Overnight and Weekend Risk:</strong> Markets can move significantly when closed or during low-volume periods</li>
            <li><strong>Counterparty Risk:</strong> Risk associated with the financial stability of brokers and exchanges</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>AI Technology Limitations</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Artificial Intelligence Constraints</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>Pattern Recognition Limitations:</strong> Our Huntr AI models analyze historical patterns that may not predict future market behavior</li>
            <li><strong>Data Dependency:</strong> AI analysis quality depends on the clarity and accuracy of uploaded chart images</li>
            <li><strong>Model Training Limitations:</strong> AI models are trained on historical data and may not adapt quickly to new market conditions</li>
            <li><strong>False Signals:</strong> AI can generate incorrect signals, leading to poor trading decisions</li>
            <li><strong>Overfitting Risk:</strong> AI models may perform well on historical data but fail in live market conditions</li>
            <li><strong>Black Box Nature:</strong> AI decision-making processes are complex and may not always be fully explainable</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Technical Analysis Limitations</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>Subjective Interpretation:</strong> Chart patterns and technical indicators can be interpreted differently</li>
            <li><strong>Self-Fulfilling Prophecies:</strong> Widely followed technical levels may become targets for manipulation</li>
            <li><strong>Fundamental Override:</strong> Technical analysis may be overridden by fundamental news and events</li>
            <li><strong>Timeframe Conflicts:</strong> Different timeframes may show conflicting signals</li>
            <li><strong>Market Regime Changes:</strong> Technical patterns may become less effective during different market conditions</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Platform and Service Limitations</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Technology Risks</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>System Downtime:</strong> Platform maintenance or technical issues may prevent access during critical trading moments</li>
            <li><strong>Analysis Delays:</strong> AI processing time may cause delays in receiving trading signals</li>
            <li><strong>Image Quality Issues:</strong> Poor quality chart images may result in inaccurate analysis</li>
            <li><strong>Network Connectivity:</strong> Internet or server issues may disrupt service availability</li>
            <li><strong>Software Bugs:</strong> Technical errors in the platform may affect analysis accuracy</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Data and Information Limitations</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>Incomplete Information:</strong> Chart images may not contain all relevant market information</li>
            <li><strong>Data Lag:</strong> Market data used for analysis may not be real-time</li>
            <li><strong>Limited Context:</strong> AI analysis may not account for current news, events, or market sentiment</li>
            <li><strong>Multi-Timeframe Analysis:</strong> Single chart analysis may not capture broader market trends</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Not Financial or Investment Advice</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Educational and Informational Purpose Only</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>No Investment Advice:</strong> Huntr AI provides educational analysis tools, not investment or financial advice</li>
            <li><strong>No Recommendations:</strong> Trading signals are analytical outputs, not recommendations to buy, sell, or hold</li>
            <li><strong>No Fiduciary Duty:</strong> We do not act as your financial advisor or have fiduciary responsibilities</li>
            <li><strong>Independent Decision Making:</strong> All trading decisions are solely your responsibility</li>
            <li><strong>Professional Consultation:</strong> Always consult with licensed financial professionals before making investment decisions</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Regulatory Compliance</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>No Regulatory Oversight:</strong> Huntr AI is not regulated as a financial services provider</li>
            <li><strong>Jurisdictional Variations:</strong> Trading regulations vary by country and jurisdiction</li>
            <li><strong>Compliance Responsibility:</strong> You are responsible for ensuring compliance with local laws and regulations</li>
            <li><strong>Tax Obligations:</strong> You are responsible for understanding and meeting all tax obligations</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Market-Specific Risk Factors</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Cryptocurrency Markets</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>Extreme Volatility:</strong> Cryptocurrency prices can fluctuate wildly within short periods</li>
            <li><strong>24/7 Markets:</strong> Crypto markets never close, creating continuous risk exposure</li>
            <li><strong>Regulatory Uncertainty:</strong> Government regulations can dramatically impact cryptocurrency values</li>
            <li><strong>Technology Risks:</strong> Blockchain technology, smart contracts, and exchange hacks present unique risks</li>
            <li><strong>Market Manipulation:</strong> Lower liquidity markets may be more susceptible to price manipulation</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Traditional Financial Markets</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>Economic Events:</strong> Economic data releases and policy changes can cause market volatility</li>
            <li><strong>Geopolitical Risks:</strong> Political events and international conflicts can impact market stability</li>
            <li><strong>Interest Rate Risk:</strong> Central bank policies can significantly affect asset prices</li>
            <li><strong>Sector-Specific Risks:</strong> Industry-specific events can impact related securities</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>User Responsibilities and Best Practices</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Personal Due Diligence</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>Independent Research:</strong> Always conduct your own research and analysis before making trading decisions</li>
            <li><strong>Risk Management:</strong> Implement proper position sizing, stop-losses, and risk management strategies</li>
            <li><strong>Diversification:</strong> Never put all your capital in a single trade or asset</li>
            <li><strong>Education:</strong> Continuously educate yourself about trading, markets, and risk management</li>
            <li><strong>Emotional Control:</strong> Maintain emotional discipline and avoid impulsive decisions based on fear or greed</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Platform Usage Guidelines</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>Clear Image Quality:</strong> Upload high-quality, clear chart images for better analysis accuracy</li>
            <li><strong>Multiple Confirmations:</strong> Use Huntr AI analysis as one of multiple confirmation tools</li>
            <li><strong>Timeframe Awareness:</strong> Consider multiple timeframes when making trading decisions</li>
            <li><strong>Regular Updates:</strong> Market conditions change; regularly update your analysis</li>
            <li><strong>Feedback Participation:</strong> Provide honest feedback to help improve AI accuracy over time</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Limitation of Liability</h2>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>No Liability for Trading Losses</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>Direct Losses:</strong> Huntr AI is not liable for any trading losses resulting from using our platform</li>
            <li><strong>Indirect Damages:</strong> We are not responsible for opportunity costs, lost profits, or consequential damages</li>
            <li><strong>Technical Issues:</strong> No liability for losses due to platform downtime, errors, or technical problems</li>
            <li><strong>Data Accuracy:</strong> We make no warranties about the accuracy or completeness of analysis results</li>
            <li><strong>Third-Party Actions:</strong> Not responsible for losses due to broker actions, market makers, or other third parties</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'black', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Service Disclaimers</h3>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>"As Is" Basis:</strong> All services are provided on an "as is" and "as available" basis</li>
            <li><strong>No Warranties:</strong> We disclaim all warranties, express or implied, including merchantability and fitness for purpose</li>
            <li><strong>Continuous Improvement:</strong> AI models and platform features are continuously evolving and may change</li>
            <li><strong>Beta Features:</strong> Some features may be in beta and carry additional risks</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Age and Eligibility Requirements</h2>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li><strong>Minimum Age:</strong> You must be at least 18 years old to use Huntr AI</li>
            <li><strong>Legal Capacity:</strong> You must have the legal capacity to enter into financial agreements</li>
            <li><strong>Jurisdictional Compliance:</strong> Use must be legal in your jurisdiction</li>
            <li><strong>Risk Understanding:</strong> You must fully understand and accept all risks associated with trading</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Professional Advice Recommendation</h2>
          <p style={{ marginBottom: '1rem' }}>Before making any trading or investment decisions, we strongly recommend consulting with:</p>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>
            <li>Licensed financial advisors or investment professionals</li>
            <li>Certified public accountants for tax implications</li>
            <li>Legal counsel for regulatory compliance</li>
            <li>Risk management specialists for portfolio strategy</li>
          </ul>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Acknowledgment of Risk</h2>
          <p style={{ marginBottom: '1.5rem', fontWeight: 600, padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #ef4444', borderRadius: '0.5rem' }}>
            By using Huntr AI, you acknowledge that you have read, understood, and accept all risks outlined in this disclaimer. You confirm that you are using our platform for educational and informational purposes only, and that you will make all trading decisions based on your own research and analysis, with full understanding of the potential for substantial financial loss.
          </p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Updates and Modifications</h2>
          <p style={{ marginBottom: '1.5rem' }}>This disclaimer may be updated periodically to reflect changes in our services, market conditions, or regulatory requirements. We will notify users of significant changes through our platform. Your continued use of Huntr AI constitutes acceptance of any updated disclaimer.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'black', marginTop: '2rem', marginBottom: '1rem' }}>Contact Information</h2>
          <p style={{ marginBottom: '1.5rem' }}>We do not currently have official contact information established. If you have questions about this disclaimer or need clarification on any risks, please use the support features available within the application once they become available.</p>
          
          <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic', fontWeight: 600 }}>
            This disclaimer is effective as of November 16, 2025. By using Huntr AI, you acknowledge that trading is inherently risky and that you may lose money. Please trade responsibly.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Disclaimer;
