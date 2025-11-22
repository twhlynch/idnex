import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function newest(json, env) {
	const { creator } = UTILS.options(json);

	if (creator) {
		const player = await UTILS.get_player(creator);
		if (!player) return UTILS.error('Failed to get player');

		const { user_name, user_id } = player;

		const levels = await UTILS.get_player_levels(user_id);
		if (!levels) return UTILS.error(`Failed to get levels`);
		if (!levels.length) return UTILS.error(`${user_name} has no levels`);

		const oldest = levels[levels.length - 1];

		const url = UTILS.level_url(oldest.identifier);
		if (!url) return UTILS.error('Failed to get level url');

		return UTILS.response(url);
	}

	const levels = await UTILS.get_levels();
	if (!levels?.length) return UTILS.error('Failed to get levels');

	const oldest = levels[levels.length - 1];

	const url = UTILS.level_url(oldest.identifier);
	if (!url) return UTILS.error('Failed to get level url');

	return UTILS.response(url);
}
