import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function newestUnbeaten(json, env) {
	const levels = await UTILS.get_unbeaten_levels();
	if (levels === null) return UTILS.error('Failed getting levels');
	if (!levels.length) return UTILS.error('No unbeaten levels');

	const level = levels[levels.length - 1];
	const fields = [
		{
			name: `Days Unbeaten`,
			value: `${UTILS.timestamp_to_days(level.update_timestamp)}`,
			inline: false,
		},
	];
	return UTILS.response('', await UTILS.generate_level_embed(level, fields));
}
