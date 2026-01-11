import apiClient from "./apiClient";

export const createIpdBill = async (billData) => {
  return await apiClient.post("/ipd-bills", billData);
};

export const getIpdBills = async () => {
  return await apiClient.get("/ipd-bills");
};

export const getIpdBillById = async (id) => {
  return await apiClient.get(`/ipd-bills/${id}`);
};

export const updateIpdBill = async (id, billData) => {
  return await apiClient.put(`/ipd-bills/${id}`, billData);
};

export const deleteIpdBill = async (id) => {
  return await apiClient.delete(`/ipd-bills/${id}`);
};
