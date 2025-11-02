<!-- ABOUTME: Card container component for content grouping -->
<!-- ABOUTME: Provides consistent spacing and shadow -->

<script lang="ts">
	export let padding: 'sm' | 'md' | 'lg' = 'md';
	export let hover = false;

	const paddingClasses = {
		sm: 'p-4',
		md: 'p-6',
		lg: 'p-8'
	};

	$: classes = `bg-white rounded-xl shadow-sm ${paddingClasses[padding]} ${hover ? 'transition-shadow hover:shadow-md' : ''}`;
</script>

<div class={classes}>
	<slot />
</div>

