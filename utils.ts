/**
 * Estimates the number of tokens in a text string.
 * Gemini rough estimate: ~4 characters per token.
 */
export const estimateTokens = (text: string): number => {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
};

/**
 * Calculates the cost of tokens based on Gemini Flash pricing.
 * Pricing: ~$0.075 per 1 million input tokens.
 */
export const calculateFlashCost = (tokens: number): number => {
  const PRICE_PER_MILLION = 0.075;
  return (tokens / 1_000_000) * PRICE_PER_MILLION;
};

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
