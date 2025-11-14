import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import BrainIcon from './icons/BrainIcon';
import ChartIcon from './icons/ChartIcon';
import SignalIcon from './icons/SignalIcon';
import SearchIcon from './icons/SearchIcon';

const { width, height } = Dimensions.get('window');

const WebLandingPage: React.FC = () => {
  const navigation = useNavigation();

  const handleDownloadApp = () => {
    if (Platform.OS === 'web') {
      const apkUrl = 'https://huntr-ai.netlify.app/huntr-ai.apk';
      const link = document.createElement('a');
      link.href = apkUrl;
      link.download = 'huntr-ai.apk';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>HUNTR AI</Text>
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
            <Text style={styles.navItem}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
            <Text style={styles.navItem}>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadApp}>
            <Text style={styles.downloadBtnText}>Download</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>AI-POWERED TRADING ANALYSIS</Text>
            <Text style={styles.heroSubtitle}>
              Professional chart analysis using Gemini 2.5 Pro AI for precise market predictions and trading signals
            </Text>
            <View style={styles.heroButtons}>
              <TouchableOpacity 
                style={styles.primaryBtn}
                onPress={() => navigation.navigate('Register' as never)}
              >
                <Text style={styles.primaryBtnText}>START ANALYZING</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.secondaryBtn}
                onPress={() => navigation.navigate('Login' as never)}
              >
                <Text style={styles.secondaryBtnText}>SIGN IN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.features}>
          <View style={styles.featureGrid}>
            <View style={styles.featureCard}>
              <View style={styles.iconContainer}>
                <BrainIcon size={32} color="#00D4FF" />
              </View>
              <Text style={styles.featureTitle}>AI ANALYSIS</Text>
              <Text style={styles.featureDesc}>
                Advanced neural networks analyze chart patterns with 95% accuracy
              </Text>
            </View>
            <View style={styles.featureCard}>
              <View style={styles.iconContainer}>
                <SignalIcon size={32} color="#00D4FF" />
              </View>
              <Text style={styles.featureTitle}>TRADING SIGNALS</Text>
              <Text style={styles.featureDesc}>
                Real-time BUY/SELL/HOLD signals with entry points and stop losses
              </Text>
            </View>
            <View style={styles.featureCard}>
              <View style={styles.iconContainer}>
                <SearchIcon size={32} color="#00D4FF" />
              </View>
              <Text style={styles.featureTitle}>MARKET DATA</Text>
              <Text style={styles.featureDesc}>
                Live market research integration for enhanced analysis accuracy
              </Text>
            </View>
            <View style={styles.featureCard}>
              <View style={styles.iconContainer}>
                <ChartIcon size={32} color="#00D4FF" />
              </View>
              <Text style={styles.featureTitle}>CHART RECOGNITION</Text>
              <Text style={styles.featureDesc}>
                Upload any chart format - our AI recognizes all trading patterns
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.process}>
          <Text style={styles.processTitle}>HOW IT WORKS</Text>
          <View style={styles.processSteps}>
            <View style={styles.processStep}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>01</Text>
              </View>
              <Text style={styles.stepTitle}>UPLOAD CHART</Text>
              <Text style={styles.stepDesc}>Upload your trading chart image</Text>
            </View>
            <View style={styles.processStep}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>02</Text>
              </View>
              <Text style={styles.stepTitle}>AI PROCESSING</Text>
              <Text style={styles.stepDesc}>AI analyzes patterns and market data</Text>
            </View>
            <View style={styles.processStep}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>03</Text>
              </View>
              <Text style={styles.stepTitle}>GET RESULTS</Text>
              <Text style={styles.stepDesc}>Receive detailed trading signals</Text>
            </View>
          </View>
        </View>

        <View style={styles.cta}>
          <LinearGradient
            colors={['#000000', '#1A1A1A']}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaTitle}>READY TO TRADE SMARTER?</Text>
            <TouchableOpacity 
              style={styles.ctaBtn}
              onPress={() => navigation.navigate('Register' as never)}
            >
              <Text style={styles.ctaBtnText}>GET STARTED NOW</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  logo: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  navItem: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '600',
  },
  downloadBtn: {
    backgroundColor: '#00D4FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  downloadBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  hero: {
    minHeight: height * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#000000',
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: 800,
  },
  heroTitle: {
    fontSize: width > 768 ? 56 : 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 1,
  },
  heroSubtitle: {
    fontSize: width > 768 ? 18 : 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  heroButtons: {
    flexDirection: width > 768 ? 'row' : 'column',
    gap: 16,
  },
  primaryBtn: {
    backgroundColor: '#00D4FF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 0,
  },
  primaryBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 0,
  },
  secondaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  features: {
    paddingVertical: 80,
    paddingHorizontal: 24,
    backgroundColor: '#111111',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 24,
  },
  featureCard: {
    width: width > 768 ? '48%' : '100%',
    backgroundColor: '#1A1A1A',
    padding: 32,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#333333',
  },
  iconContainer: {
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 1,
  },
  featureDesc: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  process: {
    paddingVertical: 80,
    paddingHorizontal: 24,
    backgroundColor: '#000000',
  },
  processTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 48,
    letterSpacing: 1,
  },
  processSteps: {
    flexDirection: width > 768 ? 'row' : 'column',
    justifyContent: 'space-between',
    gap: 40,
  },
  processStep: {
    flex: 1,
    alignItems: 'center',
  },
  stepCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#00D4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00D4FF',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1,
  },
  stepDesc: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  cta: {
    marginHorizontal: 24,
    marginVertical: 40,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333333',
  },
  ctaGradient: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 1,
  },
  ctaBtn: {
    backgroundColor: '#00D4FF',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 0,
  },
  ctaBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default WebLandingPage;