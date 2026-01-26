import {
	ADMIN_USER,
	FORMAT_VERSION,
	GRAB_API_URL,
	IMAGES_API_URL,
	LEVEL_URL,
	PLAYER_URL,
	STATS_API_URL,
	STATS_URL,
} from './config';

export function error(content: string): Response {
	return Response.json({
		type: 4,
		data: {
			tts: false,
			content,
			embeds: [],
			allowed_mentions: { parse: [] },
			flags: 1 << 6, // EPHEMERAL
		},
	});
}

export function response(
	content: string,
	...embeds: Discord.Embed[]
): Response {
	return Response.json({
		type: 4,
		data: {
			tts: false,
			content,
			embeds,
			allowed_mentions: { parse: [] },
		},
	});
}

export function options<T extends Record<string, any>>(
	json: Discord.Data,
): Partial<T> {
	let opts = {} as T;

	for (const option of json?.data?.options ?? []) {
		(opts as any)[option.name] = option.value;
	}

	return opts;
}

export function extract_level_id(message: Discord.Message): string | null {
	let message_string = message.content;
	if (message.embeds?.length) {
		message_string += JSON.stringify(message.embeds);
	}

	//            https:// (non-space) ?play=identifier
	const regex = /https?:\/\/[^\s]+\?level=([a-z0-9:]+)/;
	const matches = message_string.match(regex);
	if (!matches?.length) return null;
	const level_id = matches[1];

	if (!level_id?.length) return null;

	return level_id;
}

export function color_component_to_hex(component: number): string {
	const hex = Math.round(component * 255).toString(16);
	return hex.length == 1 ? '0' + hex : hex;
}

export function number_with_commas(x: number): string {
	let parts = x.toString().split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return parts.join('.');
}

export function timestamp_to_days(timestamp: number): number {
	const now = Date.now();
	return Math.floor((now - timestamp) / 1000 / 60 / 60 / 24);
}

export function format_time(
	seconds: string | number,
	maxDecimals: number,
): string {
	let minutes: string | number = Math.floor(Number(seconds) / 60);
	seconds = (Number(seconds) % 60).toFixed(maxDecimals);
	if (minutes < 10) {
		minutes = '0' + minutes;
	}
	if (Number(seconds) < 10) {
		seconds = '0' + seconds;
	}
	return `${minutes}:${seconds}`;
}

export async function level_embed(
	level: LevelDetails,
	fields: Discord.Field[] = [],
): Promise<Discord.Embed> {
	return {
		type: 'rich',
		title: level.title ?? '',
		color: 0x618dc3,
		fields: fields,
		thumbnail: {
			url: IMAGES_API_URL + level.images?.thumb?.key,
			height: 288,
			width: 512,
		},
		author: {
			name:
				(await get_featured_name(level.identifier.split(':')[0])) ||
				(level.creators ? level.creators?.[0] : ''),
			url: PLAYER_URL + level.identifier.split(':')[0],
		},
		url: STATS_URL + '/stats',
	};
}

export async function request<T>(
	url: string,
	callback = (data: T) => data,
): Promise<T | null> {
	const response = await fetch(url);
	if (!response.ok) return null;

	const text = await response.text();
	try {
		const data = JSON.parse(text);
		return callback(data);
	} catch (e) {
		console.error(e);
	}

	return null;
}

export async function get_players(query: string): Promise<UserInfo[] | null> {
	const url = `${GRAB_API_URL}list?type=user_name&search_term=${query}`;
	return await request(url);
}

export async function get_player(query: string): Promise<UserInfo | null> {
	const data = await get_players(query);
	if (!data?.length) return null;

	const lower = query.toLowerCase();

	const exact_match = data.find((player) => player.user_name === query);
	if (exact_match) return exact_match;

	const insensitive_match = data.find(
		(player) => player.user_name?.toLowerCase() === lower,
	);
	if (insensitive_match) return insensitive_match;

	const admin_match = data.find((player) => player.is_admin);
	if (admin_match) return admin_match;

	const supermoderator_match = data.find(
		(player) => player.is_supermoderator,
	);
	if (supermoderator_match) return supermoderator_match;

	const moderator_match = data.find((player) => player.is_moderator);
	if (moderator_match) return moderator_match;

	const verifier_match = data.find((player) => player.is_verifier);
	if (verifier_match) return verifier_match;

	const creator_match = data.find((player) => player.is_creator);
	if (creator_match) return creator_match;

	return data[0];
}

export async function get_levels(
	title: string | null = null,
	creator: string | null = null,
): Promise<LevelDetails[] | null> {
	let url = `${GRAB_API_URL}list?max_format_version=${FORMAT_VERSION}`;
	url += title ? `&type=search&search_term=${title}` : '&type=newest';
	return await request<LevelDetails[]>(url, (data) => {
		if (creator?.length) {
			return data.filter((level) =>
				level.creators?.find((player) =>
					player.toLowerCase().includes(creator.toLowerCase()),
				),
			);
		}
		return data;
	});
}

export async function get_level(
	title: string | null = null,
	creator: string | null = null,
): Promise<LevelDetails | null> {
	const levels = await get_levels(title, creator);
	if (levels === null || !levels.length) return null;

	return levels[0];
}

export async function get_all_levels(): Promise<LevelDetails[] | null> {
	const url = `${STATS_API_URL}all_verified.json`;
	return await request(url);
}

export async function get_level_details(
	identifier: string,
): Promise<LevelDetails | null> {
	const url = `${GRAB_API_URL}details/${identifier.replace(':', '/')}`;
	return await request(url);
}

export async function get_player_levels(
	user_id: string,
): Promise<LevelDetails[] | null> {
	const url = `${GRAB_API_URL}list?max_format_version=${FORMAT_VERSION}&user_id=${user_id}`;
	return await request(url);
}

export async function get_player_details(
	user_id: string,
): Promise<UserInfo | null> {
	const url = `${GRAB_API_URL}get_user_info?user_id=${user_id}`;
	return await request(url);
}

export async function get_random_level(
	verified: boolean,
): Promise<LevelDetails | null> {
	let url = GRAB_API_URL + 'get_random_level';
	if (verified) url += '?type=ok';
	return await request(url);
}

export async function get_leaderboard(
	identifier: string,
): Promise<LeaderboardEntry[] | null> {
	const url = `${GRAB_API_URL}statistics_top_leaderboard/${identifier.replace(':', '/')}`;
	return await request(url);
}

export async function get_level_browser(): Promise<LevelBrowser | null> {
	const url = `${GRAB_API_URL}get_level_browser?version=1`;
	return await request(url);
}

export function leaderboard_embed(
	leaderboard: LeaderboardEntry[],
	level: LevelDetails,
): Discord.Embed {
	const { title, identifier } = level;

	// for 0 padding
	const maxDecimals = Math.max(
		...leaderboard.map(
			(entry) => entry.best_time.toString().split('.')[1].length,
		),
	);

	let description = [];
	for (let i = 0; i < Math.min(10, leaderboard.length); i++) {
		const { user_name, best_time } = leaderboard[i];
		const time = format_time(best_time, maxDecimals);
		const row = `**${i + 1}**. ${user_name} - ${time}`;
		description.push(row);
	}

	const embed = {
		type: 'rich',
		title: `Leaderboard for ${title}`,
		description: description.join('\n'),
		color: 0x618dc3,
		fields: [],
		url: LEVEL_URL + identifier,
	};

	return embed;
}

export function list_stats(levels: LevelDetails[]) {
	let stats = {
		plays: 0,
		verified_plays: 0,
		maps: levels.length,
		time_maps: 0,
		verified_maps: 0,
		todays_plays: 0,
		average_difficulty: 0,
		average_plays: 0,
		average_likes: 0,
		average_time: 0,
		complexity: 0,
		iterations: 0,
		average_complexity: 0,
	};

	levels.forEach((level) => {
		const { change, statistics, complexity, iteration, tags } = level;

		const is_verfied = tags?.includes('ok');

		if (is_verfied) stats.verified_maps += 1;
		stats.todays_plays += change ?? 0;
		stats.complexity += complexity;
		stats.iterations += iteration || 1;

		if (statistics) {
			const { total_played, difficulty, liked, time } = statistics;

			stats.plays += total_played || 0;
			if (is_verfied) stats.verified_plays += total_played || 0;
			stats.average_difficulty += difficulty || 0;
			stats.average_likes += liked || 0;
			if (time) {
				stats.average_time += time;
				stats.time_maps += 1;
			}
		}
	});

	stats.average_difficulty /= stats.maps;
	stats.average_likes /= stats.maps;
	stats.average_time /= stats.time_maps;
	stats.average_plays = stats.plays / stats.maps;
	stats.average_complexity = stats.complexity / stats.maps;

	return stats;
}

export function user_id_timestamp(user_id: string): number {
	let user_id_int = [...user_id.toString()].reduce(
		(r, v) => r * BigInt(36) + BigInt(parseInt(v, 36)),
		0n,
	);
	user_id_int >>= BigInt(32);
	user_id_int >>= BigInt(32);

	const join_date = new Date(Number(user_id_int));
	const unix_time = Math.floor(join_date.getTime() / 1000);

	return unix_time;
}

export function player_roles(player: UserInfo): string[] {
	const role_map = {
		Creator: player.is_creator,
		Verifier: player.is_verifier,
		Moderator: player.is_moderator,
		Supermod: player.is_supermoderator,
		Developer: player.is_developer,
		Admin: player.is_admin,
	};
	const roles = Object.entries(role_map)
		.filter((e) => e[1])
		.map((e) => e[0]);
	return roles;
}

export function target_message(json: Discord.Data): Discord.Message | null {
	const messages = json?.data?.resolved?.messages;
	if (!messages) return null;

	const target = json?.data?.target_id;
	if (!target) return null;

	const message = messages[target];
	if (!message) return null;

	return message;
}

export function player_stats_embed(
	player: UserInfo,
	levels: LevelDetails[],
): Discord.Embed {
	const { user_id, user_name, active_customizations, user_level_count } =
		player;

	const { player_color_primary } = active_customizations || {};

	const stats = list_stats(levels);

	const join_string = `<t:${user_id_timestamp(user_id)}>`;

	const primary = (player_color_primary.color || [0, 0, 0])
		.map((c) => color_component_to_hex(c))
		.join('');

	const roles = player_roles(player).join(' | ');

	return {
		type: 'rich',
		title: user_name ?? '',
		description:
			`**Levels:** ${user_level_count}\n` +
			`**Verified maps:** ${number_with_commas(stats.verified_maps)}\n` +
			`**Total plays:** ${number_with_commas(stats.plays)}\n` +
			`**Verified plays:** ${number_with_commas(stats.verified_plays)}\n` +
			`**Total complexity:** ${number_with_commas(stats.complexity)}\n` +
			`**Average difficulty:** ${Math.round(stats.average_difficulty * 100)}%\n` +
			`**Average plays:** ${number_with_commas(Math.round(stats.average_plays * 100) / 100)}\n` +
			`**Average likes:** ${Math.round(stats.average_likes * 100)}%\n` +
			`**Average time:** ${Math.round(stats.average_time * 100) / 100}s`,
		color: parseInt(primary, 16),
		fields: [
			{
				name: 'Playing since',
				value: join_string,
				inline: false,
			},
			{
				name: 'identifier',
				value: user_id,
				inline: false,
			},
		],
		url: PLAYER_URL + user_id,
		footer: {
			text: roles,
		},
	};
}

export function player_info_embed(
	player: UserInfo,
	show_cosmetics = false,
): Discord.Embed {
	const { user_id, user_name, active_customizations, user_level_count } =
		player;

	const { player_color_primary, player_color_secondary } =
		active_customizations || {};
	const items = active_customizations?.items || {};

	const join_string = `<t:${user_id_timestamp(user_id)}>`;

	let cosmetics = '';
	if (show_cosmetics) {
		Object.entries(items).forEach((item) => {
			const [key, value] = item;

			const key_parts = key.replace(/\/(right|left)$/, '').split('/');
			const cleaned_key =
				key_parts[key_parts.length - 1].charAt(0).toUpperCase() +
				key_parts[key_parts.length - 1].slice(1);

			const cleaned_value = value
				.replace(/_basic$/, '')
				.replace(/_202[0-9]/, '')
				.replace(/^rotation_/, '')
				.replace(key_parts.join('_') + '_', '')
				.replaceAll('_', ' ');

			cosmetics += `**${cleaned_key}:** ${cleaned_value}\n`;
		});
	}

	const primary = (player_color_primary.color || [0, 0, 0])
		.map((c) => color_component_to_hex(c))
		.join('');
	const secondary = (player_color_secondary.color || [0, 0, 0])
		.map((c) => color_component_to_hex(c))
		.join('');

	const roles = player_roles(player).join(' | ');

	return {
		type: 'rich',
		title: user_name ?? '',
		description:
			`**Levels:** ${user_level_count}\n` +
			`**Primary:** #${primary}\n` +
			`**Secondary:** #${secondary}\n` +
			cosmetics,
		color: parseInt(primary, 16),
		fields: [
			{
				name: 'Playing since',
				value: join_string,
				inline: false,
			},
			{
				name: 'identifier',
				value: user_id,
				inline: false,
			},
		],
		url: PLAYER_URL + user_id,
		footer: {
			text: roles,
		},
	};
}

export async function get_trending_levels(): Promise<LevelDetails[] | null> {
	const url = `${STATS_API_URL}all_verified.json`;
	return await request<LevelDetails[]>(url, (data) =>
		data.sort((a, b) => (b.change ?? 0) - (a.change ?? 0)).slice(0, 200),
	);
}

export async function get_unbeaten_levels(): Promise<LevelDetails[] | null> {
	const url = `${STATS_API_URL}unbeaten_levels.json`;
	return await request<LevelDetails[]>(url);
}

export async function get_featured_name(
	id: string,
): Promise<string | undefined> {
	const response = await fetch(STATS_API_URL + 'featured_creators.json');
	const data = await response.json<{ list_key: string; title: string }[]>();
	for (let featured_creator of data || []) {
		if (featured_creator.list_key.split(':')[1] == id) {
			return featured_creator.title;
		}
	}
	return undefined;
}

export function is_bot_admin(id: string): boolean {
	return id === ADMIN_USER;
}

export function json_parse(json: string): object | null {
	try {
		return JSON.parse(json);
	} catch {
		return null;
	}
}

export function level_url(identifier: string): string | null {
	if (!identifier) return null;
	return LEVEL_URL + identifier;
}

export function image_url(level_details: LevelDetails): string | null {
	const { iteration_image, identifier } = level_details;
	if (!iteration_image || !identifier) return null;

	const image_id = `level_${identifier.replace(':', '_')}_${iteration_image}`;

	const image_url = `${IMAGES_API_URL}${image_id}.png`;

	return image_url;
}
