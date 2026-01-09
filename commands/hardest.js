import CONFIG from '../config.js';
import UTILS from '../utils.js';

const LIST_KV_KEY = 'list';
const CHANGES_KV_KEY = 'list_changes';
const ROLE_ID = '1224307852248612986';

async function add_change(change, env) {
	let changes = await env.NAMESPACE.get(CHANGES_KV_KEY);
	if (!changes) changes = '[]';
	let changes_data = JSON.parse(changes);

	let last_change_index = changes_data.findIndex(
		(item) => item.id == change.id,
	);
	if (last_change_index === -1) {
		changes_data.push(change);
	} else {
		const last_change = changes_data[last_change_index];

		if (change.description === 'added to position') {
			if (last_change.i === change.i) {
				changes_data.splice(last_change, 1);
			} else {
				last_change.description = 'moved to position';
				last_change.i = change.i;
			}
		} else if (change.description === 'moved to position') {
			last_change.description = 'moved to position';
			last_change.i = change.i;
		} else if (change.description === 'removed from position') {
			if (last_change.i == change.i) {
				changes_data.splice(last_change, 1);
			} else {
				last_change.description = 'removed from position';
			}
		}
	}

	await env.NAMESPACE.put(CHANGES_KV_KEY, JSON.stringify(changes_data));
}

export default async function hardest(json, env) {
	let { command, link, number } = UTILS.options(json);

	if (!['add', 'remove', 'move', 'list', 'page'].includes(command))
		return UTILS.error('Invalid command');

	const permission = json?.member?.roles?.find((role) => role === ROLE_ID);
	const modifying = ['add', 'remove', 'move'].includes(command);

	if (modifying && !permission)
		return UTILS.error("You don't have permission to do that");

	const response = await fetch(`${CONFIG.API_URL}get_hardest_levels`);
	const list_data = await response.json();
	if (!list_data) return UTILS.error('Error getting list');

	if (command === 'list') {
		const description = list_data
			.slice(0, 10)
			.map((item, i) => `**${i + 1}**. ${item.title}`)
			.join('\n');

		const embed = {
			title: 'Hardest Maps List',
			description: description,
			color: 0xff0000,
		};
		return UTILS.response('', embed);
	} else if (command === 'page') {
		const page = Math.max(number - 1, 0);

		const description = list_data
			.slice(
				Math.max(50 * page, 0),
				Math.min(50 * page + 50, list_data.length),
			)
			.map((item, i) => `${50 * page + i + 1} ${item.title}`)
			.join('\n');

		const embed = {
			title: 'Hardest Maps List',
			description: description,
			color: 0xff0000,
		};
		return UTILS.response('', embed);
	} else if (command === 'add') {
		const level_id = link.split('level=')[1];
		if (!number) number = list_data.length + 1;

		const response = await fetch(
			`${CONFIG.API_URL}add_hardest_level?level_id=${level_id}&position=${number}&access_token=${env.API_TOKEN}`,
		);

		const res = await response.text();
		return UTILS.response(res);
	} else if (command === 'remove') {
		const index = number - 1;
		const item = list_data[index];
		if (!item) return UTILS.error('Invalid position');

		const response = await fetch(
			`${CONFIG.API_URL}remove_hardest_level?level_id=${item.level_id}&access_token=${env.API_TOKEN}`,
		);

		const res = await response.text();
		return UTILS.response(res);
	} else if (command === 'move') {
		const level_id = link.split('level=')[1];
		const old_index = list_data.findIndex(
			(item) => item.level_id == level_id,
		);
		if (old_index === -1) return UTILS.error('Could not find level');

		if (!number) number = list_data.length + 1;

		const response = await fetch(
			`${CONFIG.API_URL}add_hardest_level?level_id=${level_id}&position=${number}&access_token=${env.API_TOKEN}`,
		);

		const res = await response.text();
		return UTILS.response(res);
	}
}
