const Medicine = require('../models/Medicine');
const asyncHandler = require('express-async-handler');

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Public
const getMedicines = asyncHandler(async (req, res) => {
  const medicines = await Medicine.find();
  res.status(200).json(medicines);
});

// @desc    Get single medicine
// @route   GET /api/medicines/:id
// @access  Public
const getMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }

  res.status(200).json(medicine);
});

// @desc    Create new medicine
// @route   POST /api/medicines
// @access  Public
const createMedicine = asyncHandler(async (req, res) => {
  const { name, description, price, purchasePrice, quantity, expiryDate, manufacturer, batchNumber, schedule } = req.body;

  const medicine = new Medicine({
    name,
    description,
    price,
    purchasePrice,
    quantity,
    expiryDate,
    manufacturer,
    batchNumber,
    schedule
  });

  const createdMedicine = await medicine.save();
  res.status(201).json(createdMedicine);
});

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Public
const updateMedicine = asyncHandler(async (req, res) => {
  const { name, description, price, purchasePrice, quantity, expiryDate, manufacturer, batchNumber, schedule } = req.body;

  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }

  medicine.name = name || medicine.name;
  medicine.description = description || medicine.description;
  medicine.price = price || medicine.price;
  medicine.purchasePrice = purchasePrice || medicine.purchasePrice;
  medicine.quantity = quantity || medicine.quantity;
  medicine.expiryDate = expiryDate || medicine.expiryDate;
  medicine.manufacturer = manufacturer || medicine.manufacturer;
  medicine.batchNumber = batchNumber || medicine.batchNumber;
  medicine.schedule = schedule || medicine.schedule;

  const updatedMedicine = await medicine.save();
  res.status(200).json(updatedMedicine);
});

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Public
const deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }

  await medicine.deleteOne();
  res.status(200).json({ message: 'Medicine removed' });
});

module.exports = {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine
};