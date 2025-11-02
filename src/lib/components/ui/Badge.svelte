<!-- ABOUTME: Badge component for labels and tags -->
<!-- ABOUTME: Supports different color variants -->

<script lang="ts">
	export let variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' = 'default';
	let className = '';
	export { className as class };

	const variantClasses = {
		default: 'bg-gray-100 text-gray-800',
		primary: 'bg-black text-white',
		success: 'bg-green-100 text-green-800',
		warning: 'bg-yellow-100 text-yellow-800',
		danger: 'bg-red-100 text-red-800'
	};

	$: classes = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`;
</script>

<span class={classes}>
	<slot />
</span>

