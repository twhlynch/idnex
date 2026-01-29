import { API_URL, LEVEL_URL } from '../config';
import * as UTILS from '../utils';

export const get_hardest: Command = async (json, _env) => {
	let { position, url } = UTILS.options<{ position: number; url: string }>(
		json,
	);
	if (!position && !url) return UTILS.error('One variable is required');

	const response = await fetch(`${API_URL}get_hardest_levels`);
	const list = await response.json<LevelDetails[]>();
	if (!list) return UTILS.error('Failed to get KV data');

	if (position !== undefined) {
		position = Math.min(Math.max(0, position - 1), list.length - 1);
	} else if (url) {
		const valid_url = url.includes('?level=');
		if (!valid_url) return UTILS.error('Invalid url');

		const id = url.split('?level=')[1].split('&')[0];
		position = list.findIndex((level) => level.level_id == id);
		if (position === -1) return UTILS.error('Level not found');
	}
	position = position ?? 0;

	const { title, creators, level_id } = list[position];
	const embed = {
		title: `#${position + 1} Hardest Level`,
		description: `**${title}** by ${creators}`,
		url: LEVEL_URL + level_id,
		color: 0xff0000,
	};

	return UTILS.response('', embed);
};
