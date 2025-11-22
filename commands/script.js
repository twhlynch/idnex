import CONFIG from '../config.js';
import UTILS from '../utils.js';

function resolve_path(object, path) {
	const keys = path.trim().replace('level.', '').split('.');
	for (const key of keys) {
		object = object[key];
		if (object === undefined) {
			return undefined;
		}
	}
	return object;
}

export default async function script(json, env) {
	const { filter, limit, return: ret } = UTILS.options(json);
	if (!filter?.length || !limit?.length || !ret?.length)
		return UTILS.error('All parameters are required');

	const data = await UTILS.get_all_levels();
	if (!data) return UTILS.error('Failed to get levels');

	const filtered = [];
	for (let level of data) {
		const segments = filter.split('&&').map((s) => s.trim());
		const valid = !segments.find((segment) => {
			const parts = segment.split(' ').map((s) => s.trim());

			let operator = parts[1];
			let compare = parts[2];

			for (let i = 3; i < parts.length; i++) {
				compare += ' ' + parts[i];
			}

			let anyCase = false;
			if (operator.startsWith('~')) {
				operator = operator.slice(1);
				compare = compare.toLowerCase();
				anyCase = true;
			}

			if (!compare?.includes('"')) {
				if (compare?.includes('.')) {
					compare = parseFloat(compare);
				} else {
					compare = parseInt(compare, 10);
				}
			} else {
				compare = compare.replaceAll('"', '');
			}

			let prop = resolve_path(level, parts[0]);
			if (prop === undefined) return true;

			if (anyCase && typeof prop == 'string') {
				prop = prop.toLowerCase();
			}

			switch (operator) {
				case '>':
					if (prop <= compare) {
						return true;
					}
					break;
				case '<':
					if (prop >= compare) {
						return true;
					}
					break;
				case '>=':
					if (prop < compare) {
						return true;
					}
					break;
				case '<=':
					if (prop > compare) {
						return true;
					}
					break;
				case '==':
					if (prop != compare) {
						return true;
					}
					break;
				case '!=':
					if (prop == compare) {
						return true;
					}
					break;
				case 'in':
					if (!(compare?.includes && compare.includes(prop))) {
						return true;
					}
					break;
				case '!in':
					if (compare?.includes && compare.includes(prop)) {
						return true;
					}
					break;
				case 'includes':
					if (!(prop?.includes && prop.includes(compare))) {
						return true;
					}
					break;
				case '!includes':
					if (prop?.includes && prop.includes(compare)) {
						return true;
					}
					break;
				default:
					return true;
			}

			return false;
		});

		if (valid) {
			filtered.push(level);
			if (filtered.length >= limit) break;
		}
	}

	filtered.forEach((level) => {
		level.link = CONFIG.LEVEL_URL + level.identifier;
		level.creator = level.creators?.length ? level.creators[0] : '';
		level.creator_link = CONFIG.PLAYER_URL + level.identifier.split(':')[0];
		level.creation_timestamp = level.creation_timestamp ?? 0;
		level.update_timestamp =
			level.update_timestamp ?? level.creation_timestamp;
		level.date = new Date(1000 * level.update_timestamp).toDateString();
	});

	const result = filtered
		.map((level) => {
			const segments = ret.split('&&').map((s) => s.trim());
			return segments
				.map((s) =>
					s.includes('"')
						? s.replaceAll('"', '').replaceAll('\\n', '\n')
						: (resolve_path(level, s) || '') + ' ',
				)
				.join('');
		})
		.join('\n');

	return UTILS.response('```\n' + result + '\n```');
}
