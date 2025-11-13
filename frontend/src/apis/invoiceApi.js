import apiClient from './apiClient';

// Get all invoices
export const getInvoices = async () => {
  const response = await apiClient.get('/invoices');
  return response;
};

// Get a single invoice by ID
export const getInvoice = async (id) => {
  const response = await apiClient.get(`/invoices/${id}`);
  return response;
};

// Create a new invoice
export const createInvoice = async (invoiceData) => {
  const response = await apiClient.post('/invoices', invoiceData);
  return response;
};

// Update an invoice by ID
export const updateInvoice = async (id, invoiceData) => {
  const response = await apiClient.put(`/invoices/${id}`, invoiceData);
  return response;
};

// Delete an invoice by ID
export const deleteInvoice = async (id) => {
  const response = await apiClient.delete(`/invoices/${id}`);
  return response;
};