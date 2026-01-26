import * as UTILS from '../utils';

export const who_is: Command = async (json, _env) => {
	const { username } = UTILS.options<{ username: string }>(json);
	if (!username) return UTILS.error('`username` is required');

	const player = await UTILS.get_player(username);
	if (!player) return UTILS.error('Failed to find player');

	const embed = UTILS.player_info_embed(player, true);

	return UTILS.response('', embed);
};
