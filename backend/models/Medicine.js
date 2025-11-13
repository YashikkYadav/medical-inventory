const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  expiryDate: {
    type: Date,
    required: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  batchNumber: {
    type: String,
    required: true
  },
  schedule: {
    type: String,
    enum: ['H', 'H1', 'X', 'Y', 'Z'],
    default: 'N/A'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Medicine', medicineSchema);