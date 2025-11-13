import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/apiService';

interface PaymentConfig {
  premiumPlan: {
    amount: number;
    currency: string;
    displayAmount: string;
    duration: number;
    features: {
      dailyAnalyses: number;
      monthlyAnalyses: number;
      supportLevel: string;
      additionalFeatures: string[];
    };
  };
  bankAccount: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    bankCode?: string;
    isActive: boolean;
  };
  paymentSettings: {
    autoApproval: boolean;
    paymentTimeoutMinutes: number;
    requireProofOfPayment: boolean;
    maxPendingPayments: number;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    adminEmails: string[];
    notificationTemplate: {
      subject: string;
      message: string;
    };
  };
}

const AdminPaymentConfigScreen: React.FC = () => {
  const { theme } = useTheme();
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Form states
  const [premiumAmount, setPremiumAmount] = useState('');
  const [premiumCurrency, setPremiumCurrency] = useState('NGN');
  const [premiumDuration, setPremiumDuration] = useState('30');
  const [dailyAnalyses, setDailyAnalyses] = useState('5');
  const [monthlyAnalyses, setMonthlyAnalyses] = useState('150');
  
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankCode, setBankCode] = useState('');
  
  const [autoApproval, setAutoApproval] = useState(false);
  const [paymentTimeout, setPaymentTimeout] = useState('30');
  const [requireProof, setRequireProof] = useState(false);
  const [maxPending, setMaxPending] = useState('10');
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [adminEmails, setAdminEmails] = useState('');
  const [notificationSubject, setNotificationSubject] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/admin/payment-config');
      const configData = response.data.config;
      setConfig(configData);
      
      // Populate form fields
      setPremiumAmount((configData.premiumPlan.amount / 100).toString());
      setPremiumCurrency(configData.premiumPlan.currency);
      setPremiumDuration(configData.premiumPlan.duration.toString());
      setDailyAnalyses(configData.premiumPlan.features.dailyAnalyses.toString());
      setMonthlyAnalyses(configData.premiumPlan.features.monthlyAnalyses.toString());
      
      setAccountNumber(configData.bankAccount.accountNumber);
      setAccountName(configData.bankAccount.accountName);
      setBankName(configData.bankAccount.bankName);
      setBankCode(configData.bankAccount.bankCode || '');
      
      setAutoApproval(configData.paymentSettings.autoApproval);
      setPaymentTimeout(configData.paymentSettings.paymentTimeoutMinutes.toString());
      setRequireProof(configData.paymentSettings.requireProofOfPayment);
      setMaxPending(configData.paymentSettings.maxPendingPayments.toString());
      
      setEmailNotifications(configData.notifications.emailNotifications);
      setSmsNotifications(configData.notifications.smsNotifications);
      setAdminEmails(configData.notifications.adminEmails.join(', '));
      setNotificationSubject(configData.notifications.notificationTemplate.subject);
      setNotificationMessage(configData.notifications.notificationTemplate.message);
      
    } catch (error) {
      console.error('Failed to load payment config:', error);
      Alert.alert('Error', 'Failed to load payment configuration');
    } finally {
      setLoading(false);
    }
  };

  const saveSection = async (section: string) => {
    try {
      setSaving(true);
      let updateData: any = {};

      switch (section) {
        case 'premium':
          updateData.premiumPlan = {
            amount: parseInt(premiumAmount) * 100, // Convert to kobo
            currency: premiumCurrency,
            displayAmount: `₦${parseInt(premiumAmount).toLocaleString()}`,
            duration: parseInt(premiumDuration),
            features: {
              dailyAnalyses: parseInt(dailyAnalyses),
              monthlyAnalyses: parseInt(monthlyAnalyses),
              supportLevel: 'Priority',
              additionalFeatures: ['Multi-timeframe Analysis', 'Advanced Technical Indicators', 'Priority Support']
            }
          };
          break;
          
        case 'bank':
          updateData.bankAccount = {
            accountNumber,
            accountName,
            bankName,
            bankCode: bankCode || null,
            isActive: true
          };
          break;
          
        case 'settings':
          updateData.paymentSettings = {
            autoApproval,
            paymentTimeoutMinutes: parseInt(paymentTimeout),
            requireProofOfPayment: requireProof,
            maxPendingPayments: parseInt(maxPending)
          };
          break;
          
        case 'notifications':
          updateData.notifications = {
            emailNotifications,
            smsNotifications,
            adminEmails: adminEmails.split(',').map(email => email.trim()).filter(email => email),
            notificationTemplate: {
              subject: notificationSubject,
              message: notificationMessage
            }
          };
          break;
      }

      await apiService.put('/admin/payment-config', updateData);
      Alert.alert('Success', 'Configuration updated successfully');
      setEditingSection(null);
      await loadConfig();
      
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'NGN') {
      return `₦${(amount / 100).toLocaleString()}`;
    }
    return `${currency} ${(amount / 100).toLocaleString()}`;
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: theme.text }}>Loading configuration...</Text>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingTop: 60,
      paddingHorizontal: 24,
      paddingBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
    },
    section: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    editButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    editButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    saveButton: {
      backgroundColor: '#4CAF50',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    cancelButton: {
      backgroundColor: '#FF4444',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      marginRight: 8,
    },
    buttonRow: {
      flexDirection: 'row',
    },
    fieldRow: {
      marginBottom: 12,
    },
    fieldLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    fieldValue: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    input: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: theme.text,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    switchLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      flex: 1,
    },

    currentValue: {
      backgroundColor: theme.surface,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    currentValueText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.primary,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Configuration</Text>
        <Text style={styles.subtitle}>Manage payment settings and pricing</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Premium Plan Configuration */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Premium Plan</Text>
            {editingSection !== 'premium' ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditingSection('premium')}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setEditingSection(null)}
                >
                  <Text style={styles.editButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => saveSection('premium')}
                  disabled={saving}
                >
                  <Text style={styles.editButtonText}>
                    {saving ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {editingSection === 'premium' ? (
            <>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Amount (₦)</Text>
                <TextInput
                  style={styles.input}
                  value={premiumAmount}
                  onChangeText={setPremiumAmount}
                  placeholder="Enter amount in Naira"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Duration (Days)</Text>
                <TextInput
                  style={styles.input}
                  value={premiumDuration}
                  onChangeText={setPremiumDuration}
                  placeholder="Enter duration in days"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Daily Analyses Limit</Text>
                <TextInput
                  style={styles.input}
                  value={dailyAnalyses}
                  onChangeText={setDailyAnalyses}
                  placeholder="Enter daily limit"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Monthly Analyses Limit</Text>
                <TextInput
                  style={styles.input}
                  value={monthlyAnalyses}
                  onChangeText={setMonthlyAnalyses}
                  placeholder="Enter monthly limit"
                  keyboardType="numeric"
                />
              </View>
            </>
          ) : (
            config && (
              <>
                <View style={styles.currentValue}>
                  <Text style={styles.currentValueText}>
                    {formatCurrency(config.premiumPlan.amount, config.premiumPlan.currency)} / {config.premiumPlan.duration} days
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Daily Analyses</Text>
                  <Text style={styles.fieldValue}>{config.premiumPlan.features.dailyAnalyses}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Monthly Analyses</Text>
                  <Text style={styles.fieldValue}>{config.premiumPlan.features.monthlyAnalyses}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Support Level</Text>
                  <Text style={styles.fieldValue}>{config.premiumPlan.features.supportLevel}</Text>
                </View>
              </>
            )
          )}
        </View>

        {/* Bank Account Configuration */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bank Account</Text>
            {editingSection !== 'bank' ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditingSection('bank')}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setEditingSection(null)}
                >
                  <Text style={styles.editButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => saveSection('bank')}
                  disabled={saving}
                >
                  <Text style={styles.editButtonText}>
                    {saving ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {editingSection === 'bank' ? (
            <>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Account Number</Text>
                <TextInput
                  style={styles.input}
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  placeholder="Enter account number"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Account Name</Text>
                <TextInput
                  style={styles.input}
                  value={accountName}
                  onChangeText={setAccountName}
                  placeholder="Enter account name"
                />
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Bank Name</Text>
                <TextInput
                  style={styles.input}
                  value={bankName}
                  onChangeText={setBankName}
                  placeholder="Enter bank name"
                />
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Bank Code (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={bankCode}
                  onChangeText={setBankCode}
                  placeholder="Enter bank code"
                />
              </View>
            </>
          ) : (
            config && (
              <>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Account Number</Text>
                  <Text style={styles.fieldValue}>{config.bankAccount.accountNumber}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Account Name</Text>
                  <Text style={styles.fieldValue}>{config.bankAccount.accountName}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Bank Name</Text>
                  <Text style={styles.fieldValue}>{config.bankAccount.bankName}</Text>
                </View>
                {config.bankAccount.bankCode && (
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Bank Code</Text>
                    <Text style={styles.fieldValue}>{config.bankAccount.bankCode}</Text>
                  </View>
                )}
              </>
            )
          )}
        </View>

        {/* Payment Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Settings</Text>
            {editingSection !== 'settings' ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditingSection('settings')}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setEditingSection(null)}
                >
                  <Text style={styles.editButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => saveSection('settings')}
                  disabled={saving}
                >
                  <Text style={styles.editButtonText}>
                    {saving ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {editingSection === 'settings' ? (
            <>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Auto Approval</Text>
                <Switch
                  value={autoApproval}
                  onValueChange={setAutoApproval}
                  trackColor={{ false: theme.border, true: theme.primary }}
                />
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Payment Timeout (Minutes)</Text>
                <TextInput
                  style={styles.input}
                  value={paymentTimeout}
                  onChangeText={setPaymentTimeout}
                  placeholder="Enter timeout in minutes"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Require Proof of Payment</Text>
                <Switch
                  value={requireProof}
                  onValueChange={setRequireProof}
                  trackColor={{ false: theme.border, true: theme.primary }}
                />
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Max Pending Payments</Text>
                <TextInput
                  style={styles.input}
                  value={maxPending}
                  onChangeText={setMaxPending}
                  placeholder="Enter max pending payments"
                  keyboardType="numeric"
                />
              </View>
            </>
          ) : (
            config && (
              <>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Auto Approval</Text>
                  <Text style={styles.fieldValue}>
                    {config.paymentSettings.autoApproval ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Payment Timeout</Text>
                  <Text style={styles.fieldValue}>
                    {config.paymentSettings.paymentTimeoutMinutes} minutes
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Require Proof</Text>
                  <Text style={styles.fieldValue}>
                    {config.paymentSettings.requireProofOfPayment ? 'Yes' : 'No'}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Max Pending</Text>
                  <Text style={styles.fieldValue}>
                    {config.paymentSettings.maxPendingPayments}
                  </Text>
                </View>
              </>
            )
          )}
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            {editingSection !== 'notifications' ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditingSection('notifications')}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setEditingSection(null)}
                >
                  <Text style={styles.editButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => saveSection('notifications')}
                  disabled={saving}
                >
                  <Text style={styles.editButtonText}>
                    {saving ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {editingSection === 'notifications' ? (
            <>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Email Notifications</Text>
                <Switch
                  value={emailNotifications}
                  onValueChange={setEmailNotifications}
                  trackColor={{ false: theme.border, true: theme.primary }}
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>SMS Notifications</Text>
                <Switch
                  value={smsNotifications}
                  onValueChange={setSmsNotifications}
                  trackColor={{ false: theme.border, true: theme.primary }}
                />
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Admin Emails (comma separated)</Text>
                <TextInput
                  style={styles.input}
                  value={adminEmails}
                  onChangeText={setAdminEmails}
                  placeholder="admin@example.com, admin2@example.com"
                />
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Notification Subject</Text>
                <TextInput
                  style={styles.input}
                  value={notificationSubject}
                  onChangeText={setNotificationSubject}
                  placeholder="Enter notification subject"
                />
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Notification Message</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notificationMessage}
                  onChangeText={setNotificationMessage}
                  placeholder="Enter notification message template"
                  multiline
                />
              </View>
            </>
          ) : (
            config && (
              <>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Email Notifications</Text>
                  <Text style={styles.fieldValue}>
                    {config.notifications.emailNotifications ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>SMS Notifications</Text>
                  <Text style={styles.fieldValue}>
                    {config.notifications.smsNotifications ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Admin Emails</Text>
                  <Text style={styles.fieldValue}>
                    {config.notifications.adminEmails.join(', ') || 'None configured'}
                  </Text>
                </View>
              </>
            )
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminPaymentConfigScreen;