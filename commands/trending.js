import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function trending(json, env) {
	const levels = await UTILS.get_trending_levels();
	if (!levels) return UTILS.error('Failed to get levels');

	const description = levels
		.slice(0, 5)
		.map((level, i) => {
			const { title, change } = level;
			return `**#${i + 1}** ${title} - ${change}`;
		})
		.join('\n');

	const embed = {
		title: `Trending Levels`,
		description: description,
		color: 0x00ffff,
	};

	return UTILS.response('', embed);
}
