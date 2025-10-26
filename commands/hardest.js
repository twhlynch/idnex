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

	const list = await env.NAMESPACE.get(LIST_KV_KEY);
	if (!list) return UTILS.error('Error getting list');

	const list_data = JSON.parse(list);

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
		const page = number - 1;

		const description = list_data
			.slice(
				Math.max(50 * page, 0),
				Math.min(50 * page + 50, list_data.length),
			)
			.map((item, i) => `${i + 1} ${item.title}`)
			.join('\n');

		const embed = {
			title: 'Hardest Maps List',
			description: description,
			color: 0xff0000,
		};
		return UTILS.response('', embed);
	} else if (command === 'add') {
		const level_id = link.split('level=')[1];
		const level = await UTILS.get_level_details(level_id);
		if (level === null) return UTILS.error('Failed to get level details');

		const { title, identifier: id, creators } = level;
		const creator = creators?.length ? creators[0] : '';

		const item = { title, id, creator };

		if (!number) number = list_data.length + 1;
		list_data.splice(number - 1, 0, item);

		let change = {
			...item,
			description: 'added to position',
			i: number - 1,
		};
		await add_change(change, env);
		await env.NAMESPACE.put(LIST_KV_KEY, JSON.stringify(list_data));

		return UTILS.response(`Added ${title} to list at position ${number}`);
	} else if (command === 'remove') {
		const index = number - 1;
		const item = list_data[index];
		if (!item) return UTILS.error('Invalid position');

		const change = {
			...item,
			description: 'removed from position',
			i: index,
		};
		await add_change(change, env);

		list_data.splice(index, 1);
		await env.NAMESPACE.put(LIST_KV_KEY, JSON.stringify(list_data));

		return UTILS.response(`Removed ${item.title} from list`);
	} else if (command === 'move') {
		const new_index = number - 1;
		const level_id = link.split('?level=')[1];
		const old_index = list_data.findIndex((item) => item.id == level_id);
		if (old_index === -1) return UTILS.error('Could not find level');

		const item = list_data[old_index];

		list_data.splice(old_index, 1);
		list_data.splice(new_index, 0, item);

		const change = {
			...item,
			description: 'moved to position',
			i: new_index,
		};
		await add_change(change, env);

		await env.NAMESPACE.put(LIST_KV_KEY, JSON.stringify(list_data));

		return UTILS.response(
			`Moved ${item.title} from ${old_index + 1} to ${number}`,
		);
	}
}
