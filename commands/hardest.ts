import { API_URL, LIST_MOD_ROLE_ID } from '../config';
import * as UTILS from '../utils';

export const hardest: Command = async (json, env) => {
	let { command, link, number } = UTILS.options<{
		command: string;
		link: string;
		number: number;
	}>(json);

	if (
		!command ||
		!['add', 'remove', 'move', 'list', 'page'].includes(command)
	)
		return UTILS.error('Invalid command');

	const permission = json?.member?.roles?.find(
		(role) => role === LIST_MOD_ROLE_ID,
	);
	const modifying = ['add', 'remove', 'move'].includes(command);

	if (modifying && !permission)
		return UTILS.error("You don't have permission to do that");

	const response = await fetch(`${API_URL}get_hardest_levels`);
	const list_data = await response.json<LevelDetails[]>();
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
		if (number === undefined) return UTILS.error('`number` is required');

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
		if (link === undefined)
			return UTILS.error('`number` or `link` are required');

		const level_id = link.split('level=')[1];
		if (!number) number = list_data.length + 1;

		const response = await fetch(
			`${API_URL}add_hardest_level?level_id=${level_id}&position=${number}&access_token=${env.API_TOKEN}`,
		);

		const res = await response.text();
		return UTILS.response(res);
	} else if (command === 'remove') {
		if (number === undefined) return UTILS.error('`number` is required');

		const index = number - 1;
		const item = list_data[index];
		if (!item) return UTILS.error('Invalid position');

		const response = await fetch(
			`${API_URL}remove_hardest_level?level_id=${item.level_id}&access_token=${env.API_TOKEN}`,
		);

		const res = await response.text();
		return UTILS.response(res);
	} else if (command === 'move') {
		if (link === undefined) return UTILS.error('`link` is required');

		const level_id = link.split('level=')[1];
		const old_index = list_data.findIndex(
			(item) => item.level_id == level_id,
		);
		if (old_index === -1) return UTILS.error('Could not find level');

		if (!number) number = list_data.length + 1;

		const response = await fetch(
			`${API_URL}add_hardest_level?level_id=${level_id}&position=${number}&access_token=${env.API_TOKEN}`,
		);

		const res = await response.text();
		return UTILS.response(res);
	}

	return UTILS.error('Invalid command');
};
