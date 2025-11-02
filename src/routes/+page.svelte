<!-- ABOUTME: Main landing page component for the gamified e-commerce experience -->
<!-- ABOUTME: This page is statically generated (SSG) for optimal performance -->

<script lang="ts">
	import ProductGrid from '$lib/components/product/ProductGrid.svelte';

	// Mock product data (will be replaced with Shopify API in Issue #6)
	const mockProducts = [
		{
			id: '1',
			title: 'Premium Wireless Headphones',
			price: 29999, // $299.99 in cents
			image: 'https://via.placeholder.com/400x400/000000/FFFFFF?text=Headphones',
			handle: 'premium-wireless-headphones',
			inStock: true,
			badge: 'New'
		},
		{
			id: '2',
			title: 'Smart Watch Pro',
			price: 39999, // $399.99
			image: 'https://via.placeholder.com/400x400/333333/FFFFFF?text=Smart+Watch',
			handle: 'smart-watch-pro',
			inStock: true,
			badge: 'Popular'
		},
		{
			id: '3',
			title: 'Portable Bluetooth Speaker',
			price: 12999, // $129.99
			image: 'https://via.placeholder.com/400x400/666666/FFFFFF?text=Speaker',
			handle: 'portable-bluetooth-speaker',
			inStock: true
		},
		{
			id: '4',
			title: 'Wireless Charging Pad',
			price: 4999, // $49.99
			image: 'https://via.placeholder.com/400x400/999999/FFFFFF?text=Charger',
			handle: 'wireless-charging-pad',
			inStock: true
		},
		{
			id: '5',
			title: 'USB-C Hub Adapter',
			price: 7999, // $79.99
			image: 'https://via.placeholder.com/400x400/CCCCCC/000000?text=USB+Hub',
			handle: 'usb-c-hub-adapter',
			inStock: false
		},
		{
			id: '6',
			title: 'Mechanical Keyboard',
			price: 15999, // $159.99
			image: 'https://via.placeholder.com/400x400/444444/FFFFFF?text=Keyboard',
			handle: 'mechanical-keyboard',
			inStock: true,
			badge: 'Sale'
		},
		{
			id: '7',
			title: 'Ergonomic Mouse',
			price: 8999, // $89.99
			image: 'https://via.placeholder.com/400x400/777777/FFFFFF?text=Mouse',
			handle: 'ergonomic-mouse',
			inStock: true
		},
		{
			id: '8',
			title: '4K Webcam',
			price: 19999, // $199.99
			image: 'https://via.placeholder.com/400x400/555555/FFFFFF?text=Webcam',
			handle: '4k-webcam',
			inStock: true
		}
	];

	let loading = false;

	function handleAddToCart(productId: string) {
		// TODO: Implement cart state management in future issue
		console.log('Add to cart:', productId);
		alert(`Product ${productId} added to cart! (Cart state management coming in future issue)`);
	}
</script>

<svelte:head>
	<title>Gamified Shop - Interactive Brand Experience</title>
	<meta name="description" content="Interactive brand experience with gamified shopping" />
</svelte:head>

<div class="container mx-auto px-4 py-12">
	<!-- Hero Section -->
	<div class="text-center mb-12">
		<h1 class="text-5xl font-bold mb-4">Welcome to Gamified Shop</h1>
		<p class="text-xl text-gray-600 max-w-2xl mx-auto">
			Discover our curated collection of premium tech products. Experience shopping like never
			before.
		</p>
	</div>

	<!-- Product Grid -->
	<ProductGrid products={mockProducts} {loading} onAddToCart={handleAddToCart} />
</div>

