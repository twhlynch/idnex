import * as UTILS from '../utils';

export const newest_unbeaten: Command = async (_json, _env) => {
	const levels = await UTILS.get_unbeaten_levels();
	if (!levels) return UTILS.error('Failed to get levels');
	if (!levels.length) return UTILS.error('No unbeaten levels');

	const level = levels[levels.length - 1];

	const fields = [
		{
			name: `Days Unbeaten`,
			value: `${UTILS.timestamp_to_days(level.update_timestamp ?? 0)}`,
			inline: false,
		},
	];

	const embed = await UTILS.level_embed(level, fields);

	return UTILS.response('', embed);
};
