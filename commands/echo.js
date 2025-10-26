import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function echo(json, env) {
	const message = UTILS.options(json);
	if (message.includes('@')) return UTILS.response(':3');

	return UTILS.response(message);
}
