<!-- ABOUTME: Responsive product grid component -->
<!-- ABOUTME: Displays products in 1 column (mobile) to 4 columns (desktop) -->

<script lang="ts">
	import ProductCard from './ProductCard.svelte';

	export let products: Array<{
		id: string;
		title: string;
		price: number;
		image: string;
		handle: string;
		inStock?: boolean;
		badge?: string | null;
	}> = [];

	export let onAddToCart: ((productId: string) => void) | undefined = undefined;
	export let loading = false;
</script>

<div class="w-full">
	{#if loading}
		<!-- Loading State -->
		<div class="flex items-center justify-center py-12">
			<div class="text-center">
				<div
					class="inline-block w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mb-4"
				/>
				<p class="text-gray-600">Loading products...</p>
			</div>
		</div>
	{:else if products.length === 0}
		<!-- Empty State -->
		<div class="flex items-center justify-center py-12">
			<div class="text-center">
				<svg
					class="w-16 h-16 mx-auto text-gray-400 mb-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
					/>
				</svg>
				<h3 class="text-xl font-semibold text-gray-800 mb-2">No products available</h3>
				<p class="text-gray-600">Check back soon for new items!</p>
			</div>
		</div>
	{:else}
		<!-- Product Grid -->
		<div
			class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
		>
			{#each products as product (product.id)}
				<ProductCard
					id={product.id}
					title={product.title}
					price={product.price}
					image={product.image}
					handle={product.handle}
					inStock={product.inStock ?? true}
					badge={product.badge ?? null}
					{onAddToCart}
				/>
			{/each}
		</div>
	{/if}
</div>

