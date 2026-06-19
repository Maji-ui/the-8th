<script>
  import { onMount } from 'svelte';

  let enabled = false;
  let hovering = false;
  let pressed = false;
  /** @type {string} */
  let label = '';

  /** @type {HTMLElement} */
  let dot;
  /** @type {HTMLElement} */
  let ring;

  onMount(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer) return;

    enabled = true;
    document.body.classList.add('ignite-cursor-on');

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let dx = mx;
    let dy = my;
    let raf = 0;

    // Target magnetico verso il centro dell'elemento sotto al cursore.
    let magnetEl = /** @type {HTMLElement | null} */ (null);

    const frame = () => {
      // ring insegue morbido, dot più reattivo → senso di "elastico"
      const ringLerp = reduce ? 1 : 0.18;
      const dotLerp = reduce ? 1 : 0.55;

      let tx = mx;
      let ty = my;
      if (magnetEl) {
        const r = magnetEl.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        // attrazione parziale verso il centro dell'elemento
        tx = mx + (cx - mx) * 0.35;
        ty = my + (cy - my) * 0.35;
      }

      rx += (tx - rx) * ringLerp;
      ry += (ty - ry) * ringLerp;
      dx += (mx - dx) * dotLerp;
      dy += (my - dy) * dotLerp;

      if (ring) ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      if (dot) dot.style.transform = `translate3d(${dx}px, ${dy}px, 0) translate(-50%, -50%)`;

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onMove = (/** @type {MouseEvent} */ e) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const interactiveSel = 'a, button, input, textarea, select, label, [role="button"], [data-cursor]';

    const onOver = (/** @type {MouseEvent} */ e) => {
      const el = /** @type {HTMLElement} */ (e.target);
      const hit = el?.closest?.(interactiveSel);
      if (hit instanceof HTMLElement) {
        hovering = true;
        label = hit.getAttribute('data-cursor') ?? '';
        // magnetismo solo su bersagli "compatti" (bottoni/link), non blocchi enormi
        const r = hit.getBoundingClientRect();
        magnetEl = r.width < 360 && r.height < 200 ? hit : null;
      } else {
        hovering = false;
        label = '';
        magnetEl = null;
      }
    };

    const onDown = () => (pressed = true);
    const onUp = () => (pressed = false);
    const onLeave = () => {
      if (ring) ring.style.opacity = '0';
      if (dot) dot.style.opacity = '0';
    };
    const onEnter = () => {
      if (ring) ring.style.opacity = '';
      if (dot) dot.style.opacity = '';
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    return () => {
      cancelAnimationFrame(raf);
      document.body.classList.remove('ignite-cursor-on');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
    };
  });
</script>

{#if enabled}
  <div class="ignite-cursor" aria-hidden="true">
    <div
      class="ignite-cursor__ring"
      class:ignite-cursor__ring--hover={hovering}
      class:ignite-cursor__ring--press={pressed}
      class:ignite-cursor__ring--label={!!label}
      bind:this={ring}
    >
      {#if label}<span class="ignite-cursor__label">{label}</span>{/if}
    </div>
    <div class="ignite-cursor__dot" class:ignite-cursor__dot--hover={hovering} bind:this={dot}></div>
  </div>
{/if}

<style>
  .ignite-cursor {
    position: fixed;
    inset: 0;
    z-index: 9999;
    pointer-events: none;
  }

  .ignite-cursor__ring,
  .ignite-cursor__dot {
    position: fixed;
    top: 0;
    left: 0;
    border-radius: 999px;
    will-change: transform, width, height, opacity;
  }

  .ignite-cursor__ring {
    width: 2.4rem;
    height: 2.4rem;
    border: 1px solid color-mix(in srgb, var(--accent-gold, #d9b25a) 75%, transparent);
    display: grid;
    place-items: center;
    transition:
      width 0.32s cubic-bezier(0.16, 1, 0.3, 1),
      height 0.32s cubic-bezier(0.16, 1, 0.3, 1),
      background-color 0.32s ease,
      border-color 0.32s ease,
      opacity 0.3s ease;
  }

  .ignite-cursor__ring--hover {
    width: 4rem;
    height: 4rem;
    border-color: color-mix(in srgb, var(--accent-gold, #d9b25a) 90%, transparent);
    background: color-mix(in srgb, var(--accent-gold, #d9b25a) 12%, transparent);
    backdrop-filter: invert(0.04);
  }

  .ignite-cursor__ring--label {
    width: 6rem;
    height: 6rem;
    background: color-mix(in srgb, var(--accent-gold, #d9b25a) 92%, transparent);
    border-color: transparent;
  }

  .ignite-cursor__ring--press {
    width: 1.8rem;
    height: 1.8rem;
  }

  .ignite-cursor__label {
    font-family: var(--font-display, sans-serif);
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #08070b;
    text-align: center;
    line-height: 1;
  }

  .ignite-cursor__dot {
    width: 6px;
    height: 6px;
    background: var(--accent-gold, #d9b25a);
    transition:
      opacity 0.3s ease,
      width 0.3s ease,
      height 0.3s ease;
  }

  .ignite-cursor__dot--hover {
    width: 0;
    height: 0;
  }
</style>
