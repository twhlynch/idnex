import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function getCreator(json, env) {
	const message = json.data.resolved.messages[json.data.target_id];
	const level_id = UTILS.extract_level_id(message);
	if (!level_id) return UTILS.error('Could not match level id');

	const user_id = level_id.split(':')[0];
	const details = await UTILS.get_player_details(user_id);
	if (details === null) return UTILS.error('Failed to get player details');

	const embed = UTILS.player_info_embed(details);

	return UTILS.response('', embed);
}
