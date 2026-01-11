const mongoose = require("mongoose");

const hospitalBillSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },
    customerContact: {
      type: String,
      required: false,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
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
    consultantName: {
      type: String,
      required: false,
    },
    admitDate: {
      type: Date,
      required: false,
    },
    dischargeDate: {
      type: Date,
      required: false,
    },
    ipdNo: {
      type: String,
      required: false,
    },
    patientRegistration: {
      type: String,
      required: false,
    },
    services: [
      {
        service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
          required: false,
        },
        serviceName: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          required: false,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        rate: {
          type: Number,
          required: true,
          min: 0,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
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
    paymentMode: {
      type: String,
      enum: [
        "Cash",
        "Credit Card",
        "Debit Card",
        "UPI",
        "Net Banking",
        "Cheque",
      ],
      default: "Cash",
    },
    remarks: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("HospitalBill", hospitalBillSchema);
