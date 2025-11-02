<!-- ABOUTME: Global header component with branding and cart icon -->
<!-- ABOUTME: Sticky header that stays at top of viewport -->

<script lang="ts">
	import CartIcon from '../cart/CartIcon.svelte';

	export let onCartClick: (() => void) | undefined = undefined;
</script>

<header class="sticky top-0 z-30 bg-white border-b border-gray-200">
	<div class="container mx-auto px-4 py-4">
		<div class="flex items-center justify-between">
			<!-- Logo/Brand -->
			<a href="/" class="text-2xl font-bold text-black hover:text-gray-700 transition-colors">
				Gamified Shop
			</a>

			<!-- Navigation -->
			<nav class="hidden md:flex items-center space-x-8">
				<a href="/" class="text-gray-700 hover:text-black transition-colors">Home</a>
				<span class="text-gray-400 cursor-not-allowed">Products (Coming Soon)</span>
				<span class="text-gray-400 cursor-not-allowed">About (Coming Soon)</span>
			</nav>

			<!-- Cart Icon -->
			<CartIcon onClick={onCartClick} />
		</div>
	</div>
</header>

