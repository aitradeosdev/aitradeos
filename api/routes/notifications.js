const express = require('express');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    res.json({ notifications: req.user.notifications || [] });
  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, message, type = 'info' } = req.body;
    
    const notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      read: false,
      timestamp: new Date()
    };
    
    req.user.notifications.push(notification);
    await req.user.save();
    
    res.json({ notification });
  } catch (error) {
    logger.error('Add notification error:', error);
    res.status(500).json({ error: 'Failed to add notification' });
  }
});

router.put('/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const notification = req.user.notifications.find(n => n.id === id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    notification.read = true;
    await req.user.save();
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    logger.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

router.put('/read-all', auth, async (req, res) => {
  try {
    req.user.notifications.forEach(n => n.read = true);
    await req.user.save();
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    logger.error('Mark all notifications read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

module.exports = router;