<script>
  import PeoplePageHead from '$lib/components/story/PeoplePageHead.svelte';
  import HomeStoryMentors from '$lib/components/home/HomeStoryMentors.svelte';
  import HomeStoryNewsletter from '$lib/components/home/HomeStoryNewsletter.svelte';
  import HomeStoryFooter from '$lib/components/home/HomeStoryFooter.svelte';
  import { storyTones } from '$lib/data/home-story.js';
  import { t } from '$lib/i18n';

  $: homeBack = { href: '/', label: $t('pages.backHome'), hint: $t('pages.backHomeHint') };
</script>

<svelte:head>
  <title>{$t('pages.mentorsTitle')} · THE 8th</title>
</svelte:head>

<article class="story-page mentors-story">
  <PeoplePageHead
    code="05 · {$t('nav.mentors')}"
    title={$t('pages.mentorsTitle')}
    lede={$t('pages.mentorsLede')}
    back={homeBack}
  />

  <HomeStoryMentors bg={storyTones.charcoal} showHead={false} />

  <HomeStoryNewsletter bg={storyTones.ash} wide />

  <HomeStoryFooter bg={storyTones.void} wide />
</article>
