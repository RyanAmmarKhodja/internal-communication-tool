import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Add interceptor
api.interceptors.response.use(
  (response) => response, // for successful responses
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Token expired or unauthorized, logging out...");
      //logoutUser(); // custom logout function (defined below)
    }
    return Promise.reject(error);
  }
);

export default api;
// Custom logout function to clear user data and redirect to login
const logoutUser = () => {
  localStorage.removeItem("token");
  delete api.defaults.headers.common["Authorization"];
  window.location.href = "/login"; // Redirect to login page
};