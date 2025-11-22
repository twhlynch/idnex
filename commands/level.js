import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function level(json, env) {
	const { title, creator } = UTILS.options(json);
	if (!title) return UTILS.error('`title` is required');

	const level = await UTILS.get_level(title, creator);
	if (!level) return UTILS.error('Failed to find a matching level');

	const url = UTILS.level_url(level.identifier);
	if (!url) return UTILS.error('Failed to get level url');

	return UTILS.response(url);
}
