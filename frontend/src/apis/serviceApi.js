import apiClient from './apiClient';

// Get all services
export const getServices = async () => {
  const response = await apiClient.get('/services');
  return response;
};

// Get a single service by ID
export const getService = async (id) => {
  const response = await apiClient.get(`/services/${id}`);
  return response;
};

// Create a new service
export const createService = async (serviceData) => {
  const response = await apiClient.post('/services', serviceData);
  return response;
};

// Update a service by ID
export const updateService = async (id, serviceData) => {
  const response = await apiClient.put(`/services/${id}`, serviceData);
  return response;
};

// Delete a service by ID
export const deleteService = async (id) => {
  const response = await apiClient.delete(`/services/${id}`);
  return response;
};