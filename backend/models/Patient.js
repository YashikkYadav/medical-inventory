const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
    },
    phoneNumber: {
      type: String,
    },
    sex: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    address: {
      type: String,
    },
    hospitalBills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HospitalBill",
      },
    ],
    opdBills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OpdBill",
      },
    ],
    ipdBills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "IpdBill",
      },
    ],
    patientId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Patient", patientSchema);
