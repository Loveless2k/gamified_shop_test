<!-- ABOUTME: Product card component for displaying product information -->
<!-- ABOUTME: Includes image, title, price, and add to cart button -->

<script lang="ts">
	import Card from '../ui/Card.svelte';
	import Button from '../ui/Button.svelte';
	import Badge from '../ui/Badge.svelte';

	export let id: string;
	export let title: string;
	export let price: number; // in cents
	export let image: string;
	export let handle: string;
	export let onAddToCart: ((productId: string) => void) | undefined = undefined;
	export let inStock = true;
	export let badge: string | null = null;

	function handleAddToCart() {
		if (onAddToCart && inStock) {
			onAddToCart(id);
		}
	}
</script>

<Card hover={true} padding="sm">
	<div class="flex flex-col h-full">
		<!-- Product Image -->
		<div class="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
			<img src={image} alt={title} class="w-full h-full object-cover" />

			<!-- Badge (if any) -->
			{#if badge}
				<div class="absolute top-2 right-2">
					<Badge variant="primary">{badge}</Badge>
				</div>
			{/if}

			<!-- Out of Stock Overlay -->
			{#if !inStock}
				<div
					class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
				>
					<Badge variant="danger">Out of Stock</Badge>
				</div>
			{/if}
		</div>

		<!-- Product Info -->
		<div class="flex-1 flex flex-col">
			<h3 class="font-semibold text-lg mb-2 line-clamp-2">{title}</h3>
			<p class="text-2xl font-bold mb-4">${(price / 100).toFixed(2)}</p>

			<!-- Add to Cart Button -->
			<Button
				variant="primary"
				size="md"
				disabled={!inStock}
				on:click={handleAddToCart}
				class="w-full mt-auto"
			>
				{inStock ? 'Add to Cart' : 'Out of Stock'}
			</Button>
		</div>
	</div>
</Card>

