const nacl = require('tweetnacl');
import { Buffer } from 'node:buffer';
import CONFIG from './config.js';

async function validate(body, request, env) {
	const signature = request.headers.get('x-signature-ed25519');
	const timestamp = request.headers.get('x-signature-timestamp');
	return (
		signature &&
		timestamp &&
		nacl.sign.detached.verify(
			Buffer.from(timestamp + body),
			Buffer.from(signature, 'hex'),
			Buffer.from(env.PUBLIC_KEY, 'hex'),
		)
	);
}

function error(content) {
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

function response(content, ...embeds) {
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

function options(json) {
	let opts = {};
	for (const option of json?.data?.options ?? []) {
		opts[option.name] = option.value;
	}
	return opts;
}

function extract_level_id(message) {
	let message_string = message.content;
	if (message.embeds?.length) {
		message_string += JSON.stringify(message.embeds);
	}

	//            https:// (non-space) ?play=identifier
	const regex = /https?:\/\/[^\s]+\?level=([a-z0-9:]+)/;
	const matches = message_string.match(regex);
	const level_id = matches[1];

	if (!level_id?.length) {
		return null;
	}

	return level_id;
}

function color_component_to_hex(component) {
	const hex = Math.round(component * 255).toString(16);
	return hex.length == 1 ? '0' + hex : hex;
}

function number_with_commas(x) {
	let parts = x.toString().split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return parts.join('.');
}

function timestamp_to_days(timestamp) {
	const now = Date.now();
	return Math.floor((now - timestamp) / 1000 / 60 / 60 / 24);
}

function format_time(seconds, maxDecimals) {
	let minutes = Math.floor(seconds / 60);
	seconds = (seconds % 60).toFixed(maxDecimals);
	if (minutes < 10) {
		minutes = '0' + minutes;
	}
	if (seconds < 10) {
		seconds = '0' + seconds;
	}
	return `${minutes}:${seconds}`;
}

async function level_embed(level, fields = []) {
	return {
		type: 'rich',
		title: level.title,
		color: 0x618dc3,
		fields: fields,
		thumbnail: {
			url: CONFIG.IMAGES_API_URL + level?.images?.thumb?.key,
			height: 288,
			width: 512,
		},
		author: {
			name:
				get_featured_name(level.identifier.split(':')[0]) ||
				level.creators
					? level.creators[0]
					: '',
			url: CONFIG.PLAYER_URL + level.identifier.split(':')[0],
		},
		url: CONFIG.STATS_URL + '/stats',
	};
}

async function request(url, callback = (data) => data) {
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

async function get_players(query) {
	const url = `${CONFIG.API_URL}list?type=user_name&search_term=${query}`;
	return await request(url);
}

async function get_player(query) {
	const data = await UTILS.get_players(query);
	if (!data?.length) return null;

	const lower = query.toLowerCase();

	const exact_match = data.find((player) => player.user_name === query);
	if (exact_match) return exact_match;

	const insensitive_match = data.find(
		(player) => player.user_name.toLowerCase() === lower,
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

async function get_levels(title, creator) {
	let url = `${CONFIG.API_URL}list?max_format_version=${CONFIG.FORMAT_VERSION}`;
	url += title ? `&type=search&search_term=${title}` : '&type=newest';
	return await request(url, (data) => {
		if (creator?.length) {
			return data.filter((level) =>
				level.creators.find((player) =>
					player.toLowerCase().includes(creator.toLowerCase()),
				),
			);
		}
		return data;
	});
}

async function get_level(title, creator) {
	const levels = await UTILS.get_levels(title, creator);
	if (levels === null || !levels.length) return null;

	return levels[0];
}

async function get_all_levels() {
	const url = `${CONFIG.STATS_API_URL}all_verified.json`;
	return await request(url);
}

async function get_level_details(identifier) {
	const url = `${CONFIG.API_URL}details/${identifier.replace(':', '/')}`;
	return await request(url);
}

async function get_player_levels(user_id) {
	const url = `${CONFIG.API_URL}list?max_format_version=${CONFIG.FORMAT_VERSION}&user_id=${user_id}`;
	return await request(url);
}

async function get_player_details(user_id) {
	const url = `${CONFIG.API_URL}get_user_info?user_id=${user_id}`;
	return await request(url);
}

async function get_random_level(verified) {
	let url = CONFIG.API_URL + 'get_random_level';
	if (verified) url += '?type=ok';
	return await request(url);
}

async function get_leaderboard(identifier) {
	const url = `${CONFIG.API_URL}statistics_top_leaderboard/${identifier.replace(':', '/')}`;
	return await request(url);
}

function leaderboard_embed(leaderboard, level) {
	const { title, identifier } = level;

	// for 0 padding
	const maxDecimals = Math.max(
		leaderboard.map((entry) => {
			entry.best_time.toString().split('.')[1].length;
		}),
	);

	let description = [];
	for (let i = 0; i < Math.min(10, leaderboard.length); i++) {
		const { user_name, best_time } = leaderboard[i];
		const time = UTILS.format_time(best_time, maxDecimals);
		const row = `**${i + 1}**. ${user_name} - ${time}`;
		description.push(row);
	}

	const embed = {
		type: 'rich',
		title: `Leaderboard for ${title}`,
		description: description.join('\n'),
		color: 0x618dc3,
		fields: [],
		url: CONFIG.LEVEL_URL + identifier,
	};

	return embed;
}

function list_stats(levels) {
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

		if (tags?.includes('ok')) stats.verified_maps += 1;
		stats.todays_plays += change;
		stats.complexity += complexity;
		stats.iterations += iteration || 1;

		if (statistics) {
			const { total_played, difficulty, liked, time } = statistics;

			stats.plays += total_played || 0;
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

function user_id_timestamp(user_id) {
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

function player_roles(player) {
	const { user_id } = player;
	const roles = [
		['Creator', player.is_creator],
		['Verifier', player.is_verifier],
		['Moderator', player.is_moderator],
		['Supermod', player.is_supermoderator],
		['Admin', player.is_admin],
		['Owner', UTILS.is_owner(user_id)],
	]
		.filter((e) => e[1])
		.map((e) => e[0]);
	return roles;
}

function player_stats_embed(player, levels) {
	const { user_id, user_name, active_customizations, user_level_count } =
		player;

	const { player_color_primary } = active_customizations || {};

	const stats = UTILS.list_stats(levels);

	const join_string = `<t:${user_id_timestamp(user_id)}>`;

	const primary = (player_color_primary.color || [0, 0, 0])
		.map((c) => UTILS.color_component_to_hex(c))
		.join('');

	const roles = player_roles(player).join(' | ');

	return {
		type: 'rich',
		title: user_name,
		description:
			`**Levels:** ${user_level_count}\n` +
			`**Verified maps:** ${UTILS.number_with_commas(stats.verified_maps)}\n` +
			`**Total plays:** ${UTILS.number_with_commas(stats.plays)}\n` +
			`**Verified plays:** ${UTILS.number_with_commas(stats.verified_plays)}\n` +
			`**Total complexity:** ${UTILS.number_with_commas(stats.complexity)}\n` +
			`**Average difficulty:** ${Math.round(stats.average_difficulty * 100)}%\n` +
			`**Average plays:** ${UTILS.number_with_commas(Math.round(stats.average_plays * 100) / 100)}\n` +
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
		url: CONFIG.PLAYER_URL + user_id,
		footer: {
			text: roles,
		},
	};
}

function player_info_embed(player, show_cosmetics = false) {
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
		.map((c) => UTILS.color_component_to_hex(c))
		.join('');
	const secondary = (player_color_secondary.color || [0, 0, 0])
		.map((c) => UTILS.color_component_to_hex(c))
		.join('');

	const roles = player_roles(player).join(' | ');

	return {
		type: 'rich',
		title: user_name,
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
		url: CONFIG.PLAYER_URL + user_id,
		footer: {
			text: roles,
		},
	};
}

async function get_trending_levels() {
	const url = `${CONFIG.STATS_API_URL}all_verified.json`;
	return await request(url, (data) =>
		data.sort((a, b) => b.change - a.change).slice(0, 200),
	);
}

async function get_unbeaten_levels() {
	const url = `${CONFIG.STATS_API_URL}unbeaten_levels.json`;
	return await request(url);
}

async function get_featured_name(id) {
	const response = await fetch(
		CONFIG.STATS_API_URL + 'featured_creators.json',
	);
	const data = await response.json();
	for (let featured_creator of data || []) {
		if (featured_creator.list_key.split(':')[1] == id) {
			return featured_creator.title;
		}
	}
	return undefined;
}

function is_owner(id) {
	return id == '290oi9frh8eihrh1r5z0q'; // Slin
}

const UTILS = {
	// discord
	response,
	error,
	validate,
	options,
	extract_level_id,
	// requests
	get_player,
	get_players,
	get_player_details,
	get_level,
	get_levels,
	get_level_details,
	get_all_levels,
	get_player_levels,
	get_random_level,
	get_trending_levels,
	get_unbeaten_levels,
	get_leaderboard,
	// embeds
	leaderboard_embed,
	level_embed,
	player_info_embed,
	player_stats_embed,
	// util
	list_stats,
	timestamp_to_days,
	is_owner,
	color_component_to_hex,
	number_with_commas,
	format_time,
};

export default UTILS;
