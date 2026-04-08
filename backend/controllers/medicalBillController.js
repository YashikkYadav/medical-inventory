const MedicalBill = require("../models/MedicalBill");
const Medicine = require("../models/Medicine");
const asyncHandler = require("express-async-handler");

// @desc    Get all medical bills
// @route   GET /api/medical-bills
// @access  Public
const getMedicalBills = asyncHandler(async (req, res) => {
  const medicalBills = await MedicalBill.find().populate("items.medicine");
  res.status(200).json(medicalBills);
});

// @desc    Get single medical bill
// @route   GET /api/medical-bills/:id
// @access  Public
const getMedicalBill = asyncHandler(async (req, res) => {
  const medicalBill = await MedicalBill.findById(req.params.id).populate(
    "items.medicine"
  );

  if (!medicalBill) {
    res.status(404);
    throw new Error("Medical bill not found");
  }

  res.status(200).json(medicalBill);
});

// @desc    Create new medical bill
// @route   POST /api/medical-bills
// @access  Public
const createMedicalBill = asyncHandler(async (req, res) => {
  const {
    customerName,
    customerContact,
    doctorName,
    patientAge,
    patientSex,
    patientAddress,
    dlNo,
    gstin,
    items,
    discount = 0,
    tax = 0,
    amountInWords,
    paymentMode = "Cash",
    paymentDate = Date.now(),
  } = req.body;

  // Validate items and calculate total
  let totalAmount = 0;

  for (const item of items) {
    const medicine = await Medicine.findById(item.medicine);

    if (!medicine) {
      res.status(404);
      throw new Error(`Medicine with ID ${item.medicine} not found`);
    }

    // Check if enough quantity is available
    if (medicine.quantity < item.quantity) {
      res.status(400);
      throw new Error(
        `Not enough quantity for ${medicine.name}. Available: ${medicine.quantity}, Requested: ${item.quantity}`
      );
    }

    // Update medicine quantity
    medicine.quantity -= item.quantity;
    await medicine.save();

    // Calculate total using the medicine price from database
    totalAmount += medicine.price * item.quantity;
  }

  const grandTotal = totalAmount - discount + tax;

  const medicalBill = new MedicalBill({
    customerName,
    customerContact,
    doctorName,
    patientAge,
    patientSex,
    patientAddress,
    dlNo,
    gstin,
    items,
    totalAmount,
    discount,
    tax,
    grandTotal,
    amountInWords,
    paymentMode,
    paymentDate,
  });

  const createdMedicalBill = await medicalBill.save();

  // Populate medicine details before sending response
  const populatedMedicalBill = await MedicalBill.findById(
    createdMedicalBill._id
  ).populate("items.medicine");

  res.status(201).json(populatedMedicalBill);
});

// @desc    Update medical bill
// @route   PUT /api/medical-bills/:id
// @access  Public
const updateMedicalBill = asyncHandler(async (req, res) => {
  const {
    customerName,
    customerContact,
    doctorName,
    patientAge,
    patientSex,
    patientAddress,
    dlNo,
    gstin,
    items,
    discount,
    tax,
    amountInWords,
    paymentMode,
    paymentDate,
  } = req.body;

  const medicalBill = await MedicalBill.findById(req.params.id);

  if (!medicalBill) {
    res.status(404);
    throw new Error("Medical bill not found");
  }

  // If items are being updated, we need to adjust medicine quantities
  if (items) {
    // First, restore the quantities of the original items
    for (const originalItem of medicalBill.items) {
      const medicine = await Medicine.findById(originalItem.medicine);
      if (medicine) {
        medicine.quantity += originalItem.quantity;
        await medicine.save();
      }
    }

    // Then, reduce quantities for the new items
    let totalAmount = 0;
    for (const item of items) {
      const medicine = await Medicine.findById(item.medicine);

      if (!medicine) {
        res.status(404);
        throw new Error(`Medicine with ID ${item.medicine} not found`);
      }

      // Check if enough quantity is available
      if (medicine.quantity < item.quantity) {
        res.status(400);
        throw new Error(
          `Not enough quantity for ${medicine.name}. Available: ${medicine.quantity}, Requested: ${item.quantity}`
        );
      }

      // Update medicine quantity
      medicine.quantity -= item.quantity;
      await medicine.save();

      // Calculate total using the medicine price from database
      totalAmount += medicine.price * item.quantity;
    }

    medicalBill.totalAmount = totalAmount;
    medicalBill.grandTotal =
      totalAmount -
      (discount !== undefined ? discount : medicalBill.discount) +
      (tax !== undefined ? tax : medicalBill.tax);
  } else {
    // Recalculate totals if only discount or tax were updated
    if (discount !== undefined || tax !== undefined) {
      let totalAmount = 0;

      for (const item of medicalBill.items) {
        const medicine = await Medicine.findById(item.medicine);
        if (medicine) {
          totalAmount += medicine.price * item.quantity;
        }
      }

      medicalBill.totalAmount = totalAmount;
      medicalBill.grandTotal =
        totalAmount -
        (discount !== undefined ? discount : medicalBill.discount) +
        (tax !== undefined ? tax : medicalBill.tax);
    }
  }

  medicalBill.customerName = customerName || medicalBill.customerName;
  medicalBill.customerContact = customerContact || medicalBill.customerContact;
  medicalBill.doctorName = doctorName !== undefined ? doctorName : medicalBill.doctorName;
  medicalBill.patientAge =
    patientAge !== undefined ? patientAge : medicalBill.patientAge;
  medicalBill.patientSex =
    patientSex !== undefined ? patientSex : medicalBill.patientSex;
  medicalBill.patientAddress =
    patientAddress !== undefined ? patientAddress : medicalBill.patientAddress;
  medicalBill.dlNo = dlNo !== undefined ? dlNo : medicalBill.dlNo;
  medicalBill.gstin = gstin !== undefined ? gstin : medicalBill.gstin;
  medicalBill.items = items !== undefined ? items : medicalBill.items;
  medicalBill.discount =
    discount !== undefined ? discount : medicalBill.discount;
  medicalBill.tax = tax !== undefined ? tax : medicalBill.tax;
  medicalBill.amountInWords =
    amountInWords !== undefined ? amountInWords : medicalBill.amountInWords;
  medicalBill.paymentMode =
    paymentMode !== undefined ? paymentMode : medicalBill.paymentMode;
  medicalBill.paymentDate =
    paymentDate !== undefined ? paymentDate : medicalBill.paymentDate;

  const updatedMedicalBill = await medicalBill.save();

  // Populate medicine details before sending response
  const populatedMedicalBill = await MedicalBill.findById(
    updatedMedicalBill._id
  ).populate("items.medicine");

  res.status(200).json(populatedMedicalBill);
});

// @desc    Delete medical bill
// @route   DELETE /api/medical-bills/:id
// @access  Public
const deleteMedicalBill = asyncHandler(async (req, res) => {
  const medicalBill = await MedicalBill.findById(req.params.id);

  if (!medicalBill) {
    res.status(404);
    throw new Error("Medical bill not found");
  }

  // Restore medicine quantities when deleting a medical bill
  for (const item of medicalBill.items) {
    const medicine = await Medicine.findById(item.medicine);
    if (medicine) {
      medicine.quantity += item.quantity;
      await medicine.save();
    }
  }

  await medicalBill.remove();
  res.status(200).json({ message: "Medical bill removed" });
});

module.exports = {
  getMedicalBills,
  getMedicalBill,
  createMedicalBill,
  updateMedicalBill,
  deleteMedicalBill,
};
