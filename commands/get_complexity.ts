import * as UTILS from '../utils';

export const get_complexity: Command = async (json, _env) => {
	const message = UTILS.target_message(json);
	if (!message) return UTILS.error('Failed to resolve message');

	const level_id = UTILS.extract_level_id(message);
	if (!level_id) return UTILS.error('Failed to match level id');

	const level = await UTILS.get_level_details(level_id);
	if (!level) return UTILS.error('Failed to get level details');

	return UTILS.response(`${level.complexity}`);
};
