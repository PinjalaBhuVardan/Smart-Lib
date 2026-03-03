const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const User = require('../models/User');
const Room = require('../models/Room');
const { protect, adminOnly } = require('../middleware/auth');
const { sendEmail, emailTemplates } = require('../utils/email');

function getISTDate() {
  return new Date().toISOString().split('T')[0];
}

function getISTMinutes() {
  var ist = new Date();
  return ist.getHours() * 60 + ist.getMinutes();
}

router.post('/scan-qr', protect, adminOnly, async (req, res) => {
  try {
    const { qrCode } = req.body;
    if (!qrCode) return res.status(400).json({ message: 'QR code is required' });

    const user = await User.findOne({ qrCode: qrCode.trim() });
    if (!user) return res.status(404).json({ message: 'Invalid QR Code - Student not found' });

    const today = getISTDate();
    const currentTotalMinutes = getISTMinutes();

    const booking = await Booking.findOne({
      user: user._id, date: today, status: 'confirmed'
    }).populate('room', 'name');

    if (!booking) {
      return res.status(404).json({
        message: 'No confirmed booking found for ' + user.name + ' (' + user.rollNo + ') today',
        user: { name: user.name, rollNo: user.rollNo }
      });
    }

    const startTime = booking.timeSlot.split('-')[0];
    const startHour = parseInt(startTime.split(':')[0]);
    const startMin = parseInt(startTime.split(':')[1]);
    const slotStartMinutes = startHour * 60 + startMin;
    const earlyEntry = slotStartMinutes - 10;
    const lateDeadline = slotStartMinutes + 10;

    if (currentTotalMinutes < earlyEntry) {
      return res.status(400).json({
        message: 'Too early! Entry allowed from ' + (startMin === 0 ? (startHour - 1) + ':50' : startHour + ':' + String(startMin - 10).padStart(2, '0')) + ' onwards',
        booking: { timeSlot: booking.timeSlot },
        user: { name: user.name, rollNo: user.rollNo }
      });
    }

    if (currentTotalMinutes > lateDeadline) {
      booking.status = 'expired';
      booking.cancelReason = 'Auto-cancelled: arrived late beyond 10 minute window';
      await booking.save();
      try {
        const template = emailTemplates.bookingCancelled(user.name, booking.room ? booking.room.name : 'Study Room', booking.date, booking.timeSlot, 'Late arrival');
        await sendEmail({ to: user.email, ...template });
      } catch (e) { console.error('email error', e.message); }
      return res.status(400).json({ message: 'Booking cancelled - ' + user.name + ' arrived too late.', autoCancelled: true });
    }

    booking.status = 'checked-in';
    booking.checkinTime = new Date();
    await booking.save();

    try {
      const template = emailTemplates.checkinSuccess(user.name, booking.room ? booking.room.name : 'Room', booking.timeSlot);
      await sendEmail({ to: user.email, ...template });
    } catch (e) { console.error('email error', e.message); }

    res.json({
      message: 'Successfully checked in!',
      user: { name: user.name, rollNo: user.rollNo, email: user.email },
      booking: { bookingId: booking.bookingId, room: booking.room ? booking.room.name : 'Room', timeSlot: booking.timeSlot, date: booking.date }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/bookings', protect, adminOnly, async (req, res) => {
  try {
    const { date, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (date) filter.date = date;
    if (status) filter.status = status;
    const bookings = await Booking.find(filter)
      .populate('user', 'name rollNo email')
      .populate('room', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Booking.countDocuments(filter);
    res.json({ bookings, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/bookings/:id/cancel', protect, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id).populate('user', 'name email').populate('room', 'name');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.status = 'cancelled';
    booking.cancelReason = reason || 'Cancelled by admin';
    await booking.save();
    try {
      const template = emailTemplates.bookingCancelled(booking.user.name, booking.room.name, booking.date, booking.timeSlot, reason || 'Cancelled by admin');
      await sendEmail({ to: booking.user.email, ...template });
    } catch (e) { console.error('email error', e.message); }
    res.json({ message: 'Booking cancelled', booking });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/users/:rollNo/redlist', protect, adminOnly, async (req, res) => {
  try {
    const { reason, duration } = req.body;
    const user = await User.findOne({ rollNo: req.params.rollNo.toUpperCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isRedListed = true;
    user.redListReason = reason;
    user.redListDuration = duration ? new Date(duration) : null;
    await user.save();
    try {
      const template = emailTemplates.redListNotice(user.name, reason);
      await sendEmail({ to: user.email, ...template });
    } catch (e) { console.error('email error', e.message); }
    res.json({ message: user.name + ' added to restricted list', user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/users/:rollNo/unredlist', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findOne({ rollNo: req.params.rollNo.toUpperCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isRedListed = false;
    user.redListReason = '';
    user.redListDuration = null;
    await user.save();
    res.json({ message: user.name + ' access restored', user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/analytics', protect, adminOnly, async (req, res) => {
  try {
    const today = getISTDate();
    const last7Days = [];
    for (var i = 6; i >= 0; i--) {
      var d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }
    const dailyBookings = await Promise.all(
      last7Days.map(async function(date) {
        return { date: date, count: await Booking.countDocuments({ date: date, status: { $ne: 'cancelled' } }) };
      })
    );
    const slotStats = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$timeSlot', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const roomStats = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$room', count: { $sum: 1 } } },
      { $lookup: { from: 'rooms', localField: '_id', foreignField: '_id', as: 'room' } },
      { $unwind: '$room' },
      { $project: { name: '$room.name', count: 1 } },
      { $sort: { count: -1 } }
    ]);
    const totalBookings = await Booking.countDocuments();
    const todayBookings = await Booking.countDocuments({ date: today });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const checkedInToday = await Booking.countDocuments({ date: today, status: 'checked-in' });
    const redListCount = await User.countDocuments({ isRedListed: true });
    const totalStudents = await User.countDocuments({ role: 'student' });
    res.json({ dailyBookings, slotStats, roomStats, summary: { totalBookings, todayBookings, cancelledBookings, checkedInToday, redListCount, totalStudents } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

