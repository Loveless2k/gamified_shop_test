// ABOUTME: Vitest configuration file for unit and integration tests
// ABOUTME: Configures test environment, coverage, and Svelte component testing

import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [svelte({ hot: !process.env.VITEST })],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom'
	},
	resolve: {
		alias: {
			$lib: '/src/lib',
			$components: '/src/lib/components',
			$features: '/src/lib/features',
			$services: '/src/lib/services'
		}
	}
});

