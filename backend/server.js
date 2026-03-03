process.env.TZ = 'Asia/Kolkata';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const Booking = require('./models/Booking');
const User = require('./models/User');
const { sendEmail, emailTemplates } = require('./utils/email');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', methods: ['GET', 'POST'] }
});

global.io = io;

connectDB();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/complaints', require('./routes/complaints'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', time: new Date() }));

io.on('connection', (socket) => {
  console.log('Student connected to live updates');
  socket.on('disconnect', () => { console.log('Student disconnected'); });
});

cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    const confirmedBookings = await Booking.find({ date: today, status: 'confirmed' })
      .populate('user', 'name email')
      .populate('room', 'name');

    for (const booking of confirmedBookings) {
      const [startTime] = booking.timeSlot.split('-');
      const [startHour, startMin] = startTime.split(':').map(Number);
      const slotStartMinutes = startHour * 60 + startMin;
      const lateDeadline = slotStartMinutes + 10;

      if (currentTotalMinutes > lateDeadline) {
        booking.status = 'expired';
        booking.cancelReason = 'Auto-cancelled: late arrival beyond 10 minute window';
        await booking.save();
        console.log('Auto-cancelled: ' + booking.bookingId);

        // 1. Send cancellation email to booked student
        if (booking.user && booking.user.email) {
          try {
            const template = emailTemplates.bookingCancelled(
              booking.user.name,
              booking.room ? booking.room.name : 'Study Room',
              booking.date,
              booking.timeSlot,
              'Automatically cancelled due to late arrival.'
            );
            await sendEmail({ to: booking.user.email, ...template });
          } catch (e) { console.error('Cancellation email error:', e.message); }
        }

        // 2. Send slot available email to ALL other students
        try {
          const allStudents = await User.find({ role: 'student', isRedListed: false });
          for (const student of allStudents) {
            if (student.email !== (booking.user ? booking.user.email : '')) {
              try {
                await sendEmail({
                  to: student.email,
                  subject: 'Slot Available - ' + (booking.room ? booking.room.name : 'Study Room'),
                  html: '<div style="font-family:Arial,sans-serif;padding:20px;border:1px solid #e0e0e0;border-radius:10px">' +
                    '<h2 style="color:#2e7d32">Room Slot Now Available!</h2>' +
                    '<p>Dear ' + student.name + ',</p>' +
                    '<p>A slot has just opened up. Book it now before someone else does!</p>' +
                    '<div style="background:#e8f5e9;padding:16px;border-radius:8px;margin:16px 0">' +
                    '<p><strong>Room:</strong> ' + (booking.room ? booking.room.name : 'Study Room') + '</p>' +
                    '<p><strong>Date:</strong> ' + booking.date + '</p>' +
                    '<p><strong>Time Slot:</strong> ' + booking.timeSlot + '</p>' +
                    '</div>' +
                    '<p>Login now to book this slot before it is taken!</p>' +
                    '<p style="color:#6b7280;font-size:12px">Smart Library Booking System</p></div>'
                });
              } catch (e) { console.error('Notify email error:', e.message); }
            }
          }
        } catch (e) { console.error('Fetch students error:', e.message); }

        // 3. Real-time popup to all students on booking page
        global.io.emit('slot-available', {
          roomId: booking.room ? booking.room._id : '',
          roomName: booking.room ? booking.room.name : 'Study Room',
          date: booking.date,
          timeSlot: booking.timeSlot,
          message: (booking.room ? booking.room.name : 'Study Room') + ' slot ' + booking.timeSlot + ' is now available!'
        });
      }
    }
  } catch (err) {
    console.error('Cron error:', err.message);
  }
});

const createDefaultAdmin = async () => {
  try {
    const bcrypt = require('bcryptjs');
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      const hashed = await bcrypt.hash('Admin@123', 12);
      await User.create({
        rollNo: 'ADMIN001',
        name: 'System Admin',
        email: process.env.EMAIL_USER || 'admin@smartlibrary.com',
        password: hashed,
        role: 'admin',
        isEmailVerified: true
      });
      console.log('Admin created: ADMIN001 / Admin@123');
    } else {
      const match = await bcrypt.compare('Admin@123', admin.password);
      if (!match) {
        admin.password = await bcrypt.hash('Admin@123', 12);
        await admin.save({ validateBeforeSave: false });
        console.log('Admin password fixed');
      } else {
        console.log('Admin ready: ADMIN001 / Admin@123');
      }
    }
  } catch (err) {
    console.error('Admin error:', err.message);
  }
};

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log('Server running on port ' + PORT);
  await createDefaultAdmin();
});
