import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function who_is(json, env) {
	const { username } = UTILS.options(json);
	if (!username) return UTILS.error('`username` is required');

	const player = await UTILS.get_player(username);
	if (!player) return UTILS.error('Failed to find player');

	const embed = UTILS.player_info_embed(player, true);

	return UTILS.response('', embed);
}
