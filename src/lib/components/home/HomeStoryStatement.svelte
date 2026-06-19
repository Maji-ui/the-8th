<script>
  import { onMount } from 'svelte';
  import MotionWords from '$lib/components/MotionWords.svelte';
  import MotionBlock from '$lib/components/MotionBlock.svelte';

  /** @type {string} */
  export let code = '';

  /** @type {string} */
  export let title = '';

  /** @type {string} */
  export let body = '';

  /** @type {string} */
  export let bg = '#06060a';

  /** @type {'dark' | 'light'} */
  export let tone = 'dark';

  /** @type {number} */
  export let minVh = 1;

  /** @type {string} */
  export let sectionId = '';

  /** @type {HTMLElement} */
  let sectionEl;
  let scale = 0.92;
  let drift = 0;

  onMount(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      scale = 1;
      drift = 0;
      return;
    }

    const onScroll = () => {
      if (!sectionEl) return;
      const rect = sectionEl.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = rect.top + rect.height / 2;
      // rel = 0 quando la sezione è centrata, ±1 ai bordi viewport
      const rel = Math.max(-1, Math.min(1, (center - vh / 2) / vh));
      // zoom-on-scroll: il testo cresce avvicinandosi al centro
      scale = 1 - Math.abs(rel) * 0.09;
      drift = rel * -42;
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  });
</script>

<section
  id={sectionId || undefined}
  class="story-statement story-statement--{tone}"
  bind:this={sectionEl}
  style="--story-bg: {bg}; min-height: {minVh}svh"
>
  <div
    class="story-statement__inner"
    style="transform: translate3d(0, {drift}px, 0) scale({scale});"
  >
    {#if code}
      <p class="story-statement__code">{code}</p>
    {/if}
    <MotionWords as="h2" className="story-statement__title" text={title} delay={40} />
    {#if body}
      <MotionBlock delay={220}>
        <p class="story-statement__body">{body}</p>
      </MotionBlock>
    {/if}
    <slot />
  </div>
</section>

<style>
  .story-statement {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(5rem, 14vh, 8rem) var(--editorial-pad);
    background: var(--story-bg);
  }

  .story-statement--dark {
    color: var(--color-linen);
  }

  .story-statement--light {
    color: var(--color-amethyst);
  }

  .story-statement__inner {
    width: min(46rem, 100%);
    text-align: center;
    will-change: transform;
    transform-origin: center center;
  }

  .story-statement__code {
    margin: 0 0 1.25rem;
    font-family: var(--font-body);
    font-size: var(--type-label);
    letter-spacing: 0.04em;
    text-transform: none;
    opacity: 0.55;
  }

  .story-statement :global(.story-statement__title) {
    margin: 0;
    font-family: var(--font-display);
    font-weight: var(--weight-black);
    font-size: var(--type-section-title);
    line-height: 1.08;
    letter-spacing: -0.02em;
    text-transform: none;
    text-wrap: balance;
  }

  .story-statement__body {
    margin: 1.35rem auto 0;
    max-width: 40rem;
    font-size: var(--editorial-body);
    line-height: 1.62;
    opacity: 0.78;
  }

  .story-statement--light .story-statement__body {
    opacity: 0.72;
  }
</style>
