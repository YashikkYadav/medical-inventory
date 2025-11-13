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
  const { customerName, customerContact, items, discount = 0, tax = 0 } = req.body;

  // Validate items
  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('At least one item is required');
  }

  // Calculate totals
  let totalAmount = 0;
  
  // Validate each item and calculate total
  for (const item of items) {
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
    
    totalAmount += item.price * item.quantity;
  }
  
  const grandTotal = totalAmount - discount + tax;

  const invoice = new Invoice({
    customerName,
    customerContact,
    items,
    totalAmount,
    discount,
    tax,
    grandTotal
  });

  const createdInvoice = await invoice.save();
  
  // Populate medicine details before sending response
  const populatedInvoice = await Invoice.findById(createdInvoice._id).populate('items.medicine');
  
  res.status(201).json(populatedInvoice);
});

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Public
const updateInvoice = asyncHandler(async (req, res) => {
  const { customerName, customerContact, items, discount, tax } = req.body;

  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  // If items are being updated, we need to adjust medicine quantities
  if (items) {
    // First, restore the quantities of the original items
    for (const originalItem of invoice.items) {
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
        throw new Error(`Not enough quantity for ${medicine.name}. Available: ${medicine.quantity}, Requested: ${item.quantity}`);
      }
      
      // Update medicine quantity
      medicine.quantity -= item.quantity;
      await medicine.save();
      
      totalAmount += item.price * item.quantity;
    }
    
    invoice.totalAmount = totalAmount;
    invoice.grandTotal = totalAmount - (discount !== undefined ? discount : invoice.discount) + (tax !== undefined ? tax : invoice.tax);
  } else {
    // Recalculate totals if only discount or tax were updated
    if (discount !== undefined || tax !== undefined) {
      let totalAmount = 0;
      
      for (const item of invoice.items) {
        totalAmount += item.price * item.quantity;
      }
      
      invoice.totalAmount = totalAmount;
      invoice.grandTotal = totalAmount - (discount !== undefined ? discount : invoice.discount) + (tax !== undefined ? tax : invoice.tax);
    }
  }

  invoice.customerName = customerName || invoice.customerName;
  invoice.customerContact = customerContact || invoice.customerContact;
  invoice.items = items || invoice.items;
  invoice.discount = discount !== undefined ? discount : invoice.discount;
  invoice.tax = tax !== undefined ? tax : invoice.tax;

  const updatedInvoice = await invoice.save();
  
  // Populate medicine details before sending response
  const populatedInvoice = await Invoice.findById(updatedInvoice._id).populate('items.medicine');
  
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

  // Restore medicine quantities when deleting an invoice
  for (const item of invoice.items) {
    const medicine = await Medicine.findById(item.medicine);
    if (medicine) {
      medicine.quantity += item.quantity;
      await medicine.save();
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