import * as UTILS from '../utils';

export const echo: Command = async (json, _env) => {
	const { message } = UTILS.options<{ message: string }>(json);
	if (!message) return UTILS.error('`message` is required');

	const allowed = !message.includes('@');
	if (!allowed) return UTILS.response('Message blocked');

	return UTILS.response(message);
};
