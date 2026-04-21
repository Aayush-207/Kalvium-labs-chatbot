import api from './api';

/**
 * Send message to chatbot
 */
export const sendMessage = async (text) => {
  const response = await api.post('/chat/send', { text });
  return response.data;
};

/**
 * Get chat history
 */
export const getChatHistory = async (limit = 50, skip = 0) => {
  const response = await api.get('/chat/history', {
    params: { limit, skip },
  });
  return response.data;
};

/**
 * Get single message
 */
export const getMessage = async (messageId) => {
  const response = await api.get(`/chat/message/${messageId}`);
  return response.data;
};
