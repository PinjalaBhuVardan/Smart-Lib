const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rollNo: { type: String, required: true },
  issueType: {
    type: String,
    enum: ['Fan not working', 'Light not working', 'WiFi issue', 'AC not working', 'Projector issue', 'Cleanliness', 'Others'],
    required: true
  },
  description: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending'
  },
  adminNote: { type: String, default: '' },
  resolvedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', complaintSchema);
