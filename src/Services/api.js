// src/services/api.js
import axios from "axios";

// Set your correct backend URL here

const BASE_API_URL = "https://bzchair.org/api/organizers";  


// POST request to register an organizer
export const registerOrganizer = async (data) => {
  try {
    console.log('datta',data);
    
    const response = await axios.post(`${BASE_API_URL}/register`, data);
    return response.data; // Return the response data (e.g., success message, etc.)
  } catch (error) {
    console.error("Error registering organizer", error);
    throw error; // Handle error accordingly
  }
};
export const loginOrganizer = async (data) => {
  try {
    console.log('datta',data);
    
    const response = await axios.post(`${BASE_API_URL}/login`, data);
    return response.data; // Return the response data (e.g., success message, etc.)
  } catch (error) {
    console.error("Error login organizer", error);
    throw error; // Handle error accordingly
  }
};
export const loginAdmin = async (data) => {
  try {
    console.log('datta',data);
    
    const response = await axios.post(`${BASE_API_URL}/Adminlogin`, data);
    return response.data; // Return the response data (e.g., success message, etc.)
  } catch (error) {
    console.error("Error login admin", error);
    throw error; // Handle error accordingly
  }
};
export const sendOtp = async (email) => {
  try {
    const response = await axios.post(`${BASE_API_URL}/send-otp`, { email });
    return response.data; // Return success message or data
  } catch (error) {
    console.error("Error sending OTP", error);
    throw error; // Re-throw to handle in UI
  }
};

export const verifyOtp = async ({ email, otp }) => {
  const response = await axios.post(`${BASE_API_URL}/verify-otp`, { email, otp });
  return response.data;
};

export const resetPassword = async ({ email, newPassword }) => {
  const response = await axios.post(`${BASE_API_URL}/reset-password`, {
    email,
    newPassword,
  });
  return response.data;
};


export const confirmReviewRequest = async (data) => {
  try {
    console.log('datta',data);
    
    const response = await axios.post(`${BASE_API_URL}/ConfirmReviewRequest`, data);
    return response.data; // Return the response data (e.g., success message, etc.)
  } catch (error) {
    console.error("Error confirming review ", error);
    throw error; // Handle error accordingly
  }
};
export const rejectReviewRequest = async (data) => {
  try {
    console.log('datta',data);
    
    const response = await axios.post(`${BASE_API_URL}/RejectReviewRequest`, data);
    return response.data; // Return the response data (e.g., success message, etc.)
  } catch (error) {
    console.error("Error rejecting review ", error);
    throw error; // Handle error accordingly
  }
};

export const assignSubOrganizerRole = async (data) => {
  try {
    console.log('datta',data);
    
    const response = await axios.post(`${BASE_API_URL}/AssignRole`, data);
    return response.data; 
  } catch (error) {
    console.error("Error assigning role ", error);
    throw error; // Handle error accordingly
  }
};

export const changePassword = async (data) => {
 try {
    console.log('datta',data);
    
    const response = await axios.post(`${BASE_API_URL}/update-password`, data);
    return response.data; 
  } catch (error) {
    console.error("Error changing password  ", error);
    throw error; // Handle error accordingly
  }
};