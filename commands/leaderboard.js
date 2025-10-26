import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function leaderboard(json, env) {
	const { title, creator } = UTILS.options(json);

	const level = await UTILS.get_level(title, creator);
	if (level === null) return UTILS.error('Could not find a matching level');

	const leaderboard = await UTILS.get_leaderboard(level.identifier);
	if (!leaderboard) return UTILS.error('Error getting leaderboard');

	const embed = UTILS.leaderboard_embed(leaderboard, level);

	return UTILS.response('', embed);
}
