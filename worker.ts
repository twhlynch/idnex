import { unbeaten as unbeaten_cmd } from './commands/unbeaten';
import { trending as trending_cmd } from './commands/trending';
import { newest_unbeaten as newestunbeaten_cmd } from './commands/newest_unbeaten';
import { global_stats as globalstats_cmd } from './commands/global_stats';
import { leaderboard as leaderboard_cmd } from './commands/leaderboard';
import { level as level_cmd } from './commands/level';
import { id as id_cmd } from './commands/id';
import { player as player_cmd } from './commands/player';
import { who_is as whois_cmd } from './commands/who_is';
import { random as random_cmd } from './commands/random';
import { newest as newest_cmd } from './commands/newest';
import { oldest as oldest_cmd } from './commands/oldest';
import { get_hardest as gethardest_cmd } from './commands/get_hardest';
import { hardest as hardest_cmd } from './commands/hardest';
import { get_leaderboard as get_leaderboard_cmd } from './commands/get_leaderboard';
import { get_creator as get_creator_cmd } from './commands/get_creator';
import { get_iterations as get_iterations_cmd } from './commands/get_iterations';
import { get_thumbnail as get_thumbnail_cmd } from './commands/get_thumbnail';
import { script as script_cmd } from './commands/script';
import { ask as ask_cmd } from './commands/ask';
import { echo as echo_cmd } from './commands/echo';
import { check_stolen as checkstolen_cmd } from './commands/check_stolen';
import { status as status_cmd } from './commands/status';
import { inspect as inspect_cmd } from './commands/inspect';

import nacl from 'tweetnacl';
import { Buffer } from 'node:buffer';

const commands: Record<string, Command> = {
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
	get_iterations_cmd,
	get_thumbnail_cmd,
	script_cmd,
	echo_cmd,
	checkstolen_cmd,
	status_cmd,
	inspect_cmd,
};
const long_commands: Record<string, Command> = {
	ask_cmd,
};

async function handle_command(
	json: Discord.Data,
	_env: Env,
	ctx: ExecutionContext,
): Promise<Response> {
	const env = inject_globals(_env);

	const command = json.data.name;
	const command_function =
		command.toLowerCase().replaceAll(' ', '_') + '_cmd';

	if (command_function in commands) {
		return await commands[command_function](json, env);
	}

	if (command_function in long_commands) {
		ctx.waitUntil(
			(async () => {
				const result = await long_commands[command_function](json, env);
				const token = json.token;
				const url = `https://discord.com/api/v10/webhooks/${env.DISCORD_APPLICATION_ID}/${token}/messages/@original`;

				const data = await result.json<{ data: object }>();

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

function inject_globals(env: Env): Ctx {
	return {
		...env,
		sql: (
			strings: TemplateStringsArray,
			...values: any[]
		): D1PreparedStatement => {
			const query = strings.join('?');
			return env.DB.prepare(query).bind(...values);
		},
	};
}

function validate(body: string, request: Request, env: Env): boolean {
	const signature = request.headers.get('x-signature-ed25519');
	const timestamp = request.headers.get('x-signature-timestamp');
	return (
		!!signature &&
		!!timestamp &&
		nacl.sign.detached.verify(
			Buffer.from(timestamp + body),
			Buffer.from(signature, 'hex'),
			Buffer.from(env.PUBLIC_KEY, 'hex'),
		)
	);
}

async function handle_request(
	request: Request,
	env: Env,
	ctx: ExecutionContext,
): Promise<Response> {
	// validate
	const body = await request.text();

	const isVerified = validate(body, request, env);
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
		return await handle_command(json, env, ctx);
	}

	// failure
	return new Response('invalid request type', { status: 400 });
}

export default {
	fetch: handle_request,
};
