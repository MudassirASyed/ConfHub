import axios from 'axios';


const BASE_API_URL = 'https://confhub-production-0226.up.railway.app/api/conference'; 

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
