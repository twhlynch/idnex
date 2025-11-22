import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function get_creator(json, env) {
	const message = UTILS.target_message(json);
	if (!message) return UTILS.error('Failed to resolve message');

	const level_id = UTILS.extract_level_id(message);
	if (!level_id) return UTILS.error('Failed to match level id');

	const user_id = level_id.split(':')[0];

	const details = await UTILS.get_player_details(user_id);
	if (!details) return UTILS.error('Failed to get player details');

	const embed = UTILS.player_info_embed(details);

	return UTILS.response('', embed);
}
