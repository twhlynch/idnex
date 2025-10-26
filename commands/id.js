import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function id(json, env) {
	const { username } = UTILS.options(json);

	const player = await UTILS.get_player_details(username);
	if (player) {
		return UTILS.response('```' + player.user_id + '```');
	}

	return UTILS.error('Could not find a player with that username');
}
