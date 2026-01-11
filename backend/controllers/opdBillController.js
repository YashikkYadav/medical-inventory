const asyncHandler = require("express-async-handler");
const OpdBill = require("../models/OpdBill");
const Patient = require("../models/Patient");

// @desc    Create new OPD Bill
// @route   POST /api/opd-bills
// @access  Public
const createOpdBill = asyncHandler(async (req, res) => {
  const { 
      patientId, 
      consultantName, 
      caseType,
      services, 
      totalAmount, 
      paymentMode, 
      remarks 
  } = req.body;

  if (!patientId || !services || services.length === 0) {
    res.status(400);
    throw new Error("Patient ID and services are required");
  }

  const bill = await OpdBill.create({
    patient: patientId,
    consultantName,
    caseType,
    services,
    totalAmount,
    paymentMode,
    remarks,
  });

  if (bill) {
      // Add bill to patient record
    const patient = await Patient.findById(patientId);
    if(patient){
        patient.opdBills.push(bill._id);
        await patient.save();
    }
    res.status(201).json(bill);
  } else {
    res.status(400);
    throw new Error("Invalid bill data");
  }
});

// @desc    Get all OPD Bills
// @route   GET /api/opd-bills
// @access  Public
const getOpdBills = asyncHandler(async (req, res) => {
  const bills = await OpdBill.find({}).sort({ createdAt: -1 }).populate("patient", "name patientId age sex phoneNumber address");
  res.json(bills);
});

// @desc    Get OPD Bill by ID
// @route   GET /api/opd-bills/:id
// @access  Public
const getOpdBillById = asyncHandler(async (req, res) => {
  const bill = await OpdBill.findById(req.params.id).populate("patient");

  if (bill) {
    res.json(bill);
  } else {
    res.status(404);
    throw new Error("Bill not found");
  }
});

// @desc    Update OPD Bill
// @route   PUT /api/opd-bills/:id
// @access  Private
const updateOpdBill = asyncHandler(async (req, res) => {
  const { consultantName, caseType, services, totalAmount, paymentMode, remarks } = req.body;

  const bill = await OpdBill.findById(req.params.id);

  if (bill) {
    bill.consultantName = consultantName || bill.consultantName;
    bill.caseType = caseType || bill.caseType;
    bill.services = services || bill.services;
    bill.totalAmount = totalAmount || bill.totalAmount;
    bill.paymentMode = paymentMode || bill.paymentMode;
    bill.remarks = remarks || bill.remarks;

    const updatedBill = await bill.save();
    res.json(updatedBill);
  } else {
    res.status(404);
    throw new Error("Bill not found");
  }
});

// @desc    Delete OPD Bill
// @route   DELETE /api/opd-bills/:id
// @access  Private
const deleteOpdBill = asyncHandler(async (req, res) => {
  const bill = await OpdBill.findById(req.params.id);

  if (bill) {
    // Remove reference from patient
    const patient = await Patient.findById(bill.patient);
    if (patient) {
      patient.opdBills = patient.opdBills.filter(
        (billId) => billId.toString() !== req.params.id
      );
      await patient.save();
    }

    await bill.deleteOne();
    res.json({ message: "Bill removed" });
  } else {
    res.status(404);
    throw new Error("Bill not found");
  }
});

module.exports = {
  createOpdBill,
  getOpdBills,
  getOpdBillById,
  updateOpdBill,
  deleteOpdBill,
};
