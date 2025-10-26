import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function getComplexity(json, env) {
	const message = json.data.resolved.messages[json.data.target_id];
	const level_id = UTILS.extract_level_id(message);
	if (!level_id) return UTILS.error('Could not match level id');

	const level = await UTILS.get_level_details(level_id);
	if (level === null) return UTILS.error('Error getting level details');

	return UTILS.response(`${level.complexity}`);
}
