import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function get_iterations(json, env) {
	const message = UTILS.target_message(json);
	if (!message) return UTILS.error('Failed to resolve message');

	const level_id = UTILS.extract_level_id(message);
	if (!level_id) return UTILS.error('Failed to match level id');

	const details = await UTILS.get_level_details(level_id);
	if (!details) return UTILS.error('Failed to get level details');

	const { iterations } = details.iteration ?? 1;

	const iteration_list = [];
	const last_string = `...\n[Iteration 1](<${CONFIG.LEVEL_URL}${level_id}:1>)`;
	let end_string = `-# (XXX of XXX iterations shown)`;
	const max_length = 2000 - last_string.length - 1 - end_string.length - 1;

	for (let i = iterations; i > 1; i--) {
		let str = `[Iteration ${i}](<${CONFIG.LEVEL_URL}${level_id}:${i}>)`;
		if (i === iterations) str += ' (current)';

		const length = iteration_list.join('\n').length + str.length;
		if (length > max_length) break;

		iteration_list.push(str);
	}

	iteration_list.push(last_string);

	end_string.replace('XXX', `${iteration_list.length}`);
	end_string.replace('XXX', `${iterations}`);
	iteration_list.push(end_string);

	const response = iteration_list.join('\n');

	return UTILS.response(response);
}
