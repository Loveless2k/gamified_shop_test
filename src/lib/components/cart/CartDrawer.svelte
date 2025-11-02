<!-- ABOUTME: Slide-out cart drawer component -->
<!-- ABOUTME: Shows cart items and checkout button -->

<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import CartItem from './CartItem.svelte';
	import Button from '../ui/Button.svelte';

	export let isOpen = false;
	export let onClose: () => void;
	export let items: Array<{
		id: string;
		title: string;
		price: number;
		quantity: number;
		image: string;
	}> = [];

	$: subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

	function handleCheckout() {
		// TODO: Navigate to Shopify checkout when Issue #6 is complete
		alert('Checkout functionality will be implemented with Shopify API integration (Issue #6)');
	}

	function handleRemoveItem(itemId: string) {
		// TODO: Implement cart state management in future issue
		console.log('Remove item:', itemId);
	}

	function handleUpdateQuantity(itemId: string, quantity: number) {
		// TODO: Implement cart state management in future issue
		console.log('Update quantity:', itemId, quantity);
	}
</script>

<!-- Backdrop -->
{#if isOpen}
	<div
		class="fixed inset-0 bg-black bg-opacity-50 z-40"
		on:click={onClose}
		on:keydown={(e) => e.key === 'Escape' && onClose()}
		role="button"
		tabindex="0"
		transition:fade={{ duration: 200 }}
	/>

	<!-- Drawer -->
	<div
		class="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
		transition:fly={{ x: 400, duration: 300 }}
	>
		<!-- Header -->
		<div class="flex items-center justify-between p-6 border-b border-gray-200">
			<h2 class="text-2xl font-bold">Shopping Cart</h2>
			<button
				on:click={onClose}
				class="p-2 hover:bg-gray-100 rounded-full transition-colors"
				aria-label="Close cart"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>

		<!-- Cart Items -->
		<div class="flex-1 overflow-y-auto p-6">
			{#if items.length === 0}
				<div class="text-center py-12">
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
							d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
					<p class="text-gray-600">Your cart is empty</p>
				</div>
			{:else}
				<div class="space-y-4">
					{#each items as item (item.id)}
						<CartItem
							{...item}
							onRemove={() => handleRemoveItem(item.id)}
							onUpdateQuantity={(qty) => handleUpdateQuantity(item.id, qty)}
						/>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Footer with Subtotal and Checkout -->
		{#if items.length > 0}
			<div class="border-t border-gray-200 p-6 space-y-4">
				<!-- Subtotal -->
				<div class="flex items-center justify-between text-lg">
					<span class="font-semibold">Subtotal:</span>
					<span class="font-bold">${(subtotal / 100).toFixed(2)}</span>
				</div>

				<!-- Checkout Button -->
				<Button variant="primary" size="lg" on:click={handleCheckout} class="w-full">
					Proceed to Checkout
				</Button>

				<p class="text-xs text-gray-500 text-center">
					Taxes and shipping calculated at checkout
				</p>
			</div>
		{/if}
	</div>
{/if}

