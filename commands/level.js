import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function level(json, env) {
	const { title, creator } = UTILS.options(json);

	const level = await UTILS.get_level(title, creator || '');
	if (level === null) return UTILS.error('Could not find a matching level');

	const url = CONFIG.LEVEL_URL + level.identifier;
	return UTILS.response(url);
}
