import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const messageApi = {
  getHistory: async (contactId: string, token: string) => {
    const response = await axios.get(`${API_URL}/messages/${contactId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.messages;
  },

  sendMessageHTTP: async (receiverId: string, content: string, token: string) => {
    const response = await axios.post(`${API_URL}/messages`, 
      { receiverId, content },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data.message;
  }
};
