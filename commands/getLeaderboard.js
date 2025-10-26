import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function getLeaderboard(json, env) {
	const message = json.data.resolved.messages[json.data.target_id];
	const level_id = UTILS.extract_level_id(message);
	if (!level_id) return UTILS.error('Could not match level id');

	const leaderboard = await UTILS.get_leaderboard(level_id);
	if (!leaderboard) return UTILS.error('Error getting leaderboard');

	const embed = UTILS.leaderboard_embed(leaderboard, level);

	return UTILS.response('', embed);
}
