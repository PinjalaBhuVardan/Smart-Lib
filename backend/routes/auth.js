const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateQRCode } = require('../utils/qrGenerator');
const { sendEmail, emailTemplates } = require('../utils/email');
const { protect } = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const { rollNo, name, email, password, phone, department, year } = req.body;

    const existingUser = await User.findOne({ $or: [{ rollNo: rollNo.toUpperCase() }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Roll number or email already registered' });
    }

    const user = new User({
      rollNo: rollNo.toUpperCase(),
      name, email, password, phone, department, year,
      isEmailVerified: true
    });

    await user.save();

    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to Smart Library - Registration Successful',
        html: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e0e0e0;border-radius:10px">' +
          '<h2 style="color:#1a237e;text-align:center">Welcome to Smart Library!</h2>' +
          '<p>Dear <strong>' + name + '</strong>,</p>' +
          '<p>Your account has been successfully created.</p>' +
          '<div style="background:#f0f4ff;padding:16px;border-radius:8px;margin:16px 0">' +
          '<p><strong>Roll Number:</strong> ' + rollNo.toUpperCase() + '</p>' +
          '<p><strong>Email:</strong> ' + email + '</p>' +
          '</div>' +
          '<p>You can now login and book study rooms.</p>' +
          '<p style="color:#6b7280;font-size:12px;margin-top:20px">Smart Library Booking System</p>' +
          '</div>'
      });
    } catch (emailErr) {
      console.error('Welcome email failed:', emailErr.message);
    }

    res.status(201).json({ message: 'Registration successful! You can now login.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { rollNo, password, email } = req.body;

    const user = await User.findOne({ $or: [{ rollNo: rollNo.toUpperCase() }, { email }] });
    if (!user) return res.status(400).json({ message: 'Invalid roll number or password' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid roll number or password' });

    if (user.isRedListed) {
      if (user.redListDuration && new Date() > user.redListDuration) {
        user.isRedListed = false;
        user.redListReason = '';
        user.redListDuration = null;
        await user.save();
      } else {
        return res.status(403).json({
          message: 'Your access is restricted. Reason: ' + (user.redListReason || 'Violation of library rules') + '. Contact admin.',
          isRedListed: true
        });
      }
    }

    if (!user.qrCode) {
      const { qrCode, qrCodeDataUrl } = await generateQRCode(user.rollNo);
      user.qrCode = qrCode;
      user.qrCodeDataUrl = qrCodeDataUrl;
      await user.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        rollNo: user.rollNo,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        year: user.year,
        role: user.role,
        qrCode: user.qrCode,
        qrCodeDataUrl: user.qrCodeDataUrl,
        isRedListed: user.isRedListed
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

module.exports = router;



