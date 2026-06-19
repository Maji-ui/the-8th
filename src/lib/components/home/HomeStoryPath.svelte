<script>
  import { onMount } from 'svelte';
  import MotionIgniteWords from '$lib/components/MotionIgniteWords.svelte';
  import { sectionProgress } from '$lib/utils/scroll-progress.js';
  import { pathImageLayers, pathSegmentState, pathCopyLayers } from '$lib/utils/path-segment.js';

  /** @type {{ id: string, title: string, body: string, image?: string, images?: string[], layout?: string, num?: string, code?: string }[]} */
  export let steps = [];

  /** @type {string} */
  export let bg = '#06060a';

  /** @type {number} */
  export let scrollVh = 2.2;

  /** @type {string} */
  export let sectionId = 'home-path';

  /** @type {HTMLElement | null} */
  export let sectionEl = null;

  let progress = 0;

  $: stepCount = steps.length;
  $: segmentState = pathSegmentState(progress, stepCount);
  $: activeIndex = segmentState.index;
  $: localProgress = segmentState.local;
  $: activeStep = steps[activeIndex] ?? steps[0];
  $: imageLayers = pathImageLayers(progress, stepCount);
  $: copyLayers = pathCopyLayers(progress, stepCount);
  $: scrubFill = stepCount > 0 ? ((activeIndex + localProgress) / stepCount) * 100 : 0;

  onMount(() => {
    let target = 0;
    let raf = 0;
    let reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const settle = () => {
      raf = 0;
      // Lerp verso il target: lo scrub diventa fluido invece di scattare frame-per-frame.
      const next = progress + (target - progress) * 0.16;
      if (Math.abs(target - next) < 0.0004) {
        progress = target;
        return;
      }
      progress = next;
      raf = requestAnimationFrame(settle);
    };

    const onScroll = () => {
      if (!sectionEl) return;
      target = sectionProgress(sectionEl.getBoundingClientRect(), scrollVh);
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
  id={sectionId}
  class="story-path"
  bind:this={sectionEl}
  style="--story-bg: {bg}; --story-scroll: {scrollVh}; --path-local: {localProgress}"
  aria-label="Percorso THE 8th"
>
  <div class="story-path__sticky">
    <div class="story-path__scrub" aria-hidden="true">
      <div class="story-path__scrub-bar">
        <span class="story-path__scrub-fill" style="width: {scrubFill}%"></span>
      </div>
      <span class="story-path__scrub-label">{activeStep?.num ?? '05'}</span>
    </div>

    <div class="story-path__numeral" aria-hidden="true">
      {#each steps as step, i (step.id)}
        <span
          class="story-path__numeral-digit"
          class:story-path__numeral-digit--on={i === activeIndex}
          style="--num-i: {i}"
        >
          {step.num ?? step.id}
        </span>
      {/each}
    </div>

    <div class="story-path__rail" aria-hidden="true">
      {#each steps as step, i}
        <span
          class="story-path__tick"
          class:story-path__tick--on={i <= activeIndex}
          class:story-path__tick--current={i === activeIndex}
          style="--tick-i: {i}; --tick-local: {i === activeIndex ? localProgress : i < activeIndex ? 1 : 0}"
        ></span>
      {/each}
    </div>

    <div class="story-path__media" aria-hidden="true">
      {#each steps as step, i (step.id)}
        {#if step.image ?? step.images?.[0]}
          {@const src = step.image ?? step.images?.[0]}
          {@const layer = imageLayers[i] ?? { opacity: 0, clip: 'inset(0 100% 0 0)', scale: 1, shiftY: 0, shiftX: 0, blur: 0, zIndex: i }}
          <div
            class="story-path__frame"
            style="
              opacity: {layer.opacity};
              z-index: {layer.zIndex};
              clip-path: {layer.clip};
              --path-scale: {layer.scale};
              --path-shift-y: {layer.shiftY}%;
              --path-shift-x: {layer.shiftX}%;
              --path-blur: {layer.blur}px;
            "
          >
            <img class="story-path__img" src={src} alt="" loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
          </div>
        {/if}
      {/each}
      <div class="story-path__grain" aria-hidden="true"></div>
      <div class="story-path__veil" class:story-path__veil--center={activeStep?.layout === 'center'}></div>
    </div>

    {#each steps as step, i (step.id)}
      {@const layer = copyLayers[i] ?? { opacity: i === 0 ? 1 : 0, drift: 0, reveal: i === 0 ? 1 : 0 }}
      <div
        class="story-path__copy story-path__copy--{step.layout ?? 'bottom-left'}"
        class:story-path__copy--active={i === activeIndex}
        style="
          opacity: {layer.opacity};
          z-index: {layer.zIndex ?? i + 1};
          --copy-drift: {layer.drift}rem;
          --copy-reveal: {layer.reveal};
          pointer-events: {layer.opacity > 0.6 ? 'auto' : 'none'};
        "
        aria-hidden={i === activeIndex ? undefined : 'true'}
      >
        <p class="story-path__code">{step.code ?? step.num ?? ''}</p>
        <MotionIgniteWords
          as="h2"
          className="story-path__title"
          text={step.title ?? ''}
          resetKey={i === activeIndex ? 1 : 0}
          delay={60}
        />
        <p class="story-path__body">{step.body ?? ''}</p>
      </div>
    {/each}
  </div>
</section>

<style>
  .story-path {
    position: relative;
    height: calc(var(--story-scroll) * 100svh);
    background: var(--story-bg);
    color: var(--color-linen);
  }

  .story-path__sticky {
    position: sticky;
    top: 0;
    height: 100svh;
    overflow: hidden;
    isolation: isolate;
  }

  .story-path__scrub {
    position: absolute;
    z-index: 6;
    top: calc(var(--site-header-offset, 5.75rem) + 0.35rem);
    left: var(--editorial-pad);
    right: var(--editorial-pad);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    pointer-events: none;
  }

  .story-path__scrub-bar {
    flex: 1;
    position: relative;
    height: 2px;
    background: color-mix(in srgb, var(--color-linen) 14%, transparent);
    overflow: hidden;
  }

  .story-path__scrub-fill {
    display: block;
    height: 100%;
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--accent-gold) 70%, transparent),
      var(--accent-gold)
    );
    box-shadow: 0 0 18px color-mix(in srgb, var(--accent-gold) 45%, transparent);
  }

  .story-path__scrub-label {
    font-family: var(--font-display);
    font-size: clamp(0.72rem, 1.2vw, 0.82rem);
    letter-spacing: 0.14em;
    color: color-mix(in srgb, var(--accent-gold) 88%, var(--color-linen));
    font-variant-numeric: tabular-nums;
  }

  .story-path__numeral {
    position: absolute;
    z-index: 2;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .story-path__numeral-digit {
    position: absolute;
    right: clamp(-0.08em, 2vw, 0.12em);
    top: 50%;
    transform: translateY(-50%) translateX(8%);
    font-family: var(--font-display);
    font-weight: var(--weight-black);
    font-size: clamp(9rem, 34vw, 22rem);
    line-height: 0.82;
    letter-spacing: -0.05em;
    color: transparent;
    -webkit-text-stroke: 1px color-mix(in srgb, var(--color-linen) 9%, transparent);
    opacity: 0;
    filter: blur(8px);
    transition:
      opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
      filter 0.9s cubic-bezier(0.16, 1, 0.3, 1),
      transform 1.1s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .story-path__numeral-digit--on {
    opacity: 0.42;
    filter: blur(0);
    transform: translateY(calc(-50% - var(--path-local, 0) * 4%)) translateX(0);
  }

  .story-path__rail {
    position: absolute;
    z-index: 5;
    left: var(--editorial-pad);
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .story-path__tick {
    position: relative;
    width: 1px;
    height: 1.4rem;
    background: color-mix(in srgb, var(--color-linen) 18%, transparent);
    transition: background 0.45s cubic-bezier(0.16, 1, 0.3, 1);
    overflow: hidden;
  }

  .story-path__tick::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: calc(var(--tick-local, 0) * 100%);
    background: var(--accent-gold);
    transition: height 0.1s linear;
  }

  .story-path__tick--on {
    height: 2rem;
  }

  .story-path__tick--current {
    width: 2px;
    box-shadow: 0 0 14px color-mix(in srgb, var(--accent-gold) 35%, transparent);
  }

  .story-path__media {
    position: absolute;
    inset: 0;
  }

  .story-path__frame {
    position: absolute;
    inset: -4%;
    will-change: clip-path, opacity, transform;
    transition: opacity 0.18s linear;
  }

  .story-path__img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    transform: scale(var(--path-scale, 1)) translate3d(var(--path-shift-x, 0), var(--path-shift-y, 0), 0);
    filter: blur(var(--path-blur, 0));
    will-change: transform, filter;
  }

  .story-path__grain {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    opacity: 0.07;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    mix-blend-mode: soft-light;
  }

  .story-path__veil {
    position: absolute;
    inset: 0;
    z-index: 3;
    pointer-events: none;
    background: linear-gradient(
      180deg,
      rgba(6, 6, 10, 0.35) 0%,
      rgba(6, 6, 10, 0.2) 38%,
      rgba(6, 6, 10, 0.88) 100%
    );
  }

  .story-path__veil--center {
    background:
      radial-gradient(
        ellipse 72% 58% at 50% 48%,
        rgba(6, 6, 10, 0.45) 0%,
        rgba(6, 6, 10, 0.78) 100%
      ),
      linear-gradient(180deg, rgba(6, 6, 10, 0.42) 0%, rgba(6, 6, 10, 0.72) 100%);
  }

  .story-path__copy {
    position: absolute;
    z-index: 4;
    padding: clamp(1.25rem, 3.5vh, 2rem) max(var(--editorial-pad), var(--chapter-index-safe, 3.75rem));
    max-width: min(38rem, 90vw);
    will-change: opacity, transform;
    transition: opacity 0.14s linear;
    transform: translate3d(0, var(--copy-drift, 0), 0);
  }

  .story-path__copy--bottom-left {
    left: 0;
    bottom: 0;
    text-align: left;
  }

  .story-path__copy--bottom-right {
    right: 0;
    bottom: 0;
    text-align: right;
  }

  .story-path__copy--top-right {
    right: 0;
    top: calc(var(--site-header-offset, 5.75rem) + 2.25rem);
    text-align: right;
    max-width: min(34rem, 82vw);
  }

  .story-path__copy--top-left {
    left: 0;
    top: calc(var(--site-header-offset, 5.75rem) + 2.25rem);
    text-align: left;
    max-width: min(34rem, 82vw);
  }

  .story-path__copy--center {
    left: 50%;
    top: 50%;
    transform: translate(-50%, calc(-50% + var(--copy-drift, 0)));
    text-align: center;
    max-width: min(36rem, 88vw);
  }

  .story-path__code {
    margin: 0 0 0.75rem;
    font-size: var(--type-label);
    letter-spacing: 0.12em;
    text-transform: none;
    color: color-mix(in srgb, var(--accent-gold) 82%, var(--color-linen));
    opacity: var(--copy-reveal, 1);
    transform: translate3d(0, calc((1 - var(--copy-reveal, 1)) * 1.25rem), 0);
    will-change: transform, opacity;
  }

  .story-path__copy .story-path__body {
    opacity: calc(var(--copy-reveal, 1) * var(--copy-reveal, 1));
    transform: translate3d(0, calc((1 - var(--copy-reveal, 1)) * 1.75rem), 0);
    clip-path: inset(0 0 calc((1 - var(--copy-reveal, 1)) * 100%) 0);
    will-change: transform, opacity, clip-path;
  }

  .story-path :global(.story-path__title) {
    margin: 0;
    font-family: var(--font-display);
    font-weight: var(--weight-black);
    font-size: clamp(2rem, 6.5vw, var(--type-section-title));
    line-height: 1.02;
    letter-spacing: -0.03em;
    text-transform: none;
    text-wrap: balance;
  }

  .story-path__body {
    margin: 1.1rem 0 0;
    max-width: 38rem;
    font-size: var(--editorial-body);
    line-height: 1.62;
    color: color-mix(in srgb, var(--color-linen) 78%, transparent);
    will-change: transform, opacity, clip-path;
  }

  .story-path__copy--center .story-path__body,
  .story-path__copy--top-right .story-path__body,
  .story-path__copy--bottom-right .story-path__body {
    margin-left: auto;
    margin-right: auto;
  }

  .story-path__copy--top-right .story-path__body,
  .story-path__copy--bottom-right .story-path__body {
    margin-left: auto;
  }

  @media (max-width: 720px) {
    .story-path__scrub {
      top: calc(var(--site-header-offset, 5.75rem) + 0.15rem);
    }

    .story-path__numeral-digit {
      font-size: clamp(6.5rem, 42vw, 11rem);
      right: -0.02em;
      opacity: 0;
    }

    .story-path__numeral-digit--on {
      opacity: 0.28;
    }

    .story-path__rail {
      top: auto;
      bottom: 38%;
      transform: none;
      flex-direction: row;
      left: var(--editorial-pad);
      right: var(--editorial-pad);
      justify-content: center;
    }

    .story-path__tick {
      width: 1.4rem;
      height: 1px;
    }

    .story-path__tick::after {
      left: 0;
      bottom: auto;
      top: 0;
      width: calc(var(--tick-local, 0) * 100%);
      height: 100%;
    }

    .story-path__tick--on {
      width: 2rem;
      height: 1px;
    }

    .story-path__copy--top-right,
    .story-path__copy--top-left {
      top: calc(var(--site-header-offset, 5.75rem) + 1.85rem);
      max-width: 92vw;
    }

    .story-path__copy--bottom-right {
      text-align: left;
      left: 0;
      right: auto;
    }

    .story-path__copy--center {
      top: auto;
      bottom: 28%;
      left: var(--editorial-pad);
      right: var(--editorial-pad);
      transform: none;
      text-align: left;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .story-path__img,
    .story-path__frame,
    .story-path__code,
    .story-path__body,
    .story-path__numeral-digit,
    .story-path__scrub-fill {
      transition: none;
      transform: none;
      filter: none;
      clip-path: none;
    }
  }
</style>
