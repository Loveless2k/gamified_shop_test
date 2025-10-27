// ABOUTME: Unit tests for utility functions
// ABOUTME: Tests price formatting and calculation functions

import { describe, it, expect } from 'vitest';
import { formatPrice, calculateTotal } from './utils';

describe('formatPrice', () => {
	it('should format cents to dollar string', () => {
		expect(formatPrice(1099)).toBe('$10.99');
		expect(formatPrice(500)).toBe('$5.00');
		expect(formatPrice(0)).toBe('$0.00');
	});

	it('should handle large amounts', () => {
		expect(formatPrice(999999)).toBe('$9999.99');
	});
});

describe('calculateTotal', () => {
	it('should calculate total for single item', () => {
		const items = [{ price: 1000, quantity: 2 }];
		expect(calculateTotal(items)).toBe(2000);
	});

	it('should calculate total for multiple items', () => {
		const items = [
			{ price: 1000, quantity: 2 },
			{ price: 500, quantity: 3 }
		];
		expect(calculateTotal(items)).toBe(3500);
	});

	it('should return 0 for empty array', () => {
		expect(calculateTotal([])).toBe(0);
	});
});

