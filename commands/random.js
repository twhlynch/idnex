import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function random(json, env) {
	const { verified } = UTILS.options(json);

	const level = await UTILS.get_random_level(verified);
	if (!level) return UTILS.error('Failed to get level');

	const url = UTILS.level_url(level.identifier);
	if (!url) return UTILS.error('Failed to get level url');

	return UTILS.response(url);
}
