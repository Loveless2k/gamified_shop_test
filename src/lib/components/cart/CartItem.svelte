<!-- ABOUTME: Individual cart item component -->
<!-- ABOUTME: Displays product info with quantity controls -->

<script lang="ts">
	export let id: string;
	export let title: string;
	export let price: number; // in cents
	export let quantity: number;
	export let image: string;
	export let onRemove: (() => void) | undefined = undefined;
	export let onUpdateQuantity: ((qty: number) => void) | undefined = undefined;

	function handleIncrement() {
		if (onUpdateQuantity) {
			onUpdateQuantity(quantity + 1);
		}
	}

	function handleDecrement() {
		if (quantity > 1 && onUpdateQuantity) {
			onUpdateQuantity(quantity - 1);
		}
	}

	$: itemTotal = price * quantity;
</script>

<div class="flex gap-4 p-4 bg-gray-50 rounded-lg">
	<!-- Product Image -->
	<div class="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-md overflow-hidden">
		<img src={image} alt={title} class="w-full h-full object-cover" />
	</div>

	<!-- Product Info -->
	<div class="flex-1 min-w-0">
		<h3 class="font-semibold text-sm truncate">{title}</h3>
		<p class="text-gray-600 text-sm mt-1">${(price / 100).toFixed(2)}</p>

		<!-- Quantity Controls -->
		<div class="flex items-center gap-2 mt-2">
			<button
				on:click={handleDecrement}
				disabled={quantity <= 1}
				class="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
				aria-label="Decrease quantity"
			>
				-
			</button>
			<span class="text-sm font-medium w-8 text-center">{quantity}</span>
			<button
				on:click={handleIncrement}
				class="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
				aria-label="Increase quantity"
			>
				+
			</button>
		</div>
	</div>

	<!-- Item Total and Remove -->
	<div class="flex flex-col items-end justify-between">
		<p class="font-bold text-sm">${(itemTotal / 100).toFixed(2)}</p>
		<button
			on:click={onRemove}
			class="text-red-600 hover:text-red-800 text-xs"
			aria-label="Remove item"
		>
			Remove
		</button>
	</div>
</div>

