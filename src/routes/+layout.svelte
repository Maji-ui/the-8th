<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import '../app.css';
	import '../lib/page-ui.css';
	import PersistentStoryCta from '$lib/components/PersistentStoryCta.svelte';
	import ScrollProgress from '$lib/components/ScrollProgress.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import Analytics from '$lib/components/Analytics.svelte';
	import SiteThemeApply from '$lib/components/SiteThemeApply.svelte';
	import FilmGrain from '$lib/components/FilmGrain.svelte';
	import CookieConsent from '$lib/components/CookieConsent.svelte';
	import NewsletterPopup from '$lib/components/NewsletterPopup.svelte';
	import AiAssistantsStrip from '$lib/components/AiAssistantsStrip.svelte';
	import IgniteCursor from '$lib/components/IgniteCursor.svelte';
	import { initLocale } from '$lib/i18n';

	let { children } = $props();

	const isHome = $derived($page.url.pathname === '/');
	const storyChrome = $derived(
		isHome ||
			$page.url.pathname.startsWith('/students') ||
			$page.url.pathname.startsWith('/mentors') ||
			$page.url.pathname.startsWith('/editions') ||
			$page.url.pathname === '/contact' ||
			$page.url.pathname === '/open-call' ||
			$page.url.pathname === '/cookie-policy'
	);

	$effect(() => {
		if (typeof document === 'undefined') return;
		document.body.classList.toggle('home-story-active', storyChrome);
	});

	onMount(() => initLocale());
</script>

<SeoHead />
<Analytics />
<IgniteCursor />
<SiteThemeApply />
<ScrollProgress />
<SiteHeader />
{#if storyChrome}
	<PersistentStoryCta />
{/if}
{#if isHome}
	<FilmGrain />
{/if}
<CookieConsent />
<NewsletterPopup />

<main class:main--inner={!storyChrome} class:main--story={storyChrome}>
	{@render children()}
</main>

{#if !storyChrome}
	<AiAssistantsStrip bg="#06060a" />
	<footer class="foot">
		<div class="foot__inner">
			<div class="foot__brand">
				<a href="/" class="foot__logo">THE 8th</a>
				<span>© 2026 THE 8th · Tutti i diritti riservati</span>
			</div>
			<nav class="foot__nav" aria-label="Footer">
				<a href="/mentors">Mentor</a>
				<a href="/students">Talenti</a>
				<a href="/editions/september">Vetrina</a>
				<a href="/open-call">Candidati</a>
				<a href="/contact">Contatti</a>
				<a href="/llms.txt">llms.txt</a>
			</nav>
			<span class="foot__tag">International Jewelry Design Contest</span>
		</div>
	</footer>
{/if}

<style>
	.foot {
		width: 100%;
		padding: 2.5rem var(--editorial-pad);
		border-top: 1px solid var(--line);
		background: var(--bg);
	}

	.foot__inner {
		width: 100%;
		max-width: none;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: 2rem;
		align-items: start;
		font-size: 0.48rem;
		letter-spacing: 0.28em;
		color: var(--fg-faint);
	}

	.foot__brand {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.foot__logo {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		color: var(--black);
	}

	.foot__nav {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		text-align: center;
	}

	.foot__nav a:hover {
		color: var(--indigo);
	}

	.foot__tag {
		text-align: right;
	}

	.main--inner,
	.main--story {
		animation: page-enter 0.55s var(--ease-ribbit) both;
	}

	.main--story {
		padding-top: 0;
	}

	@keyframes page-enter {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (max-width: 768px) {
		.foot__inner {
			grid-template-columns: 1fr;
			text-align: left;
		}
		.foot__nav {
			text-align: left;
			flex-flow: row wrap;
			gap: 1rem 1.5rem;
		}
		.foot__tag {
			text-align: left;
		}
	}
</style>
