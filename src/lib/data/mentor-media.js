/** Ritratto mentor — solo da Sanity (campo portrait in Studio). */
/** @param {{ image?: string, portrait?: string }} mentor */
export function mentorPortrait(mentor) {
	return mentor.image || mentor.portrait || '';
}
