<script>
  import { onMount } from 'svelte';
  import MotionWords from '$lib/components/MotionWords.svelte';
  import MotionBlock from '$lib/components/MotionBlock.svelte';
  import { sectionProgress, imageOpacities } from '$lib/utils/scroll-progress.js';

  /** @type {string[]} */
  export let images = [];

  /** @type {string} */
  export let bg = '#06060a';

  /** @type {number} */
  export let scrollVh = 2.4;

  /** @type {{ left?: string, right?: string, center?: string, body?: string }} */
  export let copy = {};

  /** @type {'split' | 'center' | 'stack'} */
  export let layout = 'split';

  /** @type {string} */
  export let sectionId = '';

  /** @type {string} */
  export let sectionCode = '';

  let root;
  let progress = 0;

  $: opacities = imageOpacities(progress, images.length);
  $: phaseSplit = progress < 0.38 ? 0 : progress < 0.72 ? 1 : 2;
  $: phaseCenter = progress < 0.45 ? 0 : 1;
  // Ken-burns: lo sfondo respira/zooma lungo tutto lo scroll (effetto Ignite).
  $: zoom = 1.06 + progress * 0.16;
  $: panY = (progress - 0.5) * -6;
  $: lineShift = (0.5 - progress) * 3;

  onMount(() => {
    let target = 0;
    let raf = 0;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const settle = () => {
      raf = 0;
      const next = progress + (target - progress) * 0.16;
      if (Math.abs(target - next) < 0.0004) {
        progress = target;
        return;
      }
      progress = next;
      raf = requestAnimationFrame(settle);
    };

    const onScroll = () => {
      if (!root) return;
      target = sectionProgress(root.getBoundingClientRect(), scrollVh);
      if (reduceMotion) {
        progress = target;
        return;
      }
      if (!raf) raf = requestAnimationFrame(settle);
    };

    onScroll();
    progress = target;
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  });
</script>

<section
  id={sectionId || undefined}
  class="story-scene"
  bind:this={root}
  style="--story-bg: {bg}; --story-scroll: {scrollVh}"
  aria-label="Scena visiva"
>
  <div class="story-scene__sticky">
    <div class="story-scene__media" aria-hidden="true">
      {#each images as src, i}
        <img
          class="story-scene__img"
          src={src}
          alt=""
          style="opacity: {opacities[i]}; transform: scale({zoom}) translate3d(0, {panY}%, 0);"
          loading={i === 0 ? 'eager' : 'lazy'}
        />
      {/each}
      <div class="story-scene__veil"></div>
    </div>

    <div
      class="story-scene__copy story-scene__copy--{layout}"
      style="transform: translate3d(0, {lineShift}rem, 0);"
    >
      {#if sectionCode}
        <p class="story-scene__section-code">{sectionCode}</p>
      {/if}
      {#if layout === 'split' && copy.left && copy.right}
        <p
          class="story-scene__line story-scene__line--left"
          class:story-scene__line--on={phaseSplit >= 1}
        >
          {copy.left}
        </p>
        <p
          class="story-scene__line story-scene__line--right"
          class:story-scene__line--on={phaseSplit >= 2}
        >
          {copy.right}
        </p>
      {:else if layout === 'center' && copy.center}
        <MotionWords
          as="p"
          className="story-scene__center-title"
          text={copy.center}
          delay={phaseCenter === 1 ? 0 : 120}
        />
        {#if copy.body}
          <MotionBlock delay={phaseCenter === 1 ? 180 : 320}>
            <p class="story-scene__center-body">{copy.body}</p>
          </MotionBlock>
        {/if}
      {:else if copy.center}
        <h2 class="story-scene__stack-title">{copy.center}</h2>
        {#if copy.body}
          <p class="story-scene__stack-body">{copy.body}</p>
        {/if}
      {/if}
    </div>
  </div>
</section>

<style>
  .story-scene {
    position: relative;
    height: calc(var(--story-scroll) * 100svh);
    background: var(--story-bg);
  }

  .story-scene__sticky {
    position: sticky;
    top: 0;
    height: 100svh;
    overflow: hidden;
    display: grid;
    place-items: center;
  }

  .story-scene__media {
    position: absolute;
    inset: 0;
  }

  .story-scene__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 0.55s var(--ease-ribbit-out);
    will-change: opacity, transform;
  }

  .story-scene__veil {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(6, 6, 10, 0.35) 0%, transparent 28%, transparent 62%, rgba(6, 6, 10, 0.92) 100%),
      radial-gradient(circle at 50% 42%, transparent 0%, rgba(6, 6, 10, 0.55) 72%);
    pointer-events: none;
  }

  .story-scene__copy {
    position: relative;
    z-index: 2;
    width: min(72rem, 92vw);
    padding: 0 var(--editorial-pad);
    pointer-events: none;
  }

  .story-scene__section-code {
    margin: 0 0 0.75rem;
    font-family: var(--font-body);
    font-size: var(--type-label);
    letter-spacing: 0.04em;
    color: color-mix(in srgb, var(--accent-gold) 75%, var(--color-linen));
  }

  .story-scene__copy--split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    align-items: center;
    min-height: 40vh;
  }

  .story-scene__copy--split .story-scene__section-code {
    grid-column: 1 / -1;
  }

  .story-scene__line {
    margin: 0;
    font-family: var(--font-display);
    font-weight: var(--weight-black);
    font-size: clamp(1.35rem, 4.2vw, 3.2rem);
    line-height: 0.95;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-linen);
    opacity: 0;
    transform: translateY(1.2rem);
    filter: blur(8px);
    transition:
      opacity 0.9s var(--ease-ribbit),
      transform 0.9s var(--ease-ribbit),
      filter 0.9s var(--ease-ribbit);
  }

  .story-scene__line--on {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }

  .story-scene__line--left {
    text-align: left;
    justify-self: start;
    max-width: 14ch;
  }

  .story-scene__line--right {
    text-align: right;
    justify-self: end;
    max-width: 14ch;
  }

  .story-scene__copy--center {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .story-scene__copy--center :global(.story-scene__center-title) {
    margin: 0;
    max-width: 18ch;
    font-family: var(--font-display);
    font-weight: var(--weight-black);
    font-size: clamp(1.5rem, 4.8vw, 3.6rem);
    line-height: 0.95;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--color-linen);
  }

  .story-scene__center-body {
    margin: 0;
    max-width: 36rem;
    font-size: clamp(0.9rem, 1.8vw, 1.05rem);
    line-height: 1.55;
    color: color-mix(in srgb, var(--color-linen) 72%, transparent);
  }

  .story-scene__copy--stack {
    text-align: center;
  }

  .story-scene__stack-title {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(1.4rem, 4vw, 2.8rem);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-linen);
  }

  .story-scene__stack-body {
    margin: 0.75rem auto 0;
    max-width: 32rem;
    color: color-mix(in srgb, var(--color-linen) 70%, transparent);
    font-size: 0.95rem;
    line-height: 1.5;
  }

  @media (max-width: 720px) {
    .story-scene__copy--split {
      grid-template-columns: 1fr;
      text-align: center;
      gap: 1.5rem;
    }

    .story-scene__line--left,
    .story-scene__line--right {
      text-align: center;
      justify-self: center;
      max-width: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .story-scene__line {
      opacity: 1;
      transform: none;
      filter: none;
      transition: none;
    }

    .story-scene__img {
      transition: none;
    }
  }
</style>
