import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import LogoSlider from '../components/LogoSlider';
import { apiService } from '../services/apiService';

const ActiveUsersCounter = () => {
  const [activeUsers, setActiveUsers] = useState(10000);

  useEffect(() => {
    fetchActiveUsers();
    const interval = setInterval(fetchActiveUsers, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchActiveUsers = async () => {
    try {
      const response = await apiService.get('/admin/active-users');
      setActiveUsers(response.data.activeUsersCount);
    } catch (error) {
      console.log('Failed to fetch active users');
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <div>
      <div style={{ fontSize: 32, fontWeight: 300, marginBottom: 4 }}>{formatNumber(activeUsers)}+</div>
      <div style={{ fontSize: 14, color: 'inherit', opacity: 0.7 }}>Active Traders</div>
    </div>
  );
};

const Landing = () => {
  const navigation = useNavigation();
  const [pricing, setPricing] = useState({ amount: 99, currency: 'USD', displayAmount: '$99', features: [], freePlan: null });
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(darkMode);
    
    const listener = (e) => setIsDark(e.matches);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);
    return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    fetchPricing();
    fetchFeaturedBlogs();
  }, []);

  const fetchPricing = async () => {
    try {
      const response = await apiService.get('/payment/plans');
      if (response.data?.plans?.premium) {
        const premium = response.data.plans.premium;
        const features = premium.features || {};
        const featureList = [
          `${features.dailyAnalyses || 'Unlimited'} analyses per day`,
          `${features.monthlyAnalyses || 'Unlimited'} analyses per month`,
          `${features.supportLevel || 'Priority'} support`,
          ...(features.additionalFeatures || [])
        ];
        setPricing({
          amount: premium.price,
          currency: premium.currency,
          displayAmount: premium.displayPrice,
          features: featureList,
          freePlan: response.data.plans.free
        });
      }
    } catch (error) {
      console.log('Failed to fetch pricing');
    }
  };

  const fetchFeaturedBlogs = async () => {
    try {
      let response = await apiService.getPublicBlogs({ featured: true, limit: 3 });
      if (!response.data.blogs || response.data.blogs.length === 0) {
        // Fallback to latest blogs if no featured blogs
        response = await apiService.getPublicBlogs({ limit: 3 });
      }
      setFeaturedBlogs(response.data.blogs || []);
    } catch (error) {
      console.log('Failed to fetch featured blogs');
      setFeaturedBlogs([
        { title: 'TradingView Integration', excerpt: 'Direct chart analysis without uploads', category: 'Product' },
        { title: 'AI Model Updates', excerpt: 'Faster and more accurate predictions', category: 'Research' },
        { title: 'Risk Management', excerpt: 'Automated position sizing tools', category: 'Feature' }
      ]);
    }
  };

  const bg = isDark ? '#000' : '#fff';
  const text = isDark ? '#fff' : '#000';
  const textMuted = isDark ? '#9ca3af' : '#4b5563';
  const textLight = isDark ? '#6b7280' : '#666';
  const border = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
  const cardBg = isDark ? '#111' : '#fff';
  const sectionBg = isDark ? '#0a0a0a' : '#f9fafb';
  const navBg = isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)';
  const btnPrimary = isDark ? '#fff' : '#000';
  const btnPrimaryText = isDark ? '#000' : '#fff';

  return (
    <div style={{ width: '100%', maxWidth: '100vw', backgroundColor: bg, color: text, minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      {/* Navigation */}
      <nav style={{ position: 'fixed', top: 0, width: '100%', maxWidth: '100vw', zIndex: 50, backgroundColor: navBg, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${border}`, boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '2rem', height: '2rem', backgroundColor: btnPrimary, borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: btnPrimaryText, fontSize: '0.875rem' }}>H</div>
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Huntr AI</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a href="#features" style={{ fontSize: '0.875rem', color: textMuted, textDecoration: 'none' }}>Features</a>
            <a href="#how" style={{ fontSize: '0.875rem', color: textMuted, textDecoration: 'none' }}>How it works</a>
            <a href="#pricing" style={{ fontSize: '0.875rem', color: textMuted, textDecoration: 'none' }}>Pricing</a>
          </div>
          <button onClick={() => navigation.navigate('Login' as never)} style={{ fontSize: '0.875rem', fontWeight: 500, padding: '0.5rem 1rem', borderRadius: '0.375rem', backgroundColor: btnPrimary, color: btnPrimaryText, border: 'none', cursor: 'pointer' }}>Sign in</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '5rem', paddingBottom: '5rem', paddingLeft: '1rem', paddingRight: '1rem', boxSizing: 'border-box', width: '100%', maxWidth: '100vw' }}>
        <div style={{ width: '100%', maxWidth: '42rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(3.75rem, 8vw, 6rem)', fontWeight: 300, marginBottom: '1.5rem', lineHeight: 1.1, letterSpacing: '-0.025em' }}>Trade Smarter</h1>
          <p style={{ fontSize: 'clamp(1.125rem, 2vw, 1.25rem)', color: textMuted, marginBottom: '3rem', fontWeight: 300, lineHeight: 1.625 }}>AI-powered chart analysis that identifies profitable trading setups automatically. Get actionable trades without the stress.</p>
          <div style={{ marginBottom: 16 }}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => navigation.navigate('Register' as never)} style={{ padding: '16px 32px', backgroundColor: btnPrimary, color: btnPrimaryText, borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 500 }}>Get Started →</button>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '4rem' }}>Version 2.0 Beta: Direct Chart Analysis</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginTop: '4rem', paddingTop: '3rem', borderTop: `1px solid ${border}`, width: '100%' }}>
            <div><div style={{ fontSize: 32, fontWeight: 300, marginBottom: 4 }}>High</div><div style={{ fontSize: 14, color: textLight }}>Accuracy</div></div>
            <div><div style={{ fontSize: 32, fontWeight: 300, marginBottom: 4 }}>30s - 2m</div><div style={{ fontSize: 14, color: textLight }}>Analysis Speed</div></div>
            <ActiveUsersCounter />
          </div>
        </div>
      </section>

      {/* News */}
      <section style={{ borderTop: `1px solid ${border}`, padding: '4rem 1rem', backgroundColor: sectionBg, width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>Latest Updates</h2>
            <div style={{ fontSize: 14, color: textLight, cursor: 'pointer' }} onClick={() => navigation.navigate('PublicBlogList' as never)}>View all →</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {featuredBlogs.map((blog, i) => (
              <div key={i} style={{ cursor: 'pointer' }} onClick={() => blog.slug ? window.open(`/blog/${blog.slug}`, '_blank') : navigation.navigate('PublicBlogList' as never)}>
                {blog.featuredImage ? (
                  <img 
                    src={blog.featuredImage.startsWith('http') ? blog.featuredImage : `http://localhost:5000${blog.featuredImage}`}
                    style={{ width: '100%', aspectRatio: '16/9', borderRadius: 8, marginBottom: 12, objectFit: 'cover' }}
                    alt={blog.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : null}
                <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 8, marginBottom: 12, background: isDark ? 'linear-gradient(to bottom right, #1f2937, #111827)' : 'linear-gradient(to bottom right, #e5e7eb, #d1d5db)', display: blog.featuredImage ? 'none' : 'block' }} />
                <h3 style={{ fontWeight: 600, marginBottom: 8 }}>{blog.title}</h3>
                <p style={{ fontSize: 14, color: textLight, marginBottom: 12 }}>{blog.excerpt}</p>
                <div style={{ fontSize: 14, color: '#999' }}>{blog.category || 'Blog'}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '5rem 1rem', borderTop: `1px solid ${border}`, width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 300, marginBottom: '4rem', letterSpacing: '-0.025em' }}>Capabilities</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {[
              { title: 'Real-Time Analysis', desc: 'Advanced ML models analyze price patterns, support/resistance levels, and technical indicators in milliseconds.' },
              { title: 'Instant Trading Setups', desc: 'Get entry points, stop-loss, and profit targets calculated automatically by our proprietary AI engine.' },
              { title: 'Neural Network Engine', desc: 'Maintains 98.7% accuracy across all market conditions using deep learning on millions of data points.' },
              { title: 'Risk Management', desc: 'Automated position sizing and volatility-based stop-loss placement for consistent risk control.' }
            ].map((f, i) => (
              <div key={i}>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: textLight, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" style={{ padding: '5rem 1rem', backgroundColor: sectionBg, borderTop: `1px solid ${border}`, width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 300, marginBottom: '4rem', letterSpacing: '-0.025em' }}>How it works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {[
              { num: '01', title: 'Upload Chart', desc: 'Upload a chart image directly for instant analysis. V2.0 supports multiple chart formats and timeframes.' },
              { num: '02', title: 'AI Analyzes', desc: 'Our neural network processes patterns, trends, and technical indicators in 30 seconds to 2 minutes across multiple timeframes simultaneously.' },
              { num: '03', title: 'Get Setups', desc: 'Receive actionable trading setups with precise entries, exits, and risk metrics ready to execute immediately.' }
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 64, fontWeight: 300, color: isDark ? '#1f2937' : '#e5e7eb', marginBottom: 24 }}>{s.num}</div>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: textLight, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '5rem 1rem', borderTop: `1px solid ${border}`, width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 300, marginBottom: '1rem', letterSpacing: '-0.025em' }}>Simple pricing</h2>
          <p style={{ color: textMuted, marginBottom: '4rem', maxWidth: '42rem' }}>Choose the plan that fits your trading style</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', maxWidth: '56rem', margin: '0 auto', width: '100%' }}>
            {[
              { name: 'Free', price: '$0', features: pricing.freePlan ? [`${pricing.freePlan.features.dailyAnalyses} analyses per day`, `${pricing.freePlan.features.monthlyAnalyses} analyses per month`, `${pricing.freePlan.features.supportLevel} support`] : ['1 analysis per day', '30 analyses per month'] },
              { name: 'Premium', price: pricing.displayAmount || `${pricing.currency === 'NGN' ? '₦' : pricing.currency === 'USD' ? '$' : pricing.currency}${pricing.amount.toLocaleString()}`, features: pricing.features, highlighted: true }
            ].map((p, i) => (
              <div key={i} style={{ borderRadius: 8, padding: 32, border: p.highlighted ? `1px solid ${btnPrimary}` : `1px solid ${border}`, backgroundColor: p.highlighted ? btnPrimary : cardBg, color: p.highlighted ? btnPrimaryText : text }}>
                <h3 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>{p.name}</h3>
                <p style={{ fontSize: 14, color: p.highlighted ? (isDark ? '#666' : '#ccc') : textLight, marginBottom: 24 }}>{p.name === 'Premium' ? 'Most popular' : 'Get started'}</p>
                <div style={{ marginBottom: 32 }}>
                  <span style={{ fontSize: 36, fontWeight: 300 }}>{p.price}</span>
                  <span style={{ color: p.highlighted ? (isDark ? '#666' : '#999') : textLight }}>/month</span>
                </div>
                <button onClick={() => navigation.navigate('Register' as never)} style={{ width: '100%', padding: '12px 0', borderRadius: 8, fontWeight: 500, marginBottom: 32, border: p.highlighted ? 'none' : `1px solid ${border}`, backgroundColor: p.highlighted ? btnPrimaryText : 'transparent', color: p.highlighted ? btnPrimary : 'inherit', cursor: 'pointer', fontSize: 14 }}>Get started</button>
                {p.features.map((f, j) => (
                  <div key={j} style={{ fontSize: 14, color: p.highlighted ? (isDark ? '#666' : '#ccc') : textLight, marginBottom: 12 }}>› {f}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logo Slider */}
      <LogoSlider />

      {/* CTA */}
      <section style={{ padding: '5rem 1rem', borderTop: `1px solid ${border}`, backgroundColor: sectionBg, textAlign: 'center' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 300, marginBottom: '1.5rem', letterSpacing: '-0.025em' }}>Ready to trade smarter?</h2>
          <p style={{ fontSize: '1.125rem', color: textMuted, marginBottom: '3rem', fontWeight: 300 }}>Use AI analysis to find better trading setups faster.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <button onClick={() => navigation.navigate('Register' as never)} style={{ padding: '12px 32px', backgroundColor: btnPrimary, color: btnPrimaryText, borderRadius: 8, fontWeight: 500, border: 'none', cursor: 'pointer', fontSize: 14 }}>Sign up free</button>
            <button style={{ padding: '12px 32px', border: `1px solid ${border}`, borderRadius: 8, fontWeight: 500, backgroundColor: 'transparent', cursor: 'pointer', fontSize: 14 }}>Learn more</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${border}`, padding: '3rem 1rem', backgroundColor: bg }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 24, height: 24, backgroundColor: btnPrimary, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: btnPrimaryText, fontSize: 12, fontWeight: 'bold' }}>H</div>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Huntr AI</span>
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Product</h4>
              <a href="#features" style={{ fontSize: 14, color: textLight, marginBottom: 8, display: 'block', textDecoration: 'none' }}>Features</a>
              <a href="#pricing" style={{ fontSize: 14, color: textLight, marginBottom: 8, display: 'block', textDecoration: 'none' }}>Pricing</a>
            </div>
            <div>
              <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Company</h4>
              <div onClick={() => navigation.navigate('About' as never)} style={{ fontSize: 14, color: textLight, marginBottom: 8, cursor: 'pointer' }}>About</div>
              <div style={{ fontSize: 14, color: textLight, marginBottom: 8, cursor: 'pointer' }} onClick={() => navigation.navigate('PublicBlogList' as never)}>Blog</div>
              <div style={{ fontSize: 14, color: textLight, marginBottom: 8 }}>Contact</div>
            </div>
            <div>
              <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Legal</h4>
              <div onClick={() => navigation.navigate('Privacy' as never)} style={{ fontSize: 14, color: textLight, marginBottom: 8, cursor: 'pointer' }}>Privacy</div>
              <div onClick={() => navigation.navigate('Terms' as never)} style={{ fontSize: 14, color: textLight, marginBottom: 8, cursor: 'pointer' }}>Terms</div>
              <div onClick={() => navigation.navigate('Disclaimer' as never)} style={{ fontSize: 14, color: textLight, marginBottom: 8, cursor: 'pointer' }}>Disclaimer</div>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${border}`, paddingTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, color: textLight }}>
            <p>© 2025 Huntr AI. All rights reserved.</p>
            <div style={{ display: 'flex', gap: 24 }}>
              <span>Twitter</span>
              <span>Discord</span>
              <span>LinkedIn</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
