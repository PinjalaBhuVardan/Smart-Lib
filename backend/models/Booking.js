const mongoose = require('mongoose');

const TIME_SLOTS = [
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '13:00-14:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00'
];

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rollNo: { type: String, required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  timeSlot: { type: String, enum: TIME_SLOTS, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked-in', 'cancelled', 'expired'],
    default: 'confirmed'
  },
  checkinTime: { type: Date, default: null },
  cancelReason: { type: String, default: '' },
  qrCode: { type: String }, // reuse user's QR
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
module.exports.TIME_SLOTS = TIME_SLOTS;
