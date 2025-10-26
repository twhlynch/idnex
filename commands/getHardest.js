import CONFIG from '../config.js';
import UTILS from '../utils.js';

const KV_KEY = 'list';

export default async function getHardest(json, env) {
	const list = await env.NAMESPACE.get(KV_KEY);
	if (!list) return UTILS.error('Error getting list');

	const data = JSON.parse(list);

	let { position, url } = UTILS.options(json);

	if (position !== undefined) {
		position = Math.min(data.length - 1, Math.max(0, position - 1));
	} else if (url !== undefined) {
		if (!url.includes('?level=')) return UTILS.error('Invalid url');
		const id = url.split('?level=')[1].split('&')[0];
		position = data.findIndex((level) => level.id == id);
		if (position === -1) return UTILS.error('Level not found');
	} else {
		return UTILS.error('Must specify at least one variable');
	}

	const { title, creator, id } = data[position];
	const embed = {
		title: `#${position + 1} Hardest Level`,
		description: `**${title}** by ${creator}`,
		url: CONFIG.LEVEL_URL + id,
		color: 0xff0000,
	};

	return UTILS.response('', embed);
}
