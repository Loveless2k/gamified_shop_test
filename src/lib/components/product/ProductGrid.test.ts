// ABOUTME: Unit tests for ProductGrid component
// ABOUTME: Tests grid rendering, loading, and empty states

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ProductGrid from './ProductGrid.svelte';

describe('ProductGrid', () => {
	const mockProducts = [
		{
			id: '1',
			title: 'Product 1',
			price: 1999,
			image: 'https://example.com/1.jpg',
			handle: 'product-1'
		},
		{
			id: '2',
			title: 'Product 2',
			price: 2999,
			image: 'https://example.com/2.jpg',
			handle: 'product-2'
		}
	];

	it('should render products in grid', () => {
		render(ProductGrid, { props: { products: mockProducts } });
		expect(screen.getByText('Product 1')).toBeTruthy();
		expect(screen.getByText('Product 2')).toBeTruthy();
	});

	it('should show loading state', () => {
		render(ProductGrid, { props: { products: [], loading: true } });
		expect(screen.getByText('Loading products...')).toBeTruthy();
	});

	it('should show empty state when no products', () => {
		render(ProductGrid, { props: { products: [], loading: false } });
		expect(screen.getByText('No products available')).toBeTruthy();
		expect(screen.getByText('Check back soon for new items!')).toBeTruthy();
	});

	it('should not show loading or empty state when products exist', () => {
		render(ProductGrid, { props: { products: mockProducts, loading: false } });
		expect(screen.queryByText('Loading products...')).toBeFalsy();
		expect(screen.queryByText('No products available')).toBeFalsy();
	});
});

