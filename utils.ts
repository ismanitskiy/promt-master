/**
 * Estimates the number of tokens in a text string.
 * Gemini rough estimate: ~4 characters per token.
 */
export const estimateTokens = (text: string): number => {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
};

export const PRICING = {
  'gemini-flash': 0.075, // per 1M tokens
  'gemini-thinking': 0.50, // estimated, per 1M tokens
  'gemini-nano': 0.00, // on-device, free
};

export const calculateCost = (tokens: number, model: keyof typeof PRICING = 'gemini-flash'): number => {
  const pricePerMillion = PRICING[model];
  return (tokens / 1_000_000) * pricePerMillion;
};

export const calculateFlashCost = (tokens: number) => calculateCost(tokens, 'gemini-flash');

export const formatCost = (cost: number): string => {
  if (cost === 0) return '$0.00';
  if (cost < 0.000001) return '< $0.000001';
  return `$${cost.toFixed(6)}`;
};

/**
 * Generates a unique ID.
 * Uses a fallback if crypto.randomUUID is not available (e.g. in insecure contexts like HTTP IP).
 */
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};
