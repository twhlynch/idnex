import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function whoIs(json, env) {
	const { username } = UTILS.options(json);

	const player = await UTILS.get_player(username);
	if (player === null) return UTILS.error('Could not find player');

	const embed = UTILS.player_info_embed(player, true);

	return UTILS.response('', embed);
}
