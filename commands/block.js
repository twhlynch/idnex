import CONFIG from '../config.js';
import UTILS from '../utils.js';

const KV_KEY = 'blocked';

export default async function block(json, env) {
	const discord_id = json.member?.user?.id;
	if (!discord_id) return UTILS.error('Failed to check permission');

	const permission = UTILS.is_bot_admin(discord_id);
	if (!permission) return UTILS.error('Not permitted');

	const { id } = UTILS.options(json);
	if (!id) return UTILS.error('`id` is required');

	const list = await UTILS.kv_get(KV_KEY, env);
	if (!list) return UTILS.error('Failed to get KV data');

	list.push(id.trim());

	const success = await UTILS.kv_set(KV_KEY, list, env);
	if (!success) return UTILS.error('Failed to set KV data');

	return UTILS.response(`Blocked ${id}`);
}
