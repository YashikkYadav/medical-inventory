const mongoose = require("mongoose");

const opdBillSchema = new mongoose.Schema(
  {
    billNo: {
      type: String, // e.g. "0001164"
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    // Dynamic fields from Opdbill.jsx
    caseType: {
        type: String, // "New Case", "Follow Up" etc.
        default: "New Case"
    },
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
    services: [
      {
        name: {
          type: String, // e.g. "CONSULTATION CHARGES-OPD"
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
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

module.exports = mongoose.model("OpdBill", opdBillSchema);
