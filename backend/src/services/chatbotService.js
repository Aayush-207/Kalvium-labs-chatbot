/**
 * Rule-based chatbot service
 * Handles simple message routing and response generation
 */

const chatbotResponses = {
  hi: 'Hello! How can I help you?',
  hello: 'Hello! How can I help you?',
  hey: 'Hello! How can I help you?',
  

  // Human Support (VERY IMPORTANT)
  human: 'I can connect you to a human support agent. Please wait while I transfer your request.',
  agent: 'Let me connect you to a support specialist. Please hold on.',
  support: 'Our support team is available 24/7. Would you like me to connect you?',

  // Billing & Refunds
  refund: 'You can request a refund within 30 days of purchase. Please contact our support team for assistance.',
  billing: 'For billing inquiries, please visit your account settings or contact our support team.',
  invoice: 'You can view and download your invoices from your account dashboard.',
  payment: 'We accept all major credit cards and PayPal for payments.',

  // Subscription
  price: 'Our pricing starts at $10/month',
  pricing: 'Our pricing starts at $10/month',
  subscription: 'Our subscription plans start at $10/month',
  cancel: 'You can cancel your subscription anytime from your account settings.',
  upgrade: 'You can upgrade your plan anytime to unlock more features.',
  downgrade: 'Downgrades are supported and will reflect in your next billing cycle.',

  // Demo / Sales
  demo: 'We can schedule a demo for you. Please share your preferred time.',
  trial: 'We offer a free trial for 7 days. Would you like to start now?',

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
