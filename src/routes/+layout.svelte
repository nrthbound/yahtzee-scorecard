<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="max-w-6xl mx-auto py-4 flex">
	<a href="/" title="Yahti.app">
		<svg width="84" height="14" viewBox="0 0 84 14" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M0 0H3.93555L7.00195 5.05859L10.1172 0H13.877L8.56445 8.33008V13.2617H5.35156V8.33008L0 0Z" fill="#222222"/>
			<path d="M15.5145 13.2617L20.7488 0H24.5574L29.8016 13.2617H26.3641L25.4656 10.8301H19.8504L18.952 13.2617H15.5145ZM22.6629 3.21289L20.7684 8.33008H24.5477L22.6629 3.21289Z" fill="#222222"/>
			<path d="M34.5543 0H37.7672V5.14648H43.5094V0H46.7223V13.2617H43.5094V7.8418H37.7672V13.2617H34.5543V0Z" fill="#222222"/>
			<path d="M51.6605 2.76367V0H62.7055V2.76367H58.7895V13.2617H55.5863V2.76367H51.6605Z" fill="#222222"/>
			<path d="M70.8469 0V13.2617H67.634V0H70.8469Z" fill="#222222"/>
			<path d="M83.9805 9.26172C83.9805 11.4709 82.1896 13.2617 79.9805 13.2617C77.7713 13.2617 75.9805 11.4709 75.9805 9.26172C75.9805 7.05258 77.7713 5.26172 79.9805 5.26172C82.1896 5.26172 83.9805 7.05258 83.9805 9.26172Z" fill="#FBB969"/>
		</svg>
	</a>
</div>

{@render children()}
