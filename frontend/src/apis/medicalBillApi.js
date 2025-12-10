import apiClient from "./apiClient";

// Get all medical bills
export const getMedicalBills = async () => {
  const response = await apiClient.get("/medical-bills");
  return response;
};

// Get single medical bill
export const getMedicalBill = async (id) => {
  const response = await apiClient.get(`/medical-bills/${id}`);
  return response;
};

// Create new medical bill
export const createMedicalBill = async (medicalBillData) => {
  const response = await apiClient.post("/medical-bills", medicalBillData);
  return response;
};

// Update medical bill
export const updateMedicalBill = async (id, medicalBillData) => {
  const response = await apiClient.put(`/medical-bills/${id}`, medicalBillData);
  return response;
};

// Delete medical bill
export const deleteMedicalBill = async (id) => {
  const response = await apiClient.delete(`/medical-bills/${id}`);
  return response;
};
