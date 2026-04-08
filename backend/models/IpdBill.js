const mongoose = require("mongoose");

const ipdBillSchema = new mongoose.Schema(
  {
    ipdNo: {
      type: String,
      required: false,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    // Dynamic fields from Ipdbill.jsx
    consultantName: {
      type: String,
    },
    billDate: {
      type: Date,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    // Usually "Advance Amount" or list of items
    particulars: [
        {
            description: { type: String, required: true },
            amount: { type: Number, required: true },
            date: { type: Date, default: Date.now }
        }
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMode: {
      type: String,
      default: "Cash",
    },
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("IpdBill", ipdBillSchema);
