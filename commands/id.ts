import * as UTILS from '../utils';

export const id: Command = async (json, _env) => {
	const { username } = UTILS.options<{ username: string }>(json);
	if (!username) return UTILS.error('`username` is required');

	const player = await UTILS.get_player(username);
	if (!player) return UTILS.error('Failed to find a matching player');

	return UTILS.response('```' + player.user_id + '```');
};
