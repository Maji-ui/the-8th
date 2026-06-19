import { isPlaceholder } from './placeholders.js';

/** URL locale (/students, /mentors, …) o CDN Sanity / HTTPS. */
export function isMediaUrl(src) {
	if (!src || isPlaceholder(src)) return false;
	if (src.startsWith('/')) return true;
	return /^https?:\/\//i.test(src);
}

/** @deprecated Usa isMediaUrl */
export function isStudentAsset(src) {
	return isMediaUrl(src) && (src.startsWith('/students/') || /^https?:\/\//i.test(src));
}

/** @param {unknown} item */
export function toMediaSrc(item) {
	if (!item) return null;
	if (typeof item === 'string') return item;
	if (typeof item === 'object' && item && 'src' in item) {
		return /** @type {{ src: string }} */ (item).src;
	}
	return null;
}

/** @param {unknown} item */
export function toHoverSrc(item) {
	if (item && typeof item === 'object' && 'hover' in item) {
		return /** @type {{ hover?: string }} */ (item).hover ?? null;
	}
	return null;
}

/** @param {unknown[]} list */
export function uniqueUrls(list) {
	const urls = list.map(toMediaSrc).filter((src) => typeof src === 'string');
	return [...new Set(urls.filter((src) => isMediaUrl(src)))];
}

/** @param {string[] | { src: string; hover?: string }[] | undefined} list */
export function filterMediaList(list) {
	/** @type {string[]} */
	const out = [];
	for (const item of list ?? []) {
		const src = toMediaSrc(item);
		const hover = toHoverSrc(item);
		if (src && isMediaUrl(src)) out.push(src);
		if (hover && isMediaUrl(hover)) out.push(hover);
	}
	return uniqueUrls(out);
}

/**
 * Preferisce array CMS; se vuoto usa fallback statico.
 * @param {unknown[] | undefined} cmsList
 * @param {string[]} staticList
 */
export function mediaUrlsOrFallback(cmsList, staticList) {
	const cms = filterMediaList(cmsList);
	return cms.length ? cms : staticList;
}
