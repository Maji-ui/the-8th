import { filterMediaList, isMediaUrl, uniqueUrls } from './media-urls.js';
import { mentorRole } from './mentors.js';
import { mentorPortrait } from './mentor-media.js';

/**
 * Card home / lista talenti — solo dati showcase da Sanity.
 * @param {import('./cms.server').CmsShowcase[]} showcases
 */
export function buildStoryTalentsFromShowcases(showcases) {
	return showcases.map((talent) => {
		const images = uniqueUrls([
			...filterMediaList(talent.finished),
			...filterMediaList(talent.sketch),
			...filterMediaList(talent.concept),
			...filterMediaList(talent.vetrina)
		]);
		const portrait = talent.portrait && isMediaUrl(talent.portrait) ? talent.portrait : '';
		const cover = portrait || images[0] || '';

		return {
			slug: talent.slug,
			name: talent.name,
			project: talent.project ?? '',
			href: `/students/${talent.slug}`,
			portrait,
			cover,
			images
		};
	});
}

/**
 * Card home / lista mentor — stessa forma delle card talenti.
 * @param {import('./cms.server').CmsMentor[]} mentors
 * @param {'it' | 'en'} [locale]
 */
export function buildStoryMentorsFromList(mentors, locale = 'it') {
	return mentors.map((mentor) => {
		const portrait = mentorPortrait(mentor);

		return {
			slug: mentor.slug,
			name: mentor.name,
			project: mentorRole(mentor, locale),
			href: `/mentors/${mentor.slug}`,
			portrait,
			cover: portrait,
			images: portrait ? [portrait] : []
		};
	});
}
