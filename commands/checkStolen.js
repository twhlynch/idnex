import CONFIG from '../config.js';
import UTILS from '../utils.js';

export default async function checkStolen(json, env) {
	const { id1, id2 } = UTILS.options(json);
	if (!id1) return UTILS.error('id1 is required');

	const [levels_1, levels_2] = await Promise.all([
		UTILS.get_player_levels(id1),
		id2 ? UTILS.get_player_levels(id2) : UTILS.get_all_levels(),
	]);

	if (levels_1 == null) return UTILS.error('Failed to get levels 1');
	if (levels_2 == null) return UTILS.error('Failed to get levels 2');

	const overlaps = levels_1.flatMap((l1) => {
		const parts_1 = l1.identifier.split(':');
		return levels_2
			.filter((l2) => {
				const parts_2 = l2.identifier.split(':');
				parts_1[1] === parts_2[1] && parts_1[0] !== parts_2[0];
			})
			.map((l2) => [l1.identifier, l2.identifier]);
	});

	if (!overlaps.length) return UTILS.response('None found');

	const embed = {
		type: 'rich',
		title: 'Possible stolen maps',
		description: overlaps.length + ' levels',
		color: 0x500000,
		fields: overlaps
			.map((o) => {
				return {
					name: '',
					value:
						CONFIG.LEVEL_URL +
						o[0] +
						'\n' +
						CONFIG.LEVEL_URL +
						o[1],
					inline: false,
				};
			})
			.slice(0, 10),
	};

	return UTILS.response('', embed);
}
