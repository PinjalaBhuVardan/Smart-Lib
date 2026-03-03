const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { protect, adminOnly } = require('../middleware/auth');

// Get all active rooms (public)
router.get('/', protect, async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all rooms (admin)
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add room
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json({ message: 'Room added successfully', room });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update room
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Room updated', room });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete room
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
