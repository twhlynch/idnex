import CONFIG from './config.js';
import UTILS from './utils.js';

import unbeaten_cmd from './commands/unbeaten.js';
import trending_cmd from './commands/trending.js';
import newestunbeaten_cmd from './commands/newestUnbeaten.js';
import globalstats_cmd from './commands/globalStats.js';
import leaderboard_cmd from './commands/leaderboard.js';
import level_cmd from './commands/level.js';
import id_cmd from './commands/id.js';
import player_cmd from './commands/player.js';
import whois_cmd from './commands/whoIs.js';
import random_cmd from './commands/random.js';
import newest_cmd from './commands/newest.js';
import oldest_cmd from './commands/oldest.js';
import gethardest_cmd from './commands/getHardest.js';
import hardest_cmd from './commands/hardest.js';
import get_leaderboard_cmd from './commands/getLeaderboard.js';
import get_creator_cmd from './commands/getCreator.js';
import get_complexity_cmd from './commands/getComplexity.js';
import get_iterations_cmd from './commands/getIterations.js';
import get_thumbnail_cmd from './commands/getThumbnail.js';
import script_cmd from './commands/script.js';
import ask_cmd from './commands/ask.js';
import echo_cmd from './commands/echo.js';
import block_cmd from './commands/block.js';
import unblock_cmd from './commands/unblock.js';
import checkstolen_cmd from './commands/checkStolen.js';
import status_cmd from './commands/status.js';

const commands = {
	unbeaten_cmd,
	trending_cmd,
	newestunbeaten_cmd,
	globalstats_cmd,
	leaderboard_cmd,
	level_cmd,
	id_cmd,
	player_cmd,
	whois_cmd,
	random_cmd,
	newest_cmd,
	oldest_cmd,
	gethardest_cmd,
	hardest_cmd,
	get_leaderboard_cmd,
	get_creator_cmd,
	get_complexity_cmd,
	get_iterations_cmd,
	get_thumbnail_cmd,
	script_cmd,
	echo_cmd,
	block_cmd,
	unblock_cmd,
	checkstolen_cmd,
	status_cmd,
};
const long_commands = {
	ask_cmd,
};

async function handleCommand(request, env, ctx, json) {
	const command = json.data.name;
	const command_function =
		command.toLowerCase().replaceAll(' ', '_') + '_cmd';
	if (command_function in commands) {
		const response = await commands[command_function](json, env);
		return response;
	} else if (command_function in long_commands) {
		ctx.waitUntil(
			(async () => {
				const result = await commands[command_function](json, env);
				const token = json.token;
				const url = `https://discord.com/api/v10/webhooks/${env.DISCORD_APPLICATION_ID}/${token}/messages/@original`;

				const data = await result.json();

				await fetch(url, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(
						data.data || { content: 'An unknown error occurred' },
					),
				});
			})(),
		);

		return Response.json({
			type: 5, // DEFERRED_RESPONSE
		});
	}

	return Response.json({
		type: 4,
		data: {
			tts: false,
			content: 'Invalid command',
			flags: 1 << 6, // EPHEMERAL
			embeds: [],
			allowed_mentions: { parse: [] },
		},
	});
}

async function handleRequest(request, env, ctx) {
	// validate
	const body = await request.text();
	const isVerified = await UTILS.validate(body, request, env);
	if (!isVerified) {
		return new Response('invalid request signature', { status: 401 });
	}

	// non-commands
	const json = JSON.parse(body);
	if (json.type == 1) {
		return Response.json({
			type: 1,
		});
	}

	// commands
	if (json.type == 2) {
		return await handleCommand(request, env, ctx, json);
	}

	// failure
	return new Response('invalid request type', { status: 400 });
}

export default {
	fetch: handleRequest,
};
