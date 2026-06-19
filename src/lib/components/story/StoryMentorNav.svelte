<script>
  import { page } from '$app/stores';
  import MotionWords from '$lib/components/MotionWords.svelte';
  import MotionBlock from '$lib/components/MotionBlock.svelte';
  import { storyTones } from '$lib/data/home-story.js';
  import { buildStoryMentorsFromList } from '$lib/data/home-story-build.js';
  import { getMentorNeighborsFrom } from '$lib/data/mentors.js';
  import { locale, t } from '$lib/i18n';
  import { reveal } from '$lib/reveal';

  let gridIn = false;

  /** @type {string} */
  export let currentSlug = '';

  /** @type {string} */
  export let bg = storyTones.charcoal;

  /** @type {string} */
  export let sectionCode = '// 04';

  /** Mostra link Precedente / Successivo (disattivato sui profili mentor). */
  export let showFlow = true;

  /** Griglia a 3 colonne per gli altri mentor sul profilo. */
  export let peersOnly = false;

  $: mentors = $page.data.mentors ?? [];
  $: storyMentors = buildStoryMentorsFromList(mentors, $locale);
  $: navMentors = currentSlug
    ? storyMentors.filter((mentor) => mentor.slug !== currentSlug)
    : storyMentors;
  $: neighbors = getMentorNeighborsFrom(mentors, currentSlug);
  $: bySlug = Object.fromEntries(storyMentors.map((mentor) => [mentor.slug, mentor]));
  $: prevPeer = neighbors.prev ? { ...neighbors.prev, ...bySlug[neighbors.prev.slug] } : null;
  $: nextPeer = neighbors.next ? { ...neighbors.next, ...bySlug[neighbors.next.slug] } : null;
  $: isEn = $locale === 'en';
  $: flowLabel = isEn ? 'Explore the mentor network' : 'Esplora la rete dei mentor';
</script>

<nav
  class="story-talents story-peer-nav story-peer-nav--mentor"
  style="--story-bg: {bg}; --story-peer-bg: {bg}"
  aria-label={$t('profile.exploreMentors')}
>
  <header class="story-talents__head story-peer-nav__head story-editorial-head">
    <p class="story-talents__code story-peer-nav__code story-editorial-head__code">
      {sectionCode} · {$t('nav.mentors')}
    </p>
    <MotionWords
      as="p"
      className="story-talents__title story-peer-nav__title story-editorial-head__title"
      text={$t('profile.exploreMentors')}
    />
    <MotionBlock delay={100}>
      <p class="story-talents__lede story-peer-nav__lede story-editorial-head__lede">{flowLabel}</p>
    </MotionBlock>
  </header>

  {#if showFlow && (prevPeer || nextPeer)}
    <div class="story-peer-nav__flow">
      {#if prevPeer}
        <a
          class="story-peer-nav__flow-link"
          href={prevPeer.href}
          style={prevPeer.cover ? `--flow-cover: url(${prevPeer.cover})` : undefined}
        >
          <span class="story-peer-nav__flow-kicker">{isEn ? 'Previous' : 'Precedente'}</span>
          <span class="story-peer-nav__flow-name">{prevPeer.name}</span>
          <span class="story-peer-nav__flow-project">{prevPeer.project}</span>
        </a>
      {:else}
        <div class="story-peer-nav__flow-spacer" aria-hidden="true"></div>
      {/if}

      {#if nextPeer}
        <a
          class="story-peer-nav__flow-link story-peer-nav__flow-link--next"
          href={nextPeer.href}
          style={nextPeer.cover ? `--flow-cover: url(${nextPeer.cover})` : undefined}
        >
          <span class="story-peer-nav__flow-kicker">{isEn ? 'Next' : 'Successivo'}</span>
          <span class="story-peer-nav__flow-name">{nextPeer.name}</span>
          <span class="story-peer-nav__flow-project">{nextPeer.project}</span>
        </a>
      {:else}
        <div class="story-peer-nav__flow-spacer" aria-hidden="true"></div>
      {/if}
    </div>
  {/if}

  <div
    class="story-talents__grid story-peer-nav__grid"
    class:story-peer-nav__grid--peers={peersOnly}
    use:reveal={{ variant: 'fade', threshold: 0.06, onInView: () => (gridIn = true) }}
  >
    {#each navMentors as mentor, i (mentor.slug)}
      <a
        class="story-talents__card story-peer-nav__card home-stagger"
        class:in-view={gridIn}
        style="--delay: {0.05 + i * 0.09}s"
        data-variant={i % 2 === 0 ? 'left' : 'right'}
        href={mentor.href}
      >
        <div class="story-talents__visual story-peer-nav__visual">
          {#if mentor.cover}
            <img class="story-talents__cover story-peer-nav__cover" src={mentor.cover} alt="" loading="lazy" />
          {/if}
          {#if mentor.portrait && mentor.portrait !== mentor.cover}
            <div class="story-talents__portrait story-peer-nav__portrait">
              <img src={mentor.portrait} alt="" loading="lazy" />
            </div>
          {/if}
        </div>
        {#if mentor.images?.length > 1}
          <div class="story-talents__thumbs" aria-hidden="true">
            {#each mentor.images.slice(0, 5) as src}
              <img src={src} alt="" loading="lazy" />
            {/each}
          </div>
        {/if}
        <div class="story-talents__meta story-peer-nav__meta">
          <p class="story-talents__name story-peer-nav__name">{mentor.name}</p>
          <p class="story-talents__project story-peer-nav__project">{mentor.project}</p>
        </div>
      </a>
    {/each}
  </div>

  <a class="story-talents__cta story-peer-nav__cta" href="/mentors">{$t('home.exploreAll')}</a>
</nav>
