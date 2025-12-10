// API exports
export { default as apiClient } from "./apiClient";
export * from "./authApi";
export * from "./medicineApi";
export * from "./invoiceApi";
export * from "./billingApi";
export * from "./serviceApi";
export * from "./hospitalBillApi"; // Added hospital bill API

// Re-export getMedicines for convenience
export { getMedicines } from "./medicineApi";
