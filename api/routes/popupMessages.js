const express = require('express');
const router = express.Router();
const PopupMessageModel = require('../models/PopupMessage');
const UserModel = require('../models/User');
const { auth, requireAdmin } = require('../middleware/auth');

// Get active popup message for user
router.get('/active', auth, async (req, res) => {
  try {
    const user = await UserModel.model.findById(req.user._id);
    const activeMessage = await PopupMessageModel.model.findOne({ isActive: true }).sort({ createdAt: -1 });
    
    if (!activeMessage) {
      return res.json({ message: null });
    }
    
    // Check if user has already seen this message
    const hasSeenMessage = user.seenPopupMessages?.includes(activeMessage._id.toString());
    
    if (hasSeenMessage) {
      return res.json({ message: null });
    }
    
    res.json({ message: activeMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark message as seen
router.post('/seen/:id', auth, async (req, res) => {
  try {
    await UserModel.model.findByIdAndUpdate(req.user._id, {
      $addToSet: { seenPopupMessages: req.params.id }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all messages
router.get('/admin/all', auth, requireAdmin, async (req, res) => {
  try {
    const messages = await PopupMessageModel.model.find().sort({ createdAt: -1 }).populate('createdBy', 'username');
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Create message
router.post('/admin/create', auth, requireAdmin, async (req, res) => {
  try {
    const { title, message, customization } = req.body;
    
    const newMessage = new PopupMessageModel.model({
      title,
      message,
      customization,
      createdBy: req.user._id
    });
    
    await newMessage.save();
    res.json({ success: true, message: newMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Delete message
router.delete('/admin/:id', auth, requireAdmin, async (req, res) => {
  try {
    await PopupMessageModel.model.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Toggle active status
router.patch('/admin/:id/toggle', auth, requireAdmin, async (req, res) => {
  try {
    const message = await PopupMessageModel.model.findById(req.params.id);
    message.isActive = !message.isActive;
    await message.save();
    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
