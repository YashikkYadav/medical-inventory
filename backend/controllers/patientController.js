const asyncHandler = require("express-async-handler");
const Patient = require("../models/Patient");

// @desc    Create a new patient
// @route   POST /api/patients
// @access  Public
const createPatient = asyncHandler(async (req, res) => {
  const { name, age, phoneNumber, sex, address } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Please fill in patient name");
  }

  const patientId = "PAT" + Date.now();

  const patient = await Patient.create({
    name,
    age,
    phoneNumber,
    sex,
    address,
    patientId,
  });

  if (patient) {
    res.status(201).json(patient);
  } else {
    res.status(400);
    throw new Error("Invalid patient data");
  }
});

// @desc    Get all patients
// @route   GET /api/patients
// @access  Public
const getPatients = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.pageNumber) || 1;

  // Optional search by name or phone
  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: "i" } },
          { phoneNumber: { $regex: req.query.keyword, $options: "i" } },
          { patientId: { $regex: req.query.keyword, $options: "i" } },
        ],
      }
    : {};

  const count = await Patient.countDocuments({ ...keyword });
  const patients = await Patient.find({ ...keyword })
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .populate("hospitalBills")
    .populate("opdBills")
    .populate("ipdBills");

  res.json({ patients, page, pages: Math.ceil(count / pageSize), count });
});

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Public
const getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id)
    .populate("hospitalBills")
    .populate("opdBills")
    .populate("ipdBills");

  if (patient) {
    res.json(patient);
  } else {
    res.status(404);
    throw new Error("Patient not found");
  }
});

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Public
const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (patient) {
    patient.name = req.body.name || patient.name;
    patient.age = req.body.age || patient.age;
    patient.phoneNumber = req.body.phoneNumber || patient.phoneNumber;
    patient.sex = req.body.sex || patient.sex;
    patient.address = req.body.address || patient.address;

    const updatedPatient = await patient.save();
    res.json(updatedPatient);
  } else {
    res.status(404);
    throw new Error("Patient not found");
  }
});

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Public
const deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (patient) {
    const OpdBill = require("../models/OpdBill");
    const IpdBill = require("../models/IpdBill");
    const HospitalBill = require("../models/HospitalBill");

    // Delete all related bills
    await OpdBill.deleteMany({ patient: patient._id });
    await IpdBill.deleteMany({ patient: patient._id });
    await HospitalBill.deleteMany({ _id: { $in: patient.hospitalBills } }); // HospitalBill might use a different patient reference or we can use the array

    await patient.deleteOne();
    res.json({ message: "Patient and all related bills removed" });
  } else {
    res.status(404);
    throw new Error("Patient not found");
  }
});

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};
