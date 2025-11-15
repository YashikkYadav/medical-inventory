const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true
  },
  customerContact: {
    type: String,
    required: true
  },
  patientAge: {
    type: String,
    required: false
  },
  patientSex: {
    type: String,
    required: false
  },
  patientAddress: {
    type: String,
    required: false
  },
  consultantName: {
    type: String,
    required: false
  },
  admitDate: {
    type: String,
    required: false
  },
  dischargeDate: {
    type: String,
    required: false
  },
  ipdNo: {
    type: String,
    required: false
  },
  billType: {
    type: String,
    required: true,
    enum: ['hospital', 'medical'],
    default: 'medical'
  },
  items: [{
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: false  // Make this optional for hospital bills
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    name: {
      type: String,
      required: false  // Optional name field for hospital services
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  grandTotal: {
    type: Number,
    required: true,
    min: 0
  },
  amountInWords: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Invoice', invoiceSchema);