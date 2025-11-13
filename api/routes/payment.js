const express = require('express');
const UserModel = require('../models/User');
const PaymentConfigModel = require('../models/Payment');
const { auth } = require('../middleware/auth');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

const router = express.Router();

// Helper function to format currency amounts
const formatAmount = (amount, currency) => {
  if (currency === 'NGN') {
    return `₦${(amount / 100).toLocaleString()}`;
  }
  return `${currency} ${(amount / 100).toLocaleString()}`;
};

// Get available plans and pricing
router.get('/plans', async (req, res) => {
  try {
    const config = await PaymentConfigModel.model.getActiveConfig();
    
    const plans = {
      free: {
        name: 'Free Plan',
        price: 0,
        currency: 'NGN',
        features: {
          dailyAnalyses: 1,
          monthlyAnalyses: 30,
          supportLevel: 'Community'
        }
      },
      premium: {
        name: 'Premium Plan',
        price: config.premiumPlan.amount,
        displayPrice: config.premiumPlan.displayAmount,
        currency: config.premiumPlan.currency,
        duration: config.premiumPlan.duration,
        features: config.premiumPlan.features
      }
    };
    
    res.json({
      plans,
      activeConfig: {
        bankAccount: config.bankAccount,
        paymentTimeoutMinutes: config.paymentSettings.paymentTimeoutMinutes
      }
    });
  } catch (error) {
    logger.error('Get plans error:', error);
    res.status(500).json({ error: 'Failed to get plans' });
  }
});

// Initiate premium payment
router.post('/initiate', auth, async (req, res) => {
  try {
    const { plan = 'premium' } = req.body;
    
    // Check if user is already premium
    if (req.user.subscription.plan === 'premium') {
      return res.status(400).json({ 
        error: 'User already has premium subscription',
        subscription: req.user.subscription
      });
    }
    
    // Check for existing pending payment
    const existingPending = req.user.paymentHistory.find(p => p.status === 'pending');
    if (existingPending) {
      // Check if payment has expired
      const now = new Date();
      const expiryTime = new Date(existingPending.bankDetails.expiresAt);
      
      if (now < expiryTime) {
        return res.status(400).json({
          error: 'You already have a pending payment request',
          existingPayment: {
            reference: existingPending.reference,
            amount: existingPending.amount,
            expiresAt: existingPending.bankDetails.expiresAt,
            bankDetails: existingPending.bankDetails
          }
        });
      } else {
        // Mark expired payment as rejected
        existingPending.status = 'rejected';
        existingPending.adminNotes = 'Payment expired - auto-rejected';
        await req.user.save();
      }
    }
    
    // Get payment configuration
    const config = await PaymentConfigModel.model.getActiveConfig();
    const amount = config.premiumPlan.amount;
    
    // Create new payment request
    const { paymentRequest, save } = req.user.createPaymentRequest(amount, plan);
    
    // Add bank details with expiry
    const expiryTime = new Date(Date.now() + config.paymentSettings.paymentTimeoutMinutes * 60 * 1000);
    paymentRequest.bankDetails = {
      accountNumber: config.bankAccount.accountNumber,
      accountName: config.bankAccount.accountName,
      bankName: config.bankAccount.bankName,
      displayedAt: new Date(),
      expiresAt: expiryTime
    };
    
    await save();
    
    // Update payment statistics
    await config.incrementPaymentStats(amount, 'pending');
    
    // Send notification to admins about new payment request
    await notificationService.sendPaymentNotification('payment_initiated', {
      reference: paymentRequest.reference,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      plan: paymentRequest.plan
    }, {
      id: req.user._id,
      username: req.user.username
    });
    
    res.json({
      success: true,
      paymentRequest: {
        id: paymentRequest._id?.toString() || Date.now().toString(),
        userId: req.user._id.toString(),
        reference: paymentRequest.reference,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        plan: paymentRequest.plan,
        status: 'pending',
        bankDetails: paymentRequest.bankDetails,
        expiresAt: expiryTime,
        createdAt: paymentRequest.requestedAt
      },
      message: 'Payment request created successfully'
    });
    
  } catch (error) {
    logger.error('Payment initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// Get payment status
router.get('/status/:reference?', auth, async (req, res) => {
  try {
    const { reference } = req.params;
    
    if (reference) {
      // Get specific payment by reference
      const payment = req.user.paymentHistory.find(p => p.reference === reference);
      
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      
      res.json({
        payment: {
          reference: payment.reference,
          amount: payment.amount,
          currency: payment.currency,
          plan: payment.plan,
          status: payment.status,
          requestedAt: payment.requestedAt,
          confirmedAt: payment.confirmedAt,
          bankDetails: payment.bankDetails,
          adminNotes: payment.adminNotes
        }
      });
    } else {
      // Get all user payments
      const payments = req.user.paymentHistory.map(p => ({
        reference: p.reference,
        amount: p.amount,
        currency: p.currency,
        plan: p.plan,
        status: p.status,
        requestedAt: p.requestedAt,
        confirmedAt: p.confirmedAt,
        adminNotes: p.adminNotes
      }));
      
      res.json({ payments });
    }
    
  } catch (error) {
    logger.error('Get payment status error:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
});

// Confirm payment made (user action)
router.post('/confirm/:reference', auth, async (req, res) => {
  try {
    const { reference } = req.params;
    const { proofOfPayment } = req.body; // Optional proof attachment
    
    const payment = req.user.paymentHistory.find(p => p.reference === reference);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    if (payment.status !== 'pending') {
      return res.status(400).json({ 
        error: `Payment is ${payment.status}`, 
        payment: {
          reference: payment.reference,
          status: payment.status,
          confirmedAt: payment.confirmedAt
        }
      });
    }
    
    // Check if payment has expired
    const now = new Date();
    const expiryTime = new Date(payment.bankDetails.expiresAt);
    
    if (now > expiryTime) {
      payment.status = 'rejected';
      payment.adminNotes = 'Payment expired';
      await req.user.save();
      
      return res.status(400).json({ 
        error: 'Payment has expired',
        expiredAt: expiryTime
      });
    }
    
    // Add confirmation timestamp and proof
    payment.confirmedAt = new Date();
    if (proofOfPayment) {
      payment.proofOfPayment = proofOfPayment;
    }
    
    // NOTE: Status remains 'pending' until admin approval
    // We don't change it here - admin will approve/reject
    
    await req.user.save();
    
    // Send notification to admins about payment confirmation
    await notificationService.sendPaymentNotification('payment_confirmed', {
      reference: payment.reference,
      amount: payment.amount,
      currency: payment.currency,
      plan: payment.plan
    }, {
      id: req.user._id,
      username: req.user.username
    });
    
    res.json({
      success: true,
      message: 'Payment confirmation submitted successfully. Please wait for admin approval.',
      payment: {
        reference: payment.reference,
        status: payment.status,
        confirmedAt: payment.confirmedAt,
        awaitingApproval: true
      }
    });
    
  } catch (error) {
    logger.error('Payment confirmation error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Get pending payment for current user  
router.get('/pending', auth, async (req, res) => {
  try {
    const pendingPayment = req.user.paymentHistory
      .filter(p => p.status === 'pending')
      .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt))[0];
    
    if (!pendingPayment) {
      return res.json({
        success: true,
        paymentRequest: null,
        message: 'No pending payment found'
      });
    }
    
    // Check if payment has expired
    const now = new Date();
    const expiryTime = new Date(pendingPayment.bankDetails.expiresAt);
    
    if (now > expiryTime) {
      pendingPayment.status = 'rejected';
      pendingPayment.adminNotes = 'Payment expired - auto-rejected';
      await req.user.save();
      
      return res.json({
        success: true,
        paymentRequest: null,
        message: 'Previous payment expired'
      });
    }
    
    // Return active pending payment
    res.json({
      success: true,
      paymentRequest: {
        id: pendingPayment._id.toString(),
        userId: req.user._id.toString(),
        amount: pendingPayment.amount,
        currency: pendingPayment.currency,
        plan: pendingPayment.plan,
        status: pendingPayment.status,
        bankDetails: pendingPayment.bankDetails,
        expiresAt: pendingPayment.bankDetails.expiresAt,
        createdAt: pendingPayment.requestedAt,
        reference: pendingPayment.reference
      }
    });
    
  } catch (error) {
    logger.error('Get pending payment error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get pending payment' 
    });
  }
});

// Get current subscription status
router.get('/subscription', auth, async (req, res) => {
  try {
    const subscription = req.user.subscription;
    const usageStatus = req.user.checkUsageLimit();
    
    // Check if premium subscription has expired
    let isPremiumActive = subscription.plan === 'premium';
    if (isPremiumActive && subscription.endDate && new Date() > new Date(subscription.endDate)) {
      // Downgrade expired premium to free
      req.user.subscription.plan = 'free';
      req.user.subscription.endDate = null;
      await req.user.save();
      isPremiumActive = false;
    }
    
    res.json({
      subscription: {
        plan: isPremiumActive ? 'premium' : 'free',
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        activatedAt: subscription.activatedAt,
        purchaseDate: subscription.purchaseDate,
        daysRemaining: subscription.endDate ? 
          Math.max(0, Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24))) : 
          null
      },
      usage: {
        dailyRemaining: usageStatus.dailyRemaining,
        monthlyRemaining: usageStatus.monthlyRemaining,
        dailyLimit: usageStatus.dailyLimit,
        monthlyLimit: usageStatus.monthlyLimit,
        canAnalyze: usageStatus.canAnalyze,
        resetDate: usageStatus.resetDate
      }
    });
    
  } catch (error) {
    logger.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

// Cancel pending payment
router.delete('/cancel/:reference', auth, async (req, res) => {
  try {
    const { reference } = req.params;
    
    const payment = req.user.paymentHistory.find(p => p.reference === reference);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    if (payment.status !== 'pending') {
      return res.status(400).json({ 
        error: `Cannot cancel ${payment.status} payment`,
        payment: {
          reference: payment.reference,
          status: payment.status
        }
      });
    }
    
    payment.status = 'rejected';
    payment.adminNotes = 'Cancelled by user';
    await req.user.save();
    
    res.json({
      success: true,
      message: 'Payment cancelled successfully',
      payment: {
        reference: payment.reference,
        status: payment.status
      }
    });
    
  } catch (error) {
    logger.error('Payment cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel payment' });
  }
});

module.exports = router;