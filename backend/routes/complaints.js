const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { protect, adminOnly } = require('../middleware/auth');

// Submit complaint (user)
router.post('/', protect, async (req, res) => {
  try {
    const { roomId, issueType, description } = req.body;
    const complaint = new Complaint({
      room: roomId,
      reportedBy: req.user._id,
      rollNo: req.user.rollNo,
      issueType,
      description
    });
    await complaint.save();
    res.status(201).json({ message: 'Complaint submitted successfully', complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's complaints
router.get('/my-complaints', protect, async (req, res) => {
  try {
    const complaints = await Complaint.find({ reportedBy: req.user._id })
      .populate('room', 'name')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all complaints (admin)
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('room', 'name')
      .populate('reportedBy', 'name rollNo')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update complaint status (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNote,
        resolvedAt: status === 'Resolved' ? new Date() : null
      },
      { new: true }
    ).populate('room', 'name');
    res.json({ message: 'Complaint updated', complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
