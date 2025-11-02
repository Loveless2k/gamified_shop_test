// ABOUTME: Unit tests for Badge component
// ABOUTME: Tests variant styles

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Badge from './Badge.svelte';

describe('Badge', () => {
	it('should render with default variant', () => {
		const { container } = render(Badge);
		const badge = container.querySelector('span');
		expect(badge).toBeTruthy();
		expect(badge?.className).toContain('bg-gray-100');
		expect(badge?.className).toContain('text-gray-800');
	});

	it('should apply variant classes', () => {
		const { container } = render(Badge, { props: { variant: 'primary' } });
		const badge = container.querySelector('span');
		expect(badge?.className).toContain('bg-black');
		expect(badge?.className).toContain('text-white');
	});

	it('should apply custom class', () => {
		const { container } = render(Badge, { props: { class: 'custom-class' } });
		const badge = container.querySelector('span');
		expect(badge?.className).toContain('custom-class');
	});
});

