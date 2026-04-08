const mongoose = require("mongoose");

const medicalBillSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },
    customerContact: {
      type: String,
      required: true,
    },
    doctorName: {
      type: String,
      required: false,
    },
    patientAge: {
      type: String,
      required: false,
    },
    patientSex: {
      type: String,
      required: false,
    },
    patientAddress: {
      type: String,
      required: false,
    },

    items: [
      {
        medicine: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicine",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    amountInWords: {
      type: String,
      required: false,
    },
    billType: {
      type: String,
      default: "medical",
    },
    paymentMode: {
      type: String,
      default: "Cash",
      enum: ["Cash", "Credit Card", "Debit Card", "UPI", "Net Banking"],
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MedicalBill", medicalBillSchema);
