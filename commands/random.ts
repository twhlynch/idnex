import * as UTILS from '../utils';

export const random: Command = async (json, _env) => {
	const { verified } = UTILS.options<{ verified: boolean }>(json);

	const level = await UTILS.get_random_level(!!verified);
	if (!level) return UTILS.error('Failed to get level');

	const url = UTILS.level_url(level.identifier);
	if (!url) return UTILS.error('Failed to get level url');

	return UTILS.response(url);
};
