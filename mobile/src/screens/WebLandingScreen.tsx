import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AnimatedRobot from '../components/animations/AnimatedRobot';
import AnimatedCircuits from '../components/animations/AnimatedCircuits';
import AnimatedMachine from '../components/animations/AnimatedMachine';

const { width } = Dimensions.get('window');

const WebLandingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isEffectsOn, setIsEffectsOn] = useState(false);
  const flickerAnim = useRef(new Animated.Value(0.4)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isEffectsOn) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flickerAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(flickerAnim, {
            toValue: 0.4,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 20000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      flickerAnim.setValue(0.4);
      rotateAnim.setValue(0);
    }
  }, [isEffectsOn]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.logo}>HUNTR AI</Text>
          <View style={styles.menu}>
            <TouchableOpacity 
              style={styles.downloadButton}
              onPress={() => {
                const apkUrl = 'https://huntr-ai.netlify.app/huntr-ai.apk';
                fetch(apkUrl, { method: 'HEAD' })
                  .then(response => {
                    if (response.ok) {
                      const link = document.createElement('a');
                      link.href = apkUrl;
                      link.download = 'huntr-ai.apk';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    } else {
                      window.open('https://github.com/aitradeosdev/aitradeos/releases', '_blank');
                    }
                  })
                  .catch(() => {
                    window.open('https://github.com/aitradeosdev/aitradeos/releases', '_blank');
                  });
              }}
            >
              <Text style={styles.downloadButtonText}>📱 Download App</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
              <Text style={styles.menuItem}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
              <Text style={styles.menuItem}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.banner} showsVerticalScrollIndicator={false}>
        {/* Background Effects */}
        <View style={styles.blueBlur} />
        <View style={styles.redBlur} />
        
        {/* Full Animations for Web */}
        <AnimatedCircuits side="left" />
        <AnimatedCircuits side="right" />
        
        <Animated.View style={[styles.machineArt, { transform: [{ rotate }] }]}>
          <AnimatedMachine isActive={isEffectsOn} />
        </Animated.View>
        
        <View style={styles.robotContainer}>
          <AnimatedRobot />
        </View>
        
        {/* Main Content */}
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>ARTIFICIAL INTELLIGENCE</Text>
          
          <View style={styles.contentRow}>
            {/* Blue Content */}
            <View style={styles.blueContent}>
              <Text style={styles.blueText}>Power of AI</Text>
              <Text style={styles.description}>
                Advanced trading analysis using cutting-edge AI technology for precise market predictions.
              </Text>
              
              <TouchableOpacity
                style={styles.effectsButton}
                onPress={() => setIsEffectsOn(!isEffectsOn)}
              >
                <Text style={styles.effectsButtonText}>
                  {isEffectsOn ? 'EFFECTS OFF' : 'EFFECTS ON'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Red Content */}
            <View style={styles.redContent}>
              <View style={styles.polygonContainer}>
                <View style={styles.polygon}>
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=200&fit=crop' }}
                    style={styles.polygonImage}
                  />
                </View>
                <View style={styles.polygonContent}>
                  <Text style={styles.redText}>AI Trading Signals</Text>
                  <Text style={styles.polygonDesc}>Real-time market analysis.</Text>
                </View>
              </View>
              
              <View style={styles.polygonContainer}>
                <View style={styles.polygon}>
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop' }}
                    style={styles.polygonImage}
                  />
                </View>
                <View style={styles.polygonContent}>
                  <Text style={styles.redText}>Fast Revolution</Text>
                  <Text style={styles.polygonDesc}>AI transforming trading.</Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* BOON BANE */}
          <View style={styles.boonBaneContainer}>
            <Animated.View style={{ opacity: flickerAnim }}>
              <Text style={[styles.boonText, isEffectsOn && styles.activeBlue]}>B<Text style={styles.boonO}>O</Text>ON</Text>
            </Animated.View>
            
            <Animated.View style={{ opacity: flickerAnim }}>
              <Text style={[styles.baneText, isEffectsOn && styles.activeRed]}>BAN<Text style={styles.baneE}>E</Text></Text>
            </Animated.View>
          </View>
          
          {/* CTA Buttons */}
          <View style={styles.ctaButtons}>
            <TouchableOpacity
              style={styles.primaryCTA}
              onPress={() => navigation.navigate('Register' as never)}
            >
              <Text style={styles.primaryCTAText}>Get Started</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryCTA}
              onPress={() => navigation.navigate('Login' as never)}
            >
              <Text style={styles.secondaryCTAText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Copy all styles from original LandingScreen
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { position: 'absolute', top: 40, left: 0, right: 0, zIndex: 1000, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 32, paddingHorizontal: 24, paddingVertical: 16, borderWidth: 2, borderColor: 'rgba(220, 220, 220, 0.11)' },
  logo: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', letterSpacing: 2 },
  menu: { flexDirection: 'row', gap: 24 },
  menuItem: { color: '#9B9B9B', fontSize: 14, fontWeight: '600' },
  downloadButton: { backgroundColor: '#00B2FF', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 16 },
  downloadButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  banner: { flex: 1, minHeight: Dimensions.get('window').height },
  blueBlur: { position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', backgroundColor: '#00b3ff73', opacity: 0.3 },
  redBlur: { position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', backgroundColor: '#ff585878', opacity: 0.3 },
  machineArt: { position: 'absolute', right: 20, top: '30%', width: 200, height: 200 },
  robotContainer: { position: 'absolute', bottom: 0, left: '50%', transform: [{ translateX: -100 }], zIndex: 100 },
  bannerContent: { paddingTop: 120, paddingHorizontal: 20, zIndex: 10 },
  bannerTitle: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', marginBottom: 60, textTransform: 'uppercase', letterSpacing: 2 },
  contentRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 80 },
  blueContent: { flex: 1, paddingRight: 20 },
  blueText: { color: '#00B2FF', fontSize: 18, fontWeight: '700', marginBottom: 16, paddingLeft: 14, borderLeftWidth: 4, borderLeftColor: '#00B2FF' },
  description: { color: '#9B9B9B', fontSize: 14, lineHeight: 20, marginBottom: 24 },
  effectsButton: { borderWidth: 2, borderColor: '#FFFFFF', paddingVertical: 12, paddingHorizontal: 24, transform: [{ skewX: '-20deg' }] },
  effectsButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', transform: [{ skewX: '20deg' }] },
  redContent: { flex: 1, gap: 32 },
  polygonContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  polygon: { width: 80, height: 72, position: 'relative' },
  polygonImage: { width: '100%', height: '100%', borderRadius: 8 },
  polygonContent: { flex: 1 },
  redText: { color: '#FF5858', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  polygonDesc: { color: '#FFFFFF', fontSize: 12 },
  boonBaneContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 40, marginBottom: 60 },
  boonText: { fontSize: 48, fontWeight: '900', color: '#266eb2', opacity: 0.4 },
  baneText: { fontSize: 48, fontWeight: '900', color: 'rgb(209, 73, 74)', opacity: 0.4 },
  boonO: { fontSize: 48 },
  baneE: { fontSize: 48 },
  activeBlue: { textShadowColor: '#1778d2', textShadowRadius: 20, opacity: 1 },
  activeRed: { textShadowColor: '#b91515', textShadowRadius: 20, opacity: 1 },
  ctaButtons: { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingBottom: 40 },
  primaryCTA: { backgroundColor: '#00B2FF', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 25 },
  primaryCTAText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryCTA: { borderWidth: 2, borderColor: '#FF5858', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 25 },
  secondaryCTAText: { color: '#FF5858', fontSize: 16, fontWeight: '700' },
});

export default WebLandingScreen;