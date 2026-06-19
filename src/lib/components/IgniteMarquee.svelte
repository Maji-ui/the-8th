<script>
  import { onMount } from 'svelte';

  /** Testo ripetuto nel marquee */
  export let text = 'THE 8th';

  /** Velocità base in px/frame (segno = direzione) */
  export let speed = 1.1;

  /** Sfondo della striscia */
  export let bg = 'transparent';

  /** Stile testo: 'outline' (contorno) o 'solid' (pieno) */
  export let variant = 'outline';

  /** Mostra il pallino oro tra le parole */
  export let separator = true;

  /** @type {HTMLElement} */
  let track;
  /** @type {HTMLElement} */
  let groupA;

  const items = Array.from({ length: 8 });

  onMount(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let offset = 0;
    let groupWidth = 0;
    let boost = 0;
    let lastY = window.scrollY;
    let raf = 0;
    let dir = speed >= 0 ? 1 : -1;

    const measure = () => {
      groupWidth = groupA?.getBoundingClientRect().width ?? 0;
    };
    measure();
    window.addEventListener('resize', measure, { passive: true });

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      // lo scroll spinge il marquee: più scorri veloce, più accelera/inverte
      boost += delta * 0.35;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const frame = () => {
      if (groupWidth === 0) measure();
      boost *= 0.9; // decadimento dello slancio da scroll
      const base = reduce ? 0 : Math.abs(speed) * dir;
      offset -= base + boost;
      if (groupWidth > 0) {
        // wrap continuo e senza salti
        offset = ((offset % groupWidth) + groupWidth) % groupWidth;
      }
      if (track) track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', onScroll);
    };
  });
</script>

<div
  class="ignite-marquee ignite-marquee--{variant}"
  style="--marquee-bg: {bg};"
  aria-hidden="true"
>
  <div class="ignite-marquee__track" bind:this={track}>
    <div class="ignite-marquee__group" bind:this={groupA}>
      {#each items as _, i}
        <span class="ignite-marquee__word">{text}</span>
        {#if separator}<span class="ignite-marquee__dot">&bull;</span>{/if}
      {/each}
    </div>
    <div class="ignite-marquee__group" aria-hidden="true">
      {#each items as _, i}
        <span class="ignite-marquee__word">{text}</span>
        {#if separator}<span class="ignite-marquee__dot">&bull;</span>{/if}
      {/each}
    </div>
  </div>
</div>

<style>
  .ignite-marquee {
    position: relative;
    overflow: hidden;
    background: var(--marquee-bg, transparent);
    padding: clamp(0.6rem, 2.4vh, 1.6rem) 0;
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
    mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  }

  .ignite-marquee__track {
    display: flex;
    width: max-content;
    will-change: transform;
  }

  .ignite-marquee__group {
    display: flex;
    align-items: center;
    flex: none;
  }

  .ignite-marquee__word {
    font-family: var(--font-display, sans-serif);
    font-weight: var(--weight-black, 800);
    font-size: clamp(2.6rem, 9vw, 8.5rem);
    line-height: 1;
    letter-spacing: -0.03em;
    text-transform: uppercase;
    white-space: nowrap;
    padding: 0 0.18em;
  }

  .ignite-marquee--outline .ignite-marquee__word {
    color: transparent;
    -webkit-text-stroke: 1.5px color-mix(in srgb, var(--color-linen, #f3ead8) 32%, transparent);
  }

  .ignite-marquee--solid .ignite-marquee__word {
    color: var(--color-linen, #f3ead8);
  }

  .ignite-marquee--solid .ignite-marquee__word:nth-child(4n + 1) {
    color: var(--accent-gold, #d9b25a);
  }

  .ignite-marquee__dot {
    font-size: clamp(1.2rem, 3vw, 2.4rem);
    line-height: 1;
    color: var(--accent-gold, #d9b25a);
    padding: 0 0.1em;
    transform: translateY(-0.12em);
  }
</style>
