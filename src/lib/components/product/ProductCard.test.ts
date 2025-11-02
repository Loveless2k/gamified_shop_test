// ABOUTME: Unit tests for ProductCard component
// ABOUTME: Tests product display and add to cart functionality

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ProductCard from './ProductCard.svelte';

describe('ProductCard', () => {
	const mockProduct = {
		id: '1',
		title: 'Test Product',
		price: 2999, // $29.99
		image: 'https://example.com/image.jpg',
		handle: 'test-product'
	};

	it('should render product information', () => {
		render(ProductCard, { props: mockProduct });
		expect(screen.getByText('Test Product')).toBeTruthy();
		expect(screen.getByText('$29.99')).toBeTruthy();
		expect(screen.getByAltText('Test Product')).toBeTruthy();
	});

	it('should display badge when provided', () => {
		render(ProductCard, { props: { ...mockProduct, badge: 'New' } });
		expect(screen.getByText('New')).toBeTruthy();
	});

	it('should show "Add to Cart" button when in stock', () => {
		render(ProductCard, { props: { ...mockProduct, inStock: true } });
		const button = screen.getByRole('button');
		expect(button.textContent).toBe('Add to Cart');
		expect(button).not.toHaveProperty('disabled', true);
	});

	it('should show "Out of Stock" when not in stock', () => {
		render(ProductCard, { props: { ...mockProduct, inStock: false } });
		const button = screen.getByRole('button');
		expect(button.textContent).toBe('Out of Stock');
		expect(button).toHaveProperty('disabled', true);
		const outOfStockElements = screen.getAllByText('Out of Stock');
		expect(outOfStockElements.length).toBeGreaterThan(0);
	});

	it('should call onAddToCart when button is clicked', async () => {
		const onAddToCart = vi.fn();
		render(ProductCard, { props: { ...mockProduct, onAddToCart } });
		
		const button = screen.getByRole('button');
		await fireEvent.click(button);
		
		expect(onAddToCart).toHaveBeenCalledWith('1');
	});

	it('should not call onAddToCart when out of stock', async () => {
		const onAddToCart = vi.fn();
		render(ProductCard, { props: { ...mockProduct, inStock: false, onAddToCart } });
		
		const button = screen.getByRole('button');
		await fireEvent.click(button);
		
		expect(onAddToCart).not.toHaveBeenCalled();
	});
});

