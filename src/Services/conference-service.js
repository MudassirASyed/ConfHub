import axios from 'axios';

const BASE_API_URL = 'http://localhost:1337/api/conference'; // Adjust based on your backend endpoint

export const createConference = async (data) => {
    try {
        console.log('datta',data);
        
        const response = await axios.post(`${BASE_API_URL}/create-conference`, data);
        return response.data; // Return the response data (e.g., success message, etc.)
      } catch (error) {
        console.error("Error creating conference", error);
        throw error; // Handle error accordingly
      }
    
};
