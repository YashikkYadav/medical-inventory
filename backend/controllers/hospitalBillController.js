const HospitalBill = require("../models/HospitalBill");
const Service = require("../models/Service");
const asyncHandler = require("express-async-handler");

// @desc    Get all hospital bills
// @route   GET /api/hospital-bills
// @access  Public
const getHospitalBills = asyncHandler(async (req, res) => {
  const hospitalBills = await HospitalBill.find().populate("services.service");
  res.status(200).json(hospitalBills);
});

// @desc    Get single hospital bill
// @route   GET /api/hospital-bills/:id
// @access  Public
const getHospitalBill = asyncHandler(async (req, res) => {
  const hospitalBill = await HospitalBill.findById(req.params.id).populate(
    "services.service"
  );

  if (!hospitalBill) {
    res.status(404);
    throw new Error("Hospital bill not found");
  }

  res.status(200).json(hospitalBill);
});

// @desc    Create new hospital bill
// @route   POST /api/hospital-bills
// @access  Public
const createHospitalBill = asyncHandler(async (req, res) => {
  const {
    customerName,
    customerContact,
    patientAge,
    patientSex,
    patientAddress,
    consultantName,
    admitDate,
    dischargeDate,
    billDate,
    ipdNo,
    patientRegistration,
    receiptNo,
    services,
    discount = 0,
    tax = 0,
    amountInWords,
    paymentMode,
    remarks,
  } = req.body;

  // Validate required fields
  if (!customerName) {
    res.status(400);
    throw new Error("Customer name is required");
  }

  // Validate services
  if (!services || !Array.isArray(services) || services.length === 0) {
    res.status(400);
    throw new Error("At least one service is required");
  }

  // Validate each service and calculate totals
  let totalAmount = 0;
  for (const service of services) {
    if (!service.serviceName) {
      res.status(400);
      throw new Error("Service name is required for all services");
    }

    if (!service.rate || service.rate <= 0) {
      res.status(400);
      throw new Error("Valid rate is required for all services");
    }

    if (!service.quantity || service.quantity <= 0) {
      res.status(400);
      throw new Error("Valid quantity is required for all services");
    }

    // Calculate amount if not provided
    if (!service.amount) {
      service.amount = service.rate * service.quantity;
    }

    totalAmount += service.amount;
  }

  const grandTotal = totalAmount - discount + tax;

  const hospitalBill = new HospitalBill({
    customerName,
    customerContact,
    patientAge,
    patientSex,
    patientAddress,
    consultantName,
    admitDate,
    dischargeDate,
    billDate,
    ipdNo,
    patientRegistration,
    receiptNo,
    services,
    totalAmount,
    discount,
    tax,
    grandTotal,
    amountInWords,
    paymentMode,
    remarks,
  });

  const createdHospitalBill = await hospitalBill.save();

  // Add bill to patient record if patient ID exists
  if (req.body.patient) {
      const Patient = require("../models/Patient");
      const patient = await Patient.findById(req.body.patient);
      if (patient) {
          patient.hospitalBills.push(createdHospitalBill._id);
          await patient.save();
      }
  }

  // Populate service details before sending response
  const populatedHospitalBill = await HospitalBill.findById(
    createdHospitalBill._id
  ).populate("services.service");

  res.status(201).json(populatedHospitalBill);
});

// @desc    Update hospital bill
// @route   PUT /api/hospital-bills/:id
// @access  Public
const updateHospitalBill = asyncHandler(async (req, res) => {
  const {
    customerName,
    customerContact,
    patientAge,
    patientSex,
    patientAddress,
    consultantName,
    admitDate,
    dischargeDate,
    billDate,
    ipdNo,
    patientRegistration,
    receiptNo,
    services,
    discount,
    tax,
    amountInWords,
    paymentMode,
    remarks,
  } = req.body;

  const hospitalBill = await HospitalBill.findById(req.params.id);

  if (!hospitalBill) {
    res.status(404);
    throw new Error("Hospital bill not found");
  }

  // Recalculate totals if services are updated
  let totalAmount = hospitalBill.totalAmount;
  if (services && Array.isArray(services)) {
    totalAmount = 0;
    for (const service of services) {
      if (!service.amount && service.rate && service.quantity) {
        service.amount = service.rate * service.quantity;
      }
      totalAmount += service.amount || 0;
    }
  }

  const grandTotal =
    totalAmount -
    (discount !== undefined ? discount : hospitalBill.discount) +
    (tax !== undefined ? tax : hospitalBill.tax);

  hospitalBill.customerName = customerName || hospitalBill.customerName;
  hospitalBill.customerContact =
    customerContact || hospitalBill.customerContact;
  hospitalBill.patientAge =
    patientAge !== undefined ? patientAge : hospitalBill.patientAge;
  hospitalBill.patientSex =
    patientSex !== undefined ? patientSex : hospitalBill.patientSex;
  hospitalBill.patientAddress =
    patientAddress !== undefined ? patientAddress : hospitalBill.patientAddress;
  hospitalBill.consultantName =
    consultantName !== undefined ? consultantName : hospitalBill.consultantName;
  hospitalBill.admitDate = admitDate || hospitalBill.admitDate;
  hospitalBill.dischargeDate = dischargeDate || hospitalBill.dischargeDate;
  hospitalBill.billDate = billDate || hospitalBill.billDate;
  hospitalBill.ipdNo = ipdNo || hospitalBill.ipdNo;
  hospitalBill.patientRegistration =
    patientRegistration || hospitalBill.patientRegistration;
  hospitalBill.receiptNo = receiptNo || hospitalBill.receiptNo;
  hospitalBill.services = services || hospitalBill.services;
  hospitalBill.totalAmount = totalAmount;
  hospitalBill.discount =
    discount !== undefined ? discount : hospitalBill.discount;
  hospitalBill.tax = tax !== undefined ? tax : hospitalBill.tax;
  hospitalBill.grandTotal = grandTotal;
  hospitalBill.amountInWords = amountInWords || hospitalBill.amountInWords;
  hospitalBill.paymentMode = paymentMode || hospitalBill.paymentMode;
  hospitalBill.remarks = remarks !== undefined ? remarks : hospitalBill.remarks;

  const updatedHospitalBill = await hospitalBill.save();

  // Populate service details before sending response
  const populatedHospitalBill = await HospitalBill.findById(
    updatedHospitalBill._id
  ).populate("services.service");

  res.status(200).json(populatedHospitalBill);
});

// @desc    Delete hospital bill
// @route   DELETE /api/hospital-bills/:id
// @access  Public
const deleteHospitalBill = asyncHandler(async (req, res) => {
  const hospitalBill = await HospitalBill.findById(req.params.id);

  if (!hospitalBill) {
    res.status(404);
    throw new Error("Hospital bill not found");
  }

  await hospitalBill.deleteOne();
  res.status(200).json({ message: "Hospital bill removed" });
});

module.exports = {
  getHospitalBills,
  getHospitalBill,
  createHospitalBill,
  updateHospitalBill,
  deleteHospitalBill,
};
