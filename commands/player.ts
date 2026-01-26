import * as UTILS from '../utils';

export const player: Command = async (json, _env) => {
	const { username } = UTILS.options<{ username: string }>(json);
	if (!username) return UTILS.error('`username` is required');

	const player = await UTILS.get_player(username);
	if (!player) return UTILS.error('Failed to find player');

	const { user_id } = player;
	if (!user_id) return UTILS.error('Invalid player');

	const levels = await UTILS.get_player_levels(user_id);
	if (!levels) return UTILS.error('Failed to get player levels');

	const embed = UTILS.player_stats_embed(player, levels);

	return UTILS.response('', embed);
};
