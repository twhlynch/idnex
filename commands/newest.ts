import * as UTILS from '../utils';

export const newest: Command = async (json, _env) => {
	const { creator } = UTILS.options(json);

	if (creator) {
		const player = await UTILS.get_player(creator);
		if (!player) return UTILS.error('Failed to get player');

		const { user_name, user_id } = player;

		const levels = await UTILS.get_player_levels(user_id);
		if (!levels) return UTILS.error(`Failed to get levels`);
		if (!levels.length) return UTILS.error(`${user_name} has no levels`);

		const newest = levels[0];

		const url = UTILS.level_url(newest.identifier);
		if (!url) return UTILS.error('Failed to get level url');

		return UTILS.response(url);
	}

	const level = await UTILS.get_level();
	if (!level) return UTILS.error('Failed to get levels');

	const url = UTILS.level_url(level.identifier);
	if (!url) return UTILS.error('Failed to get level url');

	return UTILS.response(url);
};
