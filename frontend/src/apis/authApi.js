import apiClient from './apiClient';

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/users/login', credentials);
    return response;
  } catch (error) {
    throw error;
  }
};

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/users', userData);
    return response;
  } catch (error) {
    throw error;
  }
};