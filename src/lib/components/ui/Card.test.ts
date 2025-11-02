// ABOUTME: Unit tests for Card component
// ABOUTME: Tests padding variants and hover state

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Card from './Card.svelte';

describe('Card', () => {
	it('should render with default props', () => {
		const { container } = render(Card);
		const card = container.querySelector('div');
		expect(card).toBeTruthy();
		expect(card?.className).toContain('bg-white');
		expect(card?.className).toContain('rounded-xl');
		expect(card?.className).toContain('shadow-sm');
	});

	it('should apply padding classes', () => {
		const { container } = render(Card, { props: { padding: 'sm' } });
		const card = container.querySelector('div');
		expect(card?.className).toContain('p-4');
	});

	it('should apply hover classes when hover is true', () => {
		const { container } = render(Card, { props: { hover: true } });
		const card = container.querySelector('div');
		expect(card?.className).toContain('transition-shadow');
		expect(card?.className).toContain('hover:shadow-md');
	});

	it('should not apply hover classes when hover is false', () => {
		const { container } = render(Card, { props: { hover: false } });
		const card = container.querySelector('div');
		expect(card?.className).not.toContain('transition-shadow');
	});
});

