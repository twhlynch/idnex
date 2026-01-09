import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function get_hardest(json, env) {
	let { position, url } = UTILS.options(json);
	if (!position && !url) return UTILS.error('One variable is required');

	const response = await fetch(`${CONFIG.API_URL}get_hardest_levels`);
	const list = await response.json();
	if (!list) return UTILS.error('Failed to get KV data');

	if (position < 1) position = 1; // done first so its truthy

	if (position) {
		position = Math.min(list.length - 1, position - 1);
	} else if (url) {
		const valid_url = url.includes('?level=');
		if (!valid_url) return UTILS.error('Invalid url');

		const id = url.split('?level=')[1].split('&')[0];
		position = list.findIndex((level) => level.level_id == id);
		if (position === -1) return UTILS.error('Level not found');
	}

	const { title, creators, level_id } = list[position];
	const embed = {
		title: `#${position + 1} Hardest Level`,
		description: `**${title}** by ${creators}`,
		url: CONFIG.LEVEL_URL + level_id,
		color: 0xff0000,
	};

	return UTILS.response('', embed);
}
