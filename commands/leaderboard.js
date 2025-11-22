import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function leaderboard(json, env) {
	const { title, creator } = UTILS.options(json);
	if (!title) return UTILS.error('`title` is required');

	const level = await UTILS.get_level(title, creator);
	if (!level) return UTILS.error('Failed to find a matching level');

	const leaderboard = await UTILS.get_leaderboard(level.identifier);
	if (!leaderboard) return UTILS.error('Failed to get leaderboard');

	const embed = UTILS.leaderboard_embed(leaderboard, level);

	return UTILS.response('', embed);
}
