<!-- ABOUTME: Cart icon with item count badge -->
<!-- ABOUTME: Displays number of items in cart -->

<script lang="ts">
	import Badge from '../ui/Badge.svelte';

	export let onClick: (() => void) | undefined = undefined;
	export let itemCount = 0;
</script>

<button
	class="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
	on:click={onClick}
	aria-label="Shopping cart"
>
	<!-- Cart SVG Icon -->
	<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
		/>
	</svg>

	<!-- Item count badge -->
	{#if itemCount > 0}
		<Badge
			variant="primary"
			class="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center"
		>
			{itemCount}
		</Badge>
	{/if}
</button>

