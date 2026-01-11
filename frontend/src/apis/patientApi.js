import apiClient from "./apiClient";

export const createPatient = async (patientData) => {
  return await apiClient.post("/patients", patientData);
};

export const getPatients = async (keyword = "", pageNumber = 1) => {
  return await apiClient.get(`/patients?keyword=${keyword}&pageNumber=${pageNumber}`);
};

export const getPatientById = async (id) => {
  return await apiClient.get(`/patients/${id}`);
};

export const updatePatient = async (id, patientData) => {
  return await apiClient.put(`/patients/${id}`, patientData);
};

export const deletePatient = async (id) => {
  return await apiClient.delete(`/patients/${id}`);
};
