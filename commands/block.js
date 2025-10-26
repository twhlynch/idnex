import CONFIG from '../config.js';
import UTILS from '../utils.js';

const KV_KEY = 'blocked';

export default async function block(json, env) {
	const permission = json.member.user.id === CONFIG.ADMIN_USER;
	if (!permission) return UTILS.error('Not permitted');

	const { id } = UTILS.options(json);

	const list = await env.NAMESPACE.get(KV_KEY);
	if (!list) return UTILS.error('KV Error');

	const data = JSON.parse(list);
	data.push(id);

	const value = JSON.stringify(data);
	await env.NAMESPACE.put(KV_KEY, value);

	return UTILS.response(`Blocked ${id}`);
}
