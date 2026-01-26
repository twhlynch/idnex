import * as UTILS from '../utils';

export const level: Command = async (json, _env) => {
	const { title, creator } = UTILS.options<{
		title: string;
		creator: string;
	}>(json);
	if (!title) return UTILS.error('`title` is required');

	const level = await UTILS.get_level(title, creator);
	if (!level) return UTILS.error('Failed to find a matching level');

	const url = UTILS.level_url(level.identifier);
	if (!url) return UTILS.error('Failed to get level url');

	return UTILS.response(url);
};
