const UserModel = require('../models/User');
const logger = require('../utils/logger');

class NotificationService {
  /**
   * Send notification to all admin users
   * @param {Object} notification - Notification object
   * @param {string} notification.title - Notification title
   * @param {string} notification.message - Notification message
   * @param {string} notification.type - Notification type (info, success, warning, error, payment)
   * @param {Object} notification.data - Additional data for the notification
   */
  async sendToAdmins(notification) {
    try {
      const adminUsers = await UserModel.model.find({ role: 'admin' });
      
      const notificationObj = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        read: false,
        timestamp: new Date(),
        data: notification.data || {}
      };
      
      let notificationsSent = 0;
      
      for (const admin of adminUsers) {
        if (!admin.notifications) {
          admin.notifications = [];
        }
        
        // Keep only last 50 notifications per user to prevent bloat
        if (admin.notifications.length >= 50) {
          admin.notifications = admin.notifications.slice(-49);
        }
        
        admin.notifications.push(notificationObj);
        await admin.save();
        notificationsSent++;
      }
      
      logger.log(`Notification sent to ${notificationsSent} admin(s): ${notification.title}`);
      return { success: true, sent: notificationsSent };
      
    } catch (error) {
      logger.error('Failed to send admin notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to a specific user
   * @param {string} userId - User ID to send notification to
   * @param {Object} notification - Notification object
   */
  async sendToUser(userId, notification) {
    try {
      const user = await UserModel.model.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Check user notification preferences
      if (user.settings && user.settings.notifications === false) {
        logger.log(`Notification skipped for user ${user.username} - notifications disabled`);
        return { success: true, skipped: true };
      }
      
      const notificationObj = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        read: false,
        timestamp: new Date(),
        data: notification.data || {}
      };
      
      if (!user.notifications) {
        user.notifications = [];
      }
      
      // Keep only last 50 notifications per user
      if (user.notifications.length >= 50) {
        user.notifications = user.notifications.slice(-49);
      }
      
      user.notifications.push(notificationObj);
      await user.save();
      
      logger.log(`Notification sent to user ${user.username}: ${notification.title}`);
      return { success: true };
      
    } catch (error) {
      logger.error('Failed to send user notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send payment-related notifications
   */
  async sendPaymentNotification(type, paymentData, userInfo) {
    const notifications = {
      'payment_initiated': {
        title: 'New Payment Request',
        message: `${userInfo.username} initiated a payment request for ${this.formatAmount(paymentData.amount, paymentData.currency)}`,
        type: 'payment'
      },
      'payment_confirmed': {
        title: 'Payment Confirmation Received',
        message: `${userInfo.username} confirmed payment ${paymentData.reference} for ${this.formatAmount(paymentData.amount, paymentData.currency)}. Please review and approve.`,
        type: 'payment'
      },
      'payment_approved': {
        title: 'Payment Approved',
        message: `Your payment ${paymentData.reference} has been approved. Welcome to Premium!`,
        type: 'success'
      },
      'payment_rejected': {
        title: 'Payment Rejected',
        message: `Your payment ${paymentData.reference} has been rejected. ${paymentData.adminNotes || 'Please contact support for more information.'}`,
        type: 'error'
      }
    };

    const notification = notifications[type];
    if (!notification) {
      logger.error(`Unknown payment notification type: ${type}`);
      return { success: false, error: 'Unknown notification type' };
    }

    notification.data = {
      paymentReference: paymentData.reference,
      userId: paymentData.userId || userInfo.id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      type: 'payment'
    };

    // Send to admins for payment requests and confirmations
    if (type === 'payment_initiated' || type === 'payment_confirmed') {
      return await this.sendToAdmins(notification);
    }
    
    // Send to user for approvals and rejections
    if (type === 'payment_approved' || type === 'payment_rejected') {
      return await this.sendToUser(paymentData.userId || userInfo.id, notification);
    }

    return { success: false, error: 'Invalid notification routing' };
  }

  /**
   * Format currency amount for display
   */
  formatAmount(amount, currency) {
    if (currency === 'NGN') {
      return `₦${(amount / 100).toLocaleString()}`;
    }
    return `${currency} ${(amount / 100).toLocaleString()}`;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(userId, notificationId) {
    try {
      const user = await UserModel.model.findById(userId);
      if (!user || !user.notifications) {
        return { success: false, error: 'User or notifications not found' };
      }

      const notification = user.notifications.find(n => n.id === notificationId);
      if (!notification) {
        return { success: false, error: 'Notification not found' };
      }

      notification.read = true;
      await user.save();

      return { success: true };
    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    try {
      const user = await UserModel.model.findById(userId);
      if (!user || !user.notifications) {
        return { success: false, error: 'User or notifications not found' };
      }

      user.notifications.forEach(notification => {
        notification.read = true;
      });
      
      await user.save();
      return { success: true };
    } catch (error) {
      logger.error('Failed to mark all notifications as read:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId) {
    try {
      const user = await UserModel.model.findById(userId);
      if (!user || !user.notifications) {
        return { success: true, count: 0 };
      }

      const unreadCount = user.notifications.filter(n => !n.read).length;
      return { success: true, count: unreadCount };
    } catch (error) {
      logger.error('Failed to get unread count:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new NotificationService();