import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function echo(json, env) {
	const { message } = UTILS.options(json);
	if (!message) return UTILS.error('`message` is required');

	const allowed = !message.includes('@');
	if (!allowed) return UTILS.response('Message blocked');

	return UTILS.response(message);
}
