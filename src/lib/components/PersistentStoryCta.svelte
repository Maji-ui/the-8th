<script>
  import { page } from '$app/stores';
  import { t } from '$lib/i18n';

  $: hidden = $page.url.pathname === '/open-call';
</script>

{#if !hidden}
  <aside class="persistent-cta" aria-label={$t('nav.persistentCtaAria')}>
    <a class="persistent-cta__primary" href="/open-call">{$t('nav.candidature')}</a>
    <a class="persistent-cta__secondary" href="/editions/september">
      {$t('home.collectionCta')}
    </a>
  </aside>
{/if}

<style>
  .persistent-cta {
    position: fixed;
    bottom: clamp(0.85rem, 2.5vh, 1.35rem);
    left: 50%;
    z-index: 175;
    transform: translateX(-50%);
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.45rem;
    padding: 0.35rem;
    border-radius: 999px;
    background: color-mix(in srgb, #06060a 82%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-linen) 14%, transparent);
    backdrop-filter: blur(16px) saturate(1.15);
    -webkit-backdrop-filter: blur(16px) saturate(1.15);
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.28);
    pointer-events: auto;
  }

  .persistent-cta a {
    border-radius: 999px;
    padding: 0.52rem 0.95rem;
    font-size: var(--type-link);
    letter-spacing: 0.02em;
    text-transform: none;
    white-space: nowrap;
    transition:
      transform 0.24s var(--ease-ribbit),
      background 0.24s ease,
      border-color 0.24s ease;
  }

  .persistent-cta a:hover {
    transform: translateY(-2px);
  }

  .persistent-cta__primary {
    border: 1px solid color-mix(in srgb, var(--accent-gold) 60%, transparent);
    background: color-mix(in srgb, var(--accent-gold) 16%, transparent);
    color: var(--color-linen);
  }

  .persistent-cta__primary:hover {
    border-color: var(--accent-gold);
    background: color-mix(in srgb, var(--accent-gold) 24%, transparent);
  }

  .persistent-cta__secondary {
    border: 1px solid color-mix(in srgb, var(--color-linen) 22%, transparent);
    background: transparent;
    color: color-mix(in srgb, var(--color-linen) 88%, transparent);
  }

  .persistent-cta__secondary:hover {
    border-color: color-mix(in srgb, var(--color-linen) 38%, transparent);
    background: color-mix(in srgb, var(--color-linen) 8%, transparent);
  }

  @media (max-width: 640px) {
    :global(:root) {
      --persistent-cta-safe: 7.75rem;
    }

    .persistent-cta {
      flex-direction: column;
      align-items: stretch;
      width: min(18.5rem, calc(100vw - 1.5rem));
      padding: 0;
      gap: 0.5rem;
      border: none;
      border-radius: 0;
      background: transparent;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      box-shadow: none;
    }

    .persistent-cta a {
      text-align: center;
      white-space: normal;
      padding: 0.62rem 1rem;
    }

    .persistent-cta__secondary {
      background: color-mix(in srgb, #06060a 82%, transparent);
      backdrop-filter: blur(16px) saturate(1.15);
      -webkit-backdrop-filter: blur(16px) saturate(1.15);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
    }
  }
</style>
