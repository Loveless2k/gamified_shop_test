<!-- ABOUTME: Reusable button component with variants -->
<!-- ABOUTME: Supports primary, secondary, and ghost styles -->

<script lang="ts">
	export let variant: 'primary' | 'secondary' | 'ghost' = 'primary';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let disabled = false;
	export let type: 'button' | 'submit' | 'reset' = 'button';

	const baseClasses =
		'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

	const variantClasses = {
		primary: 'bg-black text-white hover:bg-gray-800 focus:ring-black',
		secondary: 'bg-gray-200 text-black hover:bg-gray-300 focus:ring-gray-400',
		ghost: 'bg-transparent text-black hover:bg-gray-100 focus:ring-gray-300'
	};

	const sizeClasses = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-base',
		lg: 'px-6 py-3 text-lg'
	};

	$: classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;
</script>

<button {type} {disabled} class={classes} on:click on:mouseenter on:mouseleave>
	<slot />
</button>

