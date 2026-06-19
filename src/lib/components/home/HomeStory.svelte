<script>
  import { onMount } from 'svelte';
  import HeroCarousel from '$lib/components/HeroCarousel.svelte';
  import HomeStoryChapterIndex from './HomeStoryChapterIndex.svelte';
  import LocaleToggle from '$lib/components/LocaleToggle.svelte';
  import ScrollHint from '$lib/components/ScrollHint.svelte';
  import HomeStoryStatement from './HomeStoryStatement.svelte';
  import HomeStoryScrollScene from './HomeStoryScrollScene.svelte';
  import HomeStoryFilmStrip from './HomeStoryFilmStrip.svelte';
  import HomeStoryPath from './HomeStoryPath.svelte';
  import HomeStoryRail from './HomeStoryRail.svelte';
  import HomeStoryTalents from './HomeStoryTalents.svelte';
  import HomeStoryMentors from './HomeStoryMentors.svelte';
  import HomeStoryVetrina from './HomeStoryVetrina.svelte';
  import HomeStoryNewsletter from './HomeStoryNewsletter.svelte';
  import HomeStoryFooter from './HomeStoryFooter.svelte';
  import HomeStoryTrustStrip from './HomeStoryTrustStrip.svelte';
  import IgniteMarquee from '$lib/components/IgniteMarquee.svelte';
  import { page } from '$app/stores';
  import {
    storyTones,
    storyHeroImages,
    storyFilmStripImages,
    storyOrbitImages,
    storyPathCoverImages,
    storyWorks,
    storyVetrinaSlides
  } from '$lib/data/home-story.js';
  import { buildStoryTalentsFromShowcases } from '$lib/data/home-story-build.js';
  import {
    buildHomeIndexChapters,
    buildHomePathSteps,
    codeForSection
  } from '$lib/data/home-chapters.js';
  import { t } from '$lib/i18n';

  $: storyTalents = buildStoryTalentsFromShowcases($page.data.showcases ?? []);

  let entered = false;
  let heroScale = 1;
  let heroY = 0;

  /** @type {HTMLElement | null} */
  let pathSection = null;

  const PATH_SCROLL_VH = 2.75;

  $: pathSteps = buildHomePathSteps($t, storyPathCoverImages);
  $: homeChapters = buildHomeIndexChapters($t);

  $: if (typeof document !== 'undefined') {
    document.body.classList.toggle('home-story-gate-open', !entered);
  }

  onMount(() => {
    if (sessionStorage.getItem('the8-story-entered') === '1') entered = true;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const onScroll = () => {
      const vh = window.innerHeight || 1;
      // zoom-on-scroll dell'hero: l'immagine cresce e fa parallax uscendo di scena
      const p = Math.min(1, Math.max(0, window.scrollY / vh));
      heroScale = 1 + p * 0.18;
      heroY = p * 12;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  });

  function enterStory() {
    entered = true;
    sessionStorage.setItem('the8-story-entered', '1');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
</script>

<div class="home-story" class:home-story--entered={entered}>
  {#if !entered}
    <div class="home-story__gate" role="dialog" aria-label={$t('home.storyEnter')}>
      <div class="home-story__gate-media" aria-hidden="true">
        <HeroCarousel images={storyHeroImages} intervalMs={4500} />
        <div class="home-story__gate-veil"></div>
      </div>
      <div class="home-story__gate-content">
        <p class="home-story__gate-kicker">THE 8th · 2025–26</p>
        <h1 class="home-story__gate-title t-display">THE <span>8th</span></h1>
        <button type="button" class="home-story__gate-btn" data-cursor="↗" on:click={enterStory}>
          {$t('home.storyEnter')}
        </button>
      </div>
    </div>
  {/if}

  <section id="home-chapter-intro" class="home-story__hero" aria-label="Introduzione">
    <div class="home-story__hero-media" aria-hidden="true">
      {#if storyHeroImages[0]}
        <img
          class="home-story__hero-bg"
          src={storyHeroImages[0]}
          alt=""
          style="transform: scale({heroScale}) translate3d(0, {heroY}%, 0);"
        />
      {/if}
      <div class="home-story__hero-veil"></div>
    </div>
    <div class="home-story__hero-ui">
      <div class="home-story__hero-locale">
        <LocaleToggle />
      </div>
      <div class="home-story__hero-copy">
        <p class="home-story__hero-code">{codeForSection(1)}</p>
        <p class="home-story__hero-kicker">{$t('home.storyKicker')}</p>
        <h1 class="home-story__hero-brand t-display">THE <span>8th</span></h1>
        <p class="home-story__hero-tagline">{$t('home.heroTagline')}</p>
      </div>
      <ScrollHint text={$t('home.scroll')} />
    </div>
  </section>

  <HomeStoryStatement
    sectionId="home-chapter-manifesto"
    code={codeForSection(2)}
    title={$t('home.storyManifestoTitle')}
    body={$t('home.storyManifestoBody')}
    bg={storyTones.void}
    tone="dark"
    minVh={1.05}
  />

  <HomeStoryFilmStrip
    sectionId="home-chapter-sketch"
    sectionCode={codeForSection(3)}
    images={storyFilmStripImages}
    label={$t('home.storySketchLabel')}
    bg={storyTones.charcoal}
    intervalMs={2800}
  />

  <HomeStoryStatement
    sectionId="home-chapter-courage"
    code={codeForSection(4)}
    title={$t('home.storyCourageTitle')}
    body={$t('home.storyCourageBody')}
    bg={storyTones.ash}
    tone="dark"
    minVh={1}
  />

  <IgniteMarquee text="THE 8th" variant="outline" speed={1.1} bg={storyTones.void} />

  <HomeStoryTrustStrip bg={storyTones.ink} />

  <HomeStoryPath
    bind:sectionEl={pathSection}
    steps={pathSteps}
    bg={storyTones.void}
    scrollVh={PATH_SCROLL_VH}
  />

  <HomeStoryScrollScene
    sectionId="home-chapter-mirror"
    sectionCode={codeForSection(9)}
    images={storyOrbitImages}
    bg={storyTones.charcoal}
    scrollVh={2.4}
    layout="split"
    copy={{
      left: $t('home.storyMirrorLeft'),
      right: $t('home.storyMirrorRight')
    }}
  />

  <HomeStoryTalents
    talents={storyTalents}
    bg={storyTones.charcoal}
    sectionCode={codeForSection(10)}
  />

  <HomeStoryMentors bg={storyTones.ink} sectionCode={codeForSection(11)} />

  <HomeStoryRail
    sectionId="home-chapter-works"
    sectionCode={codeForSection(12)}
    items={storyWorks}
    title={$t('home.storyWorksTitle')}
    ctaLabel={$t('home.storyWorksCta')}
    ctaHref="/editions/september"
    bg={storyTones.charcoal}
  />

  <HomeStoryVetrina
    images={storyVetrinaSlides}
    bg={storyTones.void}
    sectionCode={codeForSection(13)}
  />

  <IgniteMarquee
    text={$t('home.heroTagline')}
    variant="solid"
    speed={-0.9}
    bg={storyTones.charcoal}
    separator={false}
  />

  <HomeStoryNewsletter bg={storyTones.ash} sectionCode={codeForSection(14)} />

  <HomeStoryStatement
    sectionId="home-chapter-closing"
    code={codeForSection(15)}
    title={$t('home.storyClosingTitle')}
    body={$t('home.storyClosingBody')}
    bg={storyTones.linen}
    tone="light"
    minVh={0.9}
  />

  <HomeStoryFooter bg={storyTones.void} wide />

  {#if entered}
    <HomeStoryChapterIndex
      chapters={homeChapters}
      pathSection={pathSection}
      pathScrollVh={PATH_SCROLL_VH}
      pathStepCount={pathSteps.length}
    />
  {/if}
</div>

<style>
  .home-story {
    --story-ease: var(--ease-ribbit);
    overflow: visible;
    background: var(--story-bg, #06060a);
    color: var(--story-text, var(--color-linen));
  }

  /* Card griglia: reveal solo sulle pagine interne, in home sempre visibili */
  .home-story :global(.story-mentors__card.home-stagger),
  .home-story :global(.story-talents__card.home-stagger) {
    opacity: 1;
    transform: none;
    transition: transform 0.35s var(--ease-ribbit);
  }

  .home-story__gate {
    position: fixed;
    inset: 0;
    z-index: 300;
    display: grid;
    place-items: center;
    background: var(--story-bg);
  }

  .home-story--entered .home-story__gate {
    display: none;
  }

  .home-story__gate-media {
    position: absolute;
    inset: 0;
  }

  .home-story__gate-media :global(.carousel) {
    position: absolute;
    inset: 0;
  }

  .home-story__gate-veil {
    position: absolute;
    inset: 0;
    z-index: 1;
    background:
      radial-gradient(circle at 50% 42%, rgba(6, 6, 10, 0.35) 0%, rgba(6, 6, 10, 0.82) 70%),
      linear-gradient(180deg, rgba(6, 6, 10, 0.55) 0%, rgba(6, 6, 10, 0.35) 45%, rgba(6, 6, 10, 0.8) 100%);
    pointer-events: none;
  }

  .home-story__gate-content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: var(--editorial-pad);
  }

  .home-story__gate-kicker {
    margin: 0 0 0.75rem;
    font-size: var(--type-label);
    letter-spacing: 0.04em;
    text-transform: none;
    color: color-mix(in srgb, var(--color-linen) 78%, transparent);
    text-shadow: 0 1px 18px rgba(6, 6, 10, 0.7);
  }

  .home-story__gate-title {
    margin: 0;
    color: var(--color-linen);
    line-height: 0.9;
    text-shadow: 0 2px 32px rgba(6, 6, 10, 0.65);
  }

  .home-story__gate-title span {
    color: var(--accent-gold);
  }

  .home-story__gate-btn {
    margin-top: 1.75rem;
    border: 1px solid color-mix(in srgb, var(--color-linen) 55%, transparent);
    border-radius: 999px;
    padding: 0.8rem 1.85rem;
    background: color-mix(in srgb, var(--color-linen) 12%, transparent);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    color: var(--color-linen);
    font-size: var(--type-link);
    letter-spacing: 0.06em;
    text-transform: none;
    cursor: pointer;
    box-shadow: 0 8px 32px rgba(6, 6, 10, 0.45);
    transition:
      background 0.3s ease,
      border-color 0.3s ease,
      transform 0.3s var(--story-ease);
  }

  .home-story__gate-btn:hover {
    transform: translateY(-2px);
    border-color: var(--accent-gold);
    background: color-mix(in srgb, var(--accent-gold) 18%, transparent);
  }

  .home-story__hero {
    position: relative;
    min-height: 100svh;
    background: var(--story-bg);
  }

  .home-story__hero-media {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .home-story__hero-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 35%;
    will-change: transform;
  }

  .home-story__hero-veil {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background:
      linear-gradient(180deg, rgba(6, 6, 10, 0.15) 0%, rgba(6, 6, 10, 0.55) 55%, rgba(6, 6, 10, 0.95) 100%),
      radial-gradient(circle at 18% 12%, color-mix(in srgb, var(--accent-primary) 18%, transparent), transparent 42%);
  }

  .home-story__hero-ui {
    --scroll-hint-color: color-mix(in srgb, var(--color-linen) 55%, transparent);
    position: relative;
    z-index: 3;
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    padding: calc(4.5rem + var(--editorial-pad)) var(--editorial-pad) clamp(2rem, 6vh, 3.5rem);
    pointer-events: none;
  }


  .home-story__hero-locale {
    position: absolute;
    top: calc(4.25rem + 0.35rem);
    right: var(--editorial-pad);
    pointer-events: auto;
    --locale-border: color-mix(in srgb, var(--color-linen) 30%, transparent);
    --locale-muted: color-mix(in srgb, var(--color-linen) 52%, transparent);
    --locale-active: var(--color-linen);
  }

  @media (min-width: 720px) {
    .home-story__hero-locale {
      display: none;
    }
  }

  .home-story__hero-copy {
    text-align: center;
    margin-bottom: 0.35rem;
  }

  .home-story__hero-code {
    margin: 0 0 0.35rem;
    font-family: var(--font-body);
    font-size: var(--type-label);
    letter-spacing: 0.04em;
    color: color-mix(in srgb, var(--accent-gold) 80%, var(--color-linen));
  }

  .home-story__hero-kicker {
    margin: 0;
    font-size: var(--type-label);
    letter-spacing: 0.04em;
    text-transform: none;
    color: color-mix(in srgb, var(--color-linen) 52%, transparent);
  }

  .home-story__hero-brand {
    margin: 0.35rem 0 0;
    color: var(--color-linen);
    line-height: 0.9;
  }

  .home-story__hero-brand span {
    color: var(--accent-gold);
  }

  .home-story__hero-tagline {
    margin: 0.75rem auto 0;
    max-width: 36rem;
    font-size: var(--editorial-body);
    line-height: 1.45;
    color: color-mix(in srgb, var(--color-linen) 78%, transparent);
  }
</style>
