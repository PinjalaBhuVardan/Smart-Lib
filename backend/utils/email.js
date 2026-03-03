const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: '"Smart Library" <' + process.env.EMAIL_USER + '>',
      to: to,
      subject: subject,
      html: html
    });
    console.log('Email sent to ' + to);
    return true;
  } catch (err) {
    console.error('Email error:', err.message);
    return false;
  }
};

const emailTemplates = {
  bookingConfirmation: function(name, room, date, timeSlot, bookingId) {
    return {
      subject: 'Booking Confirmed - ' + bookingId,
      html: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e0e0e0;border-radius:10px">' +
        '<h2 style="color:#1a237e;text-align:center">Booking Confirmed!</h2>' +
        '<p>Dear <strong>' + name + '</strong>,</p>' +
        '<p>Your study room has been successfully booked.</p>' +
        '<div style="background:#f0f4ff;padding:16px;border-radius:8px;margin:16px 0">' +
        '<p><strong>Booking ID:</strong> ' + bookingId + '</p>' +
        '<p><strong>Room:</strong> ' + room + '</p>' +
        '<p><strong>Date:</strong> ' + date + '</p>' +
        '<p><strong>Time Slot:</strong> ' + timeSlot + '</p>' +
        '</div>' +
        '<div style="background:#fff8e1;padding:16px;border-radius:8px;border-left:4px solid #ffc107">' +
        '<p><strong>Important Reminders:</strong></p>' +
        '<ul>' +
        '<li>Arrive <strong>10 minutes before</strong> your slot starts</li>' +
        '<li>Show your QR code at the admin desk for check-in</li>' +
        '<li>Late arrival beyond 10 minutes will auto-cancel your booking</li>' +
        '</ul>' +
        '</div>' +
        '<p style="color:#6b7280;font-size:12px;margin-top:20px">Smart Library Booking System</p>' +
        '</div>'
    };
  },

  bookingCancelled: function(name, room, date, timeSlot, reason) {
    return {
      subject: 'Booking Cancelled - Smart Library',
      html: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e0e0e0;border-radius:10px">' +
        '<h2 style="color:#c62828;text-align:center">Booking Cancelled</h2>' +
        '<p>Dear <strong>' + name + '</strong>,</p>' +
        '<p>Your booking has been cancelled.</p>' +
        '<div style="background:#ffebee;padding:16px;border-radius:8px;margin:16px 0">' +
        '<p><strong>Room:</strong> ' + room + '</p>' +
        '<p><strong>Date:</strong> ' + date + '</p>' +
        '<p><strong>Time Slot:</strong> ' + timeSlot + '</p>' +
        '<p><strong>Reason:</strong> ' + reason + '</p>' +
        '</div>' +
        '<p>You can book another slot from the portal.</p>' +
        '<p style="color:#6b7280;font-size:12px;margin-top:20px">Smart Library Booking System</p>' +
        '</div>'
    };
  },

  checkinSuccess: function(name, room, timeSlot) {
    return {
      subject: 'Check-In Successful - Smart Library',
      html: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e0e0e0;border-radius:10px">' +
        '<h2 style="color:#2e7d32;text-align:center">Check-In Successful!</h2>' +
        '<p>Dear <strong>' + name + '</strong>,</p>' +
        '<p>You have successfully checked in to your study room.</p>' +
        '<div style="background:#e8f5e9;padding:16px;border-radius:8px;margin:16px 0">' +
        '<p><strong>Room:</strong> ' + room + '</p>' +
        '<p><strong>Time Slot:</strong> ' + timeSlot + '</p>' +
        '<p><strong>Check-In Time:</strong> ' + new Date().toLocaleTimeString() + '</p>' +
        '</div>' +
        '<p>Please maintain silence and follow library rules.</p>' +
        '<p style="color:#6b7280;font-size:12px;margin-top:20px">Smart Library Booking System</p>' +
        '</div>'
    };
  },

  redListNotice: function(name, reason) {
    return {
      subject: 'Access Restricted - Smart Library',
      html: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e0e0e0;border-radius:10px">' +
        '<h2 style="color:#c62828;text-align:center">Access Restricted</h2>' +
        '<p>Dear <strong>' + name + '</strong>,</p>' +
        '<p>Your access to the Smart Library booking system has been restricted.</p>' +
        '<div style="background:#ffebee;padding:16px;border-radius:8px;margin:16px 0">' +
        '<p><strong>Reason:</strong> ' + reason + '</p>' +
        '</div>' +
        '<p>Please contact the admin for more information.</p>' +
        '<p style="color:#6b7280;font-size:12px;margin-top:20px">Smart Library Booking System</p>' +
        '</div>'
    };
  }
};

module.exports = { sendEmail, emailTemplates };
