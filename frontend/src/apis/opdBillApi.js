import apiClient from "./apiClient";

export const createOpdBill = async (billData) => {
  return await apiClient.post("/opd-bills", billData);
};

export const getOpdBills = async () => {
  return await apiClient.get("/opd-bills");
};

export const getOpdBillById = async (id) => {
  return await apiClient.get(`/opd-bills/${id}`);
};

export const updateOpdBill = async (id, billData) => {
  return await apiClient.put(`/opd-bills/${id}`, billData);
};

export const deleteOpdBill = async (id) => {
  return await apiClient.delete(`/opd-bills/${id}`);
};
