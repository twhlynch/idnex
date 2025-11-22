import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function newest_unbeaten(json, env) {
	const levels = await UTILS.get_unbeaten_levels();
	if (!levels) return UTILS.error('Failed to get levels');
	if (!levels.length) return UTILS.error('No unbeaten levels');

	const level = levels[levels.length - 1];

	const fields = [
		{
			name: `Days Unbeaten`,
			value: `${UTILS.timestamp_to_days(level.update_timestamp)}`,
			inline: false,
		},
	];

	const embed = await UTILS.level_embed(level, fields);

	return UTILS.response('', embed);
}
