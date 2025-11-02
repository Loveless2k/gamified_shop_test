// ABOUTME: Unit tests for CartIcon component
// ABOUTME: Tests icon rendering and item count badge

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import CartIcon from './CartIcon.svelte';

describe('CartIcon', () => {
	it('should render cart icon', () => {
		render(CartIcon);
		const button = screen.getByRole('button', { name: 'Shopping cart' });
		expect(button).toBeTruthy();
	});

	it('should not show badge when itemCount is 0', () => {
		const { container } = render(CartIcon, { props: { itemCount: 0 } });
		const badge = container.querySelector('.absolute');
		expect(badge).toBeFalsy();
	});

	it('should show badge when itemCount > 0', () => {
		render(CartIcon, { props: { itemCount: 3 } });
		expect(screen.getByText('3')).toBeTruthy();
	});

	it('should call onClick when clicked', async () => {
		const onClick = vi.fn();
		render(CartIcon, { props: { onClick } });
		
		const button = screen.getByRole('button');
		await fireEvent.click(button);
		
		expect(onClick).toHaveBeenCalled();
	});
});

