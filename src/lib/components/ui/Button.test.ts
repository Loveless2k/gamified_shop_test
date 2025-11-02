// ABOUTME: Unit tests for Button component
// ABOUTME: Tests variants, sizes, and disabled state

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Button from './Button.svelte';

describe('Button', () => {
	it('should render with default props', () => {
		const { container } = render(Button);
		const button = screen.getByRole('button');
		expect(button).toBeTruthy();
	});

	it('should apply primary variant classes', () => {
		render(Button, { props: { variant: 'primary' } });
		const button = screen.getByRole('button');
		expect(button.className).toContain('bg-black');
		expect(button.className).toContain('text-white');
	});

	it('should apply secondary variant classes', () => {
		render(Button, { props: { variant: 'secondary' } });
		const button = screen.getByRole('button');
		expect(button.className).toContain('bg-gray-200');
	});

	it('should apply ghost variant classes', () => {
		render(Button, { props: { variant: 'ghost' } });
		const button = screen.getByRole('button');
		expect(button.className).toContain('bg-transparent');
	});

	it('should apply size classes', () => {
		const { container } = render(Button, { props: { size: 'md' } });
		const button = screen.getByRole('button');
		expect(button.className).toContain('py-2');
	});

	it('should be disabled when disabled prop is true', () => {
		render(Button, { props: { disabled: true } });
		const button = screen.getByRole('button');
		expect(button).toHaveProperty('disabled', true);
		expect(button.className).toContain('opacity-50');
		expect(button.className).toContain('cursor-not-allowed');
	});

	it('should have correct button type', () => {
		render(Button, { props: { type: 'button' } });
		const button = screen.getByRole('button');
		expect(button).toHaveProperty('type', 'button');
	});
});

