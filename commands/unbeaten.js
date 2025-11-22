import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function unbeaten(json, env) {
	const levels = await UTILS.get_unbeaten_levels();
	if (!levels) return UTILS.error('Failed to get levels');
	if (!levels.length) return UTILS.error('No unbeaten levels');

	const description = levels
		.filter(
			(level) => UTILS.timestamp_to_days(level.update_timestamp) >= 100,
		)
		.map((level) => {
			const { title, update_timestamp } = level;
			const days = UTILS.timestamp_to_days(update_timestamp);
			return `**${Math.floor(days)}d** ${title}`;
		})
		.join('\n');

	const embed = {
		title: `Unbeaten Levels (${levels.length})`,
		description: description,
		color: 0xff0000,
	};

	return UTILS.response('', embed);
}
