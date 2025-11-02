// ABOUTME: Unit tests for Header component
// ABOUTME: Tests header rendering and navigation

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Header from './Header.svelte';

describe('Header', () => {
	it('should render brand name', () => {
		render(Header);
		expect(screen.getByText('Gamified Shop')).toBeTruthy();
	});

	it('should render navigation links', () => {
		render(Header);
		expect(screen.getByText('Home')).toBeTruthy();
		expect(screen.getByText('Products (Coming Soon)')).toBeTruthy();
		expect(screen.getByText('About (Coming Soon)')).toBeTruthy();
	});

	it('should render cart icon', () => {
		render(Header);
		const cartButton = screen.getByRole('button', { name: 'Shopping cart' });
		expect(cartButton).toBeTruthy();
	});
});

