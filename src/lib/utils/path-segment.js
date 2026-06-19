/** @param {number} t */
function smoothstep(t) {
	return t * t * (3 - 2 * t);
}

/**
 * Stato visivo per ogni layer immagine nel percorso 05–08.
 * @param {number} progress 0–1 sull’intera sezione
 * @param {number} stepCount
 */
export function pathImageLayers(progress, stepCount) {
	if (stepCount <= 0) return [];

	const segment = 1 / stepCount;
	const fade = segment * 0.2;

	return Array.from({ length: stepCount }, (_, i) => {
		const start = i * segment;
		const end = (i + 1) * segment;
		const local = Math.min(1, Math.max(0, (progress - start) / segment));

		let opacity = 0;
		if (progress >= start - fade && progress <= end + fade) {
			if (progress < start + fade) {
				opacity = smoothstep((progress - (start - fade)) / (fade * 2));
			} else if (progress > end - fade) {
				opacity = 1 - smoothstep((progress - (end - fade)) / (fade * 2));
			} else {
				opacity = 1;
			}
		}

		const reveal = Math.min(1, local / 0.38);
		const wipeFromLeft = i % 2 === 0;
		const hidden = (1 - reveal) * 100;
		const clip = wipeFromLeft ? `inset(0 ${hidden}% 0 0)` : `inset(0 0 0 ${hidden}%)`;

		const scale = 1.2 - local * 0.16;
		const shiftY = (local - 0.5) * 9;
		const shiftX = wipeFromLeft ? (1 - reveal) * -5 : (1 - reveal) * 5;
		const blur = Math.max(0, (1 - opacity) * 12 + (1 - reveal) * 7);

		return {
			opacity,
			clip,
			scale,
			shiftY,
			shiftX,
			blur,
			zIndex: i + 1,
			local
		};
	});
}

/**
 * Stato per ogni blocco di copy (testo) del percorso: crossfade + parallax,
 * così i passaggi tra capitoli non "saltano" da un angolo all'altro.
 * @param {number} progress 0–1 sull’intera sezione
 * @param {number} stepCount
 */
export function pathCopyLayers(progress, stepCount) {
	if (stepCount <= 0) return [];

	const segment = 1 / stepCount;
	const fade = segment * 0.3;

	return Array.from({ length: stepCount }, (_, i) => {
		const start = i * segment;
		const end = (i + 1) * segment;
		const local = Math.min(1, Math.max(0, (progress - start) / segment));

		const inFadeIn = progress < start + fade;
		const inFadeOut = progress > end - fade;

		let opacity;
		if (progress < start - fade || progress > end + fade) {
			opacity = 0;
		} else if (inFadeIn && i > 0) {
			opacity = smoothstep((progress - (start - fade)) / (fade * 2));
		} else if (inFadeOut && i < stepCount - 1) {
			opacity = 1 - smoothstep((progress - (end - fade)) / (fade * 2));
		} else {
			opacity = 1;
		}

		// Drift verticale: entra dal basso, scivola verso l'alto uscendo (parallax).
		const drift = (local - 0.5) * 2.6;
		const reveal = smoothstep(Math.min(1, local / 0.34));

		return { opacity, local, drift, reveal, zIndex: i + 1 };
	});
}

/**
 * @param {number} progress
 * @param {number} stepCount
 */
export function pathSegmentState(progress, stepCount) {
	if (stepCount <= 0) {
		return { index: 0, local: 0, segment: 1 };
	}

	const segment = 1 / stepCount;
	const index = Math.min(stepCount - 1, Math.max(0, Math.floor(progress / segment)));
	const local = Math.min(1, Math.max(0, (progress - index * segment) / segment));

	return { index, local, segment };
}
