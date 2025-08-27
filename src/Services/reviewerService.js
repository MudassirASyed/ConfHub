import axios from "axios";


const BASE_API_URL = "http://localhost:1337/api/reviewers"; 

export const registerReviewer = async (data) => {
    try {
      console.log('datta',data);
      
      const response = await axios.post(`${BASE_API_URL}/register`, data);
      return response.data; // Return the response data (e.g., success message, etc.)
    } catch (error) {
      console.error("Error registering reviewer", error);
      throw error; 
    }
  };
  export const loginReviewer = async (data) => {
    try {
      console.log('datta',data);
      
      const response = await axios.post(`${BASE_API_URL}/login`, data);
      return response.data; // Return the response data (e.g., success message, etc.)
    } catch (error) {
      console.error("Error login reviewer", error);
      throw error; // Handle error accordingly
    }
  };
  export const reviewRequest = async (data) => {
    try {
      console.log('datta',data);
      
      const response = await axios.post(`${BASE_API_URL}/reviewRequest`, data);
      return response.data; // Return the response data (e.g., success message, etc.)
    } catch (error) {
      console.error("Error sending review request", error);
      throw error; // Handle error accordingly
    }
  };
  export const submitReview = async (data) => {
    try {
      console.log('datta',data);
      
      const response = await axios.post(`${BASE_API_URL}/reviewSubmit`, data);
      return response.data; // Return the response data (e.g., success message, etc.)
    } catch (error) {
      console.error("Error sending review request", error);
      throw error; // Handle error accordingly
    }
  };