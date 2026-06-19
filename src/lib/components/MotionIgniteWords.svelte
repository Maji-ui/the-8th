<script>
  import { tick } from 'svelte';
  import { browser } from '$app/environment';

  /** @type {string} */
  export let text = '';

  /** @type {keyof HTMLElementTagNameMap} */
  export let as = 'h2';

  /** @type {string} */
  export let className = '';

  /** @type {string} */
  export let id = '';

  /** @type {number} */
  export let delay = 0;

  /** Cambia per rianimare (es. indice step scroll). */
  export let resetKey = 0;

  let visible = false;
  let lastKey = /** @type {number | undefined} */ (undefined);

  $: words = text.trim() ? text.trim().split(/\s+/) : [];

  function reveal() {
    if (!browser) {
      visible = true;
      return;
    }
    visible = false;
    tick().then(() => {
      requestAnimationFrame(() => {
        visible = true;
      });
    });
  }

  $: if (resetKey !== lastKey) {
    lastKey = resetKey;
    reveal();
  }
</script>

<svelte:element
  this={as}
  {id}
  class="motion-ignite {className}"
  class:motion-ignite--visible={visible}
  style="--ignite-delay: {delay}ms"
  aria-label={text}
>
  {#each words as word, i (resetKey + '-' + i)}
    <span class="motion-ignite__word" aria-hidden="true" style="--i: {i}">
      <span class="motion-ignite__mask">
        <span class="motion-ignite__inner">{word}</span>
      </span>
    </span>{#if i < words.length - 1}{' '}{/if}
  {/each}
</svelte:element>

<style>
  .motion-ignite {
    margin: 0;
    font: inherit;
    color: inherit;
    line-height: inherit;
    letter-spacing: inherit;
    perspective: 900px;
  }

  .motion-ignite__word {
    display: inline-block;
    vertical-align: top;
    margin-right: 0.26em;
  }

  .motion-ignite__mask {
    display: inline-block;
    overflow: hidden;
    padding-bottom: 0.08em;
  }

  .motion-ignite__inner {
    display: inline-block;
    opacity: 0;
    filter: blur(14px);
    transform: translate3d(0, 115%, 0) rotateX(28deg);
    transform-origin: 50% 100%;
    transition:
      transform 1.05s cubic-bezier(0.16, 1, 0.3, 1)
        calc(var(--ignite-delay, 0ms) + var(--i, 0) * 68ms),
      opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1)
        calc(var(--ignite-delay, 0ms) + var(--i, 0) * 68ms),
      filter 1.15s cubic-bezier(0.16, 1, 0.3, 1)
        calc(var(--ignite-delay, 0ms) + var(--i, 0) * 68ms);
  }

  .motion-ignite--visible .motion-ignite__inner {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0) rotateX(0deg);
  }

  @media (prefers-reduced-motion: reduce) {
    .motion-ignite__inner {
      opacity: 1;
      filter: none;
      transform: none;
      transition: none;
    }
  }
</style>
