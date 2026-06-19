<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import LocaleToggle from '$lib/components/LocaleToggle.svelte';
  import EightLoader from '$lib/components/EightLoader.svelte';
  import { isTalentiSection } from '$lib/data/talents.js';
  import { headerNavLinks, panelNavLinks } from '$lib/data/site-links.js';
  import { previewPoolForHref } from '$lib/data/header-previews.js';
  import { t } from '$lib/i18n';

  let menuOpen = false;
  let scrolled = false;
  let shell;
  let activePreviewHref = '/students';
  let previewIndex = 0;
  let previewTimer;
  $: path = $page.url.pathname;
  $: siteTalents = $page.data.talents ?? [];
  $: isHome = path === '/';
  $: menuLinks = panelNavLinks;
  $: currentPreview =
    menuLinks.find((link) => link.href === activePreviewHref) ?? menuLinks[0];
  $: previewSlides = previewPoolForHref(currentPreview?.href ?? '/students');
  $: previewCaption = currentPreview?.previewKey ? $t(currentPreview.previewKey) : '';
  $: if (previewIndex >= previewSlides.length) previewIndex = 0;
  $: if (typeof document !== 'undefined') {
    if (menuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }

  /** @param {string} href */
  function linkActive(href) {
    if (href === '/students') return isTalentiSection(path, siteTalents);
    if (href === '/mentors') return path === '/mentors' || path.startsWith('/mentors/');
    if (href === '/open-call') return path === '/open-call';
    if (href === '/contact') return path === '/contact';
    const base = href.split('#')[0];
    if (href.includes('#') && path === '/') return true;
    return path === base || path.startsWith(`${base}/`);
  }

  function toggleMenu() {
    menuOpen = !menuOpen;
    if (menuOpen) activePreviewHref = path.startsWith('/students/') ? '/students' : path.split('#')[0] || path;
  }

  function closeMenu() {
    menuOpen = false;
  }

  /** @param {MouseEvent} event */
  function onWindowClick(event) {
    if (!menuOpen || !shell) return;
    if (shell.contains(/** @type {Node} */ (event.target))) return;
    closeMenu();
  }

  onMount(() => {
    const desktopNav = window.matchMedia('(min-width: 1080px)');
    const onViewportChange = () => {
      if (desktopNav.matches) closeMenu();
    };
    desktopNav.addEventListener('change', onViewportChange);

    const onScroll = () => {
      scrolled = window.scrollY > 24;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      document.body.classList.remove('menu-open');
      clearInterval(previewTimer);
      desktopNav.removeEventListener('change', onViewportChange);
      window.removeEventListener('scroll', onScroll);
    };
  });

  $: {
    clearInterval(previewTimer);
    if (menuOpen && previewSlides.length > 1) {
      previewTimer = setInterval(() => {
        previewIndex = (previewIndex + 1) % previewSlides.length;
      }, 1700);
    }
  }

  /** Ritratto verticale → riempie la cornice orizzontale con crop centrato. */
  /** @param {HTMLImageElement} node */
  function headerPreviewFit(node) {
    const apply = () => {
      const { naturalWidth: w, naturalHeight: h } = node;
      if (!w || !h) return;
      const isPortrait = h > w * 1.02;
      if (isPortrait) {
        const tallness = h / w;
        const zoom = Math.min(1 + (tallness - 1) * 0.42, 1.85);
        node.style.setProperty('--header-img-zoom', zoom.toFixed(3));
        node.style.objectPosition = 'center center';
      } else {
        node.style.removeProperty('--header-img-zoom');
        node.style.objectPosition = w > h * 1.15 ? 'center center' : 'center 22%';
      }
    };
    if (node.complete && node.naturalWidth) apply();
    else node.addEventListener('load', apply, { once: true });
    return {
      destroy() {
        node.removeEventListener('load', apply);
      }
    };
  }
</script>

<svelte:window
  on:keydown={(e) => e.key === 'Escape' && closeMenu()}
  on:click={onWindowClick}
/>

<header
  class="site-header"
  class:site-header--open={menuOpen}
  class:site-header--home={isHome}
  class:site-header--scrolled={scrolled}
>
  <div class="site-header__shell" bind:this={shell}>
    <a class="site-header__logo" href="/" aria-label="THE 8th — home">THE 8th</a>
    <nav class="site-header__bar-nav" aria-label="Principale">
      {#each headerNavLinks as link}
        {#if !link.cta}
          <a
            class="site-header__bar-link"
            class:site-header__bar-link--active={linkActive(link.href)}
            href={link.href}
          >
            <span>{$t(link.key)}</span>
          </a>
        {/if}
      {/each}
    </nav>
    <div class="site-header__actions">
      {#each headerNavLinks as link}
        {#if link.cta}
          <a
            class="site-header__bar-link site-header__bar-link--cta"
            class:site-header__bar-link--active={linkActive(link.href)}
            href={link.href}
          >
            {$t(link.key)}
          </a>
        {/if}
      {/each}
      <div class="site-header__bar-locale">
        <LocaleToggle />
      </div>
      <button
        class="site-header__menu-btn"
        type="button"
        on:click={toggleMenu}
        aria-expanded={menuOpen}
        aria-label={menuOpen ? $t('nav.close') : $t('nav.menu')}
      >
        <span class="site-header__menu-icon" aria-hidden="true">
          <span></span><span></span><span></span>
        </span>
      </button>
    </div>
  </div>

  <aside
    class="site-header__panel"
    class:site-header__panel--open={menuOpen}
    aria-hidden={!menuOpen}
  >
    <div class="site-header__panel-head">
      <p class="site-header__panel-label">{$t('nav.panelNav')}</p>
      <div class="site-header__locale">
        <LocaleToggle onChange={closeMenu} />
      </div>
    </div>
    <div class="site-header__panel-preview" aria-hidden="true">
      {#if previewSlides.length}
        <div class="site-header__panel-carousel">
          {#each previewSlides as src, i}
            <article class="site-header__profile" class:site-header__profile--active={i === previewIndex}>
              <img src={src} alt="" use:headerPreviewFit />
            </article>
          {/each}
        </div>
        <div class="site-header__panel-caption">
          <p class="site-header__abstract-kicker">{currentPreview?.previewKicker}</p>
          <p class="site-header__abstract-body">{previewCaption}</p>
        </div>
      {:else}
        <div class="site-header__panel-abstract">
          <p class="site-header__abstract-kicker">{currentPreview?.previewKicker}</p>
          <p class="site-header__abstract-body">{previewCaption}</p>
          <EightLoader compact={true} story={true} section={$t('loading.default')} />
        </div>
      {/if}
    </div>
    <nav class="site-header__nav" aria-label="Principale">
      {#each menuLinks as link (link.key)}
        <a
          class="site-header__link"
          class:site-header__link--active={linkActive(link.href)}
          class:site-header__link--cta={link.cta}
          href={link.href}
          on:mouseenter={() => {
            activePreviewHref = link.href;
            previewIndex = 0;
          }}
          on:focus={() => {
            activePreviewHref = link.href;
            previewIndex = 0;
          }}
          on:click={closeMenu}
        >
          {$t(link.key)}
        </a>
      {/each}
    </nav>
  </aside>
</header>

<style>
  .site-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 200;
    display: flex;
    justify-content: center;
    padding: 0;
    pointer-events: none;
    background: transparent;
  }

  /* scrim morbido in cima: tiene leggibili logo e link sopra hero chiari/immagini */
  .site-header::before {
    content: '';
    position: absolute;
    inset: 0 0 auto 0;
    height: 6.5rem;
    background: linear-gradient(180deg, rgba(6, 6, 10, 0.55) 0%, transparent 100%);
    pointer-events: none;
    opacity: 1;
    transition: opacity 0.35s ease;
  }

  .site-header--scrolled::before,
  .site-header--open::before {
    opacity: 0;
  }

  .site-header__shell {
    --header-bar-text: #f4f3ee;
    --header-bar-muted: rgba(244, 243, 238, 0.7);
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: clamp(1rem, 3vw, 2.5rem);
    width: 100%;
    max-width: none;
    padding: clamp(0.7rem, 1.6vw, 1.05rem) clamp(1rem, 4vw, 2.75rem);
    color: var(--header-bar-text);
    background: transparent;
    border: 0;
    border-bottom: 1px solid transparent;
    border-radius: 0;
    box-shadow: none;
    transition:
      background 0.35s ease,
      border-color 0.35s ease,
      backdrop-filter 0.35s ease,
      padding 0.35s ease;
  }

  /* Stato scroll: la barra prende corpo (glass) */
  .site-header--scrolled .site-header__shell,
  .site-header--open .site-header__shell {
    background: rgba(8, 8, 12, 0.62);
    border-bottom-color: rgba(244, 243, 238, 0.12);
    backdrop-filter: blur(22px) saturate(1.25);
    -webkit-backdrop-filter: blur(22px) saturate(1.25);
    padding-top: clamp(0.55rem, 1.2vw, 0.8rem);
    padding-bottom: clamp(0.55rem, 1.2vw, 0.8rem);
  }

  .site-header--open .site-header__bar-nav,
  .site-header--open .site-header__bar-locale {
    display: none;
  }

  .site-header__logo {
    flex-shrink: 0;
    margin: 0;
    padding: 0;
    font-family: var(--font-display);
    font-size: clamp(1.2rem, 2vw, 1.55rem);
    font-weight: var(--weight-black, 800);
    letter-spacing: -0.02em;
    text-transform: none;
    text-decoration: none;
    color: var(--header-bar-text);
    line-height: 1;
  }

  .site-header__actions {
    display: flex;
    align-items: center;
    gap: clamp(0.5rem, 1.5vw, 1rem);
    margin-left: auto;
    flex-shrink: 0;
  }

  .site-header__bar-locale {
    display: none;
    --locale-border: rgba(244, 243, 238, 0.25);
    --locale-muted: rgba(244, 243, 238, 0.5);
    --locale-active: var(--color-linen);
  }

  .site-header__menu-btn {
    flex-shrink: 0;
    border: 1px solid rgba(244, 243, 238, 0.18);
    background: rgba(255, 255, 255, 0.08);
    color: var(--header-bar-text);
    border-radius: 999px;
    width: 2.5rem;
    height: 2.5rem;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: border-color 0.2s ease, background 0.2s ease;
  }

  .site-header__menu-btn:hover {
    border-color: rgba(244, 243, 238, 0.35);
    background: rgba(255, 255, 255, 0.14);
  }

  .site-header__menu-icon {
    display: inline-flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .site-header__menu-icon span {
    width: 0.86rem;
    height: 1px;
    background: var(--header-bar-text);
    transition: transform 0.2s ease, opacity 0.2s ease;
  }

  .site-header__menu-btn[aria-expanded='true'] .site-header__menu-icon span:nth-child(1) {
    transform: translateY(0.29rem) rotate(45deg);
  }

  .site-header__menu-btn[aria-expanded='true'] .site-header__menu-icon span:nth-child(2) {
    opacity: 0;
  }

  .site-header__menu-btn[aria-expanded='true'] .site-header__menu-icon span:nth-child(3) {
    transform: translateY(-0.29rem) rotate(-45deg);
  }

  .site-header__panel {
    pointer-events: none;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(34rem, 100vw);
    border-radius: 0;
    padding: 1.1rem;
    background: #06060a;
    border-left: 1px solid color-mix(in srgb, var(--color-linen) 12%, transparent);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    transform: translateX(1.2rem);
    opacity: 0;
    transition: opacity 0.28s ease, transform 0.28s var(--ease-out);
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    gap: 0.95rem;
  }

  .site-header--home .site-header__panel {
    background: #06060a;
  }

  .site-header__panel--open {
    pointer-events: auto;
    opacity: 1;
    transform: translateX(0);
  }

  .site-header__panel--open .site-header__link {
    animation: header-link-in 0.5s var(--ease-ribbit) both;
  }

  .site-header__panel--open .site-header__link:nth-child(1) {
    animation-delay: 0.04s;
  }
  .site-header__panel--open .site-header__link:nth-child(2) {
    animation-delay: 0.08s;
  }
  .site-header__panel--open .site-header__link:nth-child(3) {
    animation-delay: 0.12s;
  }
  .site-header__panel--open .site-header__link:nth-child(4) {
    animation-delay: 0.16s;
  }
  .site-header__panel--open .site-header__link:nth-child(5) {
    animation-delay: 0.2s;
  }
  .site-header__panel--open .site-header__link:nth-child(6) {
    animation-delay: 0.24s;
  }
  .site-header__panel--open .site-header__link:nth-child(7) {
    animation-delay: 0.28s;
  }
  .site-header__panel--open .site-header__link:nth-child(8) {
    animation-delay: 0.32s;
  }

  @keyframes header-link-in {
    from {
      opacity: 0;
      transform: translateX(12px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .site-header__panel--admin {
    width: min(40rem, 100vw);
    grid-template-rows: auto minmax(0, 1fr);
  }

  .site-header__panel-back {
    margin: 0;
    padding: 0;
    border: none;
    background: none;
    font-size: clamp(0.85rem, 1.4vw, 0.95rem);
    letter-spacing: 0.04em;
    text-transform: none;
    color: color-mix(in srgb, var(--color-linen) 72%, transparent);
    cursor: pointer;
  }

  .site-header__panel-back:hover {
    color: var(--accent-gold);
  }

  .site-header__panel-admin {
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .site-header__link--admin {
    margin-top: 0.35rem;
    text-align: left;
    border: 1px dashed color-mix(in srgb, var(--color-linen) 22%, transparent);
    color: color-mix(in srgb, var(--color-linen) 58%, transparent);
    cursor: pointer;
    font: inherit;
  }

  .site-header__link--admin:hover {
    color: var(--accent-gold);
    border-color: color-mix(in srgb, var(--accent-gold) 40%, transparent);
  }

  .site-header__panel-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(244, 243, 238, 0.14);
    padding-bottom: 0.75rem;
  }

  .site-header__panel-label {
    margin: 0;
    font-size: clamp(0.85rem, 1.4vw, 0.95rem);
    letter-spacing: 0.04em;
    text-transform: none;
    color: color-mix(in srgb, var(--accent-soft) 80%, transparent);
  }

  .site-header__bar-nav {
    display: none;
    align-items: center;
    justify-content: center;
    gap: clamp(0.25rem, 1.5vw, 1.5rem);
    flex: 1 1 auto;
    min-width: 0;
  }

  .site-header__bar-link {
    position: relative;
    padding: 0.4rem 0.25rem;
    font-family: var(--font-body);
    font-size: clamp(0.82rem, 0.95vw, 0.95rem);
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--header-bar-muted);
    white-space: nowrap;
    transition: color 0.25s ease;
  }

  /* underline animato in stile moderno/agency */
  .site-header__bar-link span {
    position: relative;
    display: inline-block;
  }

  .site-header__bar-link span::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -0.28rem;
    width: 100%;
    height: 1px;
    background: var(--accent-gold, #d9b25a);
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.4s cubic-bezier(0.76, 0, 0.24, 1);
  }

  .site-header__bar-link:hover span::after,
  .site-header__bar-link--active span::after {
    transform: scaleX(1);
    transform-origin: left;
  }

  .site-header__bar-link:hover,
  .site-header__bar-link--active {
    color: var(--header-bar-text);
  }

  .site-header__bar-link--active {
    color: var(--accent-gold);
  }

  .site-header__bar-link--cta {
    border: 1px solid color-mix(in srgb, var(--accent-gold) 55%, transparent);
    border-radius: 999px;
    padding: 0.5rem 1.25rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--header-bar-text);
    background: color-mix(in srgb, var(--accent-gold) 12%, transparent);
    transition: border-color 0.25s ease, background 0.25s ease, color 0.25s ease;
  }

  .site-header__bar-link--cta:hover,
  .site-header__bar-link--cta.site-header__bar-link--active {
    border-color: var(--accent-gold);
    background: var(--accent-gold);
    color: #08070b;
  }

  @media (min-width: 1080px) {
    .site-header__bar-nav {
      display: flex;
    }

    .site-header__bar-locale {
      display: inline-flex;
    }

    .site-header__menu-btn {
      display: none;
    }

    .site-header__panel {
      display: none;
    }
  }

  .site-header__panel-preview {
    position: relative;
    overflow: hidden;
    border-radius: 0;
    border: 1px solid color-mix(in srgb, var(--color-linen) 14%, transparent);
    background: #0a0a0e;
    aspect-ratio: 16 / 9;
    min-height: 0;
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
    isolation: isolate;
  }

  .site-header__panel-caption {
    position: relative;
    z-index: 2;
    padding: 0.65rem 0.75rem;
    background: #06060a;
    border-top: 1px solid color-mix(in srgb, var(--color-linen) 10%, transparent);
  }

  .site-header__panel-carousel {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .site-header__profile {
    position: absolute;
    inset: 0;
    margin: 0;
    opacity: 0;
    transition: opacity 0.35s ease;
    overflow: hidden;
  }

  .site-header__profile--active {
    opacity: 1;
  }

  .site-header__profile img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    transform: scale(var(--header-img-zoom, 1));
    transform-origin: center center;
    filter: saturate(1.12) contrast(1.05);
  }

  .site-header__panel-abstract {
    width: 100%;
    height: 100%;
    display: grid;
    align-content: center;
    gap: 0.45rem;
    padding: 0.9rem;
    background: #0a0a0e;
  }

  .site-header__abstract-kicker {
    margin: 0;
    font-size: clamp(0.85rem, 1.4vw, 0.95rem);
    letter-spacing: 0.04em;
    text-transform: none;
    color: var(--accent-gold);
  }

  .site-header__abstract-body {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(1rem, 2vw, 1.15rem);
    text-transform: none;
    line-height: 1.25;
    color: var(--color-linen);
  }

  .site-header__nav {
    display: flex;
    flex-direction: column;
    gap: 0.46rem;
    align-self: end;
    position: relative;
    z-index: 4;
    padding-top: 0.35rem;
    background: #06060a;
  }

  .site-header__link {
    font-family: var(--font-body);
    font-size: clamp(1.05rem, 2vw, 1.2rem);
    font-weight: var(--weight-medium);
    letter-spacing: 0.02em;
    text-transform: none;
    white-space: normal;
    line-height: 1.35;
    color: rgba(244, 243, 238, 0.82);
    transition: color 0.25s var(--ease-out), opacity 0.25s ease;
    padding: 0.58rem 0.72rem;
    border-radius: 0.8rem;
  }

  .site-header__link:hover {
    color: var(--color-linen);
    background: color-mix(in srgb, var(--color-linen) 8%, transparent);
  }

  .site-header__link--active {
    color: var(--accent-gold);
  }

  .site-header__link--cta {
    margin-top: 0.25rem;
    padding: 0.5rem 0.72rem;
    border: 1px solid color-mix(in srgb, var(--accent-gold) 45%, transparent);
    border-radius: 0;
    background: transparent;
    color: var(--color-linen);
  }

  .site-header__link--cta:hover {
    color: var(--color-linen);
    border-color: color-mix(in srgb, var(--accent-gold) 65%, transparent);
    background: color-mix(in srgb, var(--accent-gold) 10%, transparent);
  }

  .site-header__locale {
    flex-shrink: 0;
    --locale-border: rgba(244, 243, 238, 0.28);
    --locale-muted: rgba(244, 243, 238, 0.5);
    --locale-active: var(--color-linen);
  }

  :global(body.menu-open) {
    overflow: hidden;
  }

  @media (max-width: 720px) {
    .site-header__panel {
      width: 100vw;
      padding: 0.95rem;
    }
  }
</style>
