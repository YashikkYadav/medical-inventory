import * as medicineApi from '../apis/medicineApi';
import * as invoiceApi from '../apis/invoiceApi';

// Medicine API calls
export const getMedicines = medicineApi.getMedicines;
export const getMedicine = medicineApi.getMedicine;
export const createMedicine = medicineApi.createMedicine;
export const updateMedicine = medicineApi.updateMedicine;
export const deleteMedicine = medicineApi.deleteMedicine;

// Invoice API calls
export const getInvoices = invoiceApi.getInvoices;
export const getInvoice = invoiceApi.getInvoice;
export const createInvoice = invoiceApi.createInvoice;
export const updateInvoice = invoiceApi.updateInvoice;
export const deleteInvoice = invoiceApi.deleteInvoice;