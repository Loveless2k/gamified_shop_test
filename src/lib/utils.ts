// ABOUTME: Utility functions for the application
// ABOUTME: Contains helper functions used across the codebase

/**
 * Formats a price in cents to a currency string
 * @param cents - Price in cents
 * @returns Formatted price string (e.g., "$10.99")
 */
export function formatPrice(cents: number): string {
	return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Calculates the total price of items
 * @param items - Array of items with price and quantity
 * @returns Total price in cents
 */
export function calculateTotal(items: Array<{ price: number; quantity: number }>): number {
	return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

