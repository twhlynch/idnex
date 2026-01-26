import { STATS_URL } from '../config';
import * as UTILS from '../utils';

export const global_stats: Command = async (_json, _env) => {
	const levels = await UTILS.get_all_levels();
	if (!levels) return UTILS.error('Failed to get levels');

	const stats = UTILS.list_stats(levels);

	const embed = {
		type: 'rich',
		title: `Global Stats`,
		description:
			`**Total plays:** ${UTILS.number_with_commas(stats.plays)}\n` +
			`**Verified maps:** ${UTILS.number_with_commas(stats.verified_maps)}\n` +
			`**Todays plays:** ${UTILS.number_with_commas(stats.todays_plays)}\n` +
			`**Total complexity:** ${UTILS.number_with_commas(stats.complexity)}\n` +
			`**Iterations:** ${UTILS.number_with_commas(stats.iterations)}\n` +
			`**Average difficulty:** ${Math.round(stats.average_difficulty * 100)}%\n` +
			`**Average plays:** ${UTILS.number_with_commas(Math.round(stats.average_plays * 100) / 100)}\n` +
			`**Average likes:** ${Math.round(stats.average_likes * 100)}%\n` +
			`**Average time:** ${Math.round(stats.average_time * 100) / 100}s\n` +
			`**Average complexity:** ${UTILS.number_with_commas(Math.round(stats.average_complexity * 100) / 100)}`,
		color: 0x618dc3,
		fields: [],
		url: STATS_URL + '/stats?tab=Global',
	};

	return UTILS.response('', embed);
};
