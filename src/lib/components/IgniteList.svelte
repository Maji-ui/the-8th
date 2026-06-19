<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  /** @type {{ href: string, name: string, meta?: string, image?: string }[]} */
  export let items = [];

  /** Etichetta CTA per riga (es. "Scopri") */
  export let cue = '';

  let activeIndex = -1;
  /** @type {HTMLElement} */
  let preview;

  let pointerX = 0;
  let pointerY = 0;
  let px = 0;
  let py = 0;

  onMount(() => {
    if (!browser) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine) return;

    let raf = 0;
    const frame = () => {
      const lerp = reduce ? 1 : 0.16;
      px += (pointerX - px) * lerp;
      py += (pointerY - py) * lerp;
      if (preview) preview.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onMove = (/** @type {MouseEvent} */ e) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
    };
  });

  const pad = (/** @type {number} */ n) => String(n + 1).padStart(2, '0');
</script>

<div class="ignite-list" class:ignite-list--active={activeIndex >= 0}>
  <div
    class="ignite-list__preview"
    class:ignite-list__preview--on={activeIndex >= 0}
    bind:this={preview}
    aria-hidden="true"
  >
    {#each items as item, i}
      {#if item.image}
        <img
          src={item.image}
          alt=""
          class="ignite-list__preview-img"
          class:ignite-list__preview-img--on={i === activeIndex}
          loading="lazy"
        />
      {/if}
    {/each}
  </div>

  <ul class="ignite-list__rows">
    {#each items as item, i (item.href ?? i)}
      <li class="ignite-list__row" class:ignite-list__row--dim={activeIndex >= 0 && activeIndex !== i}>
        <a
          class="ignite-list__link"
          href={item.href}
          on:mouseenter={() => (activeIndex = i)}
          on:mouseleave={() => (activeIndex = -1)}
          on:focus={() => (activeIndex = i)}
          on:blur={() => (activeIndex = -1)}
        >
          <span class="ignite-list__index">{pad(i)}</span>
          <span class="ignite-list__name">{item.name}</span>
          {#if item.meta}<span class="ignite-list__meta">{item.meta}</span>{/if}
          <span class="ignite-list__cue">{cue}<span class="ignite-list__arrow">→</span></span>
        </a>
      </li>
    {/each}
  </ul>
</div>

<style>
  .ignite-list {
    position: relative;
    width: 100%;
  }

  .ignite-list__rows {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid color-mix(in srgb, var(--color-linen) 16%, transparent);
  }

  .ignite-list__row {
    border-bottom: 1px solid color-mix(in srgb, var(--color-linen) 16%, transparent);
    transition: opacity 0.4s var(--ease-ribbit, ease);
  }

  .ignite-list__row--dim {
    opacity: 0.32;
  }

  .ignite-list__link {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    align-items: baseline;
    gap: clamp(1rem, 4vw, 3rem);
    padding: clamp(1.1rem, 3.2vw, 2.4rem) 0.25rem;
    color: var(--color-linen);
    text-decoration: none;
    position: relative;
    isolation: isolate;
  }

  /* riempimento oro che sale in hover */
  .ignite-list__link::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: color-mix(in srgb, var(--accent-gold, #d9b25a) 10%, transparent);
    transform: scaleY(0);
    transform-origin: bottom;
    transition: transform 0.45s var(--ease-ribbit, cubic-bezier(0.16, 1, 0.3, 1));
  }

  .ignite-list__link:hover::before,
  .ignite-list__link:focus-visible::before {
    transform: scaleY(1);
  }

  .ignite-list__index {
    font-family: var(--font-mono, monospace);
    font-size: var(--type-label, 0.75rem);
    letter-spacing: 0.1em;
    color: color-mix(in srgb, var(--accent-gold, #d9b25a) 85%, var(--color-linen));
    font-variant-numeric: tabular-nums;
  }

  .ignite-list__name {
    font-family: var(--font-display, sans-serif);
    font-weight: var(--weight-black, 800);
    font-size: clamp(2rem, 7vw, 5.5rem);
    line-height: 0.98;
    letter-spacing: -0.03em;
    text-transform: uppercase;
    transition:
      transform 0.45s var(--ease-ribbit, cubic-bezier(0.16, 1, 0.3, 1)),
      color 0.35s ease;
  }

  .ignite-list__link:hover .ignite-list__name,
  .ignite-list__link:focus-visible .ignite-list__name {
    transform: translateX(clamp(0.6rem, 2vw, 1.6rem));
    color: var(--accent-gold, #d9b25a);
  }

  .ignite-list__meta {
    justify-self: end;
    max-width: 22ch;
    text-align: right;
    font-size: var(--type-link, 0.95rem);
    letter-spacing: 0.01em;
    color: color-mix(in srgb, var(--color-linen) 60%, transparent);
  }

  .ignite-list__cue {
    justify-self: end;
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    font-size: var(--type-label, 0.75rem);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--color-linen) 55%, transparent);
    opacity: 0;
    transform: translateX(-0.6rem);
    transition:
      opacity 0.35s ease,
      transform 0.4s var(--ease-ribbit, ease);
  }

  .ignite-list__link:hover .ignite-list__cue,
  .ignite-list__link:focus-visible .ignite-list__cue {
    opacity: 1;
    transform: translateX(0);
    color: var(--accent-gold, #d9b25a);
  }

  .ignite-list__arrow {
    display: inline-block;
    transition: transform 0.4s var(--ease-ribbit, ease);
  }

  .ignite-list__link:hover .ignite-list__arrow {
    transform: translateX(0.3rem);
  }

  /* immagine che insegue il cursore */
  .ignite-list__preview {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 40;
    width: clamp(13rem, 22vw, 20rem);
    aspect-ratio: 4 / 5;
    pointer-events: none;
    opacity: 0;
    border-radius: 2px;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(6, 6, 10, 0.5);
    transition: opacity 0.3s ease;
    will-change: transform, opacity;
  }

  .ignite-list__preview--on {
    opacity: 1;
  }

  .ignite-list__preview-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transform: scale(1.08);
    transition:
      opacity 0.45s var(--ease-ribbit, ease),
      transform 0.6s var(--ease-ribbit, ease);
  }

  .ignite-list__preview-img--on {
    opacity: 1;
    transform: scale(1);
  }

  @media (max-width: 720px) {
    .ignite-list__link {
      grid-template-columns: auto 1fr;
      gap: 0.6rem 1rem;
      align-items: center;
    }

    .ignite-list__meta {
      grid-column: 2;
      justify-self: start;
      text-align: left;
    }

    .ignite-list__cue {
      display: none;
    }

    /* su touch mostriamo comunque una piccola thumb inline */
    .ignite-list__preview {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ignite-list__name,
    .ignite-list__cue,
    .ignite-list__arrow,
    .ignite-list__link::before,
    .ignite-list__preview-img {
      transition: none;
    }
  }
</style>
