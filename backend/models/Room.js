const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  capacity: { type: Number, required: true },
  amenities: [{ type: String }],
  location: { type: String },
  isActive: { type: Boolean, default: true },
  image: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);
