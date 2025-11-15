const Service = require('../models/Service');
const asyncHandler = require('express-async-handler');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = asyncHandler(async (req, res) => {
  const services = await Service.find();
  res.status(200).json(services);
});

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  res.status(200).json(service);
});

// @desc    Create new service
// @route   POST /api/services
// @access  Public
const createService = asyncHandler(async (req, res) => {
  const { name, description, price } = req.body;

  const service = new Service({
    name,
    description,
    price
  });

  const createdService = await service.save();
  res.status(201).json(createdService);
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Public
const updateService = asyncHandler(async (req, res) => {
  const { name, description, price } = req.body;

  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  service.name = name || service.name;
  service.description = description || service.description;
  service.price = price || service.price;

  const updatedService = await service.save();
  res.status(200).json(updatedService);
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Public
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  await service.deleteOne();
  res.status(200).json({ message: 'Service removed' });
});

module.exports = {
  getServices,
  getService,
  createService,
  updateService,
  deleteService
};