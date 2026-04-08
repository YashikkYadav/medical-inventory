const asyncHandler = require("express-async-handler");
const IpdBill = require("../models/IpdBill");
const Patient = require("../models/Patient");

// @desc    Create new IPD Bill
// @route   POST /api/ipd-bills
// @access  Public
const createIpdBill = asyncHandler(async (req, res) => {
  const { 
      patientId, 
      ipdNo,
      consultantName, 
      billDate,
      particulars,
      totalAmount, 
      paymentMode, 
      remarks 
  } = req.body;

  if (!patientId || !particulars || particulars.length === 0) {
    res.status(400);
    throw new Error("Patient ID and particulars are required");
  }

  const finalIpdNo = ipdNo || ("IPD" + Date.now());

  const bill = await IpdBill.create({
    patient: patientId,
    ipdNo: finalIpdNo,
    consultantName,
    billDate,
    particulars,
    totalAmount,
    paymentMode,
    remarks,
  });

  if (bill) {
      // Add bill to patient record
    const patient = await Patient.findById(patientId);
    if(patient){
        patient.ipdBills.push(bill._id);
        await patient.save();
    }
    res.status(201).json(bill);
  } else {
    res.status(400);
    throw new Error("Invalid bill data");
  }
});

// @desc    Get all IPD Bills
// @route   GET /api/ipd-bills
// @access  Public
const getIpdBills = asyncHandler(async (req, res) => {
  const bills = await IpdBill.find({}).sort({ createdAt: -1 }).populate("patient", "name patientId age sex phoneNumber address");
  res.json(bills);
});

// @desc    Get IPD Bill by ID
// @route   GET /api/ipd-bills/:id
// @access  Public
const getIpdBillById = asyncHandler(async (req, res) => {
  const bill = await IpdBill.findById(req.params.id).populate("patient");

  if (bill) {
    res.json(bill);
  } else {
    res.status(404);
    throw new Error("Bill not found");
  }
});

// @desc    Update IPD Bill
// @route   PUT /api/ipd-bills/:id
// @access  Private
const updateIpdBill = asyncHandler(async (req, res) => {
  const { ipdNo, consultantName, billDate, particulars, totalAmount, paymentMode, remarks } = req.body;

  const bill = await IpdBill.findById(req.params.id);

  if (bill) {
    bill.ipdNo = ipdNo || bill.ipdNo;
    bill.consultantName = consultantName || bill.consultantName;
    bill.billDate = billDate || bill.billDate;
    bill.particulars = particulars || bill.particulars;
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

// @desc    Delete IPD Bill
// @route   DELETE /api/ipd-bills/:id
// @access  Private
const deleteIpdBill = asyncHandler(async (req, res) => {
  const bill = await IpdBill.findById(req.params.id);

  if (bill) {
    // Remove reference from patient
    const patient = await Patient.findById(bill.patient);
    if (patient) {
      patient.ipdBills = patient.ipdBills.filter(
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
  createIpdBill,
  getIpdBills,
  getIpdBillById,
  updateIpdBill,
  deleteIpdBill,
};
