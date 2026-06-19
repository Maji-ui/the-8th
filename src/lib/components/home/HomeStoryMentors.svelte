<script>
  import { page } from '$app/stores';
  import { locale, t } from '$lib/i18n';
  import { buildStoryMentorsFromList } from '$lib/data/home-story-build.js';
  import { mentors as builtinMentors, mentorRole } from '$lib/data/mentors.js';
  import HomeStoryTalents from './HomeStoryTalents.svelte';

  /** @type {string} */
  export let bg = '#14131a';

  /** @type {boolean} */
  export let showHead = true;

  /** @type {string} */
  export let sectionCode = '// 11';

  /** Layout: 'grid' o 'list' (Ignite) */
  export let variant = 'grid';

  $: mentors = (() => {
    const fromCms = buildStoryMentorsFromList($page.data.mentors ?? [], $locale);
    if (fromCms.length) return fromCms;
    return builtinMentors.map((m) => ({
      slug: m.slug,
      name: m.name,
      project: mentorRole(m, $locale),
      href: `/mentors/${m.slug}`,
      cover: m.image ?? '',
      portrait: m.image ?? '',
      images: []
    }));
  })();
</script>

<HomeStoryTalents
  talents={mentors}
  {bg}
  {showHead}
  {sectionCode}
  {variant}
  sectionId="home-mentors"
  sectionTitle={$t('home.storyMentorsTitle')}
  sectionLede={$t('home.storyMentorsBody')}
  ctaHref="/mentors"
/>
