// Function to get the authentication token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Function to check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

// Function to set the authentication token
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Function to remove the authentication token
export const removeToken = () => {
  localStorage.removeItem('token');
};