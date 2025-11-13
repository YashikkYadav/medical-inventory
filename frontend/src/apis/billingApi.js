import apiClient from './apiClient';
import { getMedicines } from './medicineApi';

// Get all medicines for billing (re-export)
export const getBillingMedicines = getMedicines;