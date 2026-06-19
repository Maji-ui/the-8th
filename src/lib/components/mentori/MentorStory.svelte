<script>
  import PeopleProfileMeta from '$lib/components/story/PeopleProfileMeta.svelte';
  import PeopleProfileSplit from '$lib/components/story/PeopleProfileSplit.svelte';
  import StoryMentorNav from '$lib/components/story/StoryMentorNav.svelte';
  import HomeStoryNewsletter from '$lib/components/home/HomeStoryNewsletter.svelte';
  import HomeStoryFooter from '$lib/components/home/HomeStoryFooter.svelte';
  import { page } from '$app/stores';
  import {
    mentorRole,
    mentorBio,
    getMentorNeighborsFrom
  } from '$lib/data/mentors.js';
  import { mentorPortrait } from '$lib/data/mentor-media.js';
  import { roleKicker } from '$lib/people-format.js';
  import PageNav from '$lib/components/PageNav.svelte';
  import { trailMentor } from '$lib/navigation/trails.js';
  import { storyTones } from '$lib/data/home-story.js';
  import { locale, t } from '$lib/i18n';

  $: homeBack = { href: '/', label: $t('pages.backHome'), hint: $t('pages.backHomeHint') };

  /** @type {import('$lib/data/mentors.js').mentors[number]} */
  export let mentor;

  $: mentors = $page.data.mentors ?? [];
  $: editionPairs = $page.data.editionPairs ?? [];
  $: neighbors = getMentorNeighborsFrom(mentors, mentor.slug);
  $: pair = editionPairs.find((p) => p.mentorSlug === mentor.slug);
  $: index = neighbors.index >= 0 ? neighbors.index : 0;
  $: total = mentors.length;
  $: tag = `M.${String(index + 1).padStart(2, '0')}`;

  $: roleParts = mentorRole(mentor, $locale).split('·').map((s) => s.trim());
  $: roleLine = `| ${roleKicker(mentorRole(mentor, $locale))} · <strong>${roleParts.slice(1).join(' · ') || mentorRole(mentor, $locale)}</strong>`;

  $: actions = [
    ...(pair
      ? [
          {
            href: `/students/${pair.studentSlug}`,
            label: `${$t('people.studentLink')} — ${pair.studentName} →`
          }
        ]
      : []),
    ...(mentor.website
      ? [{ href: mentor.website, label: `${$t('people.website')} →`, external: true }]
      : [])
  ];

  $: portrait = mentorPortrait(mentor);
</script>

<svelte:head>
  <title>{mentor.name} · THE 8th</title>
</svelte:head>

<article class="story-page mentor-story">
  <PageNav crumbs={trailMentor(mentor.name)} back={homeBack} variant="story" />

  <PeopleProfileMeta
    trail="> {$t('people.mentorTrail')} {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}"
    aside="[ {$t('people.pairLabel')} · {String(index + 1).padStart(2, '0')} ]"
  />

  <PeopleProfileSplit
    image={portrait}
    imageAlt={mentor.name}
    imageSide="right"
    {tag}
    name={mentor.name}
    {roleLine}
    bio={mentorBio(mentor, $locale)}
    {actions}
  />

  <StoryMentorNav
    currentSlug={mentor.slug}
    bg={storyTones.charcoal}
    sectionCode="02 / 02"
    showFlow={false}
    peersOnly={true}
  />

  <HomeStoryNewsletter bg={storyTones.ash} wide />

  <HomeStoryFooter bg={storyTones.void} wide />
</article>
