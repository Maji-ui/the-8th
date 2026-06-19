<script>
  import MotionWords from '$lib/components/MotionWords.svelte';
  import MotionBlock from '$lib/components/MotionBlock.svelte';
  import IgniteList from '$lib/components/IgniteList.svelte';
  import { reveal } from '$lib/reveal';
  import { t } from '$lib/i18n';

  let gridIn = false;

  /** Layout: 'grid' (default) o 'list' (Ignite hover-reveal) */
  export let variant = 'grid';

  /** Etichetta CTA per riga nella variante list */
  export let listCue = '';

  /** @type {{ slug: string, name: string, project: string, href: string, portrait?: string, cover: string, images: string[] }[]} */
  export let talents = [];

  /** @type {string} */
  export let bg = '#0c0b10';

  /** @type {boolean} */
  export let showHead = true;

  /** @type {boolean} */
  export let showCta = true;

  /** @type {string} */
  export let sectionCode = '// 10';

  /** @type {string} */
  export let sectionTitle = '';

  /** @type {string} */
  export let sectionLede = '';

  /** @type {string} */
  export let sectionId = 'home-talents';

  /** @type {string} */
  export let ctaHref = '/students';

  $: titleText = sectionTitle || $t('home.talentsTitle');
  $: ledeText = sectionLede || $t('home.talentsLead');
  $: titleId = `${sectionId}-title`;
</script>

<section class="story-talents" id={sectionId} style="--story-bg: {bg}" aria-labelledby={titleId}>
  {#if showHead}
    <div class="story-talents__head story-editorial-head">
      <p class="story-talents__code story-editorial-head__code">{sectionCode}</p>
      <MotionWords
        as="h2"
        id={titleId}
        className="story-talents__title story-editorial-head__title"
        text={titleText}
      />
      <MotionBlock delay={140}>
        <p class="story-talents__lede story-editorial-head__lede">{ledeText}</p>
      </MotionBlock>
      {#if showCta}
        <a class="story-talents__cta" href={ctaHref}>{$t('home.exploreAll')}</a>
      {/if}
    </div>
  {/if}

  {#if variant === 'list'}
    <IgniteList
      cue={listCue || $t('home.exploreAll')}
      items={talents.map((tt) => ({
        href: tt.href,
        name: tt.name,
        meta: tt.project,
        image: tt.cover || tt.portrait
      }))}
    />
  {:else}
  <div
    class="story-talents__grid"
    use:reveal={{ variant: 'fade', threshold: 0.08, onInView: () => (gridIn = true) }}
  >
    {#each talents as talent, i (talent.href ?? talent.slug ?? i)}
      <a
        class="story-talents__card home-stagger"
        class:in-view={gridIn}
        style="--delay: {0.06 + i * 0.1}s"
        data-variant={i % 2 === 0 ? 'left' : 'right'}
        href={talent.href}
      >
        <div class="story-talents__visual">
          {#if talent.cover}
            <img class="story-talents__cover" src={talent.cover} alt="" loading="lazy" />
          {/if}
          {#if talent.portrait && talent.portrait !== talent.cover}
            <div class="story-talents__portrait">
              <img src={talent.portrait} alt="" loading="lazy" />
            </div>
          {/if}
        </div>
        {#if talent.images?.length > 1}
          <div class="story-talents__thumbs" aria-hidden="true">
            {#each talent.images.slice(0, 5) as src}
              <img src={src} alt="" loading="lazy" />
            {/each}
          </div>
        {/if}
        <div class="story-talents__meta">
          <p class="story-talents__name">{talent.name}</p>
          <p class="story-talents__project">{talent.project}</p>
        </div>
      </a>
    {/each}
  </div>
  {/if}
</section>
