import * as UTILS from '../utils';

export const unbeaten: Command = async (_json, _env) => {
	const levels = await UTILS.get_unbeaten_levels();
	if (!levels) return UTILS.error('Failed to get levels');
	if (!levels.length) return UTILS.error('No unbeaten levels');

	const description = levels
		.filter(
			(level) =>
				UTILS.timestamp_to_days(level.update_timestamp ?? 0) >= 100,
		)
		.map((level) => {
			const { title, update_timestamp } = level;
			const days = UTILS.timestamp_to_days(update_timestamp ?? 0);
			return `**${Math.floor(days)}d** ${title}`;
		})
		.join('\n');

	const embed = {
		title: `Unbeaten Levels (${levels.length})`,
		description: description,
		color: 0xff0000,
	};

	return UTILS.response('', embed);
};
