// ABOUTME: SvelteKit configuration file with SSG adapter and path aliases
// ABOUTME: Configures static site generation and module resolution for the project

import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-static configuration for SSG
		adapter: adapter({
			// default options are fine for now
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true
		}),

		// Path aliases for clean imports
		alias: {
			$lib: './src/lib',
			$components: './src/lib/components',
			$features: './src/lib/features',
			$services: './src/lib/services'
		}
	}
};

export default config;

