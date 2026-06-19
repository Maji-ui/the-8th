<script lang="ts">
	import { page } from '$app/stores';
	import { locale } from '$lib/i18n';
	import { canonicalUrl, fullTitle, resolveSeo, type SeoMeta } from '$lib/seo';

	let {
		meta
	}: {
		meta?: SeoMeta;
	} = $props();

	const resolved = $derived(meta ?? resolveSeo($page.url.pathname));
	const title = $derived(fullTitle(resolved.title, $locale));
	const url = $derived(canonicalUrl(resolved.path ?? $page.url.pathname));
	const image = $derived(resolved.image ?? `${canonicalUrl('')}/og-default.png`);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={resolved.description} />
	<link rel="canonical" href={url} />
	{#if resolved.noindex}
		<meta name="robots" content="noindex, nofollow" />
	{/if}
	<meta property="og:type" content={resolved.type ?? 'website'} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={resolved.description} />
	<meta property="og:url" content={url} />
	<meta property="og:locale" content={$locale === 'it' ? 'it_IT' : 'en_US'} />
	<meta property="og:image" content={image} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={resolved.description} />
	<link rel="alternate" hreflang="it" href={canonicalUrl(resolved.path ?? $page.url.pathname)} />
	<link rel="alternate" hreflang="en" href={canonicalUrl(resolved.path ?? $page.url.pathname)} />
	<link rel="alternate" type="text/plain" title="llms.txt" href={`${canonicalUrl('')}/llms.txt`} />
</svelte:head>
