<script>
  import { page } from '$app/stores';
  import { locale, t } from '$lib/i18n';
  import { buildStoryMentorsFromList } from '$lib/data/home-story-build.js';
  import HomeStoryTalents from './HomeStoryTalents.svelte';

  /** @type {string} */
  export let bg = '#14131a';

  /** @type {boolean} */
  export let showHead = true;

  /** @type {string} */
  export let sectionCode = '// 11';

  $: mentors = buildStoryMentorsFromList($page.data.mentors ?? [], $locale);
</script>

<HomeStoryTalents
  talents={mentors}
  {bg}
  {showHead}
  {sectionCode}
  sectionId="home-mentors"
  sectionTitle={$t('home.storyMentorsTitle')}
  sectionLede={$t('home.storyMentorsBody')}
  ctaHref="/mentors"
/>
