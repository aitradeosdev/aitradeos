import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

interface AnalysisAgreementModalProps {
  visible: boolean;
  onAccept: () => Promise<void>;
  onDecline: () => void;
}

const AnalysisAgreementModal: React.FC<AnalysisAgreementModalProps> = ({
  visible,
  onAccept,
  onDecline
}) => {
  const { theme } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const handleAccept = async () => {
    if (!hasScrolledToBottom) {
      Alert.alert(
        'Please Read Entire Agreement',
        'You must scroll to the bottom and read the entire agreement before accepting.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsProcessing(true);
      await onAccept();
    } catch (error) {
      console.error('Agreement acceptance error:', error);
      Alert.alert('Error', 'Failed to process agreement. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = () => {
    Alert.alert(
      'Agreement Required',
      'You must accept this agreement to use the analysis features. Declining will log you out and prevent access to analysis functionality.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Decline & Logout', 
          style: 'destructive',
          onPress: onDecline
        }
      ]
    );
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
    setHasScrolledToBottom(isCloseToBottom);
  };

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    modalContent: {
      flex: 1,
      backgroundColor: theme.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      marginTop: 40,
    },
    header: {
      padding: 24,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    scrollContainer: {
      flex: 1,
    },
    agreementText: {
      padding: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginTop: 24,
      marginBottom: 12,
    },
    paragraph: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 22,
      marginBottom: 16,
      textAlign: 'justify',
    },
    warning: {
      backgroundColor: theme.error + '20',
      borderLeftWidth: 4,
      borderLeftColor: theme.error,
      padding: 16,
      marginVertical: 16,
      borderRadius: 8,
    },
    warningTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.error,
      marginBottom: 8,
    },
    warningText: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    footer: {
      flexDirection: 'row',
      padding: 24,
      gap: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.surface,
    },
    button: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    declineButton: {
      backgroundColor: theme.error,
    },
    acceptButton: {
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    acceptButtonDisabled: {
      backgroundColor: theme.textSecondary,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    scrollIndicator: {
      position: 'absolute',
      right: 24,
      bottom: 100,
      backgroundColor: theme.primary,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    scrollIndicatorText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    }
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={handleDecline}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Trading Analysis Agreement</Text>
            <Text style={styles.subtitle}>
              Please read this agreement carefully before using our AI analysis services
            </Text>
          </View>

          <ScrollView 
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={100}
          >
            <View style={styles.agreementText}>
              <View style={styles.warning}>
                <Text style={styles.warningTitle}>⚠️ IMPORTANT RISK DISCLOSURE</Text>
                <Text style={styles.warningText}>
                  Trading and investing in financial markets involves substantial risk of loss and is not suitable for all investors. Our AI analysis is for informational purposes only and should never be considered as financial advice.
                </Text>
              </View>

              <Text style={styles.sectionTitle}>1. ACCEPTANCE OF TERMS AND CONDITIONS</Text>
              <Text style={styles.paragraph}>
                By accessing, using, or clicking to accept this Analysis Agreement ("Agreement"), you ("User," "you," or "your") agree to be legally bound by all terms, conditions, provisions, and restrictions contained herein. This Agreement governs your use of the artificial intelligence-powered trading analysis services ("Analysis Services" or "Services") provided by Tradeos Platform ("Company," "we," "our," or "us"). If you do not agree to all terms and conditions of this Agreement, you must immediately discontinue use of the Analysis Services and log out of your account.
              </Text>
              <Text style={styles.paragraph}>
                This Agreement constitutes a legally binding contract between you and the Company. Your continued use of the Analysis Services after any modifications to this Agreement constitutes your acceptance of such modifications. We reserve the right to modify, update, or revise this Agreement at any time without prior notice, and such modifications will become effective immediately upon posting.
              </Text>

              <Text style={styles.sectionTitle}>2. NATURE OF ARTIFICIAL INTELLIGENCE ANALYSIS</Text>
              <Text style={styles.paragraph}>
                Our Analysis Services utilize advanced artificial intelligence algorithms, machine learning models, natural language processing, computer vision technology, and automated pattern recognition systems to analyze trading charts, market data, and financial information. The AI system processes vast amounts of historical market data, technical indicators, price patterns, volume analysis, and other market variables to generate trading signals, market predictions, and investment recommendations.
              </Text>
              <Text style={styles.paragraph}>
                You acknowledge and understand that artificial intelligence systems, while sophisticated, are inherently probabilistic in nature and operate based on statistical models and historical data patterns. These systems may not accurately predict future market movements, account for unprecedented market events, or consider all relevant factors that could impact financial markets. The AI analysis is generated through automated processes without human oversight of individual recommendations and may contain errors, inaccuracies, or limitations.
              </Text>

              <Text style={styles.sectionTitle}>3. COMPREHENSIVE RISK DISCLOSURE AND WARNINGS</Text>
              
              <View style={styles.warning}>
                <Text style={styles.warningTitle}>CRITICAL FINANCIAL RISK WARNING</Text>
                <Text style={styles.warningText}>
                  TRADING AND INVESTING IN FINANCIAL MARKETS CARRIES SUBSTANTIAL RISK OF LOSS. YOU COULD LOSE SOME OR ALL OF YOUR INVESTED CAPITAL. PAST PERFORMANCE IS NOT INDICATIVE OF FUTURE RESULTS.
                </Text>
              </View>

              <Text style={styles.paragraph}>
                You expressly acknowledge and understand that trading in stocks, cryptocurrencies, forex, commodities, derivatives, options, futures, bonds, and any other financial instruments involves significant financial risk and the potential for substantial monetary losses. Market conditions can change rapidly and unpredictably, and there is no guarantee that any trading strategy, analysis, or recommendation will be profitable or successful.
              </Text>
              <Text style={styles.paragraph}>
                The Analysis Services are provided for informational and educational purposes only and are not intended to constitute professional investment advice, financial guidance, or recommendations to buy, sell, or hold any particular security or financial instrument. Our AI-generated analysis should not be relied upon as the sole basis for making investment decisions, and you should always conduct your own independent research and analysis before making any trading or investment decisions.
              </Text>
              <Text style={styles.paragraph}>
                Market volatility, economic events, geopolitical factors, regulatory changes, technological failures, liquidity issues, and numerous other factors beyond our control can significantly impact the accuracy and effectiveness of our Analysis Services. You acknowledge that financial markets are inherently unpredictable and that no analysis system, whether powered by artificial intelligence or otherwise, can guarantee profitable outcomes.
              </Text>

              <Text style={styles.sectionTitle}>4. DISCLAIMER OF ACCURACY AND COMPLETENESS</Text>
              <Text style={styles.paragraph}>
                While we strive to provide accurate and reliable analysis through our AI systems, we make no representations, warranties, or guarantees regarding the accuracy, completeness, timeliness, reliability, or appropriateness of any information, data, analysis, or recommendations provided through the Analysis Services. The AI-generated content may contain errors, omissions, inaccuracies, or may be based on incomplete or outdated information.
              </Text>
              <Text style={styles.paragraph}>
                Technical indicators, chart patterns, market signals, and other analytical tools used by our AI systems are subject to interpretation and may not accurately predict future price movements or market trends. Historical data used to train our AI models may not be representative of future market conditions, and the performance of our analysis in past market conditions does not guarantee future performance.
              </Text>
              <Text style={styles.paragraph}>
                We do not guarantee that our Analysis Services will be available at all times, error-free, or uninterrupted. Technical issues, system maintenance, internet connectivity problems, server outages, or other factors may affect the availability and functionality of our services. You acknowledge that temporary unavailability of our services could impact your trading activities and potentially result in missed opportunities or losses.
              </Text>

              <Text style={styles.sectionTitle}>5. LIMITATION OF LIABILITY AND DAMAGES</Text>
              <Text style={styles.paragraph}>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE COMPANY, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AFFILIATES, SUBSIDIARIES, PARTNERS, AND LICENSORS SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES ARISING FROM OR RELATING TO YOUR USE OF THE ANALYSIS SERVICES, INCLUDING BUT NOT LIMITED TO:
              </Text>
              <Text style={styles.paragraph}>
                (a) Financial losses, trading losses, investment losses, or loss of profits resulting from trading decisions made based on our Analysis Services; (b) Loss of data, business interruption, or loss of business opportunities; (c) Damages resulting from errors, inaccuracies, or omissions in our analysis or recommendations; (d) Technical failures, system downtime, or service interruptions; (e) Unauthorized access to or alteration of your data or account information; (f) Any other damages or losses arising from your use of or reliance on our Analysis Services.
              </Text>
              <Text style={styles.paragraph}>
                IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL DAMAGES, LOSSES, AND CAUSES OF ACTION EXCEED THE AMOUNT YOU PAID TO US FOR THE ANALYSIS SERVICES DURING THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS LESS.
              </Text>

              <Text style={styles.sectionTitle}>6. INDEMNIFICATION OBLIGATIONS</Text>
              <Text style={styles.paragraph}>
                You agree to indemnify, defend, and hold harmless the Company, its officers, directors, employees, agents, affiliates, subsidiaries, partners, and licensors from and against any and all claims, demands, actions, suits, damages, liabilities, losses, settlements, judgments, costs, and expenses (including reasonable attorneys' fees and legal costs) arising from or relating to:
              </Text>
              <Text style={styles.paragraph}>
                (a) Your use of or reliance on the Analysis Services; (b) Your trading or investment activities and decisions; (c) Any violation of this Agreement by you; (d) Your violation of any applicable laws, regulations, or third-party rights; (e) Any financial losses or damages resulting from your trading activities; (f) Any claims that your use of the Analysis Services caused harm to any third party.
              </Text>

              <Text style={styles.sectionTitle}>7. NO FINANCIAL OR INVESTMENT ADVICE</Text>
              <Text style={styles.paragraph}>
                You expressly acknowledge and agree that the Company is not a registered investment advisor, broker-dealer, or financial planner, and we do not provide personalized investment advice or financial planning services. Our Analysis Services are automated tools that provide general market analysis and information, and should not be construed as personalized investment advice tailored to your individual financial situation, investment objectives, or risk tolerance.
              </Text>
              <Text style={styles.paragraph}>
                We strongly recommend that you consult with qualified financial professionals, licensed investment advisors, or certified financial planners before making any significant investment decisions. You should carefully consider your financial situation, investment experience, risk tolerance, and investment objectives before acting on any information provided through our Analysis Services.
              </Text>

              <Text style={styles.sectionTitle}>8. USER RESPONSIBILITIES AND OBLIGATIONS</Text>
              <Text style={styles.paragraph}>
                By using the Analysis Services, you agree to: (a) Use the services solely for your own personal, non-commercial purposes; (b) Conduct your own independent research and due diligence before making any trading or investment decisions; (c) Only invest money that you can afford to lose without affecting your financial well-being; (d) Comply with all applicable laws, regulations, and trading rules in your jurisdiction; (e) Maintain the security and confidentiality of your account credentials; (f) Not attempt to manipulate, interfere with, or disrupt the operation of our AI systems.
              </Text>
              <Text style={styles.paragraph}>
                You are solely responsible for all trading and investment decisions made using your account, and you acknowledge that all such decisions are made at your own risk and discretion. You understand that trading and investing require knowledge, experience, and careful consideration of market conditions and personal financial circumstances.
              </Text>

              <Text style={styles.sectionTitle}>9. REGULATORY COMPLIANCE AND LEGAL CONSIDERATIONS</Text>
              <Text style={styles.paragraph}>
                You acknowledge that financial markets are subject to extensive regulation by government agencies, financial authorities, and regulatory bodies. You are responsible for ensuring that your use of our Analysis Services and any subsequent trading activities comply with all applicable laws, regulations, tax obligations, and licensing requirements in your jurisdiction.
              </Text>
              <Text style={styles.paragraph}>
                Different jurisdictions may have varying rules regarding the use of automated trading systems, algorithmic analysis tools, and artificial intelligence in financial decision-making. Some jurisdictions may restrict or prohibit certain types of trading activities or require specific licenses or registrations. You agree to investigate and comply with all such requirements.
              </Text>

              <Text style={styles.sectionTitle}>10. INTELLECTUAL PROPERTY RIGHTS</Text>
              <Text style={styles.paragraph}>
                All intellectual property rights in and to the Analysis Services, including but not limited to artificial intelligence algorithms, machine learning models, software code, databases, user interfaces, graphics, logos, trademarks, and proprietary methodologies, are owned by the Company or its licensors. You are granted a limited, non-exclusive, non-transferable, revocable license to use the Analysis Services solely for your personal use in accordance with this Agreement.
              </Text>

              <Text style={styles.sectionTitle}>11. DATA PRIVACY AND INFORMATION USAGE</Text>
              <Text style={styles.paragraph}>
                Your use of the Analysis Services is subject to our Privacy Policy, which is incorporated herein by reference. We may collect, process, and use information about your trading patterns, analysis requests, and system usage to improve our AI algorithms and services. By accepting this Agreement, you consent to such data collection and usage as described in our Privacy Policy.
              </Text>
              <Text style={styles.paragraph}>
                We may use aggregated, anonymized data derived from user interactions to enhance our AI models, but we will not share your personal financial information or individual trading data with third parties without your explicit consent, except as required by law or as necessary to provide the Analysis Services.
              </Text>

              <Text style={styles.sectionTitle}>12. TERMINATION AND SUSPENSION</Text>
              <Text style={styles.paragraph}>
                We reserve the right to terminate or suspend your access to the Analysis Services at any time, with or without notice, for any reason or no reason, including but not limited to violation of this Agreement, suspicious or fraudulent activity, or technical issues. Upon termination, your right to use the Analysis Services will immediately cease, and we may delete your account data.
              </Text>
              <Text style={styles.paragraph}>
                You may terminate your use of the Analysis Services at any time by discontinuing use and requesting account deletion. Termination of this Agreement does not relieve you of any obligations or liabilities that accrued prior to termination, including indemnification obligations.
              </Text>

              <Text style={styles.sectionTitle}>13. FORCE MAJEURE AND EXTERNAL FACTORS</Text>
              <Text style={styles.paragraph}>
                We shall not be liable for any failure or delay in performance of our obligations under this Agreement that results from circumstances beyond our reasonable control, including but not limited to acts of God, natural disasters, wars, terrorism, government regulations, internet outages, cyber attacks, or other force majeure events.
              </Text>

              <Text style={styles.sectionTitle}>14. GOVERNING LAW AND DISPUTE RESOLUTION</Text>
              <Text style={styles.paragraph}>
                This Agreement shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to conflict of law principles. Any disputes arising under this Agreement shall be resolved through binding arbitration in accordance with the rules of [Arbitration Organization], and judgment upon the award rendered may be entered in any court having jurisdiction thereof.
              </Text>

              <Text style={styles.sectionTitle}>15. SEVERABILITY AND ENTIRE AGREEMENT</Text>
              <Text style={styles.paragraph}>
                If any provision of this Agreement is found to be unenforceable or invalid, such provision shall be limited or eliminated to the minimum extent necessary so that this Agreement shall otherwise remain in full force and effect. This Agreement constitutes the entire agreement between you and the Company regarding the Analysis Services and supersedes all prior or contemporaneous communications and proposals.
              </Text>

              <View style={styles.warning}>
                <Text style={styles.warningTitle}>FINAL ACKNOWLEDGMENT</Text>
                <Text style={styles.warningText}>
                  BY CLICKING "ACCEPT" BELOW, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY ALL TERMS OF THIS AGREEMENT. YOU CONFIRM THAT YOU UNDERSTAND THE RISKS INVOLVED IN TRADING AND THAT YOU WILL NOT HOLD THE COMPANY LIABLE FOR ANY LOSSES INCURRED THROUGH YOUR USE OF THE ANALYSIS SERVICES.
                </Text>
              </View>

              <Text style={styles.paragraph}>
                Last Updated: {new Date().toLocaleDateString()}
              </Text>
              <Text style={styles.paragraph}>
                Agreement Version: 1.0
              </Text>
            </View>
          </ScrollView>

          {!hasScrolledToBottom && (
            <View style={styles.scrollIndicator}>
              <Text style={styles.scrollIndicatorText}>Scroll to Continue</Text>
            </View>
          )}

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.declineButton]}
              onPress={handleDecline}
              disabled={isProcessing}
            >
              <Text style={styles.buttonText}>Decline & Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                hasScrolledToBottom ? null : styles.acceptButtonDisabled
              ]}
              onPress={handleAccept}
              disabled={!hasScrolledToBottom || isProcessing}
            >
              <LinearGradient
                colors={hasScrolledToBottom && !isProcessing 
                  ? ['#00D4FF', '#0099CC'] 
                  : ['#666666', '#666666']
                }
                style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
              />
              {isProcessing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  Accept & Continue
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default AnalysisAgreementModal;