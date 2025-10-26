import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function newest(json, env) {
	const { creator } = UTILS.options(json);

	if (creator) {
		const player = await UTILS.get_player(creator);
		if (player === null) return UTILS.error('Failed to find player');

		const { user_name, user_id } = player;

		const levels = await UTILS.get_player_levels(user_id);
		if (!levels === null)
			return UTILS.error(`Failed to get levels for ${user_name}`);
		if (!levels.length) return UTILS.error(`${user_name} has no levels`);

		return UTILS.response(CONFIG.LEVEL_URL + levels[0].identifier);
	}

	const level = await UTILS.get_level('', creator);
	if (level === null) return UTILS.error('Failed to get levels');

	return UTILS.response(CONFIG.LEVEL_URL + level.identifier);
}
