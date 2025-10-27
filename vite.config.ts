// ABOUTME: Vite configuration file for SvelteKit project
// ABOUTME: Configures build tool, plugins, and development server settings

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});

