import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function player(json, env) {
	const { username } = UTILS.options(json);

	const player = await UTILS.get_player(username);
	if (player === null) return UTILS.error('Could not find player');

	const { user_id } = player;

	const levels = await UTILS.get_player_levels(user_id);
	if (levels === null) return UTILS.error('Could not get player levels');

	const embed = UTILS.player_stats_embed(player, levels);

	return UTILS.response('', embed);
}
