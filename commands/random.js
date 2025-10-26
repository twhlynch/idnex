import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function random(json, env) {
	const { verified } = UTILS.options(json);
	const level = await UTILS.get_random_level(verified);
	if (level === null) return UTILS.error('Failed to get level');

	return UTILS.response(CONFIG.LEVEL_URL + level.identifier);
}
