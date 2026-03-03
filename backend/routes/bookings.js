const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendEmail, emailTemplates } = require('../utils/email');

const TIME_SLOTS = Booking.TIME_SLOTS;

router.get('/available-slots', protect, async (req, res) => {
  try {
    const { roomId, date } = req.query;
    const booked = await Booking.find({
      room: roomId, date, status: { $in: ['confirmed', 'checked-in'] }
    }).select('timeSlot');
    const bookedSlots = booked.map(function(b) { return b.timeSlot; });
    const nowIST = new Date();
    const todayIST = nowIST.toISOString().split('T')[0];
    const currentMinutes = nowIST.getHours() * 60 + nowIST.getMinutes();
    const available = TIME_SLOTS.map(function(slot) {
      var isPast = false;
      if (date === todayIST) {
        var endTime = slot.split('-')[1];
        var endHour = parseInt(endTime.split(':')[0]);
        var endMin = parseInt(endTime.split(':')[1]);
        var slotEndMinutes = endHour * 60 + endMin;
        if (currentMinutes >= slotEndMinutes) isPast = true;
      }
      return { slot: slot, available: !bookedSlots.includes(slot) && !isPast };
    });
    res.json(available);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { roomId, date, timeSlot } = req.body;
    const user = await User.findById(req.user._id);

    if (user.isRedListed) {
      return res.status(403).json({ message: 'Your access is restricted. Contact admin.' });
    }

    const nowIST = new Date();
    const todayIST = nowIST.toISOString().split('T')[0];
    if (date === todayIST) {
      const currentMinutes = nowIST.getHours() * 60 + nowIST.getMinutes();
      const slotEndTime = timeSlot.split('-')[1];
      const slotEndHour = parseInt(slotEndTime.split(':')[0]);
      const slotEndMin = parseInt(slotEndTime.split(':')[1]);
      const slotEndMinutes = slotEndHour * 60 + slotEndMin;
      if (currentMinutes >= slotEndMinutes) {
        return res.status(400).json({ message: 'This time slot has already passed. Please select a future slot.' });
      }
    }

    const existing = await Booking.findOne({
      room: roomId, date, timeSlot, status: { $in: ['confirmed', 'checked-in'] }
    });
    if (existing) return res.status(400).json({ message: 'This slot is already booked' });

    const userExisting = await Booking.findOne({
      user: req.user._id, date, timeSlot, status: { $in: ['confirmed', 'checked-in'] }
    });
    if (userExisting) return res.status(400).json({ message: 'You already have a booking for this slot' });

    const room = await Room.findById(roomId);
    if (!room || !room.isActive) return res.status(404).json({ message: 'Room not found or unavailable' });

    const bookingId = 'BK' + Date.now().toString().slice(-8);

    const booking = new Booking({
      bookingId: bookingId,
      user: req.user._id,
      rollNo: user.rollNo,
      room: roomId,
      date: date,
      timeSlot: timeSlot,
      qrCode: user.qrCode
    });

    await booking.save();

    let emailSent = false;
    try {
      const template = emailTemplates.bookingConfirmation(user.name, room.name, date, timeSlot, bookingId);
      await sendEmail({ to: user.email, ...template });
      emailSent = true;
    } catch (emailErr) {
      console.error('Email failed:', emailErr.message);
    }

    res.status(201).json({
      message: 'Booking confirmed successfully!',
      emailSent: emailSent,
      emailMessage: emailSent ? 'Confirmation email sent to ' + user.email : 'Booking confirmed but email could not be sent.',
      booking: { ...booking._doc, room: { name: room.name, location: room.location } }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('room', 'name location')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/cancel/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id }).populate('room', 'name');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'confirmed') return res.status(400).json({ message: 'Cannot cancel this booking' });

    booking.status = 'cancelled';
    booking.cancelReason = 'Cancelled by user';
    await booking.save();

    let emailSent = false;
    try {
      const user = await User.findById(req.user._id);
      const template = emailTemplates.bookingCancelled(user.name, booking.room.name, booking.date, booking.timeSlot, 'Cancelled by user');
      await sendEmail({ to: user.email, ...template });
      emailSent = true;
    } catch (emailErr) {
      console.error('Email failed:', emailErr.message);
    }

    res.json({
      message: 'Booking cancelled successfully!',
      emailSent: emailSent,
      emailMessage: emailSent ? 'Cancellation email sent to your inbox' : 'Booking cancelled but email notification failed',
      booking: booking
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;


