<!-- ABOUTME: Global layout component that wraps all pages -->
<!-- ABOUTME: Includes header, footer, and cart drawer -->

<script lang="ts">
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import CartDrawer from '$lib/components/cart/CartDrawer.svelte';

	let isCartOpen = false;
	let cartItems: Array<{
		id: string;
		title: string;
		price: number;
		quantity: number;
		image: string;
	}> = [];

	function handleCartClick() {
		isCartOpen = true;
	}

	function handleCartClose() {
		isCartOpen = false;
	}
</script>

<div class="min-h-screen flex flex-col">
	<Header onCartClick={handleCartClick} />

	<main class="flex-1">
		<slot />
	</main>

	<Footer />

	<CartDrawer isOpen={isCartOpen} onClose={handleCartClose} items={cartItems} />
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
			Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
	}
</style>

