import apiClient from "./apiClient";

// Get all hospital bills
export const getHospitalBills = async () => {
  const response = await apiClient.get("/hospital-bills");
  return response;
};

// Get a single hospital bill by ID
export const getHospitalBill = async (id) => {
  const response = await apiClient.get(`/hospital-bills/${id}`);
  return response;
};

// Create a new hospital bill
export const createHospitalBill = async (hospitalBillData) => {
  const response = await apiClient.post("/hospital-bills", hospitalBillData);
  return response;
};

// Update a hospital bill by ID
export const updateHospitalBill = async (id, hospitalBillData) => {
  const response = await apiClient.put(
    `/hospital-bills/${id}`,
    hospitalBillData
  );
  return response;
};

// Delete a hospital bill by ID
export const deleteHospitalBill = async (id) => {
  const response = await apiClient.delete(`/hospital-bills/${id}`);
  return response;
};
