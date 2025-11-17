const Invoice = require('../models/Invoice');
const Medicine = require('../models/Medicine');
const asyncHandler = require('express-async-handler');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Public
const getInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find().populate('items.medicine');
  res.status(200).json(invoices);
});

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Public
const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate('items.medicine');

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  res.status(200).json(invoice);
});

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Public
const createInvoice = asyncHandler(async (req, res) => {
  const { customerName, customerContact, patientAge, patientSex, patientAddress, consultantName, admitDate, dischargeDate, ipdNo, patientRegistration, items, discount = 0, tax = 0, billType = 'medical', amountInWords } = req.body;

  // Allow invoices without items for hospital bills
  let totalAmount = 0;
  
  // Only validate items if they exist
  if (items && items.length > 0) {
    // Validate each item and calculate total
    for (const item of items) {
      // If medicine is provided, validate it
      if (item.medicine) {
        const medicine = await Medicine.findById(item.medicine);
        
        if (!medicine) {
          res.status(404);
          throw new Error(`Medicine with ID ${item.medicine} not found`);
        }
        
        // Check if enough quantity is available
        if (medicine.quantity < item.quantity) {
          res.status(400);
          throw new Error(`Not enough quantity for ${medicine.name}. Available: ${medicine.quantity}, Requested: ${item.quantity}`);
        }
        
        // Update medicine quantity
        medicine.quantity -= item.quantity;
        await medicine.save();
      }
      
      totalAmount += (item.price || 0) * (item.quantity || 0);
    }
  }
  
  const grandTotal = totalAmount - discount + tax;

  const invoice = new Invoice({
    customerName,
    customerContact,
    patientAge,
    patientSex,
    patientAddress,
    consultantName,
    admitDate,
    dischargeDate,
    ipdNo,
    patientRegistration,
    billType,
    items: items || [],
    totalAmount,
    discount,
    tax,
    grandTotal,
    amountInWords
  });

  const createdInvoice = await invoice.save();
  
  // Populate medicine details before sending response (only if items exist)
  let populatedInvoice = createdInvoice;
  if (items && items.length > 0) {
    populatedInvoice = await Invoice.findById(createdInvoice._id).populate('items.medicine');
  }
  
  res.status(201).json(populatedInvoice);
});

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Public
const updateInvoice = asyncHandler(async (req, res) => {
  const { customerName, customerContact, patientAge, patientSex, patientAddress, consultantName, admitDate, dischargeDate, ipdNo, patientRegistration, items, discount, tax, billType, amountInWords } = req.body;

  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  // If items are being updated, we need to adjust medicine quantities
  if (items) {
    // First, restore the quantities of the original items (only if they had medicine)
    for (const originalItem of invoice.items) {
      if (originalItem.medicine) {
        const medicine = await Medicine.findById(originalItem.medicine);
        if (medicine) {
          medicine.quantity += originalItem.quantity;
          await medicine.save();
        }
      }
    }
    
    // Then, reduce quantities for the new items (only if they have medicine)
    let totalAmount = 0;
    if (items.length > 0) {
      for (const item of items) {
        // Only validate medicine if it's provided
        if (item.medicine) {
          const medicine = await Medicine.findById(item.medicine);
          
          if (!medicine) {
            res.status(404);
            throw new Error(`Medicine with ID ${item.medicine} not found`);
          }
          
          // Check if enough quantity is available
          if (medicine.quantity < item.quantity) {
            res.status(400);
            throw new Error(`Not enough quantity for ${medicine.name}. Available: ${medicine.quantity}, Requested: ${item.quantity}`);
          }
          
          // Update medicine quantity
          medicine.quantity -= item.quantity;
          await medicine.save();
        }
        
        totalAmount += (item.price || 0) * (item.quantity || 0);
      }
    }
    
    invoice.totalAmount = totalAmount;
    invoice.grandTotal = totalAmount - (discount !== undefined ? discount : invoice.discount) + (tax !== undefined ? tax : invoice.tax);
  } else {
    // Recalculate totals if only discount or tax were updated
    if (discount !== undefined || tax !== undefined) {
      let totalAmount = 0;
      
      for (const item of invoice.items) {
        totalAmount += (item.price || 0) * (item.quantity || 0);
      }
      
      invoice.totalAmount = totalAmount;
      invoice.grandTotal = totalAmount - (discount !== undefined ? discount : invoice.discount) + (tax !== undefined ? tax : invoice.tax);
    }
  }

  invoice.customerName = customerName || invoice.customerName;
  invoice.customerContact = customerContact || invoice.customerContact;
  invoice.patientAge = patientAge !== undefined ? patientAge : invoice.patientAge;
  invoice.patientSex = patientSex !== undefined ? patientSex : invoice.patientSex;
  invoice.patientAddress = patientAddress !== undefined ? patientAddress : invoice.patientAddress;
  invoice.consultantName = consultantName !== undefined ? consultantName : invoice.consultantName;
  invoice.admitDate = admitDate !== undefined ? admitDate : invoice.admitDate;
  invoice.dischargeDate = dischargeDate !== undefined ? dischargeDate : invoice.dischargeDate;
  invoice.ipdNo = ipdNo !== undefined ? ipdNo : invoice.ipdNo;
  invoice.patientRegistration = patientRegistration !== undefined ? patientRegistration : invoice.patientRegistration;
  invoice.billType = billType !== undefined ? billType : invoice.billType;
  invoice.items = items !== undefined ? items : invoice.items;
  invoice.discount = discount !== undefined ? discount : invoice.discount;
  invoice.tax = tax !== undefined ? tax : invoice.tax;
  invoice.amountInWords = amountInWords !== undefined ? amountInWords : invoice.amountInWords;

  const updatedInvoice = await invoice.save();
  
  // Populate medicine details before sending response (only if items exist and have medicine)
  let populatedInvoice = updatedInvoice;
  if (updatedInvoice.items && updatedInvoice.items.length > 0) {
    const hasMedicineItems = updatedInvoice.items.some(item => item.medicine);
    if (hasMedicineItems) {
      populatedInvoice = await Invoice.findById(updatedInvoice._id).populate('items.medicine');
    }
  }
  
  res.status(200).json(populatedInvoice);
});

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Public
const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  // Restore medicine quantities when deleting an invoice (only for items that have medicine)
  for (const item of invoice.items) {
    if (item.medicine) {
      const medicine = await Medicine.findById(item.medicine);
      if (medicine) {
        medicine.quantity += item.quantity;
        await medicine.save();
      }
    }
  }

  await invoice.remove();
  res.status(200).json({ message: 'Invoice removed' });
});

module.exports = {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice
};