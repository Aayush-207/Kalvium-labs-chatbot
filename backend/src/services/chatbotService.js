/**
 * Rule-based chatbot service
 * Handles simple message routing and response generation
 */

const chatbotResponses = {
  hi: 'Hello! How can I help you?',
  hello: 'Hello! How can I help you?',
  // Subscription
  price: 'Our pricing starts at $10/month',
  pricing: 'Our pricing starts at $10/month',
  help: 'How can I assist you today?',
  thanks: 'You are welcome! Feel free to ask anything else.',
  thank: 'You are welcome! Feel free to ask anything else.',

  default: 'I’m not sure I understood that. Could you rephrase or choose one of these topics: pricing, features, support?'
};

/**
 * Generate bot response based on user message
 * @param {string} userMessage - The message from user
 * @returns {string} Bot response
 */
export const generateBotResponse = (userMessage) => {
  if (!userMessage) {
    return "I'm not sure what you mean. Could you please rephrase?";
  }

  const normalizedMessage = userMessage.toLowerCase().trim();

  // Check for exact or partial matches
  for (const [keyword, response] of Object.entries(chatbotResponses)) {
    if (normalizedMessage.includes(keyword)) {
      return response;
    }
  }

  // Default response
  return "I'm not sure, but our team will contact you soon. Thank you for reaching out!";
};

/**
 * Check if message is valid (not empty, not too long)
 * @param {string} message - Message to validate
 * @returns {boolean}
 */
export const isValidMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return false;
  }

  const trimmed = message.trim();
  return trimmed.length > 0 && trimmed.length <= 1000;
};
