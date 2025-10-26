import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function getThumbnail(json, env) {
	const message = json.data.resolved.messages[json.data.target_id];
	const level_id = UTILS.extract_level_id(message);
	if (!level_id) return UTILS.error('Could not match level id');

	const details = await UTILS.get_level_details(level_id);
	if (details === null) return UTILS.error('Failed to get level details');

	const { iteration_image, title } = details;
	if (!iteration_image) return UTILS.error('Failed to get thumbnail');

	const image_url = `${CONFIG.IMAGES_API_URL}level_${level_id.replace(':', '_')}_${iteration_image}.png`;

	return UTILS.response(`[${title}'s thumbnail](${image_url})`);
}
