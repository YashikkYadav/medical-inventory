import apiClient from './apiClient';

// Get all medicines
export const getMedicines = async () => {
  const response = await apiClient.get('/medicines');
  return response;
};

// Get a single medicine by ID
export const getMedicine = async (id) => {
  const response = await apiClient.get(`/medicines/${id}`);
  return response;
};

// Create a new medicine
export const createMedicine = async (medicineData) => {
  const response = await apiClient.post('/medicines', medicineData);
  return response;
};

// Update a medicine by ID
export const updateMedicine = async (id, medicineData) => {
  const response = await apiClient.put(`/medicines/${id}`, medicineData);
  return response;
};

// Delete a medicine by ID
export const deleteMedicine = async (id) => {
  const response = await apiClient.delete(`/medicines/${id}`);
  return response;
};