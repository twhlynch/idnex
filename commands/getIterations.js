import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function getIterations(json, env) {
	const message = json.data.resolved.messages[json.data.target_id];
	const level_id = UTILS.extract_level_id(message);
	if (!level_id) return UTILS.error('Could not match level id');

	const details = await UTILS.get_level_details(level_id);
	if (details === null) return UTILS.error('Failed to get level details');

	const iterations = details.iteration;

	let iterationList = [];
	let length = 0;
	let lastString = `...\n[Iteration ${1}](<${CONFIG.LEVEL_URL}${level_id}:${1}>)`;
	let endString = `... (XXX of XXX iterations shown)`;
	for (let i = iterations; i > 0; i--) {
		let str = `[Iteration ${i}](<${CONFIG.LEVEL_URL}${level_id}:${i}>)`;
		if (length == 0) {
			str += ' (current)';
		}
		length += str.length;
		if (
			i > 1 &&
			length > 2000 - lastString.length - 1 - endString.length - 1
		) {
			if (iterationList.length < iterations) {
				iterationList.push(lastString);
				iterationList.push(
					`-# (${iterationList.length} of ${iterations} iterations shown)`,
				);
				break;
			}
		}
		iterationList.push(str);
	}

	return UTILS.response(iterationList.join('\n'));
}
