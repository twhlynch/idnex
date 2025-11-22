import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function id(json, env) {
	const { username } = UTILS.options(json);
	if (!username) return UTILS.error('`username` is required');

	const player = await UTILS.get_player(username);
	if (!player) return UTILS.error('Failed to find a matching player');

	return UTILS.response('```' + player.user_id + '```');
}
