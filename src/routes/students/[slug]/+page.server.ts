import { error, redirect } from '@sveltejs/kit';
import { getShowcaseFromList, getBuiltinShowcaseBySlug } from '$lib/data/showcase-registry.js';
import { loadShowcases } from '$lib/data/cms.server';
import { STUDENT_BY_ID } from '$lib/data/people';

export const prerender = true;

export async function entries() {
	const showcases = await loadShowcases();
	const slugs = showcases.map((s) => ({ slug: s.slug }));
	const legacyIds = Object.keys(STUDENT_BY_ID).map((id) => ({ slug: id }));
	return [...slugs, ...legacyIds];
}

/** @param {import('./$types').PageServerLoadEvent} event */
export async function load({ params, parent }) {
	const legacy = STUDENT_BY_ID[params.slug];
	if (legacy && legacy.slug !== params.slug) {
		throw redirect(301, `/students/${legacy.slug}`);
	}

	const { showcases } = await parent();
	// Fallback ai dati builtin quando il CMS è vuoto (es. dev senza Sanity)
	const student = getShowcaseFromList(showcases, params.slug) ?? getBuiltinShowcaseBySlug(params.slug);
	if (!student) throw error(404, 'Studente non trovato');
	return { student };
}
