import CONFIG from '../config.js';
import UTILS from '../utils.js';

const KV_KEY = 'blocked';

export default async function unblock(json, env) {
	const permission = json.member.user.id === CONFIG.ADMIN_USER;
	if (!permission) return UTILS.error('Not permitted');

	const { id } = UTILS.options(json);

	const list = await env.NAMESPACE.get(KV_KEY);
	if (!list) return UTILS.error('KV Error');

	let data = JSON.parse(list);

	data = data.filter((item) => item != id);

	const value = JSON.stringify(data);
	await env.NAMESPACE.put(KV_KEY, value);

	return UTILS.response(`Unblocked ${id}`);
}
