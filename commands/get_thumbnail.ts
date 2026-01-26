import * as UTILS from '../utils';

export const get_thumbnail: Command = async (json, _env) => {
	const message = UTILS.target_message(json);
	if (!message) return UTILS.error('Failed to resolve message');

	const level_id = UTILS.extract_level_id(message);
	if (!level_id) return UTILS.error('Failed to match level id');

	const details = await UTILS.get_level_details(level_id);
	if (!details) return UTILS.error('Failed to get level details');

	const image_url = UTILS.image_url(details);
	if (!image_url) return UTILS.error('Failed to get image url');

	const alt_text = `${details.title || 'Level'}'s thumbnail`;
	const image_messsage = `[${alt_text}](${image_url})`;

	return UTILS.response(image_messsage);
};
