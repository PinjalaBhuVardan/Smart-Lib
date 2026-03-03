const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  rollNo: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  department: { type: String },
  year: { type: String },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  qrCode: { type: String, default: null },
  qrCodeDataUrl: { type: String, default: null },
  isRedListed: { type: Boolean, default: false },
  redListReason: { type: String, default: '' },
  redListDuration: { type: Date, default: null },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
